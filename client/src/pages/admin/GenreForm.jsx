import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/genreForm.css';

export default function GenreForm({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const isCreate = mode === 'create';

  const [formData, setFormData] = useState({
    id: '',
    name: ''
  });

  useEffect(() => {
    if (isEdit && id) {
      axiosClient.get(`movies/genres/${id}/`).then(res => {
        setFormData(res.data);
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axiosClient.patch(`movies/genres/${formData.id}/`, formData);
      } else {
        await axiosClient.post('movies/genres/', formData);
      }
      navigate('/admin/genres');
    } catch (error) {
      alert('Lỗi khi lưu thể loại');
      console.error(error);
    }
  };

  return (
    <div className="genre-form-container">
      <h2 className="form-title">{isEdit ? 'Sửa thể loại' : 'Thêm thể loại mới'}</h2>
      <form className="genre-form" onSubmit={handleSubmit}>
        <div className="genre-form-fields">
          <label>ID</label>
          <input name="id" value={formData.id} onChange={handleChange} disabled={!isCreate} />

          <label>Tên thể loại</label>
          <input name="name" value={formData.name} onChange={handleChange} />
        </div>

        <div className="form-buttons">
          <button type="submit" className="save-btn">Lưu</button>
          <button type="button" className="cancel-btn" onClick={() => navigate('/admin/genres')}>Quay lại</button>
        </div>
      </form>
    </div>
  );
}
