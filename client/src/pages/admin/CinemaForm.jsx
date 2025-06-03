import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/snackForm.css';

export default function CinemaForm({ mode = 'create' }) {
    const navigate = useNavigate();
    const { clusterId, id } = useParams();
    const location = useLocation();
    const clusterName = location.state?.clusterName || '';

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        address: '',
        contact: '',
        city: '',
    });

    useEffect(() => {
        if (mode === 'edit') {
        axiosClient.get(`cinemas/cinemas/${id}/`).then((res) => {
            setFormData({
            id: res.data.id,
            name: res.data.name || '',
            address: res.data.address || '',
            contact: res.data.contact || '',
            city: res.data.city || '',
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
        data.append('address', formData.address);
        data.append('contact', formData.contact);
        data.append('city', formData.city);
        data.append('cluster', clusterId);
        if (mode === 'create') data.append('id', formData.id);

        try {
        if (mode === 'edit') {
            await axiosClient.patch(`cinemas/cinemas/${id}/`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            });
        } else {
            await axiosClient.post('cinemas/cinemas/', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
            });
        }
        navigate(`/admin/clusters/${clusterId}/cinemas`, {
            state: { clusterName }
        });
        } catch (err) {
        console.error('Lỗi khi lưu rạp:', err);
        }
    };

    return (
        <div className="snack-form-container">
        <h2>{mode === 'edit' ? 'Sửa rạp' : 'Thêm rạp mới'}</h2>
        {clusterName && (
            <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
            Cụm rạp: <span style={{ color: '#0d6efd' }}>{clusterName}</span>
            </p>
        )}
        <form className="snack-form" onSubmit={handleSubmit}>
            <div className="snack-form-left">
            {mode === 'create' && (
                <div>
                <label htmlFor="id">Mã rạp</label>
                <input
                    id="id"
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    placeholder="Nhập mã rạp"
                    required
                />
                </div>
            )}
            <div>
                <label htmlFor="name">Tên rạp</label>
                <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên rạp"
                required
                />
            </div>
            <div>
                <label htmlFor="city">Thành phố</label>
                <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Nhập thành phố"
                />
            </div>
            <div>
                <label htmlFor="address">Địa chỉ</label>
                <input
                id="address"
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Nhập địa chỉ"
                />
            </div>
            <div>
                <label htmlFor="contact">Số điện thoại</label>
                <input
                id="contact"
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Nhập SĐT liên hệ"
                />
            </div>
            </div>
            <div className="snack-form-right">
            <div className="snack-form-actions">
                <button type="submit" className="btn-save">💾 Lưu</button>
                <button
                type="button"
                className="btn-back"
                onClick={() =>
                    navigate(`/admin/clusters/${clusterId}/cinemas`, {
                    state: { clusterName }
                    })
                }
                >
                ↩ Quay lại
                </button>
            </div>
            </div>
        </form>
        </div>
    );
}
