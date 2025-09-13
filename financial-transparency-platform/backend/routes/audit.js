const express = require('express');
const { AuditLog, User, Transaction, BlockchainRecord } = require('../models');
const { authenticateToken, authorizeRoles, authorizeInstitution } = require('../middleware/auth');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const router = express.Router();

// Get audit logs
router.get('/logs', authenticateToken, authorizeRoles('admin', 'auditor', 'super_admin'), authorizeInstitution, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      action, 
      entity_type, 
      user_id, 
      start_date, 
      end_date,
      severity 
    } = req.query;
    
    const offset = (page - 1) * limit;
    const where = {};
    
    // Build where conditions
    if (action) where.action = action;
    if (entity_type) where.entity_type = entity_type;
    if (user_id) where.user_id = user_id;
    if (severity) where.severity = severity;
    
    if (start_date || end_date) {
      where.timestamp = {};
      if (start_date) where.timestamp[Op.gte] = new Date(start_date);
      if (end_date) where.timestamp[Op.lte] = new Date(end_date);
    }
    
    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          where: req.user.role === 'super_admin' ? {} : { institution_id: req.user.institution_id },
          attributes: ['id', 'first_name', 'last_name', 'email', 'role']
        },
        {
          model: Transaction,
          attributes: ['id', 'transaction_number', 'description', 'amount'],
          required: false
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['timestamp', 'DESC']]
    });
    
    res.json({
      audit_logs: auditLogs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Audit logs fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get audit statistics
router.get('/stats', authenticateToken, authorizeRoles('admin', 'auditor', 'super_admin'), authorizeInstitution, async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    let startDate;
    const currentDate = new Date();
    
    switch (period) {
      case '7days':
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(currentDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get action statistics
    const actionStats = await AuditLog.findAll({
      include: [
        {
          model: User,
          where: req.user.role === 'super_admin' ? {} : { institution_id: req.user.institution_id },
          attributes: []
        }
      ],
      where: {
        timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'action',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('AuditLog.id')), 'count']
      ],
      group: ['action'],
      raw: true
    });
    
    // Get entity type statistics
    const entityStats = await AuditLog.findAll({
      include: [
        {
          model: User,
          where: req.user.role === 'super_admin' ? {} : { institution_id: req.user.institution_id },
          attributes: []
        }
      ],
      where: {
        timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'entity_type',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('AuditLog.id')), 'count']
      ],
      group: ['entity_type'],
      raw: true
    });
    
    // Get user activity statistics
    const userStats = await AuditLog.findAll({
      include: [
        {
          model: User,
          where: req.user.role === 'super_admin' ? {} : { institution_id: req.user.institution_id },
          attributes: ['id', 'first_name', 'last_name', 'role']
        }
      ],
      where: {
        timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'user_id',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('AuditLog.id')), 'activity_count']
      ],
      group: ['user_id', 'User.id', 'User.first_name', 'User.last_name', 'User.role'],
      order: [[AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('AuditLog.id')), 'DESC']],
      limit: 10,
      raw: true
    });
    
    // Get severity statistics
    const severityStats = await AuditLog.findAll({
      include: [
        {
          model: User,
          where: req.user.role === 'super_admin' ? {} : { institution_id: req.user.institution_id },
          attributes: []
        }
      ],
      where: {
        timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'severity',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('AuditLog.id')), 'count']
      ],
      group: ['severity'],
      raw: true
    });
    
    res.json({
      period,
      action_statistics: actionStats,
      entity_statistics: entityStats,
      user_activity: userStats,
      severity_statistics: severityStats,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Audit statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch audit statistics' });
  }
});

