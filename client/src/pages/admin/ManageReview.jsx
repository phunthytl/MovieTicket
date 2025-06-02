import React, { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/admin.css';

export default function ManageReviews() {
	const [reviews, setReviews] = useState([]);

	useEffect(() => {
		const fetchReviews = async () => {
			try {
				const res = await axiosClient.get('movies/reviews/');
				setReviews(res.data);
			} catch (error) {
				console.error('Lỗi khi tải danh sách đánh giá:', error);
			}
		};
		fetchReviews();
	}, []);

	const handleDelete = async (reviewId) => {
		if (window.confirm('Bạn có chắc muốn xoá đánh giá này?')) {
			try {
				await axiosClient.delete(`movies/reviews/${reviewId}/`);
				setReviews((prev) => prev.filter((r) => r.id !== reviewId));
			} catch (error) {
				console.error('Lỗi khi xoá đánh giá:', error);
			}
		}
	};

	return (
		<div className="movie-management">
			<div className="movie-management-header">
				<h2 className="section-title">Quản lý đánh giá</h2>
			</div>

			<table className="admin-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Người dùng</th>
						<th>Phim</th>
						<th>Đánh giá</th>
						<th>Nội dung</th>
						<th>Ngày tạo</th>
						<th>Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{reviews.map((review) => (
						<tr key={review.id}>
							<td>{review.id}</td>
							<td>{review.user.username || '—'}</td>
							<td>{review.movie.name || '—'}</td>
							<td>{review.rate}/5</td>
							<td>{review.comment || '—'}</td>
							<td>{new Date(review.created_at).toLocaleDateString()}</td>
							<td>
								<button onClick={() => handleDelete(review.id)}><FaTrash color="red" /></button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
