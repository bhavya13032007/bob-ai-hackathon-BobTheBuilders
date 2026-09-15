import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, isAuthenticated } = useAuth();

  // Not logged in → go to auth page
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth" replace />;
  }

  // Logged in but wrong role → redirect to their correct dashboard
  if (allowedRole && user.role !== allowedRole) {
    if (user.role === 'recruiter') {
      return <Navigate to="/recruiter" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
