import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaChartLine, FaUsers } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import "../../assets/css/admin/Dashboard.css";

export default function Dashboard() {
    const [summaryData, setSummaryData] = useState({});
    const [dateRange, setDateRange] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchSummaryData();
    }, [dateRange]);

    const fetchSummaryData = async () => {
        try {
            const queryParams = new URLSearchParams();
            if (dateRange.start_date) queryParams.append('start_date', dateRange.start_date);
            if (dateRange.end_date) queryParams.append('end_date', dateRange.end_date);

            const res = await axiosClient.get(`cinemas/revenue/summary/?${queryParams.toString()}`);
            if (res.data.status === 'success') {
                setSummaryData(res.data.data || {});
            } else {
                setSummaryData(res.data || {});
            }
        } catch (error) {
            console.error('Lỗi khi tải tổng quan doanh thu:', error);
            setSummaryData({});
        }
    };

    const handleDateChange = (field, value) => {
        setDateRange(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="revenue-dashboard">
            {/* Header */}
            <div className="revenue-header">
                <div className="revenue-title">Tổng quan doanh thu</div>

                {/* Date Range Picker */}
                <div className="date-range-container">
                    <FaCalendarAlt />
                    <div className="date-input-group">
                        <label>Từ ngày:</label>
                        <input
                            type="date"
                            value={dateRange.start_date}
                            onChange={(e) => handleDateChange('start_date', e.target.value)}
                        />
                    </div>
                    <div className="date-input-group">
                        <label>Đến ngày:</label>
                        <input
                            type="date"
                            value={dateRange.end_date}
                            onChange={(e) => handleDateChange('end_date', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            {Object.keys(summaryData).length > 0 && (
                <div className="summary-grid">
                    <div className="summary-card">
                        <div className="summary-card-content">
                            <div className="summary-card-info">
                                <h3>Tổng doanh thu</h3>
                                <p>{formatCurrency(summaryData.total_revenue)}</p>
                            </div>
                            <FaChartLine className="summary-card-icon green" />
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-content">
                            <div className="summary-card-info">
                                <h3>Tổng đơn hàng</h3>
                                <p>{summaryData.total_orders}</p>
                            </div>
                            <FaUsers className="summary-card-icon blue" />
                        </div>
                    </div>

                    <div className="summary-card">
                        <div className="summary-card-content">
                            <div className="summary-card-info">
                                <h3>Trung bình/đơn</h3>
                                <p>{formatCurrency(summaryData.average_order_value)}</p>
                            </div>
                            <FaChartLine className="summary-card-icon orange" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
