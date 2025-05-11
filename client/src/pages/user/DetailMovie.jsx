import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/movieDetail.css';
import {
  FaClock, FaGlobeAsia, FaTag, FaStar, FaUser,
  FaLanguage, FaHome, FaChevronRight, FaMapMarkerAlt
} from 'react-icons/fa';
import BookingModal from '../../components/user/BookingModal';
import FoodModal from '../../components/user/FoodModal';

export default function MovieDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [cinemas, setCinemas] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [cinemaChains, setCinemaChains] = useState([]);
    const [selectedChain, setSelectedChain] = useState('all');
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('Tất cả');
    const [selectedDate, setSelectedDate] = useState(null);
    const [showAllCinemas, setShowAllCinemas] = useState(false);

    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [foodModalOpen, setFoodModalOpen] = useState(false);
    const [selectedShowtime, setSelectedShowtime] = useState(null);
    const [bookingData, setBookingData] = useState(null);

  useEffect(() => {
    axiosClient.get(`movies/movies/${id}/`).then(res => setMovie(res.data));

    axiosClient.get('cinemas/clusters/').then(res => {
      const clusterData = [{ id: 'all', name: 'Tất cả' }, ...res.data];
      setCinemaChains(clusterData);
    });

    axiosClient.get('cinemas/cinemas/').then(res => {
      setCinemas(res.data);
      const uniqueLocations = [...new Set(res.data.map(c => c.location))];
      setLocations(['Tất cả', ...uniqueLocations]);
      setSelectedLocation('Tất cả');
    });

    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, [id]);

  useEffect(() => {
    if (selectedDate) {
      axiosClient
        .get(`cinemas/showtimes/?movie=${id}&date=${selectedDate}`)
        .then(res => setShowtimes(res.data));
    }
  }, [id, selectedDate]);

  const generateDates = () => {
    const today = new Date();
    return Array.from({ length: 10 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return date.toISOString().split('T')[0];
    });
  };

  const filteredCinemas = cinemas.filter(c => {
    const matchLocation = selectedLocation === 'Tất cả' || c.location === selectedLocation;
    const matchCluster = selectedChain === 'all' || c.cluster === selectedChain;
    const hasShowtime = showtimes.some(st => st.cinema === c.id);
    return matchLocation && matchCluster && hasShowtime;
  });

  const displayedCinemas = showAllCinemas ? filteredCinemas : filteredCinemas.slice(0, 5);

  const getShowtimesForCinema = (cinemaId) =>
    showtimes.filter(st => st.cinema === cinemaId);

  const calcEndTime = (start, duration) => {
    const [h, m] = start.split(':').map(Number);
    const total = h * 60 + m + duration;
    const endH = Math.floor(total / 60) % 24;
    const endM = total % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  if (!movie) return <div>Đang tải thông tin phim...</div>;

  return (
    <div className="movie-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={() => navigate('/')}> <FaHome /> Trang chủ</span>
        <FaChevronRight style={{ margin: '0 8px' }} />
        <span className="breadcrumb-link" onClick={() => navigate('/movies?status=Đang chiếu')}>Phim đang chiếu</span>
        <FaChevronRight style={{ margin: '0 8px' }} />
        <span>{movie.name}</span>
      </div>

      {/* Movie Info */}
      <div className="movie-info-section">
        <div className="poster-container">
          <img src={movie.poster} alt={movie.name} className="poster" />
          <div className="play-button">▶</div>
        </div>
        <div className="info">
          <h2>{movie.name}</h2>
          <p><FaTag /> Thể loại: {movie.genres.map(g => g.name).join(', ')}</p>
          <p><FaClock /> Thời lượng: {movie.duration} phút</p>
          <p><FaGlobeAsia /> Quốc gia: {movie.country}</p>
          {movie.language && <p><FaLanguage /> Ngôn ngữ: {movie.language}</p>}
          {movie.age_rating && <p><FaUser /> Độ tuổi: {movie.age_rating}</p>}
          <div className="description">
            <h4>Nội dung phim</h4>
            <p>{movie.description}</p>
          </div>
          <div className="buttons">
            <button className="trailer" onClick={() => window.open(movie.trailer, '_blank')}>🎬 Xem Trailer</button>
            <button className="rating" onClick={() => navigate(`/movies/${id}/reviews`)}><FaStar /> Xem đánh giá</button>
          </div>
        </div>
      </div>

      {/* Date Picker */}
      <div className="date-picker">
        <h3>Lịch chiếu</h3>
        {generateDates().map(date => (
          <button
            key={date}
            className={selectedDate === date ? 'active' : ''}
            onClick={() => setSelectedDate(date)}
          >
            {date.slice(5)}
          </button>
        ))}
      </div>

      {/* Filter Zone */}
      <div className="cinema-filter-wrapper">
        <div className="cinema-tabs">
          {cinemaChains.map(chain => (
            <button
              key={chain.id}
              className={`tab-btn ${selectedChain === chain.id ? 'active' : ''}`}
              onClick={() => setSelectedChain(chain.id)}
            >
              {chain.name}
            </button>
          ))}
        </div>
        <div className="location-dropdown">
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            {locations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <FaMapMarkerAlt style={{ marginLeft: 8, color: 'white' }} />
        </div>
      </div>

        {/* CINEMA LIST */}
        <div className="cinema-list">
        {showtimes.length === 0 ? (
            <div className="no-showtime">
            Không có suất chiếu cho ngày {selectedDate}
            </div>
        ) : (
            <>
            {displayedCinemas.map(cinema => (
                <div key={cinema.id} className="cinema">
                <h4>{cinema.name}</h4>
                <p>{cinema.address}</p>
                <div className="showtime-buttons">
                    {getShowtimesForCinema(cinema.id).map(st => (
                        <button
                        className="showtime-btn"
                        onClick={() => {
                            setSelectedShowtime(st);
                            setBookingModalOpen(true);
                        }}
                        >
                        {st.start_time.slice(0, 5)} ~ {calcEndTime(st.start_time, movie.duration)}
                        </button>
                    ))}
                </div>
                </div>
            ))}
            {!showAllCinemas && filteredCinemas.length > 5 && (
                <button className="see-more" onClick={() => setShowAllCinemas(true)}>Xem thêm</button>
            )}
            </>
        )}
        </div>
        <BookingModal
        show={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        showtime={selectedShowtime}
        movie={movie}
        onOpenFoodModal={(data) => {
            setBookingData(data);
            setBookingModalOpen(false);
            setFoodModalOpen(true);
        }}
        />
        <FoodModal
        show={foodModalOpen}
        onClose={() => setFoodModalOpen(false)}
        bookingData={bookingData}
        />
    </div>
  );
}
