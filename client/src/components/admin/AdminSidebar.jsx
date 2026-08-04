import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../../assets/css/admin/admin.css';
import {
	FaHome, FaFilm, FaTags, FaUtensils,
	FaBuilding, FaUsers, FaStar, FaFileInvoice, FaClock, FaSignOutAlt, FaUserCog,
	FaCrown, FaRobot, FaTicketAlt
} from 'react-icons/fa';

export default function AdminSidebar() {
	const navigate = useNavigate();
	const userInfo = JSON.parse(localStorage.getItem('adminInfo')) || {};
	const name = userInfo.username || 'Admin';

	const handleLogout = () => {
		localStorage.removeItem('adminToken');
		localStorage.removeItem('adminInfo');
		navigate('/admin/login');
	};

	const menuItems = [
		{ name: 'Trang chủ', icon: <FaHome />, path: '/admin', exact: true },
		{ name: 'Quản lý phim', icon: <FaFilm />, path: '/admin/movies' },
		{ name: 'Quản lý thể loại', icon: <FaTags />, path: '/admin/genres' },
		{ name: 'Quản lý đồ ăn', icon: <FaUtensils />, path: '/admin/snacks' },
		{ name: 'Quản lý cụm rạp', icon: <FaBuilding />, path: '/admin/clusters' },
		{ name: 'Quản lý suất chiếu', icon: <FaClock />, path: '/admin/showtimes' },
		{ name: 'Quản lý người dùng', icon: <FaUsers />, path: '/admin/users' },
		{ name: 'Quản lý đánh giá', icon: <FaStar />, path: '/admin/reviews' },
		{ name: 'Quản lý hóa đơn', icon: <FaFileInvoice />, path: '/admin/payments' },
		{ name: 'Quản lý VIP', icon: <FaCrown />, path: '/admin/vips' },
		{ name: 'Quản lý Voucher', icon: <FaTicketAlt />, path: '/admin/vouchers' },
		{ name: 'Quản lý AI', icon: <FaRobot />, path: '/admin/ai' },
	];

	return (
		<aside className="admin-sidebar">
			<div className="sidebar-title">
				<FaUserCog /> Quản trị hệ thống
			</div>
			<nav className="sidebar-menu" style={{ flex: 1 }}>
				{menuItems.map((item, index) => (
					<NavLink
						to={item.path}
						end={item.exact}
						key={index}
						className={({ isActive }) =>
							isActive ? 'sidebar-link active' : 'sidebar-link'
						}
					>
						<span className="icon">{item.icon}</span>
						<span className="label">{item.name}</span>
					</NavLink>
				))}
			</nav>

			{/* User Info & Logout on the same line */}
			<div className="sidebar-footer" style={{ padding: '16px 20px', borderTop: '1px solid #2d2d47', marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden', flex: 1 }}>
					<div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#4a90e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', color: 'white', flexShrink: 0 }}>
						{name.charAt(0).toUpperCase()}
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
						<span style={{ fontSize: '13px', fontWeight: '600', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
							{name}
						</span>
						<span style={{ fontSize: '11px', color: '#8e8ea8' }}>Admin</span>
					</div>
				</div>
				<button 
					onClick={handleLogout}
					title="Đăng xuất"
					style={{ 
						display: 'flex', 
						alignItems: 'center', 
						justifyContent: 'center', 
						width: '32px', 
						height: '32px', 
						background: 'transparent', 
						color: '#ef4444', 
						border: 'none', 
						borderRadius: '6px', 
						cursor: 'pointer', 
						fontSize: '18px', 
						transition: 'all 0.2s ease',
						flexShrink: 0
					}}
					onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; }}
					onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; }}
				>
					<FaSignOutAlt />
				</button>
			</div>
		</aside>
	);
}