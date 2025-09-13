const sequelize = require('../config/database');
const User = require('./User');
const Institution = require('./Institution');
const Budget = require('./Budget');
const Department = require('./Department');
const Project = require('./Project');
const Transaction = require('./Transaction');
const Vendor = require('./Vendor');
const AuditLog = require('./AuditLog');
const BlockchainRecord = require('./BlockchainRecord');

// Define associations
User.belongsTo(Institution, { foreignKey: 'institution_id' });
Institution.hasMany(User, { foreignKey: 'institution_id' });

Institution.hasMany(Budget, { foreignKey: 'institution_id' });
Budget.belongsTo(Institution, { foreignKey: 'institution_id' });

Institution.hasMany(Department, { foreignKey: 'institution_id' });
Department.belongsTo(Institution, { foreignKey: 'institution_id' });

Department.hasMany(Project, { foreignKey: 'department_id' });
Project.belongsTo(Department, { foreignKey: 'department_id' });

Budget.hasMany(Transaction, { foreignKey: 'budget_id' });
Transaction.belongsTo(Budget, { foreignKey: 'budget_id' });

Project.hasMany(Transaction, { foreignKey: 'project_id' });
Transaction.belongsTo(Project, { foreignKey: 'project_id' });

Vendor.hasMany(Transaction, { foreignKey: 'vendor_id' });
Transaction.belongsTo(Vendor, { foreignKey: 'vendor_id' });

User.hasMany(Transaction, { foreignKey: 'approved_by', as: 'ApprovedTransactions' });
Transaction.belongsTo(User, { foreignKey: 'approved_by', as: 'Approver' });

User.hasMany(AuditLog, { foreignKey: 'user_id' });
AuditLog.belongsTo(User, { foreignKey: 'user_id' });

Transaction.hasMany(AuditLog, { foreignKey: 'transaction_id' });
AuditLog.belongsTo(Transaction, { foreignKey: 'transaction_id' });

Transaction.hasOne(BlockchainRecord, { foreignKey: 'transaction_id' });
BlockchainRecord.belongsTo(Transaction, { foreignKey: 'transaction_id' });

module.exports = {
  sequelize,
  User,
  Institution,
  Budget,
  Department,
  Project,
  Transaction,
  Vendor,
  AuditLog,
  BlockchainRecord
};
