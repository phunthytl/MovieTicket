import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAdmin = ({ children }) => {
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
    const isLoggedIn = !!localStorage.getItem('adminToken');
    const isAdmin = adminInfo?.isAdmin;
  
    if (isLoggedIn && isAdmin) {
      return children;
    }
  
    return <Navigate to="/admin/login" replace />;
  };

export default RequireAdmin;