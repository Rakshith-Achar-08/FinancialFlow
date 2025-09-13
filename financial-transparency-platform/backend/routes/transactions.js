const express = require('express');
const Joi = require('joi');
const { Transaction, Budget, Project, Vendor, User, AuditLog, BlockchainRecord } = require('../models');
const { authenticateToken, authorizeRoles, authorizeInstitution, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');
const crypto = require('crypto');

const router = express.Router();

// Validation schemas
const transactionSchema = Joi.object({
  budget_id: Joi.string().uuid().required(),
  project_id: Joi.string().uuid().optional(),
  vendor_id: Joi.string().uuid().optional(),
  description: Joi.string().min(1).required(),
  amount: Joi.number().positive().required(),
  transaction_type: Joi.string().valid('expense', 'income', 'transfer', 'refund').default('expense'),
  category: Joi.string().valid('salaries', 'equipment', 'services', 'supplies', 'utilities', 'travel', 'maintenance', 'other').required(),
  transaction_date: Joi.date().default(Date.now),
  payment_method: Joi.string().valid('bank_transfer', 'check', 'cash', 'credit_card', 'online').optional(),
  reference_number: Joi.string().optional(),
  invoice_number: Joi.string().optional(),
  notes: Joi.string().optional(),
  tax_amount: Joi.number().min(0).default(0),
  is_recurring: Joi.boolean().default(false),
  recurring_frequency: Joi.string().valid('monthly', 'quarterly', 'yearly').optional()
});

// Generate unique transaction number
const generateTransactionNumber = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const prefix = `TXN${year}${month}${day}`;
  
  // Find the last transaction number for today
  const lastTransaction = await Transaction.findOne({
    where: {
      transaction_number: {
        [Transaction.sequelize.Op.like]: `${prefix}%`
      }
    },
    order: [['transaction_number', 'DESC']]
  });
  
  let sequence = 1;
  if (lastTransaction) {
    const lastSequence = parseInt(lastTransaction.transaction_number.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

// Create blockchain record for transaction
const createBlockchainRecord = async (transaction, userId) => {
  try {
    // Get the last blockchain record to get previous hash
    const lastRecord = await BlockchainRecord.findOne({
      order: [['block_number', 'DESC']]
    });
    
    const blockchainData = {
      transaction_id: transaction.id,
      previous_hash: lastRecord ? lastRecord.block_hash : null,
      validator: userId,
      difficulty: 4
    };
    
    const record = await BlockchainRecord.create(blockchainData);
    logger.info(`Blockchain record created for transaction ${transaction.id}`);
    return record;
  } catch (error) {
    logger.error('Blockchain record creation failed:', error);
    throw error;
  }
};

// Create new transaction
router.post('/', authenticateToken, authorizeRoles('admin', 'auditor'), async (req, res) => {
  try {
    const { error, value } = transactionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Verify budget exists and belongs to user's institution
    const budget = await Budget.findOne({
      where: {
        id: value.budget_id,
        institution_id: req.user.institution_id
      }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    if (budget.status !== 'active') {
      return res.status(400).json({ error: 'Budget is not active' });
    }

    // Check budget availability for expenses
    if (value.transaction_type === 'expense') {
      const remainingBudget = budget.total_amount - budget.spent_amount;
      if (value.amount > remainingBudget) {
        return res.status(400).json({ error: 'Insufficient budget remaining' });
      }
    }

    // Verify project if provided
    if (value.project_id) {
      const project = await Project.findByPk(value.project_id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    // Verify vendor if provided
    if (value.vendor_id) {
      const vendor = await Vendor.findByPk(value.vendor_id);
      if (!vendor || !vendor.is_active) {
        return res.status(404).json({ error: 'Vendor not found or inactive' });
      }
    }

    // Generate transaction number
    value.transaction_number = await generateTransactionNumber();
    value.net_amount = value.amount - value.tax_amount;

    // Create transaction
    const transaction = await Transaction.create(value);

    // Create blockchain record
    await createBlockchainRecord(transaction, req.user.id);

    // Create audit log
    await AuditLog.create({
      user_id: req.user.id,
      transaction_id: transaction.id,
      action: 'create',
      entity_type: 'transaction',
      entity_id: transaction.id,
      new_values: transaction.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      description: `Transaction created: ${transaction.description}`
    });

    logger.audit('Transaction created', {
      userId: req.user.id,
      transactionId: transaction.id,
      amount: transaction.amount,
      budgetId: transaction.budget_id
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`institution-${req.user.institution_id}`).emit('transaction-created', {
      transaction: transaction.toJSON(),
      user: req.user.first_name + ' ' + req.user.last_name
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });
  } catch (error) {
    logger.error('Transaction creation error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transactions
router.get('/', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      budget_id, 
      project_id, 
      vendor_id, 
      status, 
      transaction_type,
      category,
      start_date,
      end_date
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};

    // Build where conditions
    if (budget_id) where.budget_id = budget_id;
    if (project_id) where.project_id = project_id;
    if (vendor_id) where.vendor_id = vendor_id;
    if (status) where.status = status;
    if (transaction_type) where.transaction_type = transaction_type;
    if (category) where.category = category;

    if (start_date || end_date) {
      where.transaction_date = {};
      if (start_date) where.transaction_date[Transaction.sequelize.Op.gte] = new Date(start_date);
      if (end_date) where.transaction_date[Transaction.sequelize.Op.lte] = new Date(end_date);
    }

    // Filter by institution through budget
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Budget,
          where: { institution_id: req.user.institution_id },
          attributes: ['id', 'name', 'fiscal_year']
        },
        {
          model: Project,
          attributes: ['id', 'name', 'code'],
          required: false
        },
        {
          model: Vendor,
          attributes: ['id', 'name', 'company_name'],
          required: false
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'first_name', 'last_name'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['transaction_date', 'DESC']]
    });

    res.json({
      transactions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Transaction fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get public transactions
router.get('/public', optionalAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      institution_id,
      transaction_type,
      category,
      start_date,
      end_date
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = { status: 'completed' };
    const budgetWhere = { is_public: true };

    if (institution_id) budgetWhere.institution_id = institution_id;
    if (transaction_type) where.transaction_type = transaction_type;
    if (category) where.category = category;

    if (start_date || end_date) {
      where.transaction_date = {};
      if (start_date) where.transaction_date[Transaction.sequelize.Op.gte] = new Date(start_date);
      if (end_date) where.transaction_date[Transaction.sequelize.Op.lte] = new Date(end_date);
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        {
          model: Budget,
          where: budgetWhere,
          attributes: ['id', 'name', 'fiscal_year'],
          include: [
            {
              model: require('../models').Institution,
              attributes: ['id', 'name', 'type']
            }
          ]
        },
        {
          model: Project,
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: Vendor,
          attributes: ['id', 'name'],
          required: false
        }
      ],
      attributes: ['id', 'transaction_number', 'description', 'amount', 'transaction_type', 'category', 'transaction_date', 'currency'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['transaction_date', 'DESC']]
    });

    res.json({
      transactions,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Public transaction fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch public transactions' });
  }
});

// Get transaction by ID
router.get('/:transactionId', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.transactionId },
      include: [
        {
          model: Budget,
          where: { institution_id: req.user.institution_id },
          attributes: ['id', 'name', 'fiscal_year']
        },
        {
          model: Project,
          attributes: ['id', 'name', 'code', 'description'],
          required: false
        },
        {
          model: Vendor,
          attributes: ['id', 'name', 'company_name', 'email', 'phone'],
          required: false
        },
        {
          model: User,
          as: 'Approver',
          attributes: ['id', 'first_name', 'last_name', 'email'],
          required: false
        },
        {
          model: BlockchainRecord,
          attributes: ['id', 'block_hash', 'timestamp', 'is_valid'],
          required: false
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    logger.error('Transaction fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Approve transaction
router.put('/:transactionId/approve', authenticateToken, authorizeRoles('admin', 'auditor'), authorizeInstitution, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.transactionId },
      include: [
        {
          model: Budget,
          where: { institution_id: req.user.institution_id }
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending transactions can be approved' });
    }

    const oldValues = { ...transaction.dataValues };
    await transaction.update({
      status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date()
    });

    // Update budget spent amount for expenses
    if (transaction.transaction_type === 'expense') {
      await transaction.Budget.increment('spent_amount', { by: transaction.amount });
    }

    // Create audit log
    await AuditLog.create({
      user_id: req.user.id,
      transaction_id: transaction.id,
      action: 'approve',
      entity_type: 'transaction',
      entity_id: transaction.id,
      old_values: oldValues,
      new_values: transaction.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      description: `Transaction approved: ${transaction.description}`
    });

    logger.audit('Transaction approved', {
      userId: req.user.id,
      transactionId: transaction.id,
      amount: transaction.amount
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`institution-${req.user.institution_id}`).emit('transaction-approved', {
      transaction: transaction.toJSON(),
      approver: req.user.first_name + ' ' + req.user.last_name
    });

    res.json({
      message: 'Transaction approved successfully',
      transaction
    });
  } catch (error) {
    logger.error('Transaction approval error:', error);
    res.status(500).json({ error: 'Failed to approve transaction' });
  }
});

// Reject transaction
router.put('/:transactionId/reject', authenticateToken, authorizeRoles('admin', 'auditor'), authorizeInstitution, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const transaction = await Transaction.findOne({
      where: { id: req.params.transactionId },
      include: [
        {
          model: Budget,
          where: { institution_id: req.user.institution_id }
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending transactions can be rejected' });
    }

    const oldValues = { ...transaction.dataValues };
    await transaction.update({
      status: 'rejected',
      approved_by: req.user.id,
      approved_at: new Date(),
      notes: reason || transaction.notes
    });

    // Create audit log
    await AuditLog.create({
      user_id: req.user.id,
      transaction_id: transaction.id,
      action: 'reject',
      entity_type: 'transaction',
      entity_id: transaction.id,
      old_values: oldValues,
      new_values: transaction.toJSON(),
      ip_address: req.ip,
      user_agent: req.get('User-Agent'),
      description: `Transaction rejected: ${reason || 'No reason provided'}`
    });

    logger.audit('Transaction rejected', {
      userId: req.user.id,
      transactionId: transaction.id,
      reason: reason
    });

    res.json({
      message: 'Transaction rejected successfully',
      transaction
    });
  } catch (error) {
    logger.error('Transaction rejection error:', error);
    res.status(500).json({ error: 'Failed to reject transaction' });
  }
});

// Complete transaction
router.put('/:transactionId/complete', authenticateToken, authorizeRoles('admin', 'auditor'), authorizeInstitution, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.transactionId },
      include: [
        {
          model: Budget,
          where: { institution_id: req.user.institution_id }
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved transactions can be completed' });
    }

    await transaction.update({ status: 'completed' });

    logger.audit('Transaction completed', {
      userId: req.user.id,
      transactionId: transaction.id,
      amount: transaction.amount
    });

    res.json({
      message: 'Transaction completed successfully',
      transaction
    });
  } catch (error) {
    logger.error('Transaction completion error:', error);
    res.status(500).json({ error: 'Failed to complete transaction' });
  }
});

// Get transaction audit trail
router.get('/:transactionId/audit', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      where: { id: req.params.transactionId },
      include: [
        {
          model: Budget,
          where: { institution_id: req.user.institution_id }
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const auditLogs = await AuditLog.findAll({
      where: { transaction_id: transaction.id },
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['timestamp', 'ASC']]
    });

    const blockchainRecord = await BlockchainRecord.findOne({
      where: { transaction_id: transaction.id }
    });

    res.json({
      transaction_id: transaction.id,
      audit_logs: auditLogs,
      blockchain_record: blockchainRecord
    });
  } catch (error) {
    logger.error('Audit trail fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

module.exports = router;
