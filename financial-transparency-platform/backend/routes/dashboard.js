const express = require('express');
const { Budget, Transaction, Project, Department, Vendor, Institution } = require('../models');
const { authenticateToken, authorizeInstitution, optionalAuth } = require('../middleware/auth');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const router = express.Router();

// Get dashboard overview for institution
router.get('/overview', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const institutionId = req.user.institution_id;
    const currentYear = new Date().getFullYear();

    // Get budget summary
    const budgetStats = await Budget.findAll({
      where: { 
        institution_id: institutionId,
        fiscal_year: currentYear.toString()
      },
      attributes: [
        'status',
        [Budget.sequelize.fn('COUNT', Budget.sequelize.col('id')), 'count'],
        [Budget.sequelize.fn('SUM', Budget.sequelize.col('total_amount')), 'total_amount'],
        [Budget.sequelize.fn('SUM', Budget.sequelize.col('spent_amount')), 'spent_amount']
      ],
      group: ['status'],
      raw: true
    });

    // Get transaction summary for current month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const transactionStats = await Transaction.findAll({
      include: [
        {
          model: Budget,
          where: { institution_id: institutionId },
          attributes: []
        }
      ],
      where: {
        transaction_date: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      },
      attributes: [
        'status',
        'transaction_type',
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('Transaction.id')), 'count'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total_amount']
      ],
      group: ['status', 'transaction_type'],
      raw: true
    });

    // Get recent transactions
    const recentTransactions = await Transaction.findAll({
      include: [
        {
          model: Budget,
          where: { institution_id: institutionId },
          attributes: ['name']
        },
        {
          model: Project,
          attributes: ['name'],
          required: false
        }
      ],
      attributes: ['id', 'transaction_number', 'description', 'amount', 'status', 'transaction_date'],
      limit: 10,
      order: [['transaction_date', 'DESC']]
    });

    // Get department spending
    const departmentSpending = await Department.findAll({
      where: { institution_id: institutionId },
      include: [
        {
          model: Project,
          include: [
            {
              model: Transaction,
              where: { status: 'completed' },
              attributes: []
            }
          ],
          attributes: []
        }
      ],
      attributes: [
        'id',
        'name',
        [Department.sequelize.fn('SUM', Department.sequelize.col('Projects.Transactions.amount')), 'total_spent']
      ],
      group: ['Department.id', 'Department.name'],
      raw: true
    });

    // Calculate totals
    const totalBudget = budgetStats.reduce((sum, stat) => sum + parseFloat(stat.total_amount || 0), 0);
    const totalSpent = budgetStats.reduce((sum, stat) => sum + parseFloat(stat.spent_amount || 0), 0);
    const utilizationRate = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(2) : 0;

    res.json({
      budget_summary: {
        total_budget: totalBudget,
        total_spent: totalSpent,
        remaining_budget: totalBudget - totalSpent,
        utilization_rate: utilizationRate,
        budget_stats: budgetStats
      },
      transaction_summary: {
        monthly_stats: transactionStats,
        recent_transactions: recentTransactions
      },
      department_spending: departmentSpending,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// Get public dashboard data
router.get('/public', optionalAuth, async (req, res) => {
  try {
    const { institution_id, institution_type } = req.query;
    const currentYear = new Date().getFullYear();

    let institutionWhere = { is_active: true };
    if (institution_id) institutionWhere.id = institution_id;
    if (institution_type) institutionWhere.type = institution_type;

    // Get public budget summary
    const publicBudgets = await Budget.findAll({
      where: { 
        is_public: true,
        fiscal_year: currentYear.toString(),
        status: 'active'
      },
      include: [
        {
          model: Institution,
          where: institutionWhere,
          attributes: ['id', 'name', 'type']
        }
      ],
      attributes: ['id', 'name', 'total_amount', 'spent_amount', 'institution_id']
    });

    // Get public transaction summary
    const publicTransactions = await Transaction.findAll({
      include: [
        {
          model: Budget,
          where: { is_public: true },
          include: [
            {
              model: Institution,
              where: institutionWhere,
              attributes: ['id', 'name', 'type']
            }
          ],
          attributes: ['name', 'institution_id']
        }
      ],
      where: { status: 'completed' },
      attributes: [
        'transaction_type',
        'category',
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('Transaction.id')), 'count'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total_amount']
      ],
      group: ['transaction_type', 'category', 'Budget.institution_id', 'Budget.Institution.id', 'Budget.Institution.name', 'Budget.Institution.type', 'Budget.name'],
      raw: true
    });

    // Calculate aggregated statistics
    const totalPublicBudget = publicBudgets.reduce((sum, budget) => sum + parseFloat(budget.total_amount), 0);
    const totalPublicSpent = publicBudgets.reduce((sum, budget) => sum + parseFloat(budget.spent_amount), 0);

    // Group by institution type
    const institutionTypeStats = {};
    publicBudgets.forEach(budget => {
      const type = budget.Institution.type;
      if (!institutionTypeStats[type]) {
        institutionTypeStats[type] = {
          count: 0,
          total_budget: 0,
          total_spent: 0
        };
      }
      institutionTypeStats[type].count++;
      institutionTypeStats[type].total_budget += parseFloat(budget.total_amount);
      institutionTypeStats[type].total_spent += parseFloat(budget.spent_amount);
    });

    res.json({
      summary: {
        total_institutions: Object.keys(institutionTypeStats).length,
        total_public_budget: totalPublicBudget,
        total_public_spent: totalPublicSpent,
        transparency_rate: totalPublicBudget > 0 ? ((totalPublicSpent / totalPublicBudget) * 100).toFixed(2) : 0
      },
      institution_type_stats: institutionTypeStats,
      public_budgets: publicBudgets.slice(0, 20), // Limit for performance
      transaction_categories: publicTransactions,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Public dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch public dashboard data' });
  }
});

// Get budget trend data
router.get('/trends/budget', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const { period = '12months' } = req.query;
    const institutionId = req.user.institution_id;

    let startDate, groupBy;
    const currentDate = new Date();

    switch (period) {
      case '7days':
        startDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = [
          Transaction.sequelize.fn('DATE', Transaction.sequelize.col('transaction_date'))
        ];
        break;
      case '30days':
        startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = [
          Transaction.sequelize.fn('DATE', Transaction.sequelize.col('transaction_date'))
        ];
        break;
      case '12months':
      default:
        startDate = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
        groupBy = [
          Transaction.sequelize.fn('EXTRACT', Transaction.sequelize.literal('YEAR FROM transaction_date')),
          Transaction.sequelize.fn('EXTRACT', Transaction.sequelize.literal('MONTH FROM transaction_date'))
        ];
        break;
    }

    const trendData = await Transaction.findAll({
      include: [
        {
          model: Budget,
          where: { institution_id: institutionId },
          attributes: []
        }
      ],
      where: {
        transaction_date: {
          [Op.gte]: startDate
        },
        status: 'completed'
      },
      attributes: [
        [Transaction.sequelize.fn('DATE_TRUNC', period === '12months' ? 'month' : 'day', Transaction.sequelize.col('transaction_date')), 'period'],
        'transaction_type',
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total_amount'],
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('Transaction.id')), 'transaction_count']
      ],
      group: ['period', 'transaction_type'],
      order: [['period', 'ASC']],
      raw: true
    });

    res.json({
      period,
      trend_data: trendData,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Budget trend error:', error);
    res.status(500).json({ error: 'Failed to fetch budget trend data' });
  }
});

// Get spending by category
router.get('/spending/category', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const { fiscal_year } = req.query;
    const institutionId = req.user.institution_id;
    const currentYear = fiscal_year || new Date().getFullYear().toString();

    const categorySpending = await Transaction.findAll({
      include: [
        {
          model: Budget,
          where: { 
            institution_id: institutionId,
            fiscal_year: currentYear
          },
          attributes: []
        }
      ],
      where: {
        status: 'completed',
        transaction_type: 'expense'
      },
      attributes: [
        'category',
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'total_amount'],
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('Transaction.id')), 'transaction_count'],
        [Transaction.sequelize.fn('AVG', Transaction.sequelize.col('amount')), 'average_amount']
      ],
      group: ['category'],
      order: [[Transaction.sequelize.fn('SUM', Transaction.sequelize.col('amount')), 'DESC']],
      raw: true
    });

    const totalSpending = categorySpending.reduce((sum, cat) => sum + parseFloat(cat.total_amount), 0);

    const categoryData = categorySpending.map(cat => ({
      ...cat,
      percentage: totalSpending > 0 ? ((parseFloat(cat.total_amount) / totalSpending) * 100).toFixed(2) : 0
    }));

    res.json({
      fiscal_year: currentYear,
      total_spending: totalSpending,
      category_breakdown: categoryData,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Category spending error:', error);
    res.status(500).json({ error: 'Failed to fetch category spending data' });
  }
});

