import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { FaTicketAlt, FaTrash, FaUndo, FaSave } from 'react-icons/fa';
import '../../assets/css/admin/seats.css';

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
      const res = await axiosClient.get(`cinemas/showtimes/${id}/`);
      setShowtime(res.data);
      const seatRes = await axiosClient.get(`cinemas/seats/by-room/${res.data.room}/`);
      setSeats(seatRes.data);
      const statusRes = await axiosClient.get(`cinemas/seat-status/?showtime=${id}`);
      setSeatStatus(statusRes.data);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    }
  };

  const parseMatrix = () => {
    const matrix = [];
    for (const seat of seats) {
      const pos = seat.matrix_position;
      let row = 0, col = 0;
      if (pos.length === 4) {
        row = parseInt(pos.slice(0, 2));
        col = parseInt(pos.slice(2));
      } else if (pos.length === 3) {
        row = parseInt(pos.slice(0, 1));
        col = parseInt(pos.slice(1));
      } else {
        row = parseInt(pos[0]);
        col = parseInt(pos.slice(1));
      }
      if (!isNaN(row) && !isNaN(col)) {
        if (!matrix[row]) matrix[row] = [];
        matrix[row][col] = seat;
      }
    }
    return matrix;
  };

  const matrix = parseMatrix();
  const colCount = matrix.length > 0 ? Math.max(...matrix.map(r => r?.length || 0)) : 0;

  const isBooked = (seatId) => seatStatus.some(status => status.seat === seatId);

  const getStatusId = (seatId) => {
    const status = seatStatus.find(s => s.seat === seatId);
    return status?.id;
  };

  const toggleSelect = (seat) => {
    if (!mode) return;

    if (mode === 'cancel' && !isBooked(seat.id)) return;
    if (mode === 'book' && isBooked(seat.id)) return;

    const newSet = new Set(selected);
    newSet.has(seat.id) ? newSet.delete(seat.id) : newSet.add(seat.id);
    setSelected(newSet);
  };

  const getSeatClass = (seat) => {
    const selectedClass = selected.has(seat.id)
      ? mode === 'book' ? ' selected-book' : ' selected-cancel'
      : '';
  
    const isBlocked =
      (mode === 'cancel' && !isBooked(seat.id)) ||
      (mode === 'book' && isBooked(seat.id));
  
    const allowClick = !isBlocked;
  
    const extraClass = allowClick ? ' can-click' : '';
  
    return `seat ${isBooked(seat.id) ? 'taken' : ''}${selectedClass}${extraClass} ${seat.type === 'double' ? 'double' : ''}`;
  };

  const handleBook = async () => {
    try {
      await Promise.all(
        Array.from(selected).map(seatId =>
          axiosClient.post('cinemas/seat-status/', {
            seat: seatId,
            showtime: showtime.id,
            status: 'booked'
          })
        )
      );
      alert('Đặt ghế thành công!');
      setSelected(new Set());
      setMode(null);
      fetchData();
    } catch (err) {
      console.error('Lỗi đặt ghế:', err);
    }
  };

  const handleCancel = async () => {
    try {
      await Promise.all(
        Array.from(selected).map(seatId => {
          const statusId = getStatusId(seatId);
          if (statusId) return axiosClient.delete(`cinemas/seat-status/${statusId}/`);
          return Promise.resolve();
        })
      );
      alert('Huỷ ghế thành công!');
      setSelected(new Set());
      setMode(null);
      fetchData();
    } catch (err) {
      console.error('Lỗi huỷ ghế:', err);
    }
  };

  return (
    <div className="snack-form-container">
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
                <button className="btn-save" onClick={() => setMode('book')}><FaTicketAlt /> Đặt ghế</button>
                <button className="btn-delete" onClick={() => setMode('cancel')}><FaTrash /> Huỷ ghế</button>
              </>
            )}
            {mode && (
              <button className="btn-cancel" onClick={() => { setMode(null); setSelected(new Set()); }}><FaUndo /> Thoát</button>
            )}
            <button className="btn-back" onClick={() => navigate('/admin/showtimes')}>↩ Quay lại</button>
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
            <button className="btn-save" onClick={handleBook}><FaSave /> Xác nhận đặt ({selected.size})</button>
          )}

          {mode === 'cancel' && selected.size > 0 && (
            <button className="btn-delete" onClick={handleCancel}><FaTrash /> Xác nhận huỷ ({selected.size})</button>
          )}
        </>
      )}
    </div>
  );
}