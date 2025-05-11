import React, { useEffect, useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { getNext7Days } from '../../utils/dateUtils';
import '../../assets/css/user/quickbooking.css';
// import BookingModal from './BookingModal';

export function QuickBooking() {
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [dates, setDates] = useState([]);
  const [showtimes, setShowtimes] = useState([]);

  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedShowtime, setSelectedShowtime] = useState('');

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axiosClient.get('cinemas/cinemas/').then(res => setCinemas(res.data));
    axiosClient.get('movies/movies/').then(res => setMovies(res.data));
    setDates(getNext7Days());
  }, []);

  useEffect(() => {
    if (selectedCinema && selectedMovie && selectedDate) {
      axiosClient.get(`/showtimes/?cinema=${selectedCinema}&movie=${selectedMovie}&date=${selectedDate}`)
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
    setShowModal(true);
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

        <select onChange={(e) => setSelectedShowtime(e.target.value)}>
          <option value="">4. Chọn Suất</option>
          {showtimes.length > 0 ? (
            showtimes.map(s => (
              <option key={s.id} value={s.id}>
                {s.time} - Phòng {s.room_name}
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

      {/* Modal đặt vé (giả sử có) */}
      {/* {showModal && (
        <BookingModal
          showtimeId={selectedShowtime}
          onClose={() => setShowModal(false)}
        />
      )} */}
    </div>
  );
}