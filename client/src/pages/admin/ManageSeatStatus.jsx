import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { FaTicketAlt, FaTrash, FaUndo, FaSave } from 'react-icons/fa';
import '../../assets/css/admin/SeatStatus.css';

export default function ManageSeatStatus() {
	const { id } = useParams();
	const navigate = useNavigate();

	const [showtime, setShowtime] = useState(null);
	const [seats, setSeats] = useState([]);
	const [seatStatus, setSeatStatus] = useState([]);
	const [selected, setSelected] = useState(new Set());
	const [mode, setMode] = useState(null);

	useEffect(() => {
		fetchData();
	}, [id]);

	const fetchData = async () => {
		try {
			const resShowtime = await axiosClient.get(`cinemas/showtimes/${id}/`);
			setShowtime(resShowtime.data);

			const resSeats = await axiosClient.get(`cinemas/seats/by-room/${resShowtime.data.room}/`);
			setSeats(resSeats.data);

			const resStatus = await axiosClient.get(`cinemas/seat-status/?showtime=${id}`);
			setSeatStatus(resStatus.data);
		} catch (err) {
			console.error('Lỗi khi tải dữ liệu:', err);
		}
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

	const colCount = matrix.length
		? Math.max(...matrix.map(row => (row ? row.length : 0)))
		: 0;

	// Kiểm tra trạng thái ghế hiện tại
	const getSeatStatus = (seatId) => {
		const statusObj = seatStatus.find(s => s.seat === seatId);
		return statusObj ? statusObj.status : 'available';
	};

	// Lấy id trạng thái ghế đang được đặt (dùng để update)
	const getStatusId = (seatId) => {
		const status = seatStatus.find(s => s.seat === seatId);
		return status?.id;
	};

	// Chọn / bỏ chọn ghế
	const toggleSelect = (seat) => {
		if (!mode) return;

		const currentStatus = getSeatStatus(seat.id);

		if (mode === 'book' && currentStatus === 'booked') return;
		if (mode === 'cancel' && currentStatus === 'available') return;

		const newSet = new Set(selected);
		if (newSet.has(seat.id)) {
			newSet.delete(seat.id);
		} else {
			newSet.add(seat.id);
		}
		setSelected(newSet);
	};

	const getSeatClass = (seat) => {
		const status = getSeatStatus(seat.id);
		const selectedClass = selected.has(seat.id)
			? mode === 'book' ? 'selected-book' : 'selected-cancel'
			: '';
		const isBlocked =
			(mode === 'book' && status === 'booked') ||
			(mode === 'cancel' && status === 'available');
		const clickClass = isBlocked ? '' : 'can-click';

		return `seat ${status === 'booked' ? 'taken' : ''} ${selectedClass} ${clickClass}`;
	};

	// Đặt ghế (chuyển status từ available -> booked)
	const handleBook = async () => {
		try {
			await Promise.all(
				Array.from(selected).map(seatId => {
					const statusId = getStatusId(seatId);
					if (statusId) {
						// update status thành booked
						return axiosClient.patch(`cinemas/seat-status/${statusId}/`, {
							status: 'booked',
						});
					} else {
						// chưa có bản ghi, tạo mới với booked
						return axiosClient.post('cinemas/seat-status/', {
							seat: seatId,
							showtime: showtime.id,
							status: 'booked',
						});
					}
				})
			);
			alert('Đặt ghế thành công!');
			setSelected(new Set());
			setMode(null);
			fetchData();
		} catch (err) {
			console.error('Lỗi đặt ghế:', err);
		}
	};

	// Hủy ghế (chuyển trạng thái booked -> available)
	const handleCancel = async () => {
		try {
			await Promise.all(
				Array.from(selected).map(seatId => {
					const statusId = getStatusId(seatId);
					if (statusId) {
						return axiosClient.patch(`cinemas/seat-status/${statusId}/`, {
							status: 'available',
						});
					}
					return Promise.resolve();
				})
			);
			alert('Hủy ghế thành công!');
			setSelected(new Set());
			setMode(null);
			fetchData();
		} catch (err) {
			console.error('Lỗi hủy ghế:', err);
		}
	};

	return (
		<div className="seats-form-container">
			{showtime && (
				<>
					<div className="showtime-header">
						<h2>
							{showtime.movie_name} – {showtime.cinema_name} – {showtime.room_name} – {showtime.date}
						</h2>
					</div>

					<div style={{ margin: '16px 0', display: 'flex', gap: 12 }}>
						{!mode && (
							<>
								<button className="btn-save" onClick={() => setMode('book')}>
									<FaTicketAlt /> Đặt ghế
								</button>
								<button className="btn-delete" onClick={() => setMode('cancel')}>
									<FaTrash /> Hủy ghế
								</button>
							</>
						)}
						{mode && (
							<button
								className="btn-cancel"
								onClick={() => {
									setMode(null);
									setSelected(new Set());
								}}
							>
								<FaUndo /> Thoát
							</button>
						)}
						<button className="btn-back" onClick={() => navigate('/admin/showtimes')}>
							↩ Quay lại
						</button>
					</div>

					<div className="seat-grid-container">
						<div className="seat-grid">
							{matrix.map((row, rowIdx) => (
								<div key={rowIdx} className="seat-row">
									{[...Array(colCount)].map((_, colIdx) => {
										const seat = row?.[colIdx];
										return (
											<div key={colIdx} className="seat-wrapper">
												{seat ? (
													<div
														className={getSeatClass(seat)}
														onClick={() => toggleSelect(seat)}
													></div>
												) : (
													<div style={{ width: 40, height: 40 }}></div>
												)}
											</div>
										);
									})}
								</div>
							))}
						</div>
					</div>

					{mode === 'book' && selected.size > 0 && (
						<button className="btn-save" onClick={handleBook}>
							<FaSave /> Xác nhận đặt ({selected.size})
						</button>
					)}

					{mode === 'cancel' && selected.size > 0 && (
						<button className="btn-delete" onClick={handleCancel}>
							<FaTrash /> Xác nhận hủy ({selected.size})
						</button>
					)}
				</>
			)}
		</div>
	);
}
