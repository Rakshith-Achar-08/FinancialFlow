const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  budget_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  project_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  vendor_id: {
    type: DataTypes.UUID,
    allowNull: true
  },
  transaction_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  transaction_type: {
    type: DataTypes.ENUM('expense', 'income', 'transfer', 'refund'),
    allowNull: false,
    defaultValue: 'expense'
  },
  category: {
    type: DataTypes.ENUM('salaries', 'equipment', 'services', 'supplies', 'utilities', 'travel', 'maintenance', 'other'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  transaction_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  payment_method: {
    type: DataTypes.ENUM('bank_transfer', 'check', 'cash', 'credit_card', 'online'),
    allowNull: true
  },
  reference_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  invoice_number: {
    type: DataTypes.STRING,
    allowNull: true
  },
  receipt_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  recurring_frequency: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'yearly'),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  exchange_rate: {
    type: DataTypes.DECIMAL(10, 4),
    defaultValue: 1.0000
  },
  tax_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  },
  net_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false
  }
}, {
  tableName: 'transactions',
  indexes: [
    {
      fields: ['budget_id']
    },
    {
      fields: ['project_id']
    },
    {
      fields: ['vendor_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['transaction_date']
    },
    {
      fields: ['transaction_type']
    }
  ],
  hooks: {
    beforeCreate: (transaction) => {
      if (!transaction.net_amount) {
        transaction.net_amount = transaction.amount - (transaction.tax_amount || 0);
      }
    },
    beforeUpdate: (transaction) => {
      if (transaction.changed('amount') || transaction.changed('tax_amount')) {
        transaction.net_amount = transaction.amount - (transaction.tax_amount || 0);
      }
    }
  }
});

module.exports = Transaction;
