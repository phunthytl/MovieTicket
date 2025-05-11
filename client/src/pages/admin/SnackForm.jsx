import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/snackForm.css';

export default function SnackForm({ mode = 'create' }) {
	const navigate = useNavigate();
	const { id } = useParams();

	// Khởi tạo dữ liệu form
	const [formData, setFormData] = useState({
		id: '',
		name: '',
		price: '',
		description: '',
		image: null,
	});
	const [preview, setPreview] = useState(null); // Ảnh xem trước

	// Nếu đang sửa thì lấy dữ liệu snack từ server
	useEffect(() => {
		if (mode === 'edit' || mode === 'view') {
			axiosClient.get(`payments/snacks/${id}/`).then((res) => {
				setFormData({
					id: res.data.id,
					name: res.data.name || '',
					price: res.data.price || '',
					description: res.data.description || '',
					image: null,
				});
				setPreview(res.data.image);
			});
		}
	}, [id, mode]);

	// Xử lý thay đổi input
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Xử lý chọn ảnh và preview
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		setFormData((prev) => ({ ...prev, image: file }));
		setPreview(URL.createObjectURL(file));
	};

	// Submit form
	const handleSubmit = async (e) => {
		e.preventDefault();

		const data = new FormData();
		data.append('name', formData.name);
		data.append('price', formData.price);
		data.append('description', formData.description);
		if (formData.image) {
			data.append('image', formData.image);
		}
		if (mode === 'create') {
			data.append('id', formData.id); // Gửi ID nếu là tạo mới
		}

		try {
			if (mode === 'edit') {
				await axiosClient.patch(`payments/snacks/${id}/`, data, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
			} else {
				await axiosClient.post('payments/snacks/', data, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
			}
			navigate('/admin/snacks');
		} catch (err) {
			console.error('Lỗi khi lưu món ăn:', err);
		}
	};

	return (
		<div className="snack-form-container">
			<h2>{mode === 'edit' ? 'Sửa món ăn' : 'Thêm đồ ăn mới'}</h2>
			<form className="snack-form" onSubmit={handleSubmit}>
				<div className="snack-form-left">
					{/* Chỉ hiện ô nhập ID khi thêm mới */}
					{mode === 'create' && (
						<div>
							<label htmlFor="id">ID món ăn</label>
							<input
								id="id"
								type="text"
								name="id"
								value={formData.id}
								onChange={handleChange}
								placeholder="Nhập ID món ăn (bắt buộc)"
								required
							/>
						</div>
					)}

					<div>
						<label htmlFor="name">Tên món ăn</label>
						<input
							id="name"
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Nhập tên đồ ăn"
							required
						/>
					</div>

					<div>
						<label htmlFor="price">Giá món ăn (VNĐ)</label>
						<input
							id="price"
							type="number"
							name="price"
							value={formData.price}
							onChange={handleChange}
							placeholder="Nhập giá đồ ăn"
							required
						/>
					</div>

					<div>
						<label htmlFor="description">Mô tả món ăn</label>
						<textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleChange}
							placeholder="Mô tả về món ăn"
						/>
					</div>
				</div>

				{/* Khối ảnh + thao tác */}
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

					{/* Nút lưu và quay lại */}
					<div className="snack-form-actions">
						<button type="submit" className="btn-save">💾 Lưu</button>
						<button type="button" className="btn-back" onClick={() => navigate('/admin/snacks')}>
							↩ Quay lại
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
