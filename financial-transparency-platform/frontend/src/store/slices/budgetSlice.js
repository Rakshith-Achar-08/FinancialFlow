import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import budgetService from '../../services/budgetService';

// Async thunks
export const fetchBudgets = createAsyncThunk(
  'budget/fetchBudgets',
  async (params, { rejectWithValue }) => {
    try {
      const response = await budgetService.getBudgets(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch budgets');
    }
  }
);

export const fetchBudgetById = createAsyncThunk(
  'budget/fetchBudgetById',
  async (budgetId, { rejectWithValue }) => {
    try {
      const response = await budgetService.getBudgetById(budgetId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch budget');
    }
  }
);

export const createBudget = createAsyncThunk(
  'budget/createBudget',
  async (budgetData, { rejectWithValue }) => {
    try {
      const response = await budgetService.createBudget(budgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create budget');
    }
  }
);

export const updateBudget = createAsyncThunk(
  'budget/updateBudget',
  async ({ budgetId, budgetData }, { rejectWithValue }) => {
    try {
      const response = await budgetService.updateBudget(budgetId, budgetData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update budget');
    }
  }
);

export const approveBudget = createAsyncThunk(
  'budget/approveBudget',
  async (budgetId, { rejectWithValue }) => {
    try {
      const response = await budgetService.approveBudget(budgetId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to approve budget');
    }
  }
);

export const activateBudget = createAsyncThunk(
  'budget/activateBudget',
  async (budgetId, { rejectWithValue }) => {
    try {
      const response = await budgetService.activateBudget(budgetId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to activate budget');
    }
  }
);

export const deleteBudget = createAsyncThunk(
  'budget/deleteBudget',
  async (budgetId, { rejectWithValue }) => {
    try {
      await budgetService.deleteBudget(budgetId);
      return budgetId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete budget');
    }
  }
);

export const fetchBudgetSummary = createAsyncThunk(
  'budget/fetchBudgetSummary',
  async (budgetId, { rejectWithValue }) => {
    try {
      const response = await budgetService.getBudgetSummary(budgetId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch budget summary');
    }
  }
);

export const fetchPublicBudgets = createAsyncThunk(
  'budget/fetchPublicBudgets',
  async (params, { rejectWithValue }) => {
    try {
      const response = await budgetService.getPublicBudgets(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch public budgets');
    }
  }
);

const initialState = {
  budgets: [],
  currentBudget: null,
  budgetSummary: null,
  publicBudgets: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  },
  isLoading: false,
  error: null,
  filters: {
    fiscal_year: '',
    status: '',
    category: '',
  },
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBudget: (state) => {
      state.currentBudget = null;
      state.budgetSummary = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        fiscal_year: '',
        status: '',
        category: '',
      };
    },
    updateBudgetInList: (state, action) => {
      const index = state.budgets.findIndex(budget => budget.id === action.payload.id);
      if (index !== -1) {
        state.budgets[index] = { ...state.budgets[index], ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Budgets
      .addCase(fetchBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = action.payload.budgets;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Budget by ID
      .addCase(fetchBudgetById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgetById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBudget = action.payload.budget;
      })
      .addCase(fetchBudgetById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Budget
      .addCase(createBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets.unshift(action.payload.budget);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update Budget
      .addCase(updateBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedBudget = action.payload.budget;
        
        // Update in budgets list
        const index = state.budgets.findIndex(budget => budget.id === updatedBudget.id);
        if (index !== -1) {
          state.budgets[index] = updatedBudget;
        }
        
        // Update current budget if it's the same
        if (state.currentBudget && state.currentBudget.id === updatedBudget.id) {
          state.currentBudget = updatedBudget;
        }
      })
      .addCase(updateBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Approve Budget
      .addCase(approveBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        const approvedBudget = action.payload.budget;
        
        // Update in budgets list
        const index = state.budgets.findIndex(budget => budget.id === approvedBudget.id);
        if (index !== -1) {
          state.budgets[index] = approvedBudget;
        }
        
        // Update current budget if it's the same
        if (state.currentBudget && state.currentBudget.id === approvedBudget.id) {
          state.currentBudget = approvedBudget;
        }
      })
      .addCase(approveBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Activate Budget
      .addCase(activateBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(activateBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        const activatedBudget = action.payload.budget;
        
        // Update in budgets list
        const index = state.budgets.findIndex(budget => budget.id === activatedBudget.id);
        if (index !== -1) {
          state.budgets[index] = activatedBudget;
        }
        
        // Update current budget if it's the same
        if (state.currentBudget && state.currentBudget.id === activatedBudget.id) {
          state.currentBudget = activatedBudget;
        }
      })
      .addCase(activateBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete Budget
      .addCase(deleteBudget.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgets = state.budgets.filter(budget => budget.id !== action.payload);
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Budget Summary
      .addCase(fetchBudgetSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgetSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgetSummary = action.payload;
      })
      .addCase(fetchBudgetSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Public Budgets
      .addCase(fetchPublicBudgets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicBudgets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publicBudgets = action.payload.budgets;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPublicBudgets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearCurrentBudget,
  setFilters,
  clearFilters,
  updateBudgetInList,
} = budgetSlice.actions;

export default budgetSlice.reducer;
