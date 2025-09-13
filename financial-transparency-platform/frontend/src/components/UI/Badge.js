import React from 'react';
import { getStatusColor } from '../../utils/formatters';

const Badge = ({ 
  children, 
  variant = 'secondary', 
  size = 'medium',
  className = '',
  status = null 
}) => {
  // If status is provided, use status-based color
  const badgeVariant = status ? getStatusColor(status) : variant;
  
  const baseClasses = 'inline-flex items-center font-medium rounded-full';
  
  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs',
    medium: 'px-2.5 py-0.5 text-xs',
    large: 'px-3 py-1 text-sm',
  };
  
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
  };
  
  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[badgeVariant]}
    ${className}
  `.trim();
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
};

export default Badge;
