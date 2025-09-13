import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

// Async thunks
export const fetchDashboardOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getOverview();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch dashboard overview');
    }
  }
);

export const fetchPublicDashboard = createAsyncThunk(
  'dashboard/fetchPublicDashboard',
  async (params, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getPublicDashboard(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch public dashboard');
    }
  }
);

export const fetchBudgetTrends = createAsyncThunk(
  'dashboard/fetchBudgetTrends',
  async (period, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getBudgetTrends(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch budget trends');
    }
  }
);

export const fetchSpendingByCategory = createAsyncThunk(
  'dashboard/fetchSpendingByCategory',
  async (fiscalYear, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getSpendingByCategory(fiscalYear);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch spending by category');
    }
  }
);

export const fetchVendorAnalysis = createAsyncThunk(
  'dashboard/fetchVendorAnalysis',
  async (limit, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getVendorAnalysis(limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch vendor analysis');
    }
  }
);

export const fetchProjectPerformance = createAsyncThunk(
  'dashboard/fetchProjectPerformance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getProjectPerformance();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project performance');
    }
  }
);

const initialState = {
  overview: null,
  publicDashboard: null,
  budgetTrends: null,
  spendingByCategory: null,
  vendorAnalysis: null,
  projectPerformance: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearDashboardData: (state) => {
      state.overview = null;
      state.publicDashboard = null;
      state.budgetTrends = null;
      state.spendingByCategory = null;
      state.vendorAnalysis = null;
      state.projectPerformance = null;
      state.lastUpdated = null;
    },
    updateRealTimeData: (state, action) => {
      // Handle real-time updates from WebSocket
      const { type, data } = action.payload;
      
      switch (type) {
        case 'budget-created':
        case 'budget-updated':
          if (state.overview) {
            // Update budget summary in overview
            state.overview.budget_summary = {
              ...state.overview.budget_summary,
              ...data.budget_summary
            };
          }
          break;
        case 'transaction-created':
        case 'transaction-approved':
          if (state.overview) {
            // Update transaction summary in overview
            state.overview.transaction_summary = {
              ...state.overview.transaction_summary,
              recent_transactions: [
                data.transaction,
                ...state.overview.transaction_summary.recent_transactions.slice(0, 9)
              ]
            };
          }
          break;
        default:
          break;
      }
      
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Dashboard Overview
      .addCase(fetchDashboardOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Public Dashboard
      .addCase(fetchPublicDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publicDashboard = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchPublicDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Budget Trends
      .addCase(fetchBudgetTrends.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBudgetTrends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.budgetTrends = action.payload;
      })
      .addCase(fetchBudgetTrends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Spending by Category
      .addCase(fetchSpendingByCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSpendingByCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spendingByCategory = action.payload;
      })
      .addCase(fetchSpendingByCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Vendor Analysis
      .addCase(fetchVendorAnalysis.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorAnalysis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendorAnalysis = action.payload;
      })
      .addCase(fetchVendorAnalysis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Project Performance
      .addCase(fetchProjectPerformance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectPerformance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projectPerformance = action.payload;
      })
      .addCase(fetchProjectPerformance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearDashboardData,
  updateRealTimeData,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
