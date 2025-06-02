import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/movieDetail.css';
import {
	FaClock, FaGlobeAsia, FaTag, FaStar, FaUser, FaFilm,
	FaLanguage, FaHome, FaChevronRight
} from 'react-icons/fa';
import { getNext7Days } from '../../utils/dateUtils';

export default function MovieDetailPage() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [movie, setMovie] = useState(null);
	const [cinemas, setCinemas] = useState([]);
	const [showtimes, setShowtimes] = useState([]);
	const [cinemaChains, setCinemaChains] = useState([]);
	const [selectedChain, setSelectedChain] = useState('all');
	const [selectedDate, setSelectedDate] = useState(null);
	const [showAllCinemas, setShowAllCinemas] = useState(false);

	useEffect(() => {
		axiosClient.get(`movies/movies/${id}/`).then(res => setMovie(res.data));

		axiosClient.get('cinemas/clusters/').then(res => {
			const clusterData = [{ id: 'all', name: 'Tất cả' }, ...res.data];
			setCinemaChains(clusterData);
		});

		axiosClient.get('cinemas/cinemas/').then(res => {
			setCinemas(res.data);
		});

		const today = new Date().toISOString().split('T')[0];
		setSelectedDate(today);
	}, [id]);

	useEffect(() => {
		if (selectedDate) {
			axiosClient
				.get(`cinemas/showtimes/?movie=${id}&date=${selectedDate}`)
				.then(res => setShowtimes(res.data));
		}
	}, [id, selectedDate]);

	const filteredCinemas = cinemas.filter(c => {
		const matchCluster = selectedChain === 'all' || c.cluster === selectedChain;
		const hasShowtime = showtimes.some(st => st.cinema === c.id);
		return matchCluster && hasShowtime;
	});

	const displayedCinemas = showAllCinemas ? filteredCinemas : filteredCinemas.slice(0, 5);

	const getShowtimesForCinema = (cinemaId) =>
		showtimes.filter(st => st.cinema === cinemaId);

	const calcEndTime = (start, duration) => {
		const [h, m] = start.split(':').map(Number);
		const total = h * 60 + m + duration;
		const endH = Math.floor(total / 60) % 24;
		const endM = total % 60;
		return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
	};

	const handleShowtimeClick = (showtime) => {
		navigate(`/movies/${id}/booking/${showtime.id}`);
	};

	if (!movie) return <div>Đang tải thông tin phim...</div>;

	return (
		<div className="movie-detail-page">
			{/* Breadcrumb */}
			<div className="breadcrumb">
				<span className="breadcrumb-link" onClick={() => navigate('/')}> <FaHome /> Trang chủ</span>
				<FaChevronRight style={{ margin: '0 8px' }} />
				<span className="breadcrumb-link" onClick={() => navigate('/movies?status=Đang chiếu')}>Phim đang chiếu</span>
				<FaChevronRight style={{ margin: '0 8px' }} />
				<span>{movie.name}</span>
			</div>

			{/* Movie Info */}
			<div className="movie-info-section">
				<div className="poster-container">
					<img src={movie.poster} alt={movie.name} className="poster" />
					<div className="play-button">▶</div>
				</div>
				<div className="info">
					<h2>{movie.name}</h2>
					<p><FaTag /> Thể loại: {movie.genres.map(g => g.name).join(', ')}</p>
					<p><FaClock /> Thời lượng: {movie.duration} phút</p>
					<p><FaGlobeAsia /> Quốc gia: {movie.country}</p>
					{movie.language && <p><FaLanguage /> Ngôn ngữ: {movie.language}</p>}
					{movie.age_rating && <p><FaUser /> Độ tuổi: {movie.age_rating}</p>}
					<div className="description">
						<h4>Nội dung phim</h4>
						<p>{movie.description}</p>
					</div>
					<div className="buttons">
						<button className="trailer" onClick={() => window.open(movie.trailer, '_blank')}><FaFilm /> Xem Trailer</button>
						<button className="rating-detailmovie" onClick={() => navigate(`/movies/${id}/reviews`)}><FaStar /> Xem đánh giá</button>
					</div>
				</div>
			</div>

			{/* Date Picker */}
			<div className="date-picker">
				<h3>Lịch chiếu</h3>
				{getNext7Days().map(date => (
					<button
						key={date.value}
						className={selectedDate === date.value ? 'active' : ''}
						onClick={() => setSelectedDate(date.value)}
					>
						{date.label}
					</button>
				))}
			</div>

			{/* Filter Zone */}
			<div className="cinema-filter-wrapper">
				<div className="cinema-tabs-detail">
					{cinemaChains.map(chain => {
						const isActive = selectedChain === chain.id;
						return (
							<button
								key={chain.id}
								className={`tab-btn-detail${isActive ? ' active' : ''}`}
								onClick={() => setSelectedChain(chain.id)}
								aria-pressed={isActive}
							>
								{chain.name}
							</button>
						);
					})}
				</div>
				{/* Bỏ phần location dropdown */}
			</div>

			{/* CINEMA LIST */}
			<div className="cinema-list">
				{showtimes.length === 0 ? (
					<div className="no-showtime">
						Không có suất chiếu cho ngày {selectedDate}
					</div>
				) : (
					<>
						{displayedCinemas.map(cinema => (
							<div key={cinema.id} className="cinema">
								<h4>{cinema.name}</h4>
								<p>{cinema.address}</p>
								<div className="showtime-buttons">
									{getShowtimesForCinema(cinema.id).map(st => (
										<button
											key={st.id}
											className="showtime-btn"
											onClick={() => handleShowtimeClick(st)}
										>
											{st.start_time.slice(0, 5)} ~ {calcEndTime(st.start_time, movie.duration)}
										</button>
									))}
								</div>
							</div>
						))}

						{!showAllCinemas && filteredCinemas.length > 5 && (
							<button className="see-more" onClick={() => setShowAllCinemas(true)}>Xem thêm</button>
						)}
					</>
				)}
			</div>
		</div>
	);
}
