import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/snackForm.css';

export default function ShowtimeForm({ mode = 'create' }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: '',
        cinema: '',
        room: '',
        movie: '',
        date: '',
        start_time: '',
    });

    const [cinemas, setCinemas] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [movies, setMovies] = useState([]);
    const [existingTimes, setExistingTimes] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        axiosClient.get('cinemas/cinemas/').then((res) => setCinemas(res.data));
        axiosClient.get('movies/movies/').then((res) => setMovies(res.data));
    }, []);

    useEffect(() => {
        if (formData.cinema) {
        axiosClient.get(`cinemas/rooms/by-cinema/${formData.cinema}/`).then((res) => setRooms(res.data));
        }
    }, [formData.cinema]);

    useEffect(() => {
        if (mode === 'edit') {
        axiosClient.get(`cinemas/showtimes/${id}/`).then((res) => {
            setFormData({
            id: res.data.id,
            cinema: res.data.cinema,
            room: res.data.room,
            movie: res.data.movie,
            date: res.data.date,
            start_time: res.data.start_time,
            });
        });
        }
    }, [id, mode]);

    useEffect(() => {
        const fetchUsedTimes = async () => {
        if (formData.room && formData.date) {
            try {
            const res = await axiosClient.get(`cinemas/showtimes/by-room/${formData.room}/?date=${formData.date}`);
            setExistingTimes(res.data.map((s) => s.start_time.slice(0, 5)));
            } catch (err) {
            console.error('Lỗi khi tải giờ chiếu:', err);
            }
        } else {
            setExistingTimes([]);
        }
        };
        fetchUsedTimes();
    }, [formData.room, formData.date]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const data = new FormData();
        data.append('id', formData.id);
        data.append('cinema', formData.cinema);
        data.append('room', formData.room);
        data.append('movie', formData.movie);
        data.append('date', formData.date);
        data.append('start_time', formData.start_time);

        try {
        if (mode === 'edit') {
            await axiosClient.put(`cinemas/showtimes/${id}/`, data);
        } else {
            await axiosClient.post('cinemas/showtimes/', data);
        }
        navigate('/admin/showtimes');
        } catch (err) {
        console.error('Lỗi khi lưu suất chiếu:', err);
        const msg = err.response?.data?.non_field_errors?.[0] || 'Lỗi không xác định';
        setErrorMsg(msg);
        }
    };

    return (
        <div className="snack-form-container">
        <h2>{mode === 'edit' ? 'Sửa suất chiếu' : 'Thêm suất chiếu mới'}</h2>

        {errorMsg && (
            <div style={{ marginBottom: 10, color: 'red', fontWeight: 500 }}>{errorMsg}</div>
        )}

        <form className="snack-form" onSubmit={handleSubmit}>
            <div className="snack-form-left">
            {mode === 'create' && (
                <div>
                <label>Mã suất chiếu</label>
                <input name="id" value={formData.id} onChange={handleChange} required />
                </div>
            )}
            <div>
                <label>Rạp chiếu</label>
                <select name="cinema" value={formData.cinema} onChange={handleChange} required>
                <option value="">-- Chọn rạp --</option>
                {cinemas.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                </select>
            </div>
            <div>
                <label>Phòng chiếu</label>
                <select name="room" value={formData.room} onChange={handleChange} required>
                <option value="">-- Chọn phòng --</option>
                {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                ))}
                </select>
            </div>
            <div>
                <label>Phim</label>
                <select name="movie" value={formData.movie} onChange={handleChange} required>
                <option value="">-- Chọn phim --</option>
                {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                ))}
                </select>
            </div>
            <div>
                <label>Ngày chiếu</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>
            <div>
                <label>Giờ bắt đầu</label>
                <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} required />
                {existingTimes.length > 0 && (
                <p style={{ marginTop: 4, fontSize: 13, color: '#888' }}>
                    ⏱ Giờ đã có: {existingTimes.join(', ')}
                </p>
                )}
            </div>
            </div>

            <div className="snack-form-right">
            <div className="snack-form-actions">
                <button type="submit" className="btn-save">💾 Lưu</button>
                <button type="button" className="btn-back" onClick={() => navigate('/admin/showtimes')}>
                ↩ Quay lại
                </button>
            </div>
            </div>
        </form>
        </div>
    );
}
