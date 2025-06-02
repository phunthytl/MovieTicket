import React from 'react';
import '../../assets/css/admin/admin.css';

export default function Dashboard() {
    const stats = [
        { label: 'Tổng số phim', value: 34, color: '#4a90e2' },
        { label: 'Số suất chiếu', value: 128, color: '#50e3c2' },
        { label: 'Người dùng', value: 452, color: '#f5a623' },
        { label: 'Doanh thu (₫)', value: '120,500,000', color: '#e94e77' },
    ];

    return (
        <div className="dashboard">
        <h2 className="dashboard-title">Thống kê tổng quan</h2>
        <div className="stat-grid">
        </div>
        </div>
    );
}
