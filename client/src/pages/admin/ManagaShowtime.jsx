import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { FaEdit, FaTrash } from 'react-icons/fa';
import '../../assets/css/admin/admin.css';

export default function ManageShowtimes() {
    const [showtimes, setShowtimes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await axiosClient.get('cinemas/showtimes/');
            setShowtimes(res.data);
        } catch (err) {
            console.error('Lỗi khi tải suất chiếu:', err);
        }
        };
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Xoá suất chiếu này?')) {
        try {
            await axiosClient.delete(`cinemas/showtimes/${id}/`);
            setShowtimes((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            console.error('Lỗi xoá suất chiếu:', err);
        }
        }
    };

    return (
        <div className="movie-management">
        <div className="movie-management-header">
            <h2 className="section-title">Quản lý suất chiếu</h2>
            <button
            className="add-movie-btn"
            onClick={() => navigate('/admin/showtimes/create')}
            >
            + Thêm suất chiếu
            </button>
        </div>

        <table className="admin-table">
            <thead>
            <tr>
                <th>ID</th>
                <th>Phim</th>
                <th>Rạp</th>
                <th>Phòng</th>
                <th>Ngày</th>
                <th>Giờ chiếu</th>
                <th>Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {showtimes.map((s) => (
                <tr key={s.id}>
                    <td style={{ color: '#0d6efd', cursor: 'pointer' }}
                    onClick={() => navigate(`/admin/showtimes/${s.id}/seats`, {
                    state: { movieName: s.movie_name, roomName: s.room_name, time: s.start_time }
                    })}>
                    {s.id}
                    </td>
                    <td>{s.movie_name}</td>
                    <td>{s.cinema_name}</td>
                    <td>{s.room_name}</td>
                    <td>{s.date}</td>
                    <td>{s.start_time}</td>
                    <td>
                        <button onClick={() => navigate(`/admin/showtimes/${s.id}/edit`)}><FaEdit /></button>
                        <button onClick={() => handleDelete(s.id)}><FaTrash color="red" /></button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
}
