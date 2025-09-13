import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import budgetReducer from './slices/budgetSlice';
import transactionReducer from './slices/transactionSlice';
import dashboardReducer from './slices/dashboardSlice';
import auditReducer from './slices/auditSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    budget: budgetReducer,
    transaction: transactionReducer,
    dashboard: dashboardReducer,
    audit: auditReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
