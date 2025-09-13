const express = require('express');
const Joi = require('joi');
const { Budget, Institution, User, Department, Project, Transaction } = require('../models');
const { authenticateToken, authorizeRoles, authorizeInstitution } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Validation schemas
const budgetSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().optional(),
  fiscal_year: Joi.string().min(4).max(10).required(),
  total_amount: Joi.number().positive().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().greater(Joi.ref('start_date')).required(),
  category: Joi.string().valid('operational', 'capital', 'emergency', 'development', 'maintenance').default('operational'),
  currency: Joi.string().length(3).default('INR'),
  is_public: Joi.boolean().default(true)
});

// Create new budget
router.post('/', authenticateToken, authorizeRoles('admin', 'super_admin'), async (req, res) => {
  try {
    const { error, value } = budgetSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Add institution_id from authenticated user
    value.institution_id = req.user.institution_id;

    // Check if budget with same name and fiscal year exists
    const existingBudget = await Budget.findOne({
      where: {
        institution_id: value.institution_id,
        name: value.name,
        fiscal_year: value.fiscal_year
      }
    });

    if (existingBudget) {
      return res.status(409).json({ error: 'Budget with this name already exists for the fiscal year' });
    }

    const budget = await Budget.create(value);

    logger.audit('Budget created', {
      userId: req.user.id,
      budgetId: budget.id,
      budgetName: budget.name,
      amount: budget.total_amount
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`institution-${req.user.institution_id}`).emit('budget-created', {
      budget: budget.toJSON(),
      user: req.user.first_name + ' ' + req.user.last_name
    });

    res.status(201).json({
      message: 'Budget created successfully',
      budget
    });
  } catch (error) {
    logger.error('Budget creation error:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Get all budgets for institution
router.get('/', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const { page = 1, limit = 10, fiscal_year, status, category } = req.query;
    const offset = (page - 1) * limit;

    const where = { institution_id: req.user.institution_id };
    if (fiscal_year) where.fiscal_year = fiscal_year;
    if (status) where.status = status;
    if (category) where.category = category;

    const { count, rows: budgets } = await Budget.findAndCountAll({
      where,
      include: [
        {
          model: Institution,
          attributes: ['id', 'name', 'type']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      budgets,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Budget fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Get public budgets (no authentication required)
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 10, institution_type, fiscal_year } = req.query;
    const offset = (page - 1) * limit;

    const where = { is_public: true, status: 'active' };
    const includeWhere = {};
    
    if (institution_type) {
      includeWhere.type = institution_type;
    }

    if (fiscal_year) {
      where.fiscal_year = fiscal_year;
    }

    const { count, rows: budgets } = await Budget.findAndCountAll({
      where,
      include: [
        {
          model: Institution,
          attributes: ['id', 'name', 'type', 'city', 'state'],
          where: includeWhere
        }
      ],
      attributes: ['id', 'name', 'description', 'fiscal_year', 'total_amount', 'allocated_amount', 'spent_amount', 'category', 'currency', 'start_date', 'end_date'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      budgets,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Public budget fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch public budgets' });
  }
});

// Get budget by ID
router.get('/:budgetId', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.budgetId,
        institution_id: req.user.institution_id
      },
      include: [
        {
          model: Institution,
          attributes: ['id', 'name', 'type']
        },
        {
          model: Transaction,
          attributes: ['id', 'amount', 'description', 'transaction_type', 'status', 'transaction_date'],
          limit: 10,
          order: [['transaction_date', 'DESC']]
        }
      ]
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json({ budget });
  } catch (error) {
    logger.error('Budget fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch budget' });
  }
});

// Update budget
router.put('/:budgetId', authenticateToken, authorizeRoles('admin', 'super_admin'), authorizeInstitution, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.budgetId,
        institution_id: req.user.institution_id
      }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Don't allow updating if budget is closed
    if (budget.status === 'closed') {
      return res.status(400).json({ error: 'Cannot update closed budget' });
    }

    const allowedFields = ['name', 'description', 'total_amount', 'end_date', 'category', 'is_public'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const oldValues = { ...budget.dataValues };
    await budget.update(updates);

    logger.audit('Budget updated', {
      userId: req.user.id,
      budgetId: budget.id,
      oldValues: oldValues,
      newValues: updates
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`institution-${req.user.institution_id}`).emit('budget-updated', {
      budget: budget.toJSON(),
      user: req.user.first_name + ' ' + req.user.last_name
    });

    res.json({
      message: 'Budget updated successfully',
      budget
    });
  } catch (error) {
    logger.error('Budget update error:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Approve budget
router.put('/:budgetId/approve', authenticateToken, authorizeRoles('admin', 'super_admin'), authorizeInstitution, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.budgetId,
        institution_id: req.user.institution_id
      }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    if (budget.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft budgets can be approved' });
    }

    await budget.update({
      status: 'approved',
      approved_by: req.user.id,
      approved_at: new Date()
    });

    logger.audit('Budget approved', {
      userId: req.user.id,
      budgetId: budget.id,
      budgetName: budget.name
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`institution-${req.user.institution_id}`).emit('budget-approved', {
      budget: budget.toJSON(),
      approver: req.user.first_name + ' ' + req.user.last_name
    });

    res.json({
      message: 'Budget approved successfully',
      budget
    });
  } catch (error) {
    logger.error('Budget approval error:', error);
    res.status(500).json({ error: 'Failed to approve budget' });
  }
});

// Activate budget
router.put('/:budgetId/activate', authenticateToken, authorizeRoles('admin', 'super_admin'), authorizeInstitution, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.budgetId,
        institution_id: req.user.institution_id
      }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    if (budget.status !== 'approved') {
      return res.status(400).json({ error: 'Only approved budgets can be activated' });
    }

    await budget.update({ status: 'active' });

    logger.audit('Budget activated', {
      userId: req.user.id,
      budgetId: budget.id,
      budgetName: budget.name
    });

    res.json({
      message: 'Budget activated successfully',
      budget
    });
  } catch (error) {
    logger.error('Budget activation error:', error);
    res.status(500).json({ error: 'Failed to activate budget' });
  }
});

// Get budget summary
router.get('/:budgetId/summary', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.budgetId,
        institution_id: req.user.institution_id
      }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Get transaction summary
    const transactionSummary = await Transaction.findAll({
      where: { budget_id: budget.id },
      attributes: [
        'transaction_type',
        'status',
        [Budget.sequelize.fn('COUNT', Budget.sequelize.col('id')), 'count'],
        [Budget.sequelize.fn('SUM', Budget.sequelize.col('amount')), 'total_amount']
      ],
      group: ['transaction_type', 'status'],
      raw: true
    });

    // Get department-wise allocation
    const departmentSummary = await Department.findAll({
      where: { institution_id: req.user.institution_id },
      include: [
        {
          model: Project,
          include: [
            {
              model: Transaction,
              where: { budget_id: budget.id },
              attributes: []
            }
          ],
          attributes: []
        }
      ],
      attributes: [
        'id',
        'name',
        [Budget.sequelize.fn('SUM', Budget.sequelize.col('Projects.Transactions.amount')), 'total_spent']
      ],
      group: ['Department.id', 'Department.name'],
      raw: true
    });

    res.json({
      budget: {
        id: budget.id,
        name: budget.name,
        total_amount: budget.total_amount,
        allocated_amount: budget.allocated_amount,
        spent_amount: budget.spent_amount,
        remaining_amount: budget.total_amount - budget.spent_amount,
        utilization_percentage: ((budget.spent_amount / budget.total_amount) * 100).toFixed(2)
      },
      transaction_summary: transactionSummary,
      department_summary: departmentSummary
    });
  } catch (error) {
    logger.error('Budget summary error:', error);
    res.status(500).json({ error: 'Failed to fetch budget summary' });
  }
});

// Delete budget (soft delete)
router.delete('/:budgetId', authenticateToken, authorizeRoles('admin', 'super_admin'), authorizeInstitution, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      where: {
        id: req.params.budgetId,
        institution_id: req.user.institution_id
      }
    });

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    // Check if budget has transactions
    const transactionCount = await Transaction.count({
      where: { budget_id: budget.id }
    });

    if (transactionCount > 0) {
      return res.status(400).json({ error: 'Cannot delete budget with existing transactions' });
    }

    await budget.update({ status: 'cancelled' });

    logger.audit('Budget deleted', {
      userId: req.user.id,
      budgetId: budget.id,
      budgetName: budget.name
    });

    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    logger.error('Budget deletion error:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

module.exports = router;
