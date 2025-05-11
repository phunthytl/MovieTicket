import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/clusterForm.css';

export default function ClusterForm({ mode = 'create' }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const [formData, setFormData] = useState({
		id: '',
		name: '',
		description: '',
		image: null,
	});
	const [preview, setPreview] = useState(null);

	useEffect(() => {
		if (mode === 'edit') {
			axiosClient.get(`cinemas/clusters/${id}/`).then((res) => {
				setFormData({
					id: res.data.id,
					name: res.data.name || '',
					description: res.data.description || '',
					image: null,
				});
				setPreview(res.data.image);
			});
		}
	}, [id, mode]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		setFormData((prev) => ({ ...prev, image: file }));
		setPreview(URL.createObjectURL(file));
	};

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const data = new FormData();
        if (mode === 'create') {
            if (!formData.id) {
                alert('Vui lòng nhập mã cụm rạp!');
                return;
            }
            data.append('id', formData.id.trim());
        }
        data.append('name', formData.name.trim());
        data.append('description', formData.description.trim());
        if (formData.image) data.append('image', formData.image);
    
        // Debug log
        for (let [key, val] of data.entries()) {
            console.log(`${key}:`, val);
        }
    
        try {
            if (mode === 'edit') {
                await axiosClient.patch(`cinemas/clusters/${id}/`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                await axiosClient.post('cinemas/clusters/', data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }
            navigate('/admin/clusters');
        } catch (err) {
            console.error('Lỗi khi lưu cụm rạp:', err);
            if (err.response) {
                console.log('📦 Thông báo từ server:', err.response.data);
            }
        }
    };

	return (
		<div className="snack-form-container">
			<h2>{mode === 'edit' ? 'Sửa cụm rạp' : 'Thêm cụm rạp'}</h2>
			<form className="snack-form" onSubmit={handleSubmit}>
				<div className="snack-form-left">
					{mode === 'create' && (
						<div>
							<label htmlFor="id">Mã cụm rạp</label>
							<input
								id="id"
								type="text"
								name="id"
								value={formData.id}
								onChange={handleChange}
								placeholder="Nhập mã cụm rạp"
								required
							/>
						</div>
					)}
					<div>
						<label htmlFor="name">Tên cụm rạp</label>
						<input
							id="name"
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Nhập tên cụm rạp"
							required
						/>
					</div>
					<div>
						<label htmlFor="description">Mô tả</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Nhập mô tả cụm rạp"
						/>
					</div>
				</div>

				<div className="snack-form-right">
					<div className="snack-image-preview">
						{preview ? (
							<img src={preview} alt="preview" />
						) : (
							<div className="image-placeholder">📷</div>
						)}
					</div>
					<label htmlFor="image-upload" className="btn-upload">+ Thêm ảnh</label>
					<input
						id="image-upload"
						type="file"
						accept="image/*"
						style={{ display: 'none' }}
						onChange={handleImageChange}
					/>
					<div className="snack-form-actions">
						<button type="submit" className="btn-save">💾 Lưu</button>
						<button type="button" className="btn-back" onClick={() => navigate('/admin/clusters')}>
							↩ Quay lại
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
