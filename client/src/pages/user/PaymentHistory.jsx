import React, { useEffect, useState } from "react";
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/PaymentHistory.css';
import PaymentDetailModal from "../../components/user/PaymentDetailModal";
import ReviewModal from "../../components/user/ReviewModal";
import { FaStar, FaTicketAlt, FaCreditCard, FaCalendarAlt, FaEye } from 'react-icons/fa';

const PaymentHistory = () => {
    const [tickets, setTickets] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [reviewModal, setReviewModal] = useState(false);
    const [reviewTicket, setReviewTicket] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketRes, reviewRes] = await Promise.all([
                    axiosClient.get("payments/payments/user-payments/", { tokenType: "user" }),
                    axiosClient.get("movies/reviews/", { tokenType: "user" }),
                ]);
                setTickets(ticketRes.data);
                setReviews(reviewRes.data || []);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            }
        };
        fetchData();
    }, []);

    const handleViewDetails = async (ticket) => {
        setShowModal(true);
        try {
            const res = await axiosClient.get(`payments/payments/${ticket.id}`, {
                tokenType: "user",
            });
            setSelectedTicket(res.data);
        } catch (error) {
            console.error("Lỗi khi tải chi tiết vé:", error);
            setSelectedTicket(ticket);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedTicket(null);
    };

    const hasReviewed = (movieId) => {
        return reviews.some((review) => review.movie?.id === movieId);
    };

    const handleReview = (ticket) => {
        const now = new Date();
        const showtimeEnd = new Date(ticket.showtime_end);

        if (!ticket.movie_id) {
            alert("Không tìm thấy thông tin phim.");
            return;
        }

        if (showtimeEnd > now) {
            alert("Phim chưa chiếu, bạn không thể đánh giá lúc này.");
            return;
        }

        if (hasReviewed(ticket.movie_id)) {
            alert("Bạn đã đánh giá phim này rồi.");
            return;
        }

        setReviewTicket(ticket);
        setReviewModal(true);
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);

    const formatDate = (dateString) => new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    const getStatusText = (status) => {
        switch(status) {
            case 'paid': return 'Đã thanh toán';
            case 'canceled': return 'Đã hủy';
            case 'pending': return 'Chờ thanh toán';
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'paid': return 'status-paid';
            case 'canceled': return 'status-canceled';
            case 'pending': return 'status-pending';
            default: return 'status-default';
        }
    };

    return (
        <div className="ticket-history-container">
            <div className="ticket-history-wrapper">
                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon"><FaTicketAlt /></div>
                        <h3 className="empty-title">Chưa có vé nào</h3>
                        <p className="empty-text">Bạn chưa có vé nào được thanh toán.</p>
                    </div>
                ) : (
                    <div className="ticket-list">
                        {tickets.map((ticket) => {
                            const reviewed = hasReviewed(ticket.movie_id);
                            const showtimePassed = ticket.showtime_end && new Date(ticket.showtime_end) < new Date();
                            const canReview = showtimePassed && !reviewed;

                            return (
                                <div key={ticket.id} className="ticket-card">
                                    <div className="ticket-content">
                                        <div className="ticket-header">
                                            <div className="ticket-info">
                                                <h3 className="order-id">Đơn hàng #{ticket.id}</h3>
                                                <div className="status-container">
                                                    <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                                                        {getStatusText(ticket.status)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="ticket-details">
                                            <div className="detail-item">
                                                <span className="detail-label"><FaCreditCard /> Tổng tiền:</span>
                                                <span className="detail-value">{formatPrice(ticket.total_price)}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label"><FaCalendarAlt /> Ngày mua:</span>
                                                <span className="detail-value">{formatDate(ticket.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="ticket-footer">
                                            <div className="ticket-summary">
                                                {ticket.tickets && Object.entries(ticket.tickets).map(([movie, seats]) => (
                                                    <span key={movie} className="summary-text">
                                                        {movie}: {Array.isArray(seats) ? seats.length : seats} ghế
                                                    </span>
                                                ))}
                                                {ticket.snacks?.length > 0 && (
                                                    <span className="summary-text">• {ticket.snacks.length} món ăn</span>
                                                )}
                                            </div>
                                            <div className="ticket-actions">
                                                <button onClick={() => handleViewDetails(ticket)} className="view-button">
                                                    <FaEye /> Xem chi tiết
                                                </button>

                                                <button
                                                    onClick={() => handleReview(ticket)}
                                                    className={`review-button ${canReview ? 'review-active' : 'review-disabled'}`}
                                                >
                                                    <FaStar color="#fbbf24" /> {reviewed ? "Đã đánh giá" : "Đánh giá"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showModal && (
                <PaymentDetailModal
                    show={showModal}  
                    ticket={selectedTicket}
                    onClose={closeModal}
                    formatPrice={formatPrice}
                    formatDate={formatDate}
                    getStatusText={getStatusText}
                    getStatusClass={getStatusClass}
                />
            )}

            {reviewModal && (
                <ReviewModal
                    ticket={reviewTicket}
                    onClose={() => {
                        setReviewModal(false);
                        setReviewTicket(null);
                    }}
                    onReviewSuccess={(review) => {
                        setReviews(prev => [...prev, review]);
                    }}
                />
            )}
        </div>
    );
};

export default PaymentHistory;
