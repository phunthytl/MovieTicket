import '../../assets/css/user/PaymentHistory.css'
import { FaTimes, FaFilm, FaBuilding, FaChair, FaUtensils, FaCheck } from 'react-icons/fa';

const PaymentDetailModal = ({
    show,
    ticket,
    onClose,
    formatPrice,
    formatDate,
    getStatusText,
    getStatusClass
}) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3 className="modal-title">
                        Chi tiết đơn hàng #{ticket?.id || 'N/A'}
                    </h3>
                    <button onClick={onClose} className="close-button">
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-content">
                    {ticket ? (
                        <>
                            {/* Thông tin phim */}
                            <div className="info-section movie-info-pd">
                                <h4 className="section-title">
                                    <FaFilm />
                                    Thông tin phim
                                </h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Tên phim:</span>
                                        <span className="info-value">{ticket.movie_name || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Ngày chiếu:</span>
                                        <span className="info-value">{ticket.date || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Giờ chiếu:</span>
                                        <span className="info-value">
                                            {ticket.start_time && ticket.end_time
                                                ? `${ticket.start_time} - ${ticket.end_time}`
                                                : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phòng:</span>
                                        <span className="info-value">{ticket.room_name || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin rạp */}
                            <div className="info-section cinema-info-pd">
                                <h4 className="section-title">
                                    <FaBuilding />
                                    Thông tin rạp
                                </h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Tên rạp:</span>
                                        <span className="info-value">{ticket.cinema_name || 'N/A'}</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Địa chỉ:</span>
                                        <span className="info-value">{ticket.cinema_address || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin ghế */}
                            <div className="info-section seat-info">
                                <h4 className="section-title">
                                    <FaChair />
                                    Thông tin ghế
                                </h4>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Ghế đã chọn:</span>
                                        <span className="info-value">
                                            {ticket.seats && Array.isArray(ticket.seats)
                                                ? ticket.seats.join(', ')
                                                : ticket.tickets && Object.values(ticket.tickets).flat().join(', ') || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Tiền vé:</span>
                                        <span className="info-value">{formatPrice(ticket.ticket_total || 0)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Thông tin đồ ăn */}
                            {(ticket.snacks?.length > 0 || ticket.snack_total > 0) && (
                                <div className="info-section snack-info-pd">
                                    <h4 className="section-title">
                                        <FaUtensils />
                                        Đồ ăn & Thức uống
                                    </h4>
                                    <div className="info-value">
                                        {ticket.snacks?.map((snackStr, index) => (
                                            <div key={index} className="snack-info-pd"> 
                                                <span>{snackStr}</span>
                                            </div>
                                        ))}
                                    
                                        <div className="info-item">
                                            <span className="info-label">Tiền đồ ăn:</span>
                                            <span className="info-value">
                                                {formatPrice(ticket.snack_total || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tổng thanh toán */}
                            <div className={`info-section ${ticket.status === 'canceled' ? 'total-section-canceled' : 'total-section-paid'}`}>
                                <div className="total-section">
                                    <span className="total-label">Tổng thanh toán:</span>
                                    <span className={`total-amount ${ticket.status === 'canceled' ? 'canceled' : 'paid'}`}>
                                        {formatPrice(ticket.total_price)}
                                    </span>
                                </div>
                                <div className="date-and-status">
                                    <div className="info-item">
                                        <span className="info-label">Ngày tạo:</span>
                                        <span className="info-value">{formatDate(ticket.created_at)}</span>
                                    </div>
                                    <div className={`paid-badge ${getStatusClass(ticket.status)}`}>
                                        {ticket.status === 'paid' && <FaCheck />}
                                        {ticket.status === 'canceled' && <FaTimes />}
                                        {getStatusText(ticket.status)}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="modal-loading">
                            <p>Không thể tải chi tiết vé</p>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="close-modal-button">
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailModal;
