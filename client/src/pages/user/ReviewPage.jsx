import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/Review.css';
import {
	FaStar, FaHome, FaChevronRight, FaUser, FaClock
} from 'react-icons/fa';

export default function MovieReviewsPage() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [movie, setMovie] = useState(null);
	const [reviews, setReviews] = useState([]);
	const [averageRating, setAverageRating] = useState(0);

	useEffect(() => {
		axiosClient.get(`movies/movies/${id}/`)
			.then(res => {
				setMovie(res.data);
			})
			.catch(err => {
				console.error('Error fetching movie:', err);
			});

		axiosClient.get(`movies/reviews/?movie=${id}`)
			.then(res => {
				setReviews(res.data);

				if (res.data.length > 0) {
					const total = res.data.reduce((sum, review) => sum + review.rate, 0);
					setAverageRating((total / res.data.length).toFixed(1));
				}
			})
			.catch(err => {
				console.error('Error fetching reviews:', err);
			});
	}, [id]);

	const renderStars = (rating) => {
		const stars = [];
		for (let i = 1; i <= 5; i++) {
			stars.push(
				<FaStar
					key={i}
					className={i <= rating ? 'star filled' : 'star'}
				/>
			);
		}
		return stars;
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		return date.toLocaleDateString('vi-VN');
	};

	return (
		<div className="movie-reviews-page">
			<div className="breadcrumb">
				<span className="breadcrumb-link" onClick={() => navigate('/')}>
					<FaHome /> Trang chủ
				</span>
				<FaChevronRight style={{ margin: '0 8px' }} />
				<span className="breadcrumb-link" onClick={() => navigate('/movies?status=Đang chiếu')}>
					Phim đang chiếu
				</span>
				<FaChevronRight style={{ margin: '0 8px' }} />
				<span className="breadcrumb-link" onClick={() => navigate(`/movies/${id}`)}>
					{movie?.name}
				</span>
				<FaChevronRight style={{ margin: '0 8px' }} />
				<span>Đánh giá</span>
			</div>

			<div className="movie-header">
				<div className="movie-poster-review">
					<img src={movie?.poster} alt={movie?.name} />
				</div>
				<div className="movie-info-review">
					<h1>Đánh giá phim {movie?.name || ''}</h1>
					<div className="movie-genres-review">
						<span>Thể loại: {movie?.genres?.map(g => g.name).join(', ')}</span>
					</div>
				</div>
			</div>

			<div className="rating-summary">
				<div className="average-rating">
					<div className="rating-number">
						<FaStar className="star-icon" />
						<span className="rating-value">{averageRating}</span>
						<span className="rating-scale">/5</span>
					</div>
					<div className="review-count">{reviews.length} đánh giá</div>
				</div>
			</div>

			<div className="reviews-section">
				{reviews.length === 0 ? (
					<div className="no-reviews">
						<p>Chưa có đánh giá nào cho phim này</p>
					</div>
				) : (
					<div className="reviews-list">
						{reviews.map(review => (
							<div key={review.id} className="review-item">
								<div className="review-header">
									<div className="reviewer-info">
										<div className="reviewer-avatar">
											<FaUser />
										</div>
										<div className="reviewer-details">
											<h4 className="reviewer-name">
												{review.user?.name || review.user?.username || 'Người dùng'}
											</h4>
											<div className="review-meta">
												<div className="review-rating">
													{renderStars(review.rate)}
												</div>
												<div className="review-time">
													<FaClock />
													<span>{formatDate(review.created_at)}</span>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div className="review-content">
									<p>{review.comment || 'Nữ chính xinh, đáng xem'}</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}