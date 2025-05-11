import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/admin.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function ManageGenres() {
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();

  const fetchGenres = async () => {
    const res = await axiosClient.get('movies/genres/');
    setGenres(res.data);
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Xoá thể loại này?')) {
      await axiosClient.delete(`movies/genres/${id}/`);
      fetchGenres();
    }
  };

  return (
    <div className="movie-management">
      <div className="movie-management-header">
        <h2 className="section-title">Quản lý thể loại</h2>
        <button className="add-movie-btn" onClick={() => navigate('/admin/genres/create')}>
          + Thêm thể loại
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {genres.map((g) => (
            <tr key={g.id}>
              <td>{g.id}</td>
              <td>{g.name}</td>
              <td>
                <button onClick={() => navigate(`/admin/genres/${g.id}/edit`)}><FaEdit /></button>
                <button onClick={() => handleDelete(g.id)}><FaTrash color="red" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
