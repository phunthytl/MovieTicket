// src/pages/ShowtimesPage.jsx
import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/showtime.css';
import { FaCalendarAlt, FaFilm, FaMapMarkerAlt } from 'react-icons/fa';
import { getNext7Days } from '../../utils/dateUtils';

export default function ShowtimesPage() {
  const [dates, setDates] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [showtimes, setShowtimes] = useState([]);

  useEffect(() => {
    setDates(getNext7Days());

    axiosClient.get('/movies/movies/').then(res => setMovies(res.data));
    axiosClient.get('/cinemas/cinemas/').then(res => setCinemas(res.data));
  }, []);

  useEffect(() => {
    if (selectedDate && selectedMovie && selectedCinema) {
      axiosClient.get('/cinemas/showtimes/', {
          params: {
            date: selectedDate,
            movie: selectedMovie,
            cinema: selectedCinema,
          },
        })
        .then(res => setShowtimes(res.data))
        .catch(() => setShowtimes([]));
    } else {
      setShowtimes([]);
    }
  }, [selectedDate, selectedMovie, selectedCinema]);

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
            <FaFilm />
            <select value={selectedMovie} onChange={e => setSelectedMovie(e.target.value)}>
                <option value="">2. Phim</option>
                {movies.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
                ))}
            </select>
            </div>
            <div className="filter">
            <FaMapMarkerAlt />
            <select value={selectedCinema} onChange={e => setSelectedCinema(e.target.value)}>
                <option value="">3. Rạp</option>
                {cinemas.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
            </div>
        </div>

        {showtimes.length === 0 && selectedDate && selectedMovie && selectedCinema && (
            <p className="no-showtimes">Không có suất chiếu</p>
        )}

        {showtimes.length > 0 && (
            <div className="showtimes-list">
            {showtimes.map((st, index) => (
                <div key={index} className="showtime-item">
                    <div className="movie-info">
                        {st.movie_poster && 
                            <div className="movie-poster">
                                <img src={st.movie_poster} alt={st.movie_name} />
                            </div>
                        }
                        <div className="movie-title">{st.movie_name}</div>
                    </div>

                    <div className="showtime-details">
                        <div className="cinema-info">
                            <div className="cinema-image">
                            {st.cinema_image && 
                                <div>
                                    <img src={st.cinema_image} alt={st.cinema_name} />
                                </div>
                            }
                            </div>
                            <div className="cinema-info-text">
                                <div className="cinema-name">{st.cinema_name}</div>
                                <div className="cinema-address">{st.cinema_address}</div>
                                <div className="showtime-slot">
                                {st.start_time} ~ {st.end_time}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            </div>
        )}
    </div>
  );
}