// Get vendor analysis
router.get('/vendors/analysis', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const institutionId = req.user.institution_id;
    const { limit = 10 } = req.query;

    const vendorAnalysis = await Vendor.findAll({
      include: [
        {
          model: Transaction,
          include: [
            {
              model: Budget,
              where: { institution_id: institutionId },
              attributes: []
            }
          ],
          where: { status: 'completed' },
          attributes: []
        }
      ],
      attributes: [
        'id',
        'name',
        'company_name',
        'vendor_type',
        [Vendor.sequelize.fn('COUNT', Vendor.sequelize.col('Transactions.id')), 'transaction_count'],
        [Vendor.sequelize.fn('SUM', Vendor.sequelize.col('Transactions.amount')), 'total_amount'],
        [Vendor.sequelize.fn('AVG', Vendor.sequelize.col('Transactions.amount')), 'average_transaction'],
        [Vendor.sequelize.fn('MAX', Vendor.sequelize.col('Transactions.transaction_date')), 'last_transaction_date']
      ],
      group: ['Vendor.id'],
      having: Vendor.sequelize.literal('COUNT("Transactions"."id") > 0'),
      order: [[Vendor.sequelize.fn('SUM', Vendor.sequelize.col('Transactions.amount')), 'DESC']],
      limit: parseInt(limit),
      raw: true
    });

    res.json({
      vendor_analysis: vendorAnalysis,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Vendor analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch vendor analysis' });
  }
});

