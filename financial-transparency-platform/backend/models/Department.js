const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Department = sequelize.define('Department', {
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
  code: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1, 20]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  head_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  head_email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  budget_allocation: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  parent_department_id: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'departments',
  indexes: [
    {
      fields: ['institution_id']
    },
    {
      unique: true,
      fields: ['institution_id', 'code']
    }
  ]
});

// Self-referential association for parent-child departments
Department.belongsTo(Department, { as: 'ParentDepartment', foreignKey: 'parent_department_id' });
Department.hasMany(Department, { as: 'SubDepartments', foreignKey: 'parent_department_id' });

module.exports = Department;
