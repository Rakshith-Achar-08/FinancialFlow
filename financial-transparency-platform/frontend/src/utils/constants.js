// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    USERS: '/auth/users',
  },
  BUDGET: {
    BASE: '/budget',
    PUBLIC: '/budget/public',
    APPROVE: (id) => `/budget/${id}/approve`,
    ACTIVATE: (id) => `/budget/${id}/activate`,
    SUMMARY: (id) => `/budget/${id}/summary`,
  },
  TRANSACTIONS: {
    BASE: '/transactions',
    PUBLIC: '/transactions/public',
    APPROVE: (id) => `/transactions/${id}/approve`,
    REJECT: (id) => `/transactions/${id}/reject`,
    COMPLETE: (id) => `/transactions/${id}/complete`,
    AUDIT: (id) => `/transactions/${id}/audit`,
  },
  DASHBOARD: {
    OVERVIEW: '/dashboard/overview',
    PUBLIC: '/dashboard/public',
    TRENDS: '/dashboard/trends/budget',
    SPENDING: '/dashboard/spending/category',
    VENDORS: '/dashboard/vendors/analysis',
    PROJECTS: '/dashboard/projects/performance',
  },
  AUDIT: {
    LOGS: '/audit/logs',
    STATS: '/audit/stats',
    BLOCKCHAIN: '/audit/blockchain/integrity',
    SUSPICIOUS: '/audit/suspicious',
    TRAIL: (type, id) => `/audit/trail/${type}/${id}`,
    EXPORT: (format) => `/audit/export/${format}`,
  },
  REPORTS: {
    TYPES: '/reports/types',
    BUDGET: (format) => `/reports/budget/${format}`,
    TRANSACTIONS: (format) => `/reports/transactions/${format}`,
    FINANCIAL: (format) => `/reports/financial/${format}`,
    AUDIT: (format) => `/reports/audit/${format}`,
  },
};

// User roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  AUDITOR: 'auditor',
  VIEWER: 'viewer',
  PUBLIC: 'public',
};

// Budget statuses
export const BUDGET_STATUS = {
  DRAFT: 'draft',
  APPROVED: 'approved',
  ACTIVE: 'active',
  CLOSED: 'closed',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled',
};

// Transaction statuses
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Transaction types
export const TRANSACTION_TYPES = {
  EXPENSE: 'expense',
  INCOME: 'income',
  TRANSFER: 'transfer',
  REFUND: 'refund',
};

// Transaction categories
export const TRANSACTION_CATEGORIES = {
  SALARIES: 'salaries',
  EQUIPMENT: 'equipment',
  SERVICES: 'services',
  SUPPLIES: 'supplies',
  UTILITIES: 'utilities',
  TRAVEL: 'travel',
  MAINTENANCE: 'maintenance',
  OTHER: 'other',
};

// Budget categories
export const BUDGET_CATEGORIES = {
  OPERATIONAL: 'operational',
  CAPITAL: 'capital',
  EMERGENCY: 'emergency',
  DEVELOPMENT: 'development',
  MAINTENANCE: 'maintenance',
};

// Institution types
export const INSTITUTION_TYPES = {
  GOVERNMENT: 'government',
  NGO: 'ngo',
  COLLEGE: 'college',
  SCHOOL: 'school',
  UNIVERSITY: 'university',
  OTHER: 'other',
};

// Project statuses
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Audit actions
export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  VIEW: 'view',
  EXPORT: 'export',
};

// Audit entity types
export const AUDIT_ENTITY_TYPES = {
  TRANSACTION: 'transaction',
  BUDGET: 'budget',
  PROJECT: 'project',
  VENDOR: 'vendor',
  USER: 'user',
  INSTITUTION: 'institution',
};

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Payment methods
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  CHECK: 'check',
  CASH: 'cash',
  CREDIT_CARD: 'credit_card',
  ONLINE: 'online',
};

