import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/admin/admin.css';

export default function AdminHeader() {
    const userInfo = JSON.parse(localStorage.getItem('adminInfo')) || {};
    const name = userInfo.username || 'Admin';
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        navigate('/admin/login');
    };

    return (
        <header className="admin-header">
        <div className="admin-header-left">
            <h2>Quản trị hệ thống</h2>
        </div>
        <div className="admin-header-right">
            <span className="admin-name">Xin chào, {name}</span>
            <button className="logout-btn" onClick={handleLogout}>Đăng xuất</button>
        </div>
        </header>
    );
}
