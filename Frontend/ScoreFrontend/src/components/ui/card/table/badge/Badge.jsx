// Badge.jsx
import React from 'react';
import './Badge.css'
const Badge = ({ children, className, variant = "primary" }) => {
  const variantClass = variant === "secondary" ? "badge-secondary" : "badge-primary";
  return <span className={`badge ${variantClass} ${className}`}>{children}</span>;
};

export default Badge;