// Vendor types
export const VENDOR_TYPES = {
  SUPPLIER: 'supplier',
  CONTRACTOR: 'contractor',
  CONSULTANT: 'consultant',
  SERVICE_PROVIDER: 'service_provider',
  OTHER: 'other',
};

// Chart colors
export const CHART_COLORS = {
  PRIMARY: '#3b82f6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  SECONDARY: '#64748b',
  INFO: '#06b6d4',
  PURPLE: '#8b5cf6',
  PINK: '#ec4899',
  INDIGO: '#6366f1',
  TEAL: '#14b8a6',
};

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  ISO: 'yyyy-MM-dd',
  DISPLAY: 'dd/MM/yyyy',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMIT_OPTIONS: [10, 25, 50, 100],
};

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf', 'text/csv'],
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  SIDEBAR_STATE: 'sidebarOpen',
};

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Modal types
export const MODAL_TYPES = {
  CREATE_BUDGET: 'createBudget',
  CREATE_TRANSACTION: 'createTransaction',
  EDIT_PROFILE: 'editProfile',
  CONFIRM_DELETE: 'confirmDelete',
  TRANSACTION_DETAILS: 'transactionDetails',
  BUDGET_DETAILS: 'budgetDetails',
};

// WebSocket events
export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_INSTITUTION: 'join-institution',
  BUDGET_CREATED: 'budget-created',
  BUDGET_UPDATED: 'budget-updated',
  BUDGET_APPROVED: 'budget-approved',
  TRANSACTION_CREATED: 'transaction-created',
  TRANSACTION_APPROVED: 'transaction-approved',
  TRANSACTION_REJECTED: 'transaction-rejected',
};

// Report formats
export const REPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json',
};

// Dashboard periods
export const DASHBOARD_PERIODS = {
  SEVEN_DAYS: '7days',
  THIRTY_DAYS: '30days',
  NINETY_DAYS: '90days',
  TWELVE_MONTHS: '12months',
};

// Status badge variants
export const STATUS_VARIANTS = {
  [BUDGET_STATUS.DRAFT]: 'secondary',
  [BUDGET_STATUS.APPROVED]: 'primary',
  [BUDGET_STATUS.ACTIVE]: 'success',
  [BUDGET_STATUS.CLOSED]: 'secondary',
  [BUDGET_STATUS.SUSPENDED]: 'warning',
  [BUDGET_STATUS.CANCELLED]: 'danger',
  
  [TRANSACTION_STATUS.PENDING]: 'warning',
  [TRANSACTION_STATUS.APPROVED]: 'primary',
  [TRANSACTION_STATUS.REJECTED]: 'danger',
  [TRANSACTION_STATUS.COMPLETED]: 'success',
  [TRANSACTION_STATUS.CANCELLED]: 'danger',
  
  [PROJECT_STATUS.PLANNING]: 'secondary',
  [PROJECT_STATUS.ACTIVE]: 'success',
  [PROJECT_STATUS.ON_HOLD]: 'warning',
  [PROJECT_STATUS.COMPLETED]: 'success',
  [PROJECT_STATUS.CANCELLED]: 'danger',
};

// Form validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[\d\s\-\(\)]{10,}$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 1000,
  AMOUNT_MIN: 0.01,
  AMOUNT_MAX: 999999999.99,
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`,
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_AMOUNT: 'Please enter a valid amount',
  AMOUNT_TOO_LOW: `Amount must be at least ${VALIDATION_RULES.AMOUNT_MIN}`,
  AMOUNT_TOO_HIGH: `Amount cannot exceed ${VALIDATION_RULES.AMOUNT_MAX}`,
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} character`,
  NAME_TOO_LONG: `Name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`,
  DESCRIPTION_TOO_LONG: `Description cannot exceed ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} characters`,
  INVALID_DATE: 'Please enter a valid date',
  END_DATE_BEFORE_START: 'End date must be after start date',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Server error. Please try again later.',
};
