import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import '../../assets/css/admin/snackForm.css';

export default function RoomForm({ mode = 'create' }) {
    const { clusterId, cinemaId, id } = useParams();
    const location = useLocation();
    const cinemaName = location.state?.cinemaName || '';
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        type: '',
        status: ''
    });

    useEffect(() => {
        if (mode === 'edit') {
        axiosClient.get(`cinemas/rooms/${id}/`).then((res) => {
            setFormData({
            id: res.data.id,
            name: res.data.name || '',
            type: res.data.type || '',
            status: res.data.status || ''
            });
        });
        }
    }, [id, mode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('type', formData.type);
        data.append('status', formData.status);
        data.append('cinema', cinemaId);
        if (mode === 'create') data.append('id', formData.id);

        try {
        if (mode === 'edit') {
            await axiosClient.patch(`cinemas/rooms/${id}/`, data);
        } else {
            await axiosClient.post('cinemas/rooms/', data);
        }
        navigate(`/admin/clusters/${clusterId}/cinemas/${cinemaId}/rooms`, {
            state: { cinemaName }
        });
        } catch (err) {
        console.error('Lỗi khi lưu phòng:', err);
        }
    };

    return (
        <div className="snack-form-container">
        <h2>{mode === 'edit' ? 'Sửa phòng' : 'Thêm phòng mới'}</h2>
        {cinemaName && (
            <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
            Rạp: <span>{cinemaName}</span>
            </p>
        )}
        <form className="snack-form" onSubmit={handleSubmit}>
            <div className="snack-form-left">
            {mode === 'create' && (
                <div>
                <label htmlFor="id">Mã phòng</label>
                <input
                    id="id"
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    placeholder="Nhập mã phòng"
                    required
                />
                </div>
            )}
            <div>
                <label htmlFor="name">Tên phòng</label>
                <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên phòng"
                required
                />
            </div>
            <div>
                <label htmlFor="type">Loại phòng</label>
                <input
                id="type"
                type="text"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="Nhập loại phòng"
                />
            </div>
            <div>
                <label htmlFor="status">Trạng thái</label>
                <input
                id="status"
                type="text"
                name="status"
                value={formData.status}
                onChange={handleChange}
                placeholder="VD: Đang hoạt động / Bảo trì"
                />
            </div>
            </div>
            <div className="snack-form-right">
            <div className="snack-form-actions">
                <button type="submit" className="btn-save"><FaSave style={{ marginRight: '6px' }} /> Lưu</button>
                <button
                type="button"
                className="btn-back"
                onClick={() =>
                    navigate(`/admin/clusters/${clusterId}/cinemas/${cinemaId}/rooms`, {
                    state: { cinemaName }
                    })
                }
                >
                <FaArrowLeft style={{ marginRight: '6px' }} /> Quay lại
                </button>
            </div>
            </div>
        </form>
        </div>
    );
}
