import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import MovieList from '../../components/user/MovieList';

export default function MovieListPage() {
    const [movies, setMovies] = useState([]);
    const [searchParams] = useSearchParams();

    // Lấy status từ URL và giải mã (decode)
    let rawStatus = searchParams.get('status') || 'Đang chiếu';
    rawStatus = decodeURIComponent(rawStatus);

    let status = 'Đang chiếu';
    if (rawStatus === 'Sắp chiếu') {
        status = 'Sắp chiếu';
    }

    useEffect(() => {
        axiosClient.get(`movies/movies?status=${encodeURIComponent(status)}`)
        .then((res) => {setMovies(res.data);})
    }, [status]);

    return (
        <div className="movie-list-page" style={{ paddingTop: 110, textAlign: 'center' }}>
        <h2>{status === 'Đang chiếu' ? 'Phim đang chiếu' : 'Phim sắp chiếu'}</h2>
        <MovieList movies={movies} />
        </div>
    );
}