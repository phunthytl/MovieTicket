import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus, FaTicketAlt } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import SearchAndSort from '../../components/admin/SearchAndSort';
import '../../assets/css/admin/admin.css';

export default function ManageVoucher() {
	const [vouchers, setVouchers] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortKey, setSortKey] = useState('id');
	const [sortOrder, setSortOrder] = useState('desc');
	const navigate = useNavigate();

	const fetchVouchers = async () => {
		try {
			const res = await axiosClient.get('payments/vouchers/', { tokenType: 'admin' });
			setVouchers(res.data);
		} catch (error) {
			console.error('Lỗi khi tải danh sách voucher:', error);
		}
	};

	useEffect(() => {
		fetchVouchers();
	}, []);

	const handleSort = (key) => {
		if (sortKey === key) {
			setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortKey(key);
			setSortOrder('asc');
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm('Bạn có chắc muốn xoá voucher này?')) {
			try {
				await axiosClient.delete(`payments/vouchers/${id}/`, { tokenType: 'admin' });
				setVouchers((prev) => prev.filter((v) => v.id !== id));
			} catch (error) {
				console.error('Lỗi khi xoá voucher:', error);
			}
		}
	};

	const filteredAndSorted = [...vouchers]
		.filter((v) =>
			v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			v.name.toLowerCase().includes(searchTerm.toLowerCase())
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
		<div className="movie-management">
			<div className="movie-management-header">
				<h2 className="section-title"><FaTicketAlt style={{ marginRight: '8px' }} /> Quản lý Voucher / Mã giảm giá</h2>
				<button className="add-movie-btn" onClick={() => navigate('/admin/vouchers/create')}>
					<FaPlus style={{ marginRight: '6px' }} /> Thêm Voucher
				</button>
			</div>

			<SearchAndSort
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				sortKey={sortKey}
				sortOrder={sortOrder}
				onSort={handleSort}
				columns={[
					{ key: 'id', label: 'ID' },
					{ key: 'code', label: 'Mã giảm giá' },
					{ key: 'discount_amount', label: 'Trị giá giảm' },
					{ key: 'end_date', label: 'Hạn dùng' }
				]}
			/>

			<table className="admin-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Mã Code</th>
						<th>Tên Voucher</th>
						<th>Loại</th>
						<th>Trị giá</th>
						<th>Đơn tối thiểu</th>
						<th>Giảm tối đa</th>
						<th>Số lượng</th>
						<th>Hạn dùng</th>
						<th>Trạng thái</th>
						<th>Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{filteredAndSorted.map((v) => (
						<tr key={v.id}>
							<td>{v.id}</td>
							<td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{v.code}</td>
							<td>{v.name}</td>
							<td>{v.discount_type === 'percentage' ? 'Phần trăm (%)' : 'Số tiền cố định'}</td>
							<td>{v.discount_amount.toLocaleString()} {v.discount_type === 'percentage' ? '%' : 'đ'}</td>
							<td>{v.min_spent.toLocaleString()} đ</td>
							<td>{v.max_discount > 0 ? `${v.max_discount.toLocaleString()} đ` : 'Không giới hạn'}</td>
							<td>{v.quantity}</td>
							<td>{v.end_date ? new Date(v.end_date).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</td>
							<td>
								<span className={`status-badge ${v.active ? 'status-active' : 'status-inactive'}`} style={{
									padding: '4px 8px',
									borderRadius: '4px',
									fontSize: '12px',
									fontWeight: '600',
									background: v.active ? '#eff6ff' : '#f1f5f9',
									color: v.active ? '#3b82f6' : '#64748b',
									border: `1px solid ${v.active ? '#bfdbfe' : '#e2e8f0'}`
								}}>
									{v.active ? 'Kích hoạt' : 'Tạm khóa'}
								</span>
							</td>
							<td>
								<button onClick={() => navigate(`/admin/vouchers/${v.id}/edit`)}><FaEdit /></button>
								<button onClick={() => handleDelete(v.id)}><FaTrash color="red" /></button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
