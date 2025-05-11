import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/seats.css';

export default function ManageSeats() {
  const { id: roomId } = useParams();
  const location = useLocation();
  const roomName = location.state?.roomName || '';
  const [existingSeats, setExistingSeats] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState(8);
  const [cols, setCols] = useState(12);

  useEffect(() => {
    fetchSeats();
  }, [roomId]);

  const fetchSeats = async () => {
    const res = await axiosClient.get(`cinemas/seats/by-room/${roomId}/`);
    setExistingSeats(res.data);
  };

  const handleClick = (row, col) => {
    const key = `${row}${col}`;
    const isTaken = existingSeats.some(seat => seat.matrix_position === key);

    if (!editMode && isTaken) return;
    if (editMode && !isTaken) return;

    const newSet = new Set(selected);
    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
    setSelected(newSet);
  };

  const handleCreate = async () => {
    const selectedArray = Array.from(selected);

    const payload = selectedArray.map(pos => {
      const row = parseInt(pos[0]);
      const col = parseInt(pos[1]);
      return {
        id: `${roomId}_${pos}`,
        matrix_position: pos,
        room: roomId,
        row,
        column: col
      };
    });

    try {
      await Promise.all(payload.map(data => axiosClient.post('cinemas/seats/', data)));
      alert('Tạo ghế thành công!');
      setSelected(new Set());
      fetchSeats();
    } catch (err) {
      console.error('❌ Lỗi tạo ghế:', err.response?.data || err.message);
    }
  };

  const handleDelete = async () => {
    const idsToDelete = Array.from(selected).map(pos => {
      const seat = existingSeats.find(s => s.matrix_position === pos);
      return seat ? seat.id : `${roomId}_${pos}`;
    });

    try {
      await Promise.all(idsToDelete.map(id => axiosClient.delete(`cinemas/seats/${id}/`)));
      alert('Đã xoá ghế!');
      setSelected(new Set());
      fetchSeats();
    } catch (err) {
      console.error('❌ Lỗi xoá ghế:', err.response?.data || err.message);
    }
  };

  const getSeatClass = (key) => {
    const seat = existingSeats.find(s => s.matrix_position === key);
    const isSelected = selected.has(key);
    return `seat ${seat ? 'taken' : ''} ${isSelected ? 'selected' : ''}`;
  };

  return (
    <div className="movie-management">
      <h2>Quản lý ghế - {roomName}</h2>

      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <button onClick={() => {
          setEditMode(!editMode);
          setSelected(new Set());
        }}>
          {editMode ? <><FaTimes /> Thoát sửa</> : <><FaEdit /> Sửa ghế</>}
        </button>
      </div>

      <div className="seat-grid">
        {[...Array(rows)].map((_, row) => (
          <div className="seat-row" key={row}>
            {[...Array(cols)].map((_, col) => {
              const key = `${row}${col}`;
              return (
                <div
                  key={col}
                  className={getSeatClass(key)}
                  onClick={() => handleClick(row, col)}
                ></div>
              );
            })}
          </div>
        ))}
      </div>

      {selected.size > 0 && !editMode && (
        <button className="btn-save" onClick={handleCreate}>
          <FaSave /> Tạo {selected.size} ghế
        </button>
      )}

      {selected.size > 0 && editMode && (
        <button className="btn-delete" onClick={handleDelete}>
          <FaTrash /> Xoá {selected.size} ghế
        </button>
      )}
    </div>
  );
}
