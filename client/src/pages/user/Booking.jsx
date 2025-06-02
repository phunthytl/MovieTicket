import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/booking.css';

export default function BookingPage() {
	const { movieId, id } = useParams();
	const navigate = useNavigate();

	const [showtime, setShowtime] = useState(null);
	const [movie, setMovie] = useState(null);
	const [seats, setSeats] = useState([]);
	const [seatStatus, setSeatStatus] = useState([]);
	const [selectedSeats, setSelectedSeats] = useState([]);
	const [snacks, setSnacks] = useState([]);
	const [selectedSnacks, setSelectedSnacks] = useState({});

	useEffect(() => {
		fetchData();
		fetchSnacks();
	}, [id]);

	const fetchData = async () => {
		try {
			const resShowtime = await axiosClient.get(`cinemas/showtimes/${id}/`);
			setShowtime(resShowtime.data);

			const resMovie = await axiosClient.get(`movies/movies/${movieId}/`);
			setMovie(resMovie.data);

			const resSeats = await axiosClient.get(`cinemas/seats/by-room/${resShowtime.data.room}/`);
			setSeats(resSeats.data);

			const resStatus = await axiosClient.get(`cinemas/seat-status/?showtime=${id}`);
			setSeatStatus(resStatus.data);
		} catch (err) {
			console.error('Lỗi khi tải dữ liệu:', err);
		}
	};

	const fetchSnacks = async () => {
		try {
			const res = await axiosClient.get('payments/snacks/');
			setSnacks(res.data);
		} catch (err) {
			console.error('Lỗi khi tải đồ ăn:', err);
		}
	};

	const getSeatStatus = (seatId) => {
		const status = seatStatus.find(s => s.seat === seatId);
		return status ? status.status : 'available';
	};

	const toggleSeat = (seat) => {
		if (getSeatStatus(seat.id) === 'booked') return;

		const isSelected = selectedSeats.some(s => s.id === seat.id);
		if (isSelected) {
			setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
		} else {
			setSelectedSeats([...selectedSeats, seat]);
		}
	};

	const updateSnackQuantity = (snackId, change) => {
		setSelectedSnacks(prev => {
			const current = prev[snackId] || 0;
			const newQuantity = Math.max(0, current + change);
			if (newQuantity === 0) {
				const { [snackId]: _, ...rest } = prev;
				return rest;
			}
			return { ...prev, [snackId]: newQuantity };
		});
	};

	const parseMatrix = () => {
		const matrix = [];
		seats.forEach(seat => {
			const rowLetter = seat.row;
			const colNumber = seat.column;

			if (!rowLetter || !colNumber) return;

			const rowIndex = rowLetter.charCodeAt(0) - 'A'.charCodeAt(0);
			const colIndex = colNumber - 1;

			if (!matrix[rowIndex]) matrix[rowIndex] = [];
			matrix[rowIndex][colIndex] = seat;
		});
		return matrix;
	};

	const matrix = parseMatrix();
	const colCount = matrix.length ? Math.max(...matrix.map(row => (row ? row.length : 0))) : 0;

	const ticketTotal = selectedSeats.reduce((sum, seat) => sum + (seat.price || 120000), 0);
	const snackTotal = Object.entries(selectedSnacks).reduce((sum, [snackId, quantity]) => {
		const snack = snacks.find(s => s.id === snackId);
		return sum + (snack ? snack.price * quantity : 0);
	}, 0);
	const grandTotal = ticketTotal + snackTotal;

	const handleContinue = async () => {
		if (selectedSeats.length === 0) {
			alert('Vui lòng chọn ít nhất 1 ghế!');
			return;
		}
		// Tạo đối tượng bookingData từ các dữ liệu đã chọn
		const bookingData = {
			showtime: showtime.id,
			movie: movie.id,
			seats: selectedSeats.map(seat => seat.id),
			snacks: Object.entries(selectedSnacks).map(([snackId, quantity]) => ({
				snack: snackId,
				quantity
			})),
			ticket_total: ticketTotal,
			snack_total: snackTotal,
			total_price: grandTotal,
		};
		
		console.log('Booking data gửi đi:', bookingData); 

		try {
			const res = await axiosClient.post('payments/payments/', bookingData, { tokenType: 'user' });

			localStorage.setItem('bookingData', JSON.stringify(bookingData));

			navigate(`/movies/${bookingData.movie}/payments/${res.data.id}`,{
				state: {
					showtime: showtime,
					movie: movie,
				}
			});
		} catch (err) {
			console.error('Lỗi tạo đơn thanh toán:', err);
			alert('Có lỗi khi tạo đơn thanh toán. Vui lòng thử lại.');
		}
	};

	if (!showtime || !movie) {
		return <div className="loading">Đang tải...</div>;
	}

	return (
		<div className="booking-container">
			{/* Header */}
			<div className="booking-header">
				<h1>{movie.title}</h1>
				<div className="showtime-info">
					<span>{showtime.cinema_name}</span>
					<span>{showtime.room_name}</span>
					<span>{showtime.date} - {showtime.time}</span>
				</div>
			</div>

			<div className="booking-content">
				{/* Bên trái - Chọn ghế */}
				<div className="seat-selection">
					<h3>Chọn ghế ngồi</h3>

					<div className="screen">MÀN HÌNH</div>

					<div className="seat-grid">
						{matrix.map((row, rowIdx) => (
							<div key={rowIdx} className="seat-row">
								{[...Array(colCount)].map((_, colIdx) => {
									const seat = row?.[colIdx];
									return (
										<div key={colIdx} className="seat-wrapper">
											{seat ? (
												<div
													className={`seat ${getSeatStatus(seat.id)} ${
														selectedSeats.some(s => s.id === seat.id) ? 'selected' : ''
													}`}
													onClick={() => toggleSeat(seat)}
												>
													{seat.row}{seat.column}
												</div>
											) : (
												<div className="seat empty"></div>
											)}
										</div>
									);
								})}
							</div>
						))}
					</div>

					<div className="seat-legend">
						<div className="legend-item">
							<div className="legend-seat available"></div>
							<span>Ghế trống</span>
						</div>
						<div className="legend-item">
							<div className="legend-seat selected"></div>
							<span>Đã chọn</span>
						</div>
						<div className="legend-item">
							<div className="legend-seat booked"></div>
							<span>Đã đặt</span>
						</div>
					</div>

					<div className="selected-seats">
						<strong>Ghế đã chọn: </strong>
						{selectedSeats.length > 0
							? selectedSeats.map(seat => `${seat.row}${seat.column}`).join(', ')
							: 'Chưa chọn ghế'}
					</div>
				</div>

				{/* Bên phải - Chọn đồ ăn */}
				<div className="snack-selection">
					<h3>Chọn đồ ăn</h3>

					<div className="snack-list">
						{snacks.map(snack => {
							const quantity = selectedSnacks[snack.id] || 0;
							return (
								<div key={snack.id} className="snack-item">
									<div className="snack-info">
										<img src={snack.image || '/default-snack.jpg'} alt={snack.name} />
										<div>
											<h4>{snack.name}</h4>
											<p className="snack-price">{snack.price?.toLocaleString()}đ</p>
										</div>
									</div>

									<div className="quantity-controls">
										<button
											className="qty-btn"
											onClick={() => updateSnackQuantity(snack.id, -1)}
											disabled={quantity === 0}
										>
											-
										</button>
										<span className="quantity">{quantity}</span>
										<button
											className="qty-btn"
											onClick={() => updateSnackQuantity(snack.id, 1)}
										>
											+
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<div className="booking-footer">
				<div className="price-summary">
					<div className="price-row">
						<span>Vé xem phim ({selectedSeats.length} ghế):</span>
						<span>{ticketTotal.toLocaleString()}đ</span>
					</div>
					{snackTotal > 0 && (
						<div className="price-row">
							<span>Đồ ăn & nước uống:</span>
							<span>{snackTotal.toLocaleString()}đ</span>
						</div>
					)}
					<div className="price-row total">
						<span>Tổng cộng:</span>
						<span>{grandTotal.toLocaleString()}đ</span>
					</div>
				</div>

				<div className="footer-buttons">
					<button className="btn-back" onClick={() => navigate(-1)}>
						Quay lại
					</button>
					<button
						className="btn-continue"
						onClick={handleContinue}
						disabled={selectedSeats.length === 0}
					>
						Tiếp tục thanh toán
					</button>
				</div>
			</div>
		</div>
	);
}
