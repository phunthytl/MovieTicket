import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTicketAlt, FaMapMarkedAlt, FaCalendarAlt, FaUser, FaClock, FaInfoCircle, FaSearch, FaSignOutAlt, FaChevronDown, FaFilm } from 'react-icons/fa';
import '../../assets/css/user/Header.css';
import axiosClient from '../../api/axiosClient';

export default function Header() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const dropdownRef = useRef(null);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('userInfo'));

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const toggleDropdown = () => {
        setDropdownOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setSearchResults([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const fetchResults = async () => {
                if (!searchText.trim()) {
                    setSearchResults([]);
                    return;
                }
                try {
                    const res = await axiosClient.get(`movies/movies/?search=${searchText}`);
                    setSearchResults(res.data);
                } catch (err) {
                    console.error('Lỗi tìm kiếm:', err);
                }
            };

            fetchResults();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchText]);

    return (
        <header className="header">
            <div className="header-top">
                <div className="logo">SuperStar</div>

                <div className="search-login">
                    <div className="search-box" ref={searchRef}>
                        <input
                            type="text"
                            placeholder="Tìm phim, rạp"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                        <button><FaSearch /></button>
                        {searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map((movie) => (
                                    <div
                                        key={movie.id}
                                        className="search-result-item"
                                        onClick={() => {
                                            navigate(`/movies/${movie.id}`);
                                            setSearchText('');
                                            setSearchResults([]);
                                        }}
                                    >
                                        <div className="search-movie-item">
                                            <img src={movie.poster} alt={movie.name} 
                                                style={{ width: '30px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                                            />
                                            <div>{movie.name}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {user ? (
                        <div className="user-info" ref={dropdownRef}>
                            <div className="user-dropdown" onClick={toggleDropdown}>
                                <FaUser /> {user?.username} <FaChevronDown />
                            </div>
                            {dropdownOpen && (
                                <div className="dropdown-menu">
                                    <NavLink to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                                        <FaUser /> Thông tin cá nhân
                                    </NavLink>
                                    <button className="dropdown-item" onClick={() => { handleLogout(); setDropdownOpen(false); }}>
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
