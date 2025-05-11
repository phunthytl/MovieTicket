import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/bookingModal.css';

export default function BookingModal({ show, onClose, showtime, movie, onOpenFoodModal }) {
  const [seats, setSeats] = useState([]);
  const [seatStatus, setSeatStatus] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);

  useEffect(() => {
    if (!show || !showtime) return;
    fetchData();
  }, [show, showtime]);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get(`cinemas/showtimes/${showtime.id}/`);
      const seatRes = await axiosClient.get(`cinemas/seats/by-room/${res.data.room}/`);
      const statusRes = await axiosClient.get(`cinemas/seat-status/?showtime=${showtime.id}`);

      setSeats(seatRes.data);
      setSeatStatus(statusRes.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    }
  };

  const getSeatStatus = (seatId) => {
    const status = seatStatus.find(s => s.seat === seatId);
    return status ? status.status : 'available';
  };

  const toggleSeat = (seatId) => {
    if (getSeatStatus(seatId) === 'booked') return;

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(s => s !== seatId)
        : [...prev, seatId]
    );
  };

  const parseCode = (matrix_position) => {
    if (!matrix_position || matrix_position.length < 2) return { row: 0, col: 0 };
    const row = parseInt(matrix_position[0]);
    const col = parseInt(matrix_position.slice(1));
    return { row, col };
  };

  const groupedSeats = {};
  seats.forEach(seat => {
    const parsed = parseCode(seat.matrix_position);
    if (!parsed) return;
    const { row, col } = parsed;
    if (!groupedSeats[row]) groupedSeats[row] = [];
    groupedSeats[row][col] = seat;
  });

  if (!show || !showtime) return null;

  const maxCols = Math.max(...Object.values(groupedSeats).map(row => row.length));

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>MUA VÉ XEM PHIM</h2>

        <div className="screen">MÀN HÌNH</div>
        <div className="seat-matrix">
          {Object.keys(groupedSeats).sort().map(row => (
            <div
              className="seat-row"
              key={row}
              style={{ display: 'grid', gridTemplateColumns: `repeat(${maxCols}, 32px)`, gap: '8px' }}
            >
              {Array.from({ length: maxCols }).map((_, col) => {
                const seat = groupedSeats[row][col];
                return seat ? (
                  <div
                    key={seat.id}
                    className={`seat ${getSeatStatus(seat.id)} ${selectedSeats.includes(seat.id) ? 'selected' : ''}`}
                    onClick={() => toggleSeat(seat.id)}
                  >
                    {seat.matrix_position}
                  </div>
                ) : (
                  <div className="seat empty" key={col}></div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="seat-legend">
          <span className="legend green">Ghế trống</span>
          <span className="legend red">Đã chọn</span>
          <span className="legend gray">Đã đặt</span>
        </div>

        <div className="booking-footer">
          <p>Chỗ ngồi: {selectedSeats.join(', ') || 'Chưa chọn'}</p>
          <div className="footer-buttons">
            <button onClick={onClose}>Hủy</button>
            <button onClick={() => onOpenFoodModal({
              movie: movie.id,
              showtime: showtime.id,
              seats: selectedSeats
            })} disabled={selectedSeats.length === 0}>Mua vé</button>
          </div>
        </div>
      </div>
    </div>
  );
}