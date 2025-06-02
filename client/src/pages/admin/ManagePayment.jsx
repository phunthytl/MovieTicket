import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/admin.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SearchAndSort from '../../components/admin/SearchAndSort';

export default function ManagePayments() {
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayments = async () => {
        try {
            const res = await axiosClient.get('payments/payments/');
            setPayments(res.data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách thanh toán:', error);
        }
        };

        fetchPayments();
    }, []);

    const handleSort = (key) => {
        if (sortKey === key) {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
        setSortKey(key);
        setSortOrder('asc');
        }
    };

    const handleDelete = async (paymentId) => {
        if (window.confirm('Bạn có chắc muốn xoá thanh toán này?')) {
        try {
            await axiosClient.delete(`payments/payments/${paymentId}/`);
            setPayments(prev => prev.filter(p => p.id !== paymentId));
        } catch (error) {
            console.error('Lỗi khi xoá thanh toán:', error);
        }
        }
    };

    const handleChangeStatus = async (payment) => {
        // Nếu trạng thái là canceled thì không cho đổi
        if (payment.status === 'canceled') {
            alert('Không thể thay đổi trạng thái của thanh toán đã bị hủy.');
            return;
        }

        // Chuyển trạng thái từ pending -> paid, hoặc ngược lại
        const newStatus = payment.status === 'pending' ? 'paid' : 'pending';

        if (window.confirm(`Bạn có chắc muốn đổi trạng thái sang "${newStatus}"?`)) {
            try {
                await axiosClient.patch(`payments/payments/${payment.id}/`, { status: newStatus });
                setPayments(prev =>
                    prev.map(p => p.id === payment.id ? { ...p, status: newStatus } : p)
                );
            } catch (error) {
                console.error('Lỗi khi cập nhật trạng thái:', error);
            }
        }
    };
    
    // Lọc và sắp xếp
    const filteredAndSorted = [...payments]
        .filter(p =>
        p.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toString().includes(searchTerm)
        )
        .sort((a, b) => {
        if (!sortKey) return 0;
        const valA = a[sortKey]?.toString().toLowerCase() || '';
        const valB = b[sortKey]?.toString().toLowerCase() || '';
        return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        });

    return (
        <div className="payment-management">
        <div className="payment-management-header">
            <h2 className="section-title">Quản lý thanh toán</h2>
        </div>

        <SearchAndSort
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            columns={[
            { key: 'id', label: 'ID' },
            { key: 'status', label: 'Trạng thái' },
            { key: 'created_at', label: 'Ngày tạo' },
            { key: 'total_price', label: 'Tổng tiền' },
            ]}
        />

        <table className="admin-table">
            <thead>
            <tr>
                <th>ID</th>
                <th>Người dùng</th>
                <th>Vé</th>
                <th>Đồ ăn</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {filteredAndSorted.map(payment => (
                <tr key={payment.id}>
                <td>{payment.id}</td>
                <td>{payment.user.username}</td>
                <td>
                    {payment.tickets && Object.entries(payment.tickets).length > 0 ? (
                    Object.entries(payment.tickets).map(([showtimeId, seats]) => (
                        <div key={showtimeId}>
                        Suất {showtimeId}: {seats.join(', ')}
                        </div>
                    ))
                    ) : (
                    'Không có'
                    )}
                </td>
                <td>{payment.snacks.map(s => `${s.snack} x${s.quantity}`).join(', ') || 'Không có'}</td>
                <td>{payment.total_price.toLocaleString('vi-VN')}₫</td>
                <td>
                    <button
                    className={`status-btn status-${payment.status}`}
                    onClick={() => handleChangeStatus(payment)}
                    >
                    {payment.status}
                    </button>
                </td>
                <td>{new Date(payment.created_at).toLocaleString()}</td>
                <td className="action-buttons">
                    <button onClick={() => handleDelete(payment.id)}>
                    <FaTrash color="red" />
                    </button>
                </td>
                </tr>
            ))}
            {filteredAndSorted.length === 0 && (
                <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                </tr>
            )}
            </tbody>
        </table>
        </div>
    );
}
