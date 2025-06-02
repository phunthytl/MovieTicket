import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/css/user/movieList.css';

export default function MovieList({ movies }) {
    const navigate = useNavigate();

    if (!movies || movies.length === 0) {
        return <p style={{ textAlign: 'center' }}>Không có phim nào.</p>;
    }

    return (
        <div className="movie-list">
        <div className="movie-grid">
            {movies.map((movie) => (
            <div className="movie-card" key={movie.id}>
                <img
                src={movie.poster}
                alt={movie.name}
                className="movie-poster"
                />
                <div className="movie-info-container">
                <h4 className="movie-title">{movie.name}</h4>
                <p className="movie-duration">{movie.duration} phút</p>
                </div>
                <div className="movie-actions">
                <button
                    className="trailer-btn"
                    onClick={() => window.open(movie.trailer, '_blank')}
                >
                    Xem trailer
                </button>
                <button
                    className="book-btn"
                    onClick={() => navigate(`/movies/${movie.id}`)}
                >
                    Đặt vé
                </button>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
}
