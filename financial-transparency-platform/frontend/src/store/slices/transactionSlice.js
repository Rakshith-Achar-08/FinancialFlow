import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transaction/fetchTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transactions');
    }
  }
);

export const fetchTransactionById = createAsyncThunk(
  'transaction/fetchTransactionById',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactionById(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transaction');
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transaction/createTransaction',
  async (transactionData, { rejectWithValue }) => {
    try {
      const response = await transactionService.createTransaction(transactionData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create transaction');
    }
  }
);

export const approveTransaction = createAsyncThunk(
  'transaction/approveTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await transactionService.approveTransaction(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to approve transaction');
    }
  }
);

export const rejectTransaction = createAsyncThunk(
  'transaction/rejectTransaction',
  async ({ transactionId, reason }, { rejectWithValue }) => {
    try {
      const response = await transactionService.rejectTransaction(transactionId, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to reject transaction');
    }
  }
);

export const completeTransaction = createAsyncThunk(
  'transaction/completeTransaction',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await transactionService.completeTransaction(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to complete transaction');
    }
  }
);

export const fetchTransactionAudit = createAsyncThunk(
  'transaction/fetchTransactionAudit',
  async (transactionId, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactionAudit(transactionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit trail');
    }
  }
);

export const fetchPublicTransactions = createAsyncThunk(
  'transaction/fetchPublicTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await transactionService.getPublicTransactions(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch public transactions');
    }
  }
);

const initialState = {
  transactions: [],
  currentTransaction: null,
  transactionAudit: null,
  publicTransactions: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  isLoading: false,
  error: null,
  filters: {
    budget_id: '',
    project_id: '',
    vendor_id: '',
    status: '',
    transaction_type: '',
    category: '',
    start_date: '',
    end_date: '',
  },
};

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTransaction: (state) => {
      state.currentTransaction = null;
      state.transactionAudit = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        budget_id: '',
        project_id: '',
        vendor_id: '',
        status: '',
        transaction_type: '',
        category: '',
        start_date: '',
        end_date: '',
      };
    },
    updateTransactionInList: (state, action) => {
      const index = state.transactions.findIndex(transaction => transaction.id === action.payload.id);
      if (index !== -1) {
        state.transactions[index] = { ...state.transactions[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Transaction by ID
      .addCase(fetchTransactionById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTransaction = action.payload.transaction;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Transaction
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload.transaction);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Approve Transaction
      .addCase(approveTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const approvedTransaction = action.payload.transaction;
        
        // Update in transactions list
        const index = state.transactions.findIndex(transaction => transaction.id === approvedTransaction.id);
        if (index !== -1) {
          state.transactions[index] = approvedTransaction;
        }
        
        // Update current transaction if it's the same
        if (state.currentTransaction && state.currentTransaction.id === approvedTransaction.id) {
          state.currentTransaction = approvedTransaction;
        }
      })
      .addCase(approveTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Reject Transaction
      .addCase(rejectTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const rejectedTransaction = action.payload.transaction;
        
        // Update in transactions list
        const index = state.transactions.findIndex(transaction => transaction.id === rejectedTransaction.id);
        if (index !== -1) {
          state.transactions[index] = rejectedTransaction;
        }
        
        // Update current transaction if it's the same
        if (state.currentTransaction && state.currentTransaction.id === rejectedTransaction.id) {
          state.currentTransaction = rejectedTransaction;
        }
      })
      .addCase(rejectTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Complete Transaction
      .addCase(completeTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const completedTransaction = action.payload.transaction;
        
        // Update in transactions list
        const index = state.transactions.findIndex(transaction => transaction.id === completedTransaction.id);
        if (index !== -1) {
          state.transactions[index] = completedTransaction;
        }
        
        // Update current transaction if it's the same
        if (state.currentTransaction && state.currentTransaction.id === completedTransaction.id) {
          state.currentTransaction = completedTransaction;
        }
      })
      .addCase(completeTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Transaction Audit
      .addCase(fetchTransactionAudit.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionAudit.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactionAudit = action.payload;
      })
      .addCase(fetchTransactionAudit.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Public Transactions
      .addCase(fetchPublicTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publicTransactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPublicTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentTransaction,
  setFilters,
  clearFilters,
  updateTransactionInList,
} = transactionSlice.actions;

export default transactionSlice.reducer;
