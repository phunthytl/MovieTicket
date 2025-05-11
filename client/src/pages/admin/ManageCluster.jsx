import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/admin.css';

export default function ManageClusters() {
	const [clusters, setClusters] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axiosClient.get('cinemas/clusters/');
				setClusters(res.data);
			} catch (err) {
				console.error('Lỗi khi tải cụm rạp:', err);
			}
		};
		fetchData();
	}, []);

	const handleDelete = async (id) => {
		if (window.confirm('Xoá cụm rạp này?')) {
			try {
				await axiosClient.delete(`cinemas/clusters/${id}/`);
				setClusters((prev) => prev.filter((c) => c.id !== id));
			} catch (err) {
				console.error('Lỗi xoá:', err);
			}
		}
	};

	return (
		<div className="movie-management">
			<div className="movie-management-header">
				<h2 className="section-title">Quản lý cụm rạp</h2>
				<button className="add-movie-btn" onClick={() => navigate('/admin/clusters/create')}>
					+ Thêm cụm rạp
				</button>
			</div>

			<table className="admin-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Ảnh</th>
						<th>Tên cụm rạp</th>
						<th>Mô tả</th>
						<th>Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{clusters.map((c) => (
						<tr key={c.id}>
							<td>{c.id}</td>
							<td>
								{c.image ? (
									<img src={c.image} alt="preview" style={{ width: 60, height: 40, objectFit: 'cover' }} />
								) : '—'}
							</td>
							<td
								style={{ color: '#0d6efd', cursor: 'pointer' }}
								onClick={() => navigate(`/admin/clusters/${c.id}/cinemas`, {
									state: { clusterName: c.name }
								})}
							>
								{c.name}
							</td>
							<td>{c.description || '—'}</td>
							<td>
								<button onClick={() => navigate(`/admin/clusters/${c.id}/edit`)}><FaEdit /></button>
								<button onClick={() => handleDelete(c.id)}><FaTrash color="red" /></button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
