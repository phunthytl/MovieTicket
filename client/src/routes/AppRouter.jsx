import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import ManageMovies from '../pages/admin/ManageMovie';
import AdminLogin from '../pages/admin/AdminLogin';
import MovieForm from '../pages/admin/MovieForm';
import ManageGenres from '../pages/admin/ManageGenre';
import GenreForm from '../pages/admin/GenreForm';
import ManageSnacks from '../pages/admin/ManageSnack';
import SnackForm from '../pages/admin/SnackForm';
import ManageUsers from '../pages/admin/ManagerUser';
import UserForm from '../pages/admin/UserForm';
import ManageClusters from '../pages/admin/ManageCluster';
import ClusterForm from '../pages/admin/ClusterForm';
import ManageCinemas from '../pages/admin/ManageCinema';
import CinemaForm from '../pages/admin/CinemaForm';
import ManageRooms from '../pages/admin/ManageRoom';
import RoomForm from '../pages/admin/RoomForm';
import ManageSeats from '../pages/admin/ManageSeat';
import ManageShowtimes from '../pages/admin/ManagaShowtime';
import ShowtimeForm from '../pages/admin/ShowtimeForm';
import ManageSeatStatus from '../pages/admin/ManageSeatStatus';
import ManagePayments from '../pages/admin/ManagePayment';

import UserLayout from '../layouts/UserLayout';
import Home from '../pages/user/Home';
import Login from '../pages/user/Login';
import MovieDetailPage from '../pages/user/DetailMovie';
import PaymentPage from '../pages/user/PaymentPage';
import MovieListPage from '../pages/user/MovieListPage';
import RequireAdmin from '../components/admin/RequireAdmin';
import ShowtimesPage from '../pages/user/ShowtimePage';
import PaymentHistory from '../pages/user/PaymentHistory';
import VNPayReturn from '../pages/user/VnPayReturn';
import BookingPage from '../pages/user/Booking';
import ManageReviews from '../pages/admin/ManageReview';
import MovieReviewsPage from '../pages/user/ReviewPage';
import UserProfilePage from '../pages/user/Profile';
import CinemasPage from '../pages/user/CinemasPage';
import Register from '../pages/user/Register';

export default function AppRouter() {

    return (
        <Router>
            <Routes>
                {/* Trang đăng nhập admin */}
                <Route path="/admin/login" element={<AdminLogin />} />
                {/* Các route của trang Admin */}
                <Route path="/admin/*" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                    <Route index element={<Dashboard />} />
                    <Route path="movies" element={<ManageMovies />} />
                    <Route path="movies/create" element={<MovieForm mode="create" />} />
                    <Route path="movies/:id/edit" element={<MovieForm mode="edit" />} />
                    <Route path="movies/:id/view" element={<MovieForm mode="view" />} />
                    <Route path="genres" element={<ManageGenres />} />
                    <Route path="genres/create" element={<GenreForm mode="create" />} />
                    <Route path="genres/:id/edit" element={<GenreForm mode="edit" />} />
                    <Route path="snacks" element={<ManageSnacks />} />
                    <Route path="snacks/create" element={<SnackForm mode="create" />} />
                    <Route path="snacks/:id/edit" element={<SnackForm mode="edit" />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="users/create" element={<UserForm mode="create" />} />
                    <Route path="users/:id/edit" element={<UserForm mode="edit" />} />
                    <Route path="clusters" element={<ManageClusters />} />
                    <Route path="clusters/create" element={<ClusterForm mode="create" />} />
                    <Route path="clusters/:id/edit" element={<ClusterForm mode="edit" />} />
                    <Route path="clusters/:clusterId/cinemas" element={<ManageCinemas />} />
                    <Route path="clusters/:clusterId/cinemas/create" element={<CinemaForm mode="create" />} />
                    <Route path="clusters/:clusterId/cinemas/:id/edit" element={<CinemaForm mode="edit" />} />
                    <Route path="clusters/:clusterId/cinemas/:cinemaId/rooms" element={<ManageRooms />} />
                    <Route path="clusters/:clusterId/cinemas/:cinemaId/rooms/create" element={<RoomForm mode="create" />} />
                    <Route path="clusters/:clusterId/cinemas/:cinemaId/rooms/:id/edit" element={<RoomForm mode="edit" />} />
                    <Route path="clusters/:clusterId/cinemas/:cinemaId/rooms/:id/seats" element={<ManageSeats />} />
                    <Route path="showtimes" element={<ManageShowtimes />} />
                    <Route path="showtimes/create" element={<ShowtimeForm mode="create" />} />
                    <Route path="showtimes/:id/edit" element={<ShowtimeForm mode="edit" />} />
                    <Route path="showtimes/:id/seats" element={<ManageSeatStatus />} />
                    <Route path="payments" element={<ManagePayments />} />
                    <Route path="reviews" element={<ManageReviews />} />
                </Route>

                {/* Route người dùng*/}
                <Route path="/*" element={<UserLayout />}>
                    <Route index element={<Home />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="profile" element={<UserProfilePage />} />
                    <Route path="movies" element={<MovieListPage />} />
                    <Route path="movies/:id" element={<MovieDetailPage />} />
                    <Route path="movies/:id/reviews" element={<MovieReviewsPage />} />
                    <Route path="movies/:movieId/booking/:id" element={<BookingPage />} />
                    <Route path="movies/:movieId/payments/:paymentId" element={<PaymentPage />} />
                    <Route path="showtimes" element={<ShowtimesPage />} />
                    <Route path="cinemas" element={<CinemasPage />} />
                    <Route path="payment/vnpay-return" element={<VNPayReturn />} />
                    <Route path="history" element={<PaymentHistory />} />
                </Route>
            </Routes>
        </Router>
    );
}
