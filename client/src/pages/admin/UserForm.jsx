import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/userForm.css';
export default function UserForm({ mode = 'create' }) {
	const navigate = useNavigate();
	const { id } = useParams();

	// State lưu thông tin user
	const [formData, setFormData] = useState({
		name: '',
		username: '',
		email: '',
		password: '',
		phone: '',
		avatar: null,
	});
	const [preview, setPreview] = useState(null); // Ảnh xem trước

	// Nếu đang sửa, fetch thông tin user
	useEffect(() => {
		if (mode === 'edit') {
			axiosClient.get(`users/users/${id}/`).then((res) => {
				setFormData({
					name: res.data.name || '',
					username: res.data.username || '',
					email: res.data.email || '',
					password: '',
					phone: res.data.phone || '',
					avatar: null,
				});
				setPreview(res.data.avatar);
			});
		}
	}, [id, mode]);

	// Xử lý input thay đổi
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Xử lý chọn ảnh đại diện
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		setFormData((prev) => ({ ...prev, avatar: file }));
		setPreview(URL.createObjectURL(file));
	};

	// Submit form
	const handleSubmit = async (e) => {
		e.preventDefault();

		const data = new FormData();
		data.append('name', formData.name);
		data.append('username', formData.username);
		data.append('email', formData.email);
		data.append('phone', formData.phone);
		if (formData.avatar) data.append('avatar', formData.avatar);

		if (mode === 'create') {
			data.append('password', formData.password);
		}

		try {
			if (mode === 'edit') {
				await axiosClient.patch(`users/users/${id}/`, data, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
			} else {
				await axiosClient.post('users/users/', data, {
					headers: { 'Content-Type': 'multipart/form-data' },
				});
			}
			navigate('/admin/users');
		} catch (err) {
			console.error('Lỗi khi lưu người dùng:', err);
		}
	};

	return (
		<div className="snack-form-container">
			<h2>{mode === 'edit' ? 'Sửa người dùng' : 'Thêm người dùng'}</h2>
			<form className="snack-form" onSubmit={handleSubmit}>
				{/* Cột trái: các trường thông tin */}
				<div className="snack-form-left">
					<div>
						<label htmlFor="name">Họ và tên</label>
						<input
							id="name"
							type="text"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Nhập họ tên"
							required
						/>
					</div>

					<div>
						<label htmlFor="username">Tên đăng nhập</label>
						<input
							id="username"
							type="text"
							name="username"
							value={formData.username}
							onChange={handleChange}
							placeholder="Nhập tên đăng nhập"
							required
						/>
					</div>

					<div>
						<label htmlFor="email">Email</label>
						<input
							id="email"
							type="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							placeholder="Nhập email"
							required
						/>
					</div>

					{mode === 'create' && (
						<div>
							<label htmlFor="password">Mật khẩu</label>
							<input
								id="password"
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Nhập mật khẩu"
								required
							/>
						</div>
					)}

					<div>
						<label htmlFor="phone">Số điện thoại</label>
						<input
							id="phone"
							type="text"
							name="phone"
							value={formData.phone}
							onChange={handleChange}
							placeholder="Nhập SĐT"
						/>
					</div>
				</div>

				{/* Cột phải: Avatar và nút thao tác */}
				<div className="snack-form-right">
					<div className="snack-image-preview">
						{preview ? (
							<img src={preview} alt="avatar" />
						) : (
							<div className="image-placeholder">🖼</div>
						)}
					</div>

					<label htmlFor="avatar-upload" className="btn-upload">+ Thêm ảnh</label>
					<input
						id="avatar-upload"
						type="file"
						accept="image/*"
						style={{ display: 'none' }}
						onChange={handleImageChange}
					/>

					<div className="snack-form-actions">
						<button type="submit" className="btn-save">💾 Lưu</button>
						<button type="button" className="btn-back" onClick={() => navigate('/admin/users')}>
							↩ Quay lại
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
