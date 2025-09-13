const express = require('express');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const { Budget, Transaction, Project, Department, Vendor, Institution } = require('../models');
const { authenticateToken, authorizeInstitution } = require('../middleware/auth');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const router = express.Router();

// Generate PDF report
const generatePDFReport = async (data, reportType, res) => {
  const doc = new PDFDocument();
  
  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report-${Date.now()}.pdf"`);
  
  doc.pipe(res);
  
  // Header
  doc.fontSize(20).text('Financial Transparency Report', 50, 50);
  doc.fontSize(14).text(`Report Type: ${reportType}`, 50, 80);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 50, 100);
  doc.text(`Institution: ${data.institution?.name || 'N/A'}`, 50, 120);
  
  let yPosition = 160;
  
  // Budget Summary
  if (data.budgets && data.budgets.length > 0) {
    doc.fontSize(16).text('Budget Summary', 50, yPosition);
    yPosition += 30;
    
    data.budgets.forEach(budget => {
      doc.fontSize(12)
        .text(`${budget.name} (${budget.fiscal_year})`, 50, yPosition)
        .text(`Total: ₹${parseFloat(budget.total_amount).toLocaleString()}`, 300, yPosition)
        .text(`Spent: ₹${parseFloat(budget.spent_amount).toLocaleString()}`, 450, yPosition);
      yPosition += 20;
      
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
    });
  }
  
  // Transaction Summary
  if (data.transactions && data.transactions.length > 0) {
    yPosition += 20;
    doc.fontSize(16).text('Recent Transactions', 50, yPosition);
    yPosition += 30;
    
    data.transactions.slice(0, 20).forEach(transaction => {
      doc.fontSize(10)
        .text(transaction.transaction_number, 50, yPosition)
        .text(transaction.description.substring(0, 40), 120, yPosition)
        .text(`₹${parseFloat(transaction.amount).toLocaleString()}`, 300, yPosition)
        .text(transaction.status, 400, yPosition)
        .text(new Date(transaction.transaction_date).toLocaleDateString(), 450, yPosition);
      yPosition += 15;
      
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
    });
  }
  
  doc.end();
};

// Generate Excel report
const generateExcelReport = async (data, reportType, res) => {
  const workbook = new ExcelJS.Workbook();
  
  // Budget sheet
  if (data.budgets && data.budgets.length > 0) {
    const budgetSheet = workbook.addWorksheet('Budgets');
    budgetSheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Fiscal Year', key: 'fiscal_year', width: 15 },
      { header: 'Total Amount', key: 'total_amount', width: 15 },
      { header: 'Spent Amount', key: 'spent_amount', width: 15 },
      { header: 'Remaining', key: 'remaining', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Category', key: 'category', width: 15 }
    ];
    
    data.budgets.forEach(budget => {
      budgetSheet.addRow({
        name: budget.name,
        fiscal_year: budget.fiscal_year,
        total_amount: parseFloat(budget.total_amount),
        spent_amount: parseFloat(budget.spent_amount),
        remaining: parseFloat(budget.total_amount) - parseFloat(budget.spent_amount),
        status: budget.status,
        category: budget.category
      });
    });
  }
  
  // Transaction sheet
  if (data.transactions && data.transactions.length > 0) {
    const transactionSheet = workbook.addWorksheet('Transactions');
    transactionSheet.columns = [
      { header: 'Transaction Number', key: 'transaction_number', width: 20 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Type', key: 'transaction_type', width: 15 },
      { header: 'Category', key: 'category', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Date', key: 'transaction_date', width: 15 },
      { header: 'Budget', key: 'budget_name', width: 25 },
      { header: 'Project', key: 'project_name', width: 25 },
      { header: 'Vendor', key: 'vendor_name', width: 25 }
    ];
    
    data.transactions.forEach(transaction => {
      transactionSheet.addRow({
        transaction_number: transaction.transaction_number,
        description: transaction.description,
        amount: parseFloat(transaction.amount),
        transaction_type: transaction.transaction_type,
        category: transaction.category,
        status: transaction.status,
        transaction_date: new Date(transaction.transaction_date),
        budget_name: transaction.Budget?.name || '',
        project_name: transaction.Project?.name || '',
        vendor_name: transaction.Vendor?.name || ''
      });
    });
  }
  
  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${reportType}-report-${Date.now()}.xlsx"`);
  
  await workbook.xlsx.write(res);
  res.end();
};

// Budget report
router.get('/budget/:format', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const { format } = req.params;
    const { fiscal_year, status } = req.query;
    
    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use pdf or excel' });
    }
    
    const where = { institution_id: req.user.institution_id };
    if (fiscal_year) where.fiscal_year = fiscal_year;
    if (status) where.status = status;
    
    const budgets = await Budget.findAll({
      where,
      include: [
        {
          model: Institution,
          attributes: ['name', 'type']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    const reportData = {
      budgets,
      institution: budgets[0]?.Institution,
      reportType: 'Budget Report'
    };
    
    logger.audit('Budget report generated', {
      userId: req.user.id,
      format,
      budgetCount: budgets.length
    });
    
    if (format === 'pdf') {
      await generatePDFReport(reportData, 'Budget', res);
    } else {
      await generateExcelReport(reportData, 'Budget', res);
    }
  } catch (error) {
    logger.error('Budget report generation error:', error);
    res.status(500).json({ error: 'Failed to generate budget report' });
  }
});

// Transaction report
router.get('/transactions/:format', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const { format } = req.params;
    const { start_date, end_date, status, transaction_type, category, budget_id } = req.query;
    
    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use pdf or excel' });
    }
    
    const where = {};
    if (status) where.status = status;
    if (transaction_type) where.transaction_type = transaction_type;
    if (category) where.category = category;
    if (budget_id) where.budget_id = budget_id;
    
    if (start_date || end_date) {
      where.transaction_date = {};
      if (start_date) where.transaction_date[Op.gte] = new Date(start_date);
      if (end_date) where.transaction_date[Op.lte] = new Date(end_date);
    }
    
    const transactions = await Transaction.findAll({
      where,
      include: [
        {
          model: Budget,
          where: { institution_id: req.user.institution_id },
          include: [
            {
              model: Institution,
              attributes: ['name', 'type']
            }
          ]
        },
        {
          model: Project,
          attributes: ['name'],
          required: false
        },
        {
          model: Vendor,
          attributes: ['name'],
          required: false
        }
      ],
      order: [['transaction_date', 'DESC']],
      limit: 1000 // Limit for performance
    });
    
    const reportData = {
      transactions,
      institution: transactions[0]?.Budget?.Institution,
      reportType: 'Transaction Report'
    };
    
    logger.audit('Transaction report generated', {
      userId: req.user.id,
      format,
      transactionCount: transactions.length
    });
    
    if (format === 'pdf') {
      await generatePDFReport(reportData, 'Transaction', res);
    } else {
      await generateExcelReport(reportData, 'Transaction', res);
    }
  } catch (error) {
    logger.error('Transaction report generation error:', error);
    res.status(500).json({ error: 'Failed to generate transaction report' });
  }
});

