import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/admin.css';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SearchAndSort from '../../components/admin/SearchAndSort';

export default function ManageSnacks() {
	const [snacks, setSnacks] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [sortKey, setSortKey] = useState('id');
	const [sortOrder, setSortOrder] = useState('desc');
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

	const handleSort = (key) => {
		if (sortKey === key) {
			setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
		} else {
			setSortKey(key);
			setSortOrder('asc');
		}
	};

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

	const filteredAndSorted = [...snacks]
		.filter((snack) =>
			snack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			snack.price?.toString().includes(searchTerm)
		)
		.sort((a, b) => {
			if (!sortKey) return 0;
			if (sortKey === 'price') {
				const valA = a.price || 0;
				const valB = b.price || 0;
				return sortOrder === 'asc' ? valA - valB : valB - valA;
			}
			const valA = a[sortKey]?.toString().toLowerCase() || '';
			const valB = b[sortKey]?.toString().toLowerCase() || '';
			return sortOrder === 'asc'
				? valA.localeCompare(valB)
				: valB.localeCompare(valA);
		});

	return (
		<div className="movie-management">
			<div className="movie-management-header">
				<h2 className="section-title">Quản lý đồ ăn rạp</h2>
				<button className="add-movie-btn" onClick={() => navigate('/admin/snacks/create')}>
					+ Thêm món ăn
				</button>
			</div>

			<SearchAndSort
				searchTerm={searchTerm}
				onSearchChange={setSearchTerm}
				sortKey={sortKey}
				sortOrder={sortOrder}
				onSort={handleSort}
				columns={[
					{ key: 'id', label: 'Mã món' },
					{ key: 'name', label: 'Tên món' },
					{ key: 'price', label: 'Giá' }
				]}
			/>

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
					{filteredAndSorted.map((snack) => (
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
