const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  department_id: {
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
  code: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1, 50]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  budget_allocated: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  budget_spent: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'),
    defaultValue: 'planning'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
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
  project_manager: {
    type: DataTypes.STRING,
    allowNull: true
  },
  manager_email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  completion_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'projects',
  indexes: [
    {
      fields: ['department_id']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['department_id', 'code']
    }
  ]
});

module.exports = Project;