// Get project performance
router.get('/projects/performance', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const institutionId = req.user.institution_id;

    const projectPerformance = await Project.findAll({
      include: [
        {
          model: Department,
          where: { institution_id: institutionId },
          attributes: ['name']
        },
        {
          model: Transaction,
          where: { status: 'completed' },
          attributes: [],
          required: false
        }
      ],
      attributes: [
        'id',
        'name',
        'status',
        'budget_allocated',
        'budget_spent',
        'completion_percentage',
        'start_date',
        'end_date',
        [Project.sequelize.fn('COUNT', Project.sequelize.col('Transactions.id')), 'transaction_count'],
        [Project.sequelize.fn('SUM', Project.sequelize.col('Transactions.amount')), 'actual_spent']
      ],
      group: ['Project.id', 'Department.id', 'Department.name'],
      raw: true
    });

    const performanceData = projectPerformance.map(project => {
      const budgetUtilization = project.budget_allocated > 0 
        ? ((parseFloat(project.actual_spent || 0) / project.budget_allocated) * 100).toFixed(2)
        : 0;
      
      const isOverBudget = parseFloat(project.actual_spent || 0) > project.budget_allocated;
      const daysRemaining = project.end_date ? Math.ceil((new Date(project.end_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;

      return {
        ...project,
        budget_utilization: budgetUtilization,
        is_over_budget: isOverBudget,
        days_remaining: daysRemaining,
        status_indicator: daysRemaining < 0 ? 'overdue' : daysRemaining < 30 ? 'urgent' : 'on_track'
      };
    });

    res.json({
      project_performance: performanceData,
      generated_at: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Project performance error:', error);
    res.status(500).json({ error: 'Failed to fetch project performance data' });
  }
});

module.exports = router;
