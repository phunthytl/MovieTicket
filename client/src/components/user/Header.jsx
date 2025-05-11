// src/components/user/Header.jsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaMapMarkedAlt, FaCalendarAlt, FaUser, FaClock, FaInfoCircle, FaSearch, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import '../../assets/css/user/header.css';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <header className="header">
      <div className="header-top">
        <div className="logo">SuperStar</div>

        <div className="search-login">
          <div className="search-box">
            <input type="text" placeholder="Tìm phim, rạp" />
            <button><FaSearch /></button>
          </div>

          {user ? (
            <div className="user-info">
              <div className="user-dropdown" onClick={toggleDropdown}>
                <FaUser /> {user.username} <FaChevronDown />
              </div>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <NavLink to="/profile" className="dropdown-item">
                    <FaUser /> Thông tin cá nhân
                  </NavLink>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <FaSignOutAlt /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink to="/login" className="login-btn">
              <FaUser /> Đăng nhập
            </NavLink>
          )}
        </div>
      </div>

      <div className="header-bottom">
        <div className="left-nav">
          <NavLink to="/" className="nav-highlight">
            <FaTicketAlt /> Đặt vé ngay
          </NavLink>
          <NavLink to="/cinemas"><FaMapMarkedAlt /> Chọn rạp</NavLink>
          <NavLink to="/showtimes"><FaCalendarAlt /> Lịch chiếu</NavLink>
        </div>
        <div className="right-nav">
          <NavLink to="/history"><FaClock /> Lịch sử mua vé</NavLink>
          <NavLink to="/about"><FaInfoCircle /> Giới thiệu</NavLink>
        </div>
      </div>
    </header>
  );
}
