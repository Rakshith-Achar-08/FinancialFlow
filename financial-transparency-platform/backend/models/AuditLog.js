const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  action: {
    type: DataTypes.ENUM('create', 'update', 'delete', 'approve', 'reject', 'view', 'export'),
    allowNull: false
  },
  entity_type: {
    type: DataTypes.ENUM('transaction', 'budget', 'project', 'vendor', 'user', 'institution'),
    allowNull: false
  },
  entity_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  old_values: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  new_values: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.INET,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  session_id: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['transaction_id']
    },
    {
      fields: ['entity_type', 'entity_id']
    },
    {
      fields: ['timestamp']
    },
    {
      fields: ['action']
    }
  ]
});

module.exports = AuditLog;
