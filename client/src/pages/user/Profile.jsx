import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/Profile.css';
import {
	FaUser, FaCamera, FaEdit, FaLock, FaSave, FaTimes,
	FaEye, FaEyeSlash, FaHome, FaChevronRight, FaEnvelope,
	FaPhone
} from 'react-icons/fa';

// ... (import và setup ban đầu như cũ)

export default function UserProfilePage() {
	const navigate = useNavigate();

	const [user, setUser] = useState(null);
	const [activeTab, setActiveTab] = useState('profile');
	const [isEditing, setIsEditing] = useState(false);

	const [profileForm, setProfileForm] = useState({
		name: '',
		email: '',
		phone: '',
	});

	const [passwordForm, setPasswordForm] = useState({
		current_password: '',
		new_password: '',
		confirm_password: ''
	});

	const [showPasswords, setShowPasswords] = useState({
		current: false,
		new: false,
		confirm: false
	});

	const [avatarFile, setAvatarFile] = useState(null);
	const [avatarPreview, setAvatarPreview] = useState(null);

	useEffect(() => {
		const storedUser = localStorage.getItem('userInfo');
		if (storedUser) {
			const userInfo = JSON.parse(storedUser);
			setUser(userInfo);
			setProfileForm({
				name: userInfo.name || '',
				email: userInfo.email || '',
				phone: userInfo.phone || '',
			});
		}
	}, []);

	const handleProfileInputChange = (e) => {
		const { name, value } = e.target;
		setProfileForm(prev => ({ ...prev, [name]: value }));
	};

	const handlePasswordInputChange = (e) => {
		const { name, value } = e.target;
		setPasswordForm(prev => ({ ...prev, [name]: value }));
	};

	const handleAvatarChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setAvatarFile(file);
			const reader = new FileReader();
			reader.onloadend = () => setAvatarPreview(reader.result);
			reader.readAsDataURL(file);
		}
	};

	const handleSaveProfile = async () => {
		try {
			const formData = new FormData();
			Object.entries(profileForm).forEach(([key, val]) => {
				if (val) formData.append(key, val);
			});
			if (avatarFile) formData.append('avatar', avatarFile);

			const response = await axiosClient.patch(`users/users/${user.id}/`, formData, {
				headers: { 'Content-Type': 'multipart/form-data' }
			});

			localStorage.setItem('userInfo', JSON.stringify(response.data));
			setUser(response.data);
			setIsEditing(false);
			setAvatarFile(null);
			setAvatarPreview(null);
		} catch (error) {
			console.error("Cập nhật thông tin thất bại", error);
		}
	};

	const handleChangePassword = async () => {
		if (passwordForm.new_password !== passwordForm.confirm_password) {
			alert('Mật khẩu xác nhận không khớp');
			return;
		}
		if (passwordForm.new_password.length < 6) {
			alert('Mật khẩu mới phải có ít nhất 6 ký tự');
			return;
		}
		try {
			await axiosClient.post('users/users/changePassword/', {
				old_password: passwordForm.current_password,
				new_password: passwordForm.new_password
			}, { tokenType: 'user' });
			setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
			alert('Đổi mật khẩu thành công!');
		} catch {
			alert('Mật khẩu hiện tại không đúng hoặc có lỗi xảy ra');
		}
	};

	const togglePasswordVisibility = (field) => {
		setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
	};

	const cancelEdit = () => {
		if (!user) return;
		setIsEditing(false);
		setAvatarFile(null);
		setAvatarPreview(null);
		setProfileForm({
			name: user.name || '',
			email: user.email || '',
			phone: user.phone || '',
		});
	};

	if (!user) return <div>Đang tải thông tin...</div>;

	return (
		<div className="user-profile-page">
			<div className="breadcrumb">
				<span className="breadcrumb-link" onClick={() => navigate('/')}>
					<FaHome /> Trang chủ
				</span>
				<FaChevronRight style={{ margin: '0 8px' }} />
				<span>Thông tin cá nhân</span>
			</div>

			<div className="profile-container">
				<div className="profile-header">
					<div className="avatar-section">
						<div className="avatar-container">
							<img
								src={avatarPreview || user.avatar || '/default-avatar.png'}
								alt="Avatar"
								className="avatar"
							/>
							{isEditing && (
								<label className="avatar-upload">
									<FaCamera />
									<input
										type="file"
										accept="image/*"
										onChange={handleAvatarChange}
										style={{ display: 'none' }}
									/>
								</label>
							)}
						</div>
					</div>
					<div className="user-info">
						<h2>{user.name}</h2>
						<p>{user.username}</p>
					</div>
					<div className="profile-actions">
						{!isEditing ? (
							<button className="btn btn-edit" onClick={() => setIsEditing(true)}>
								<FaEdit /> Chỉnh sửa
							</button>
						) : (
							<div className="edit-actions">
								<button className="btn btn-save" onClick={handleSaveProfile}>
									<FaSave /> Lưu
								</button>
								<button className="btn btn-cancel" onClick={cancelEdit}>
									<FaTimes /> Hủy
								</button>
							</div>
						)}
					</div>
				</div>

				<div className="tab-navigation">
					<button
						className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
						onClick={() => setActiveTab('profile')}
					>
						<FaUser /> Thông tin cá nhân
					</button>
					<button
						className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
						onClick={() => setActiveTab('password')}
					>
						<FaLock /> Đổi mật khẩu
					</button>
				</div>

				<div className="tab-content">
					{activeTab === 'profile' && (
						<div className="profile-form">
							<div className="form-group">
								<label><FaUser /> Họ và tên</label>
								<input
									type="text"
									name="name"
									value={profileForm.name}
									onChange={handleProfileInputChange}
									disabled={!isEditing}
									placeholder="Nhập họ và tên"
								/>
							</div>
							<div className="form-group">
								<label><FaEnvelope /> Email</label>
								<input
									type="email"
									name="email"
									value={profileForm.email}
									onChange={handleProfileInputChange}
									disabled={!isEditing}
									placeholder="Nhập email"
								/>
							</div>
							<div className="form-group">
								<label><FaPhone /> Số điện thoại</label>
								<input
									type="tel"
									name="phone"
									value={profileForm.phone}
									onChange={handleProfileInputChange}
									disabled={!isEditing}
									placeholder="Nhập số điện thoại"
								/>
							</div>
						</div>
					)}

					{activeTab === 'password' && (
						<div className="password-form">
							<div className="form-group">
								<label>Mật khẩu hiện tại</label>
								<div className="password-input">
									<input
										type={showPasswords.current ? 'text' : 'password'}
										name="current_password"
										value={passwordForm.current_password}
										onChange={handlePasswordInputChange}
										placeholder="Nhập mật khẩu hiện tại"
									/>
									<span onClick={() => togglePasswordVisibility('current')}>
										{showPasswords.current ? <FaEyeSlash /> : <FaEye />}
									</span>
								</div>
							</div>

							<div className="form-group">
								<label>Mật khẩu mới</label>
								<div className="password-input">
									<input
										type={showPasswords.new ? 'text' : 'password'}
										name="new_password"
										value={passwordForm.new_password}
										onChange={handlePasswordInputChange}
										placeholder="Nhập mật khẩu mới"
									/>
									<span onClick={() => togglePasswordVisibility('new')}>
										{showPasswords.new ? <FaEyeSlash /> : <FaEye />}
									</span>
								</div>
							</div>

							<div className="form-group">
								<label>Xác nhận mật khẩu</label>
								<div className="password-input">
									<input
										type={showPasswords.confirm ? 'text' : 'password'}
										name="confirm_password"
										value={passwordForm.confirm_password}
										onChange={handlePasswordInputChange}
										placeholder="Nhập lại mật khẩu"
									/>
									<span onClick={() => togglePasswordVisibility('confirm')}>
										{showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
									</span>
								</div>
							</div>

							<button className="btn btn-save" onClick={handleChangePassword}>
								<FaSave /> Đổi mật khẩu
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
