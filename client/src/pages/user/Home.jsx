import React, { useEffect, useState } from 'react';
import { QuickBooking } from '../../components/user/QuickBooking';
import MovieList from '../../components/user/MovieList';
import axiosClient from '../../api/axiosClient'; // import đúng axiosClient
import { useNavigate } from 'react-router-dom';
import '../../assets/css/user/user.css'

export default function Home() {
  const [hotMovies, setHotMovies] = useState([]);
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [activeTab, setActiveTab] = useState('Đang chiếu');
  const [slideIndex, setSlideIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get('movies/movies/hot-slider')
      .then((res) => setHotMovies(res.data));

    axiosClient.get(`movies/movies?status=${encodeURIComponent('Đang chiếu')}`)
      .then((res) => setNowShowing(res.data));

    axiosClient.get(`movies/movies?status=${encodeURIComponent('Sắp chiếu')}`)
      .then((res) => setComingSoon(res.data));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % hotMovies.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [hotMovies]);

  const displayedMovies = activeTab === 'Đang chiếu'
    ? nowShowing.slice(0, 8)
    : comingSoon.slice(0, 8);

  return (
    <div className="home-page">

      {/* Slider phim hot */}
      <div className="home-slider">
        <img className="slider-banner" src={hotMovies[slideIndex]?.bannerImage} />
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
