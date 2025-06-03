import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAdmin = ({ children }) => {
    const adminInfo = JSON.parse(localStorage.getItem('adminInfo'));
    const isLoggedIn = !!localStorage.getItem('adminToken');
    const is_staff = adminInfo?.is_staff;
  
    if (isLoggedIn && is_staff) {
        return children;
    }
  
    return <Navigate to="/admin/login" replace />;
};

export default RequireAdmin;