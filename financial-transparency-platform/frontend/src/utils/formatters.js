// Currency formatter
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '₹0';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
};

// Number formatter with Indian numbering system
export const formatNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  return new Intl.NumberFormat('en-IN').format(number);
};

// Date formatter
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  return new Date(date).toLocaleDateString('en-IN', formatOptions);
};

// DateTime formatter
export const formatDateTime = (date) => {
  if (!date) return '';
  
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Relative time formatter
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return formatDate(date);
  }
};

// Percentage formatter
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '0%';
  
  return `${Number(value).toFixed(decimals)}%`;
};

// File size formatter
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Status formatter
export const formatStatus = (status) => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

// Format transaction number
export const formatTransactionNumber = (number) => {
  if (!number) return '';
  
  // Format as TXN2024010100001 -> TXN-2024-01-01-00001
  const match = number.match(/^(TXN)(\d{4})(\d{2})(\d{2})(\d+)$/);
  if (match) {
    const [, prefix, year, month, day, sequence] = match;
    return `${prefix}-${year}-${month}-${day}-${sequence}`;
  }
  
  return number;
};

// Format budget utilization
export const formatUtilization = (spent, total) => {
  if (!total || total === 0) return '0%';
  
  const percentage = (spent / total) * 100;
  return formatPercentage(percentage);
};

// Get status color
export const getStatusColor = (status) => {
  const statusColors = {
    // Budget statuses
    draft: 'secondary',
    approved: 'primary',
    active: 'success',
    closed: 'secondary',
    suspended: 'warning',
    cancelled: 'danger',
    
    // Transaction statuses
    pending: 'warning',
    rejected: 'danger',
    completed: 'success',
    
    // Project statuses
    planning: 'secondary',
    on_hold: 'warning',
    overdue: 'danger',
    urgent: 'warning',
    on_track: 'success',
    
    // Audit severity
    low: 'secondary',
    medium: 'warning',
    high: 'danger',
    critical: 'danger',
  };
  
  return statusColors[status] || 'secondary';
};

// Format institution type
export const formatInstitutionType = (type) => {
  const typeMap = {
    government: 'Government',
    ngo: 'NGO',
    college: 'College',
    school: 'School',
    university: 'University',
    other: 'Other',
  };
  
  return typeMap[type] || type;
};

// Format user role
export const formatUserRole = (role) => {
  const roleMap = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    auditor: 'Auditor',
    viewer: 'Viewer',
    public: 'Public',
  };
  
  return roleMap[role] || role;
};
