import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaUserCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import SearchAndSort from '../../components/admin/SearchAndSort';
import '../../assets/css/admin/admin.css';

export default function ManageUsers() {
	const [users, setUsers] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortKey, setSortKey] = useState('id');
	const [sortOrder, setSortOrder] = useState('desc');
	const navigate = useNavigate();

	useEffect(() => {
		const fetchUsers = async () => {
			try {
				const res = await axiosClient.get('users/users/');
				setUsers(res.data);
			} catch (error) {
				console.error('Lỗi khi tải danh sách người dùng:', error);
			}
		};
		fetchUsers();
	}, []);

	const handleSort = (key) => {
		if (sortKey === key) {
			setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortKey(key);
			setSortOrder('asc');
		}
	};

	const handleDelete = async (userId) => {
		if (window.confirm('Bạn có chắc muốn xoá người dùng này?')) {
			try {
				await axiosClient.delete(`users/users/${userId}/`);
				setUsers((prev) => prev.filter((u) => u.id !== userId));
			} catch (error) {
				console.error('Lỗi khi xoá người dùng:', error);
			}
		}
	};

	const filteredAndSorted = [...users]
		.filter((user) =>
			user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(user.phone || '').includes(searchTerm)
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
				<h2 className="section-title">Quản lý người dùng</h2>
				<button className="add-movie-btn" onClick={() => navigate('/admin/users/create')}>
					+ Thêm người dùng
				</button>
			</div>

			<SearchAndSort
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				sortKey={sortKey}
				sortOrder={sortOrder}
				onSort={handleSort}
				columns={[
					{ key: 'id', label: 'Mã ND' },
					{ key: 'name', label: 'Tên người dùng' },
					{ key: 'username', label: 'Username' }
				]}
			/>

			<table className="admin-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Avatar</th>
						<th>Tên</th>
						<th>Email</th>
						<th>Username</th>
						<th>SĐT</th>
						<th>Quyền</th>
						<th>Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{filteredAndSorted.map((user) => (
						<tr key={user.id}>
							<td>{user.id}</td>
							<td>
								{user.avatar ? (
									<img src={user.avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
								) : (
									<FaUserCircle size={40} color="#cbd5e1" />
								)}
							</td>
							<td>{user.name}</td>
							<td>{user.email}</td>
							<td>{user.username}</td>
							<td>{user.phone || '—'}</td>
							<td>{user.is_staff ? 'Quản trị viên' : 'Người dùng'}</td>
							<td>
								<button onClick={() => navigate(`/admin/users/${user.id}/edit`)}><FaEdit /></button>
								<button onClick={() => handleDelete(user.id)}><FaTrash color="red" /></button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
