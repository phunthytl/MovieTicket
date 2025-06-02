import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/Cinema.css';
import { 
    FaMapMarkerAlt, 
    FaFilm, 
    FaClock, 
    FaHome, 
    FaChevronRight,
    FaStar,
    FaPlay
} from 'react-icons/fa';

export default function CinemaClusterPage() {
    const [clusters, setClusters] = useState([]);
    const [selectedCluster, setSelectedCluster] = useState(null);
    const [movies, setMovies] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [groupedShowtimes, setGroupedShowtimes] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        // Load clusters and cinemas
        Promise.all([
            axiosClient.get('cinemas/clusters/'),
            axiosClient.get('cinemas/cinemas/')
        ]).then(([clustersRes, cinemasRes]) => {
            setClusters(clustersRes.data);
            setCinemas(cinemasRes.data);
        }).catch(error => {
            console.error('Error loading data:', error);
        });
    }, []);

    const handleClusterSelect = async (cluster) => {
        setSelectedCluster(cluster);
        
        try {
            // Get all cinemas in this cluster
            const clusterCinemas = cinemas.filter(c => c.cluster === cluster.id);
            const cinemaIds = clusterCinemas.map(c => c.id);

            if (cinemaIds.length === 0) {
                setGroupedShowtimes([]);
                return;
            }

            // Get current date
            const today = new Date().toISOString().split('T')[0];

            // Get showtimes for all cinemas in this cluster
            const showtimesPromises = cinemaIds.map(cinemaId => 
                axiosClient.get('cinemas/showtimes/', { 
                    params: { cinema: cinemaId, date: today }
                }).catch(() => ({ data: [] }))
            );

            const showtimesResults = await Promise.all(showtimesPromises);
            const allShowtimes = showtimesResults.flatMap(result => result.data);

            setShowtimes(allShowtimes);
            setGroupedShowtimes(groupByMovieThenCinema(allShowtimes));
        } catch (error) {
            console.error('Error loading showtimes:', error);
            setShowtimes([]);
            setGroupedShowtimes([]);
        }
    };

    const groupByMovieThenCinema = (data) => {
        const grouped = {};

        data.forEach(showtime => {
            const movieId = showtime.movie;
            if (!grouped[movieId]) {
                grouped[movieId] = {
                    movie_id: movieId,
                    movie_name: showtime.movie_name,
                    movie_poster: showtime.movie_poster,
                    cinemas: {}
                };
            }

            const cinemaId = showtime.cinema;
            if (!grouped[movieId].cinemas[cinemaId]) {
                grouped[movieId].cinemas[cinemaId] = {
                    cinema_name: showtime.cinema_name,
                    cinema_address: showtime.cinema_address,
                    cinema_image: showtime.cinema_image,
                    time_slots: []
                };
            }

            grouped[movieId].cinemas[cinemaId].time_slots.push({
                id: showtime.id,
                room_name: showtime.room_name,
                start_time: showtime.start_time,
                end_time: showtime.end_time,
                room: showtime.room,
                cinema: showtime.cinema,
                movie: showtime.movie
            });
        });

        return Object.values(grouped).map(movie => ({
            ...movie,
            cinemas: Object.values(movie.cinemas).map(c => ({
                ...c,
                time_slots: c.time_slots.sort((a, b) => a.start_time.localeCompare(b.start_time))
            }))
        }));
    };

    const getCinemasInCluster = (clusterId) => {
        return cinemas.filter(c => c.cluster === clusterId);
    };

    const handleBookingClick = (showtimeId, movieId) => {
        navigate(`/movies/${movieId}/booking/${showtimeId}`);
    };

    if (!clusters.length) return <div>Đang tải thông tin cụm rạp...</div>;

    return (
        <div className="cinema-cluster-page">
            {/* Breadcrumb */}
            <div className="breadcrumb-cp">
                <span className="breadcrumb-link" onClick={() => navigate('/')}>
                    <FaHome /> Trang chủ
                </span>
                <FaChevronRight style={{ margin: '0 8px' }} />
                <span>Chọn rạp</span>
            </div>

            <div className="page-header">
                <h1>Chọn cụm rạp chiếu phim</h1>
                <p>Lựa chọn cụm rạp để xem danh sách phim đang chiếu</p>
            </div>

            <div className="clusters-grid">
                {clusters.map(cluster => {
                    const clusterCinemas = getCinemasInCluster(cluster.id);
                    const isSelected = selectedCluster?.id === cluster.id;
                    
                    return (
                        <div 
                            key={cluster.id} 
                            className={`cluster-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleClusterSelect(cluster)}
                        >
                            <div className="cluster-header">
                                <h3>{cluster.name}</h3>
                                <div className="cinema-count">
                                    <FaMapMarkerAlt />
                                    <span>{clusterCinemas.length} rạp</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedCluster && (
                <div className="selected-cluster-section">
                    <div className="section-header">
                        <h2>
                            <FaFilm />
                            Lịch chiếu tại {selectedCluster.name}
                        </h2>
                    </div>

                    {groupedShowtimes.length === 0 ? (
                        <div className="no-movies">
                            <FaFilm />
                            <p>Hiện tại không có suất chiếu nào tại cụm rạp này</p>
                        </div>
                    ) : (
                        <div className="showtimes-display">
                            {groupedShowtimes.map((movie, index) => (
                                <div key={index} className="showtime-item">
                                    <div className="movie-info">
                                        {movie.movie_poster && (
                                            <div className="movie-poster">
                                                <img src={movie.movie_poster} alt={movie.movie_name} />
                                            </div>
                                        )}
                                        <div className="movie-title">{movie.movie_name}</div>
                                    </div>
                                    <div className="cinema-item-st">
                                        {Array.isArray(movie.cinemas) && movie.cinemas.map((cinema, ci) => (
                                            <div key={ci} className="showtime-details">
                                                <div className="cinema-info">
                                                    <div className="cinema-image">
                                                        {cinema.cinema_image && (
                                                            <img src={cinema.cinema_image} alt={cinema.cinema_name} />
                                                        )}
                                                    </div>
                                                    <div className="cinema-info-text">
                                                        <div className="cinema-name">{cinema.cinema_name}</div>
                                                        <div className="cinema-address">{cinema.cinema_address}</div>
                                                        <div className="time-slots">
                                                            {cinema.time_slots.map((slot, si) => (
                                                                <button
                                                                    key={si}
                                                                    className="showtime-slot"
                                                                    onClick={() => handleBookingClick(slot.id, slot.movie)}
                                                                >
                                                                    {slot.start_time} ~ {slot.end_time}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}