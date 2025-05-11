import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/admin.css';

export default function ManageUsers() {
	const [users, setUsers] = useState([]);
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

	return (
		<div className="movie-management">
			<div className="movie-management-header">
				<h2 className="section-title">Quản lý người dùng</h2>
				<button className="add-movie-btn" onClick={() => navigate('/admin/users/create')}>
					+ Thêm người dùng
				</button>
			</div>

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
					{users.map((user) => (
						<tr key={user.id}>
							<td>{user.id}</td>
							<td>
								{user.avatar ? (
									<img src={user.avatar} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
								) : '—'}
							</td>
							<td>{user.name}</td>
							<td>{user.email}</td>
							<td>{user.username}</td>
							<td>{user.phone || '—'}</td>
							<td>{user.isAdmin ? 'Quản trị viên' : 'Người dùng'}</td>
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
