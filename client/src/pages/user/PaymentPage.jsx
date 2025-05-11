import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/paymentPage.css';

export default function PaymentPage() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [countdown, setCountdown] = useState(600); // 10 phút

  useEffect(() => {
    axiosClient.get(`payments/payments/${paymentId}/`)
      .then(res => {
        setPayment(res.data);
        console.log('✅ Payment data:', res.data);
      })
      .catch(err => {
        console.error('❌ Lỗi khi fetch payment:', err);
      });

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/payment/timeout');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paymentId, navigate]);

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!payment) {
    return <div>Đang tải thông tin thanh toán...</div>;
  }

  return (
    <div className="payment-page">
      <div className="ticket-info">
        <h2>{payment.movie_name || ''}</h2>
        <p><strong>Rạp:</strong> {payment.cinema_name || ''}</p>
        <p><strong>Địa chỉ:</strong> {payment.cinema_address || ''}</p>
        <p><strong>Thời gian:</strong> {payment.start_time || ''} ~ {payment.end_time || ''}</p>
        <p><strong>Ngày chiếu:</strong> {payment.date || ''}</p>
        <p><strong>Phòng chiếu:</strong> {payment.room_name || ''}</p>
        <p><strong>Số ghế:</strong> {payment.seats?.join(', ') || ''}</p>
        <hr />
        <p><strong>GHẾ:</strong> {payment.ticket_total?.toLocaleString() || 0} VND</p>
        <p><strong>BẮP - NƯỚC:</strong> {payment.snack_total?.toLocaleString() || 0} VND</p>
        <hr />
        <p className="total">SỐ TIỀN CẦN THANH TOÁN: {payment.total_price?.toLocaleString() || 0} VND</p>
      </div>

      <div className="qr-section">
        <h3>THANH TOÁN {formatTime(countdown)}</h3>
        <p className="note">Bạn cần thanh toán trong 10 phút nếu không đơn của bạn sẽ bị hủy.</p>
        {payment.qr_code_url ? (
          <img src={payment.qr_code_url} alt="QR Code Momo" className="qr-image" />
        ) : (
          <p>Không có mã QR để thanh toán.</p>
        )}
      </div>
    </div>
  );
}
