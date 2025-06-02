import React, { useEffect, useState } from 'react';
import { QuickBooking } from '../../components/user/QuickBooking';
import MovieList from '../../components/user/MovieList';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/user/user.css';

// Import ảnh banner từ thư mục assets/images
import banner1 from '../../assets/images/1.jpg';
import banner2 from '../../assets/images/2.jpg';
import banner3 from '../../assets/images/3.jpg';

export default function Home() {
    const [nowShowing, setNowShowing] = useState([]);
    const [comingSoon, setComingSoon] = useState([]);
    const [activeTab, setActiveTab] = useState('Đang chiếu');
    const [slideIndex, setSlideIndex] = useState(0);
    const navigate = useNavigate();

    // Danh sách ảnh banner lấy từ assets
    const banners = [banner1, banner2, banner3];

    useEffect(() => {
        // Lấy dữ liệu phim từ API cho phần danh sách phim
        axiosClient.get(`movies/movies?status=${encodeURIComponent('Đang chiếu')}`)
        .then((res) => setNowShowing(res.data));

        axiosClient.get(`movies/movies?status=${encodeURIComponent('Sắp chiếu')}`)
        .then((res) => setComingSoon(res.data));
    }, []);

    useEffect(() => {
        // Tự động chuyển ảnh slider mỗi 4 giây
        const interval = setInterval(() => {
        setSlideIndex((prev) => (prev + 1) % banners.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const displayedMovies = activeTab === 'Đang chiếu'
        ? nowShowing.slice(0, 8)
        : comingSoon.slice(0, 8);

    return (
        <div className="home-page">
            {/* Slider phim hot */}
            <div className="home-slider">
            <img
                className="slider-banner"
                src={banners[slideIndex]}
                alt={`Banner ${slideIndex + 1}`}
            />
            </div>

            {/* Đặt vé nhanh */}
            <QuickBooking />

            {/* Tabs */}
            <div className="home-tabs">
                <button className={activeTab === 'Đang chiếu' ? 'active' : ''} onClick={() => setActiveTab('Đang chiếu')}>
                Đang chiếu
                </button>
                <button className={activeTab === 'Sắp chiếu' ? 'active' : ''} onClick={() => setActiveTab('Sắp chiếu')}>
                Sắp chiếu
                </button>
            </div>

            {/* Danh sách phim */}
            <div className="home-movie-list">
                <MovieList movies={displayedMovies} />
            </div>

            {/* Xem thêm */}
            <div className="home-see-more">
                <button onClick={() => navigate(`/movies?status=${encodeURIComponent(activeTab)}`)}>Xem thêm</button>
            </div>
        </div>
    );
}