// Get blockchain integrity status
router.get('/blockchain/integrity', authenticateToken, authorizeRoles('admin', 'auditor', 'super_admin'), async (req, res) => {
  try {
    // Validate blockchain integrity
    const validationResult = await BlockchainRecord.validateChain();
    
    // Get blockchain statistics
    const totalBlocks = await BlockchainRecord.count();
    const latestBlock = await BlockchainRecord.findOne({
      order: [['block_number', 'DESC']],
      attributes: ['id', 'block_number', 'block_hash', 'timestamp', 'is_valid']
    });
    
    // Get invalid blocks count
    const invalidBlocks = await BlockchainRecord.count({
      where: { is_valid: false }
    });
    
    // Get recent blockchain records
    const recentBlocks = await BlockchainRecord.findAll({
      include: [
        {
          model: Transaction,
          attributes: ['id', 'transaction_number', 'description', 'amount']
        }
      ],
      limit: 10,
      order: [['block_number', 'DESC']]
    });
    
    res.json({
      integrity_status: validationResult,
      statistics: {
        total_blocks: totalBlocks,
        invalid_blocks: invalidBlocks,
        integrity_percentage: totalBlocks > 0 ? (((totalBlocks - invalidBlocks) / totalBlocks) * 100).toFixed(2) : 100
      },
      latest_block: latestBlock,
      recent_blocks: recentBlocks,
      checked_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Blockchain integrity check error:', error);
    res.status(500).json({ error: 'Failed to check blockchain integrity' });
  }
});

// Get suspicious activities
router.get('/suspicious', authenticateToken, authorizeRoles('admin', 'auditor', 'super_admin'), authorizeInstitution, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Find suspicious patterns
    const suspiciousActivities = [];
    
    // 1. Multiple failed login attempts
    const failedLogins = await AuditLog.findAll({
      include: [
        {
          model: User,
          where: req.user.role === 'super_admin' ? {} : { institution_id: req.user.institution_id },
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      where: {
        action: 'login_failed',
        timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'user_id',
        'ip_address',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('AuditLog.id')), 'attempt_count']
      ],
      group: ['user_id', 'ip_address', 'User.id', 'User.first_name', 'User.last_name', 'User.email'],
      having: AuditLog.sequelize.literal('COUNT("AuditLog"."id") > 5'),
      raw: true
    });
    
    failedLogins.forEach(login => {
      suspiciousActivities.push({
        type: 'multiple_failed_logins',
        severity: 'high',
        description: `${login.attempt_count} failed login attempts from IP ${login.ip_address}`,
        user_id: login.user_id,
        details: login
      });
    });
    
    // 2. Large transactions outside business hours
    const largeTransactions = await Transaction.findAll({
      include: [
        {
          model: require('../models').Budget,
          where: req.user.role === 'super_admin' ? {} : { institution_id: req.user.institution_id },
          attributes: ['name']
        }
      ],
      where: {
        amount: {
          [Op.gt]: 100000 // Transactions over 1 lakh
        },
        transaction_date: {
          [Op.gte]: startDate
        },
        [Op.or]: [
          AuditLog.sequelize.where(
            AuditLog.sequelize.fn('EXTRACT', AuditLog.sequelize.literal('HOUR FROM transaction_date')),
            { [Op.lt]: 9 }
          ),
          AuditLog.sequelize.where(
            AuditLog.sequelize.fn('EXTRACT', AuditLog.sequelize.literal('HOUR FROM transaction_date')),
            { [Op.gt]: 18 }
          )
        ]
      },
      attributes: ['id', 'transaction_number', 'amount', 'description', 'transaction_date'],
      limit: 20
    });
    
    largeTransactions.forEach(transaction => {
      suspiciousActivities.push({
        type: 'large_transaction_off_hours',
        severity: 'medium',
        description: `Large transaction of ₹${transaction.amount.toLocaleString()} outside business hours`,
        transaction_id: transaction.id,
        details: transaction
      });
    });
    
    // 3. Rapid consecutive transactions
    const rapidTransactions = await AuditLog.findAll({
      include: [
        {
          model: User,
          where: req.user.role === 'super_admin' ? {} : { institution_id: req.user.institution_id },
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      where: {
        action: 'create',
        entity_type: 'transaction',
        timestamp: {
          [Op.gte]: startDate
        }
      },
      attributes: [
        'user_id',
        [AuditLog.sequelize.fn('COUNT', AuditLog.sequelize.col('AuditLog.id')), 'transaction_count'],
        [AuditLog.sequelize.fn('MIN', AuditLog.sequelize.col('timestamp')), 'first_transaction'],
        [AuditLog.sequelize.fn('MAX', AuditLog.sequelize.col('timestamp')), 'last_transaction']
      ],
      group: ['user_id', 'User.id', 'User.first_name', 'User.last_name'],
      having: AuditLog.sequelize.literal('COUNT("AuditLog"."id") > 10'),
      raw: true
    });
    
    rapidTransactions.forEach(activity => {
      const timeDiff = new Date(activity.last_transaction) - new Date(activity.first_transaction);
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 1) { // More than 10 transactions in 1 hour
        suspiciousActivities.push({
          type: 'rapid_transactions',
          severity: 'high',
          description: `${activity.transaction_count} transactions created in ${hoursDiff.toFixed(1)} hours`,
          user_id: activity.user_id,
          details: activity
        });
      }
    });
    
    // Sort by severity
    const severityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
    suspiciousActivities.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);
    
    res.json({
      suspicious_activities: suspiciousActivities,
      total_count: suspiciousActivities.length,
      period_days: days,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Suspicious activity detection error:', error);
    res.status(500).json({ error: 'Failed to detect suspicious activities' });
  }
});

// Get audit trail for specific entity
router.get('/trail/:entityType/:entityId', authenticateToken, authorizeRoles('admin', 'auditor', 'super_admin'), authorizeInstitution, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    const auditTrail = await AuditLog.findAll({
      where: {
        entity_type: entityType,
        entity_id: entityId
      },
      include: [
        {
          model: User,
          where: req.user.role === 'super_admin' ? {} : { institution_id: req.user.institution_id },
          attributes: ['id', 'first_name', 'last_name', 'email', 'role']
        }
      ],
      order: [['timestamp', 'ASC']]
    });
    
    if (auditTrail.length === 0) {
      return res.status(404).json({ error: 'No audit trail found for this entity' });
    }
    
    res.json({
      entity_type: entityType,
      entity_id: entityId,
      audit_trail: auditTrail,
      total_events: auditTrail.length
    });
  } catch (error) {
    logger.error('Audit trail fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch audit trail' });
  }
});

