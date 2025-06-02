import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { getNext7Days } from '../../utils/dateUtils';
import '../../assets/css/user/QuickBooking.css';

export function QuickBooking() {
    const [cinemas, setCinemas] = useState([]);
    const [movies, setMovies] = useState([]);
    const [dates, setDates] = useState([]);
    const [showtimes, setShowtimes] = useState([]);

    const [selectedCinema, setSelectedCinema] = useState('');
    const [selectedMovie, setSelectedMovie] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedShowtime, setSelectedShowtime] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        axiosClient.get('cinemas/cinemas/').then(res => setCinemas(res.data));
        axiosClient.get('movies/movies/').then(res => setMovies(res.data));
        setDates(getNext7Days());
    }, []);

    useEffect(() => {
        if (selectedCinema && selectedMovie && selectedDate) {
            axiosClient
                .get(`cinemas/showtimes/?cinema=${selectedCinema}&movie=${selectedMovie}&date=${selectedDate}`)
                .then(res => setShowtimes(res.data));
        } else {
            setShowtimes([]);
        }
    }, [selectedCinema, selectedMovie, selectedDate]);

    const handleBooking = () => {
        if (!selectedCinema || !selectedMovie || !selectedDate || !selectedShowtime) {
            alert('Vui lòng chọn đầy đủ thông tin');
            return;
        }

        const showtime = showtimes.find(s => s.id === Number(selectedShowtime));
        if (!showtime) {
            alert('Không tìm thấy suất chiếu!');
            return;
        }

        navigate(`/movies/${showtime.movie}/booking/${showtime.id}`);
    };

    return (
        <div className="quick-booking">
            <h3 className="booking-title">ĐẶT VÉ NHANH</h3>
            <div className="booking-selects">
                <select onChange={(e) => setSelectedCinema(e.target.value)}>
                    <option value="">1. Chọn Rạp</option>
                    {cinemas.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <select onChange={(e) => setSelectedMovie(e.target.value)}>
                    <option value="">2. Chọn Phim</option>
                    {movies.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>

                <select onChange={(e) => setSelectedDate(e.target.value)}>
                    <option value="">3. Chọn Ngày</option>
                    {dates.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                </select>

                <select value={selectedShowtime} onChange={(e) => setSelectedShowtime(e.target.value)}>
                    <option value="">4. Chọn Suất</option>
                    {showtimes.length > 0 ? (
                        showtimes.map(s => (
                            <option key={s.id} value={s.id.toString()}>
                                {s.room_name}: {s.start_time} - {s.end_time}
                            </option>
                        ))
                    ) : (
                        selectedCinema && selectedMovie && selectedDate && (
                            <option disabled>Không có suất chiếu</option>
                        )
                    )}
                </select>

                <button className="booking-btn" onClick={handleBooking}>
                    ĐẶT NGAY
                </button>
            </div>
        </div>
    );
}
