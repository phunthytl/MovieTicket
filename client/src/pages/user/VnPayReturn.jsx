import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';

export default function VnPayReturn() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);

        // chuyển URLSearchParams thành object để truyền cho axios params
        const paramsObj = Object.fromEntries(searchParams.entries());

        axiosClient.get('/payments/vnpay-return/', { params: paramsObj })
        .then(res => {
            console.log('✔ Thanh toán thành công:', res.data);
            navigate('/history');
        })
        .catch(err => {
            console.error('❌ Lỗi xử lý kết quả thanh toán:', err);
            alert('Thanh toán thất bại hoặc không hợp lệ!');
            navigate('/');
        });
    }, [navigate, location]);

    return <div>Đang xử lý kết quả thanh toán...</div>;
}