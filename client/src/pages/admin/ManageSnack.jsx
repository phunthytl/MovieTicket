import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/admin.css';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function ManageSnacks() {
	const [snacks, setSnacks] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchSnacks = async () => {
			try {
				const res = await axiosClient.get('payments/snacks/');
				setSnacks(res.data);
			} catch (error) {
				console.error('Lỗi khi tải danh sách đồ ăn:', error);
			}
		};

		fetchSnacks();
	}, []);

	const handleDelete = async (snackId) => {
		if (window.confirm('Bạn có chắc muốn xoá món này?')) {
			try {
				await axiosClient.delete(`payments/snacks/${snackId}/`);
				setSnacks((prev) => prev.filter((s) => s.id !== snackId));
			} catch (error) {
				console.error('Lỗi khi xoá món:', error);
			}
		}
	};

	return (
		<div className="movie-management">
			<div className="movie-management-header">
				<h2 className="section-title">Quản lý đồ ăn rạp</h2>
				<button className="add-movie-btn" onClick={() => navigate('/admin/snacks/create')}>
					+ Thêm món ăn
				</button>
			</div>

			<table className="admin-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Tên món</th>
						<th>Giá</th>
						<th>Ảnh</th>
						<th>Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{snacks.map((snack) => (
						<tr key={snack.id}>
							<td>{snack.id}</td>
							<td>{snack.name}</td>
							<td>{snack.price?.toLocaleString()}đ</td>
							<td>
								{snack.image && (
									<img
										src={snack.image}
										alt={snack.name}
										style={{ width: '60px', height: 'auto', borderRadius: '4px' }}
									/>
								)}
							</td>
							<td>
								<button onClick={() => navigate(`/admin/snacks/${snack.id}/edit`)}><FaEdit /></button>
								<button onClick={() => handleDelete(snack.id)}><FaTrash color="red" /></button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