// Export audit logs
router.get('/export/:format', authenticateToken, authorizeRoles('admin', 'auditor', 'super_admin'), authorizeInstitution, async (req, res) => {
  try {
    const { format } = req.params;
    const { start_date, end_date, action, entity_type } = req.query;
    
    if (!['csv', 'json'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use csv or json' });
    }
    
    const where = {};
    if (action) where.action = action;
    if (entity_type) where.entity_type = entity_type;
    
    if (start_date || end_date) {
      where.timestamp = {};
      if (start_date) where.timestamp[Op.gte] = new Date(start_date);
      if (end_date) where.timestamp[Op.lte] = new Date(end_date);
    }
    
    const auditLogs = await AuditLog.findAll({
      where,
      include: [
        {
          model: User,
          where: req.user.role === 'super_admin' ? {} : { institution_id: req.user.institution_id },
          attributes: ['first_name', 'last_name', 'email', 'role']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: 10000 // Limit for performance
    });
    
    logger.audit('Audit logs exported', {
      userId: req.user.id,
      format,
      recordCount: auditLogs.length
    });
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.json"`);
      res.json(auditLogs);
    } else {
      // CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
      
      const csvHeader = 'Timestamp,User,Action,Entity Type,Entity ID,Description,IP Address,Severity\n';
      res.write(csvHeader);
      
      auditLogs.forEach(log => {
        const row = [
          log.timestamp,
          `${log.User.first_name} ${log.User.last_name}`,
          log.action,
          log.entity_type,
          log.entity_id,
          log.description || '',
          log.ip_address || '',
          log.severity
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        
        res.write(row + '\n');
      });
      
      res.end();
    }
  } catch (error) {
    logger.error('Audit export error:', error);
    res.status(500).json({ error: 'Failed to export audit logs' });
  }
});

module.exports = router;
