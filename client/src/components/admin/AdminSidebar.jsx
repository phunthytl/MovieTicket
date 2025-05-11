import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../assets/css/admin/admin.css';
import {
	FaHome, FaFilm, FaTags, FaUtensils,
	FaBuilding, FaUsers, FaStar, FaFileInvoice, FaClock
} from 'react-icons/fa';

export default function AdminSidebar() {
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
	];

	return (
		<aside className="admin-sidebar">
			<div className="sidebar-title">🎬 Admin</div>
			<nav className="sidebar-menu">
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
		</aside>
	);
}