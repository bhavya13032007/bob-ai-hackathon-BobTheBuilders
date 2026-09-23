import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Card component to standardize UI design across the application.
 * Supports framer-motion animations via the `animate` prop.
 */
const Card = ({ 
  children, 
  className = '', 
  animate = true, 
  delay = 0, 
  onClick,
  hoverEffect = true 
}) => {
  const baseClasses = `bg-white rounded-2xl border border-gray-100 shadow-sm ${
    hoverEffect ? 'hover:shadow-md transition-all' : ''
  } overflow-hidden ${className}`;

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className={baseClasses}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={baseClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
