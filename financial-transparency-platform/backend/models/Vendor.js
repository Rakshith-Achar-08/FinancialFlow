const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vendor = sequelize.define('Vendor', {
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
  company_name: {
    type: DataTypes.STRING,
    allowNull: true
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
  contact_person: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'India'
  },
  postal_code: {
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
  vendor_type: {
    type: DataTypes.ENUM('supplier', 'contractor', 'consultant', 'service_provider', 'other'),
    allowNull: false,
    defaultValue: 'supplier'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bank_account: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bank_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ifsc_code: {
    type: DataTypes.STRING,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    allowNull: true,
    validate: {
      min: 0,
      max: 5
    }
  },
  total_transactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_amount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0
  }
}, {
  tableName: 'vendors',
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['vendor_type']
    },
    {
      fields: ['is_active']
    }
  ]
});

module.exports = Vendor;
