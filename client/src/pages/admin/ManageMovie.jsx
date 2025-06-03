import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/admin.css';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SearchAndSort from '../../components/admin/SearchAndSort';

export default function ManageMovies() {
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovies = async () => {
        try {
            const res = await axiosClient.get('movies/movies/');
            setMovies(res.data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách phim:', error);
        }
        };

        fetchMovies();
    }, []);

    const handleSort = (key) => {
        if (sortKey === key) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
        setSortKey(key);
        setSortOrder('asc');
        }
    };

    const handleDelete = async (movieId) => {
        if (window.confirm('Bạn có chắc muốn xoá phim này?')) {
        try {
            await axiosClient.delete(`movies/movies/${movieId}/`);
            setMovies((prev) => prev.filter((m) => m.id !== movieId));
        } catch (error) {
            console.error('Lỗi khi xoá phim:', error);
        }
        }
    };

    const filteredAndSorted = [...movies]
        .filter((movie) =>
        movie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.status?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
        if (!sortKey) return 0;
        const valA = a[sortKey]?.toString().toLowerCase() || '';
        const valB = b[sortKey]?.toString().toLowerCase() || '';
        return sortOrder === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        });

    return (
        <div className="movie-management">
        <div className="movie-management-header">
            <h2 className="section-title">Quản lý phim</h2>
            <button className="add-movie-btn" onClick={() => navigate('/admin/movies/create')}>
            + Thêm mới phim
            </button>
        </div>

        <SearchAndSort
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            columns={[
            { key: 'name', label: 'Tên phim' },
            ]}
        />

        <table className="admin-table">
            <thead>
            <tr>
                <th>ID</th>
                <th>Tên phim</th>
                <th>Thể loại</th>
                <th>Thời lượng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {filteredAndSorted.map((movie) => (
                <tr key={movie.id}>
                <td>{movie.id}</td>
                <td>{movie.name}</td>
                <td>{(movie.genres || []).map((g) => g.name).join(', ')}</td>
                <td>{movie.duration} phút</td>
                <td>{movie.status}</td>
                <td className="action-buttons">
                    <button onClick={() => navigate(`/admin/movies/${movie.id}/view`)}><FaEye color="green" /></button>
                    <button onClick={() => navigate(`/admin/movies/${movie.id}/edit`)}><FaEdit /></button>
                    <button onClick={() => handleDelete(movie.id)}><FaTrash color="red" /></button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
} 