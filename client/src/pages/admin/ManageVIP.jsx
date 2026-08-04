import React, { useEffect, useState } from 'react';
import { FaCrown, FaGem, FaAward, FaSearch, FaUserCircle } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/admin.css';

export default function ManageVIP() {
	const [users, setUsers] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortKey, setSortKey] = useState('total_spent');
	const [sortOrder, setSortOrder] = useState('desc');

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await axiosClient.get('users/users/');
				// Lọc bỏ tài khoản admin (is_staff) khỏi danh sách tích lũy VIP của khách hàng
				const customersOnly = res.data.filter((u) => !u.is_staff);
				setUsers(customersOnly);
			} catch (error) {
				console.error('Lỗi khi tải danh sách khách hàng VIP:', error);
			}
		};
		fetchUsers();
	}, []);

	const handleSort = (key) => {
		if (sortKey === key) {
			setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortKey(key);
			setSortOrder('desc'); // Thường xếp từ cao xuống thấp
		}
	};

	const filteredAndSorted = [...users]
		.filter((u) =>
			u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			u.username.toLowerCase().includes(searchTerm.toLowerCase())
		)
		.sort((a, b) => {
			const valA = a[sortKey];
			const valB = b[sortKey];
			if (typeof valA === 'number' && typeof valB === 'number') {
				return sortOrder === 'asc' ? valA - valB : valB - valA;
			}
			const strA = valA?.toString().toLowerCase() || '';
			const strB = valB?.toString().toLowerCase() || '';
			return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
		});

	const getVipBadge = (level) => {
		switch (level) {
			case 3:
				return (
					<span className="status-badge" style={{
						background: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8',
						display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold'
					}}>
						<FaGem /> VIP Kim Cương
					</span>
				);
			case 2:
				return (
					<span className="status-badge" style={{
						background: '#fffbeb', color: '#d97706', border: '1px solid #fef3c7',
						display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold'
					}}>
						<FaCrown /> VIP Vàng
					</span>
				);
			case 1:
				return (
					<span className="status-badge" style={{
						background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
						display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold'
					}}>
						<FaAward /> VIP Bạc
					</span>
				);
			default:
				return (
					<span className="status-badge" style={{
						background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0',
						display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px'
					}}>
						Thường
					</span>
				);
		}
	};

	const getDiscount = (level) => {
		switch (level) {
			case 3: return '15%';
			case 2: return '10%';
			case 1: return '5%';
			default: return '0%';
		}
	};

	return (
		<div className="movie-management">
			<div className="movie-management-header" style={{ marginBottom: '20px' }}>
				<h2 className="section-title"><FaCrown style={{ color: '#d97706', marginRight: '8px' }} /> Quản lý khách hàng thân thiết VIP</h2>
			</div>

			{/* Cấu hình các hạn mức VIP */}
			<div style={{
				display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px'
			}}>
				<div style={{ background: '#f8fafc', padding: '16px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
					<h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}><FaAward /> VIP Bạc (Silver)</h3>
					<p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Chi tiêu tối thiểu: <strong>1.000.000 đ</strong></p>
					<p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#10b981' }}>Chiết khấu trực tiếp: <strong>5%</strong></p>
				</div>
				<div style={{ background: '#fffbeb', padding: '16px', borderRadius: '4px', border: '1px solid #fef3c7' }}>
					<h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#d97706' }}><FaCrown /> VIP Vàng (Gold)</h3>
					<p style={{ margin: 0, fontSize: '14px', color: '#b45309' }}>Chi tiêu tối thiểu: <strong>5.000.000 đ</strong></p>
					<p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#10b981' }}>Chiết khấu trực tiếp: <strong>10%</strong></p>
				</div>
				<div style={{ background: '#fdf2f8', padding: '16px', borderRadius: '4px', border: '1px solid #fbcfe8' }}>
					<h3 style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px', color: '#db2777' }}><FaGem /> VIP Kim Cương (Diamond)</h3>
					<p style={{ margin: 0, fontSize: '14px', color: '#be185d' }}>Chi tiêu tối thiểu: <strong>10.000.000 đ</strong></p>
					<p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#10b981' }}>Chiết khấu trực tiếp: <strong>15%</strong></p>
				</div>
			</div>

			{/* Ô tìm kiếm và lọc */}
			<div className="search-sort-container" style={{
				display: 'flex', gap: '15px', alignItems: 'center', background: '#fff', padding: '16px', borderRadius: '4px', border: '1px solid #f1f5f9', marginBottom: '20px'
			}}>
				<div style={{ position: 'relative', flex: 1 }}>
					<FaSearch style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
					<input
						type="text"
						placeholder="Tìm kiếm khách hàng bằng tên, email, tên đăng nhập..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						style={{
							padding: '12px 12px 12px 36px',
							border: '1px solid #e2e8f0',
							borderRadius: '4px',
							width: '100%',
							boxSizing: 'border-box',
							background: '#f8fafc',
							fontSize: '14px'
						}}
					/>
				</div>
				<div style={{ display: 'flex', gap: '8px' }}>
					<button
						onClick={() => handleSort('total_spent')}
						style={{
							padding: '10px 16px',
							border: '1px solid #e2e8f0',
							borderRadius: '4px',
							background: sortKey === 'total_spent' ? '#3b82f6' : '#fff',
							color: sortKey === 'total_spent' ? '#fff' : '#475569',
							fontWeight: '600',
							fontSize: '14px',
							cursor: 'pointer'
						}}
					>
						Xếp theo chi tiêu {sortKey === 'total_spent' && (sortOrder === 'asc' ? '↑' : '↓')}
					</button>
					<button
						onClick={() => handleSort('vip_level')}
						style={{
							padding: '10px 16px',
							border: '1px solid #e2e8f0',
							borderRadius: '4px',
							background: sortKey === 'vip_level' ? '#3b82f6' : '#fff',
							color: sortKey === 'vip_level' ? '#fff' : '#475569',
							fontWeight: '600',
							fontSize: '14px',
							cursor: 'pointer'
						}}
					>
						Xếp theo cấp độ {sortKey === 'vip_level' && (sortOrder === 'asc' ? '↑' : '↓')}
					</button>
				</div>
			</div>

			{/* Danh sách người dùng */}
			<table className="admin-table">
				<thead>
					<tr>
						<th>Mã ND</th>
						<th>Ảnh đại diện</th>
						<th>Họ tên</th>
						<th>Username</th>
						<th>Email</th>
						<th>Số điện thoại</th>
						<th>Cấp độ VIP</th>
						<th>Tổng chi tiêu (365 ngày)</th>
						<th>Chiết khấu vé</th>
					</tr>
				</thead>
				<tbody>
					{filteredAndSorted.map((u) => (
						<tr key={u.id}>
							<td>{u.id}</td>
							<td>
								{u.avatar ? (
									<img src={u.avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
								) : (
									<FaUserCircle size={32} color="#cbd5e1" />
								)}
							</td>
							<td style={{ fontWeight: '600', color: '#1e293b' }}>{u.name}</td>
							<td>{u.username}</td>
							<td>{u.email}</td>
							<td>{u.phone || '—'}</td>
							<td>{getVipBadge(u.vip_level)}</td>
							<td style={{ fontWeight: 'bold', color: '#10b981' }}>{u.total_spent.toLocaleString()} đ</td>
							<td style={{ fontWeight: 'bold', color: '#3b82f6' }}>{getDiscount(u.vip_level)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
