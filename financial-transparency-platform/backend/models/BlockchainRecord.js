const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const BlockchainRecord = sequelize.define('BlockchainRecord', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transaction_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true
  },
  block_hash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  previous_hash: {
    type: DataTypes.STRING(64),
    allowNull: true
  },
  merkle_root: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  nonce: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  difficulty: {
    type: DataTypes.INTEGER,
    defaultValue: 4
  },
  data_hash: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  signature: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  validator: {
    type: DataTypes.UUID,
    allowNull: false
  },
  is_valid: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  block_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'blockchain_records',
  indexes: [
    {
      fields: ['transaction_id']
    },
    {
      fields: ['block_hash']
    },
    {
      fields: ['block_number']
    },
    {
      fields: ['timestamp']
    }
  ],
  hooks: {
    beforeCreate: async (record) => {
      // Generate block number if not provided
      if (!record.block_number) {
        const lastBlock = await BlockchainRecord.findOne({
          order: [['block_number', 'DESC']]
        });
        record.block_number = lastBlock ? lastBlock.block_number + 1 : 1;
      }
      
      // Generate data hash from transaction data
      if (!record.data_hash) {
        const Transaction = require('./Transaction');
        const transaction = await Transaction.findByPk(record.transaction_id);
        if (transaction) {
          const dataString = JSON.stringify({
            id: transaction.id,
            amount: transaction.amount,
            description: transaction.description,
            transaction_date: transaction.transaction_date,
            approved_by: transaction.approved_by
          });
          record.data_hash = crypto.createHash('sha256').update(dataString).digest('hex');
        }
      }
      
      // Generate merkle root (simplified - in real blockchain this would be more complex)
      if (!record.merkle_root) {
        record.merkle_root = crypto.createHash('sha256').update(record.data_hash).digest('hex');
      }
      
      // Generate block hash
      if (!record.block_hash) {
        const blockData = `${record.previous_hash || ''}${record.merkle_root}${record.timestamp}${record.nonce}`;
        record.block_hash = crypto.createHash('sha256').update(blockData).digest('hex');
      }
    }
  }
});

// Static method to validate blockchain integrity
BlockchainRecord.validateChain = async function() {
  const blocks = await this.findAll({
    order: [['block_number', 'ASC']]
  });
  
  for (let i = 1; i < blocks.length; i++) {
    const currentBlock = blocks[i];
    const previousBlock = blocks[i - 1];
    
    // Check if previous hash matches
    if (currentBlock.previous_hash !== previousBlock.block_hash) {
      return {
        isValid: false,
        error: `Block ${currentBlock.block_number} has invalid previous hash`
      };
    }
    
    // Verify block hash
    const blockData = `${currentBlock.previous_hash}${currentBlock.merkle_root}${currentBlock.timestamp}${currentBlock.nonce}`;
    const calculatedHash = crypto.createHash('sha256').update(blockData).digest('hex');
    
    if (currentBlock.block_hash !== calculatedHash) {
      return {
        isValid: false,
        error: `Block ${currentBlock.block_number} has invalid hash`
      };
    }
  }
  
  return { isValid: true };
};

module.exports = BlockchainRecord;
