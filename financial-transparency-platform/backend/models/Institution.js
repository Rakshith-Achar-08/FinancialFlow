const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Institution = sequelize.define('Institution', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200]
    }
  },
  type: {
    type: DataTypes.ENUM('government', 'ngo', 'college', 'school', 'university', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contact_email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  contact_phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  registration_number: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  tax_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  logo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  established_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'India'
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'institutions'
});

module.exports = Institution;
