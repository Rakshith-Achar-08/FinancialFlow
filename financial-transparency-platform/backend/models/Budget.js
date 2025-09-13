const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  institution_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fiscal_year: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [4, 10]
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  allocated_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  spent_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'approved', 'active', 'closed', 'suspended'),
    defaultValue: 'draft'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterStartDate(value) {
        if (value <= this.start_date) {
          throw new Error('End date must be after start date');
        }
      }
    }
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('operational', 'capital', 'emergency', 'development', 'maintenance'),
    allowNull: false,
    defaultValue: 'operational'
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'budgets',
  indexes: [
    {
      fields: ['institution_id', 'fiscal_year']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Budget;
