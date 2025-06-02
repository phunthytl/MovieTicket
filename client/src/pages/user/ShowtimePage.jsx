import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/Showtime.css';
import { FaCalendarAlt, FaFilm, FaMapMarkerAlt } from 'react-icons/fa';
import { getNext7Days } from '../../utils/dateUtils';

export default function ShowtimesPage() {
    const [dates, setDates] = useState([]);
    const [cinemas, setCinemas] = useState([]);
    const [showtimes, setShowtimes] = useState([]);
    const [movies, setMovies] = useState([]);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedMovie, setSelectedMovie] = useState('');

    const [groupedShowtimes, setGroupedShowtimes] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const next7Days = getNext7Days();
        setDates(next7Days);

        axiosClient.get('cinemas/cinemas/').then(res => setCinemas(res.data));

        if (next7Days.length > 0) {
            const today = next7Days[0].value;
            setSelectedDate(today);

            axiosClient.get('cinemas/showtimes/', { params: { date: today } })
                .then(res => {
                    setShowtimes(res.data);
                    extractUniqueMovies(res.data);
                })
                .catch(() => {
                    setShowtimes([]);
                    setMovies([]);
                });
        }
    }, []);

    useEffect(() => {
        if (!selectedDate) return;

        const params = { date: selectedDate };
        if (selectedCinema) params.cinema = selectedCinema;

        axiosClient.get('cinemas/showtimes/', { params })
            .then(res => {
                setShowtimes(res.data);
                extractUniqueMovies(res.data);

                if (!res.data.some(st => st.movie === selectedMovie)) {
                    setSelectedMovie('');
                }
            })
            .catch(() => {
                setShowtimes([]);
                setMovies([]);
                setSelectedMovie('');
            });
    }, [selectedDate, selectedCinema]);

    const extractUniqueMovies = (showtimesData) => {
        const movieMap = new Map();
        showtimesData.forEach(st => {
            if (!movieMap.has(st.movie)) {
                movieMap.set(st.movie, { id: st.movie, name: st.movie_name });
            }
        });
        setMovies(Array.from(movieMap.values()));
    };

    useEffect(() => {
        if (!selectedMovie) {
            setGroupedShowtimes(groupByMovieThenCinema(showtimes));
        } else {
            const filtered = showtimes.filter(st => st.movie === selectedMovie);
            setGroupedShowtimes(groupByMovieThenCinema(filtered));
        }
    }, [selectedMovie, showtimes]);

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

    return (
        <div className="showtimes-page">
            <h2>Lịch chiếu</h2>
            <div className="filters">
                <div className="filter">
                    <FaCalendarAlt />
                    <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)}>
                        <option value="">1. Ngày</option>
                        {dates.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>
                <div className="filter">
                    <FaMapMarkerAlt />
                    <select value={selectedCinema} onChange={e => setSelectedCinema(e.target.value)}>
                        <option value="">2. Rạp</option>
                        {cinemas.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter">
                    <FaFilm />
                    <select value={selectedMovie} onChange={e => setSelectedMovie(e.target.value)} disabled={movies.length === 0}>
                        <option value="">3. Phim</option>
                        {movies.length > 0 ? (
                            movies.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))
                        ) : (
                            <option disabled>Chưa có phim phù hợp</option>
                        )}
                    </select>
                </div>
            </div>

            {groupedShowtimes.length === 0 && selectedDate && (
                <p className="no-showtimes">Không có suất chiếu phim phù hợp</p>
            )}

            {Array.isArray(groupedShowtimes) && groupedShowtimes.map((movie, index) => (
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
                                                onClick={() => {
                                                    navigate(`/movies/${slot.movie}/booking/${slot.id}`);
                                                }}
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
    );
}
