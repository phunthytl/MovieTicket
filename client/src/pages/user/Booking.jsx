import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { FaArrowLeft, FaCreditCard, FaGift } from 'react-icons/fa';
import '../../assets/css/user/booking.css';

export default function BookingPage() {
	const { movieId, id } = useParams();
	const navigate = useNavigate();
    const location = useLocation();

	const [showtime, setShowtime] = useState(null);
	const [movie, setMovie] = useState(null);
	const [seats, setSeats] = useState([]);
	const [seatStatus, setSeatStatus] = useState([]);
	const [selectedSeats, setSelectedSeats] = useState([]);
	const [snacks, setSnacks] = useState([]);
	const [selectedSnacks, setSelectedSnacks] = useState({});
	const [vouchers, setVouchers] = useState([]);
	const [selectedVoucher, setSelectedVoucher] = useState(null);
	const [voucherDiscount, setVoucherDiscount] = useState(0);

	useEffect(() => {
		fetchData();
		fetchSnacks();
		fetchVouchers();
	}, [id]);

	const fetchVouchers = async () => {
		try {
			const token = localStorage.getItem('userToken');
			if (token) {
				const res = await axiosClient.get('payments/vouchers/my-vouchers/', { tokenType: 'user' });
				setVouchers(res.data || []);
			}
		} catch (err) {
			console.error('Lỗi khi tải mã giảm giá:', err);
		}
	};

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
	const userInfo = JSON.parse(localStorage.getItem('userInfo'));
	const vipLevel = userInfo?.vip_level || 0;

	let vipDiscountRate = 0;
	let vipTierName = '';
	if (vipLevel === 1) {
		vipDiscountRate = 0.05;
		vipTierName = 'Bạc';
	} else if (vipLevel === 2) {
		vipDiscountRate = 0.10;
		vipTierName = 'Vàng';
	} else if (vipLevel === 3) {
		vipDiscountRate = 0.15;
		vipTierName = 'Kim Cương';
	}

	const subtotal = ticketTotal + snackTotal;
	const vipDiscount = Math.floor(subtotal * vipDiscountRate);

	// Tự động tính toán chiết khấu Voucher và kiểm tra điều kiện min_spent
	useEffect(() => {
		if (!selectedVoucher) {
			setVoucherDiscount(0);
			return;
		}

		if (subtotal < selectedVoucher.min_spent) {
			setSelectedVoucher(null);
			setVoucherDiscount(0);
			alert(`Đơn đặt vé đã thay đổi. Đơn hàng cần đạt tối thiểu ${selectedVoucher.min_spent.toLocaleString()}đ để áp dụng mã ${selectedVoucher.code}.`);
			return;
		}

		let discount = 0;
		if (selectedVoucher.discount_type === 'amount') {
			discount = selectedVoucher.discount_amount;
		} else if (selectedVoucher.discount_type === 'percentage') {
			const pct = Math.floor(subtotal * (selectedVoucher.discount_amount / 100));
			if (selectedVoucher.max_discount && selectedVoucher.max_discount > 0) {
				discount = Math.min(pct, selectedVoucher.max_discount);
			} else {
				discount = pct;
			}
		}
		setVoucherDiscount(discount);
	}, [selectedVoucher, subtotal]);

	const grandTotal = Math.max(0, subtotal - vipDiscount - voucherDiscount);

	const handleContinue = async () => {
        const token = localStorage.getItem('userToken');
        if (!token) {
            alert('Vui lòng đăng nhập để tiếp tục thanh toán.');
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

		if (selectedSeats.length === 0) {
			alert('Vui lòng chọn ít nhất 1 ghế!');
			return;
		}

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
			voucher_code: selectedVoucher ? selectedVoucher.code : null,
		};

		try {
			const res = await axiosClient.post('payments/payments/', bookingData, { tokenType: 'user' });

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
				<h1>{movie.name}</h1>
				<div className="showtime-info">
					<span>{showtime.cinema_name}</span>
					<span>{showtime.room_name}</span>
					<span>{showtime.date}: {showtime.start_time} ~ {showtime.end_time}</span>
				</div>
			</div>

			<div className="booking-content">
				{/* Chọn ghế */}
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

				{/* Right Sidebar */}
				<div className="booking-sidebar">
					{/* Chọn đồ ăn */}
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

						{/* Chọn Khuyến mãi / Voucher - Embedded in right column */}
						<div className="voucher-section-embedded" style={{ borderTop: '1px solid #eee', marginTop: '15px', paddingTop: '15px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
							<h3 style={{ margin: 0, fontSize: '0.95rem', color: '#333', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
								<FaGift color="#dc3545" /> Khuyến mãi / Voucher
							</h3>
							{vouchers.length > 0 ? (
								<div style={{ flex: 1, maxWidth: '180px' }}>
									<select
										className="voucher-select-box"
										value={selectedVoucher ? selectedVoucher.id : ''}
										onChange={(e) => {
											const val = e.target.value;
											if (!val) {
												setSelectedVoucher(null);
											} else {
												const v = vouchers.find(item => item.id === parseInt(val));
												if (v) {
													if (subtotal < v.min_spent) {
														alert(`Đơn đặt vé chưa đạt giá trị tối thiểu ${v.min_spent.toLocaleString()}đ để dùng mã này.`);
													} else {
														setSelectedVoucher(v);
													}
												}
											}
										}}
										style={{
											width: '100%',
											padding: '6px 8px',
											borderRadius: '6px',
											border: '1px solid #ddd',
											fontSize: '12px',
											color: '#333',
											backgroundColor: '#fff',
											cursor: 'pointer',
											outline: 'none'
										}}
									>
										<option value="">-- Chọn mã --</option>
										{vouchers.map(v => (
											<option key={v.id} value={v.id} disabled={subtotal < v.min_spent}>
												{v.code} - Giảm {v.discount_type === 'amount' ? `${v.discount_amount.toLocaleString()}đ` : `${v.discount_amount}%`} {subtotal < v.min_spent ? ' [Chưa đủ]' : ''}
											</option>
										))}
									</select>
								</div>
							) : (
								<p style={{ fontSize: '11px', color: '#999', margin: 0 }}>
									Không có mã khả dụng
								</p>
							)}
						</div>
					</div>

					{/* Hóa đơn & Nút thanh toán */}
					<div className="price-summary-sidebar">
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
							{vipDiscount > 0 && (
								<div className="price-row vip-discount">
									<span>Chiết khấu VIP ({vipTierName} -{vipDiscountRate * 100}%):</span>
									<span style={{ color: '#f59e0b', fontWeight: 'bold' }}>-{vipDiscount.toLocaleString()}đ</span>
								</div>
							)}
							{voucherDiscount > 0 && (
								<div className="price-row voucher-discount" style={{ color: '#10b981' }}>
									<span>Khuyến mãi ({selectedVoucher?.code}):</span>
									<span style={{ fontWeight: 'bold' }}>-{voucherDiscount.toLocaleString()}đ</span>
								</div>
							)}
							<div className="price-row total">
								<span>Tổng cộng:</span>
								<span>{grandTotal.toLocaleString()}đ</span>
							</div>
						</div>

						<div className="footer-buttons">
							<button className="btn-back" onClick={() => navigate(-1)}>
								<FaArrowLeft style={{ marginRight: '6px' }} /> Quay lại
							</button>
							<button
								className="btn-continue"
								onClick={handleContinue}
								disabled={selectedSeats.length === 0}
							>
								<FaCreditCard style={{ marginRight: '6px' }} /> Tiếp tục
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