// Comprehensive financial report
router.get('/financial/:format', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const { format } = req.params;
    const { fiscal_year } = req.query;
    const currentYear = fiscal_year || new Date().getFullYear().toString();
    
    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use pdf or excel' });
    }
    
    // Get budgets
    const budgets = await Budget.findAll({
      where: { 
        institution_id: req.user.institution_id,
        fiscal_year: currentYear
      },
      include: [
        {
          model: Institution,
          attributes: ['name', 'type']
        }
      ]
    });
    
    // Get transactions
    const transactions = await Transaction.findAll({
      include: [
        {
          model: Budget,
          where: { 
            institution_id: req.user.institution_id,
            fiscal_year: currentYear
          }
        },
        {
          model: Project,
          attributes: ['name'],
          required: false
        },
        {
          model: Vendor,
          attributes: ['name'],
          required: false
        }
      ],
      order: [['transaction_date', 'DESC']],
      limit: 500
    });
    
    // Get department summary
    const departments = await Department.findAll({
      where: { institution_id: req.user.institution_id },
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
      group: ['Department.id'],
      raw: true
    });
    
    const reportData = {
      budgets,
      transactions,
      departments,
      institution: budgets[0]?.Institution,
      reportType: 'Comprehensive Financial Report',
      fiscal_year: currentYear
    };
    
    logger.audit('Financial report generated', {
      userId: req.user.id,
      format,
      fiscal_year: currentYear
    });
    
    if (format === 'pdf') {
      await generatePDFReport(reportData, 'Financial', res);
    } else {
      await generateExcelReport(reportData, 'Financial', res);
    }
  } catch (error) {
    logger.error('Financial report generation error:', error);
    res.status(500).json({ error: 'Failed to generate financial report' });
  }
});

// Audit report
router.get('/audit/:format', authenticateToken, authorizeInstitution, async (req, res) => {
  try {
    const { format } = req.params;
    const { start_date, end_date, action, entity_type } = req.query;
    
    if (!['pdf', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Use pdf or excel' });
    }
    
    const AuditLog = require('../models').AuditLog;
    const User = require('../models').User;
    
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
          where: { institution_id: req.user.institution_id },
          attributes: ['first_name', 'last_name', 'email', 'role']
        },
        {
          model: Transaction,
          attributes: ['transaction_number', 'description', 'amount'],
          required: false
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: 1000
    });
    
    const reportData = {
      auditLogs,
      reportType: 'Audit Trail Report'
    };
    
    logger.audit('Audit report generated', {
      userId: req.user.id,
      format,
      logCount: auditLogs.length
    });
    
    if (format === 'pdf') {
      await generatePDFReport(reportData, 'Audit', res);
    } else {
      await generateExcelReport(reportData, 'Audit', res);
    }
  } catch (error) {
    logger.error('Audit report generation error:', error);
    res.status(500).json({ error: 'Failed to generate audit report' });
  }
});

// Get available report types
router.get('/types', authenticateToken, (req, res) => {
  res.json({
    report_types: [
      {
        type: 'budget',
        name: 'Budget Report',
        description: 'Detailed budget allocation and utilization report',
        formats: ['pdf', 'excel']
      },
      {
        type: 'transactions',
        name: 'Transaction Report',
        description: 'Comprehensive transaction history and details',
        formats: ['pdf', 'excel']
      },
      {
        type: 'financial',
        name: 'Financial Report',
        description: 'Complete financial overview including budgets, transactions, and department spending',
        formats: ['pdf', 'excel']
      },
      {
        type: 'audit',
        name: 'Audit Trail Report',
        description: 'Complete audit trail of all system activities',
        formats: ['pdf', 'excel']
      }
    ]
  });
});

module.exports = router;
