import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import SearchAndSort from '../../components/admin/SearchAndSort';
import '../../assets/css/admin/admin.css';

export default function ManageClusters() {
	const [clusters, setClusters] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortKey, setSortKey] = useState('id');
	const [sortOrder, setSortOrder] = useState('desc');
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

	const handleSort = (key) => {
		if (sortKey === key) {
			setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortKey(key);
			setSortOrder('asc');
		}
	};

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

	const filteredAndSorted = [...clusters]
		.filter((c) =>
			c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
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
				<h2 className="section-title">Quản lý cụm rạp</h2>
				<button className="add-movie-btn" onClick={() => navigate('/admin/clusters/create')}>
					+ Thêm cụm rạp
				</button>
			</div>

			<SearchAndSort
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				sortKey={sortKey}
				sortOrder={sortOrder}
				onSort={handleSort}
				columns={[
					{ key: 'id', label: 'Mã cụm' },
					{ key: 'name', label: 'Tên cụm rạp' }
				]}
			/>

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
					{filteredAndSorted.map((c) => (
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
