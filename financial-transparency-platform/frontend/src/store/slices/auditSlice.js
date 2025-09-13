import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import auditService from '../../services/auditService';

// Async thunks
export const fetchAuditLogs = createAsyncThunk(
  'audit/fetchAuditLogs',
  async (params, { rejectWithValue }) => {
    try {
      const response = await auditService.getAuditLogs(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit logs');
    }
  }
);

export const fetchAuditStats = createAsyncThunk(
  'audit/fetchAuditStats',
  async (period, { rejectWithValue }) => {
    try {
      const response = await auditService.getAuditStats(period);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit statistics');
    }
  }
);

export const fetchBlockchainIntegrity = createAsyncThunk(
  'audit/fetchBlockchainIntegrity',
  async (_, { rejectWithValue }) => {
    try {
      const response = await auditService.getBlockchainIntegrity();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch blockchain integrity');
    }
  }
);

export const fetchSuspiciousActivities = createAsyncThunk(
  'audit/fetchSuspiciousActivities',
  async (days, { rejectWithValue }) => {
    try {
      const response = await auditService.getSuspiciousActivities(days);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch suspicious activities');
    }
  }
);

export const fetchAuditTrail = createAsyncThunk(
  'audit/fetchAuditTrail',
  async ({ entityType, entityId }, { rejectWithValue }) => {
    try {
      const response = await auditService.getAuditTrail(entityType, entityId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch audit trail');
    }
  }
);

export const exportAuditLogs = createAsyncThunk(
  'audit/exportAuditLogs',
  async ({ format, params }, { rejectWithValue }) => {
    try {
      const response = await auditService.exportAuditLogs(format, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Failed to export audit logs');
    }
  }
);

const initialState = {
  auditLogs: [],
  auditStats: null,
  blockchainIntegrity: null,
  suspiciousActivities: [],
  auditTrail: null,
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  },
  isLoading: false,
  error: null,
  filters: {
    action: '',
    entity_type: '',
    user_id: '',
    start_date: '',
    end_date: '',
    severity: '',
  },
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuditTrail: (state) => {
      state.auditTrail = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        action: '',
        entity_type: '',
        user_id: '',
        start_date: '',
        end_date: '',
        severity: '',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Audit Logs
      .addCase(fetchAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auditLogs = action.payload.audit_logs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Audit Stats
      .addCase(fetchAuditStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auditStats = action.payload;
      })
      .addCase(fetchAuditStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Blockchain Integrity
      .addCase(fetchBlockchainIntegrity.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlockchainIntegrity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blockchainIntegrity = action.payload;
      })
      .addCase(fetchBlockchainIntegrity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Suspicious Activities
      .addCase(fetchSuspiciousActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuspiciousActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.suspiciousActivities = action.payload.suspicious_activities;
      })
      .addCase(fetchSuspiciousActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Audit Trail
      .addCase(fetchAuditTrail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAuditTrail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auditTrail = action.payload;
      })
      .addCase(fetchAuditTrail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Export Audit Logs
      .addCase(exportAuditLogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportAuditLogs.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(exportAuditLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearAuditTrail,
  setFilters,
  clearFilters,
} = auditSlice.actions;

export default auditSlice.reducer;
