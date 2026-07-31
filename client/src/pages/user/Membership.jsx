import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/membership.css';
import { FaHome, FaChevronRight, FaInfoCircle } from 'react-icons/fa';

export default function MembershipPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [rollingPayments, setRollingPayments] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('userInfo');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const fetchData = async () => {
            try {
                // 1. Đồng bộ thông tin người dùng mới nhất từ server
                const userRes = await axiosClient.get(`users/users/${parsedUser.id}/`, { tokenType: 'user' });
                localStorage.setItem('userInfo', JSON.stringify(userRes.data));
                setUser(userRes.data);

                // 2. Lấy danh sách hóa đơn thành công (paid)
                const paymentsRes = await axiosClient.get('payments/payments/?status=paid', { tokenType: 'user' });
                const paidList = paymentsRes.data || [];

                // 3. Tính toán tổng chi tiêu trong vòng 365 ngày qua (Rolling 365 days)
                const oneYearAgo = new Date();
                oneYearAgo.setDate(oneYearAgo.getDate() - 365);

                const filtered = paidList.filter(payment => {
                    const payDate = new Date(payment.created_at);
                    return payDate >= oneYearAgo;
                });
                setRollingPayments(filtered);

                const sum = filtered.reduce((total, p) => total + parseFloat(p.total_price), 0);
                setTotalSpent(sum);
            } catch (err) {
                console.error("Lỗi khi tải thông tin hạng thành viên:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="membership-container" style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ color: '#fbbf24', fontSize: '18px' }}>Đang tải thông tin thành viên...</div>
            </div>
        );
    }

    // Định nghĩa các mốc thăng hạng
    const TIER_THRESHOLDS = {
        SILVER: 1000000,    // 1.000.000đ
        GOLD: 5000000,      // 5.000.000đ
        DIAMOND: 10000000   // 10.000.000đ
    };

    // Tính toán tiến trình thăng cấp
    let progressPercent = 0;
    let nextTierName = '';
    let spentNeeded = 0;
    let progressLabel = '';

    if (totalSpent < TIER_THRESHOLDS.SILVER) {
        nextTierName = 'VIP Bạc';
        spentNeeded = TIER_THRESHOLDS.SILVER - totalSpent;
        progressPercent = (totalSpent / TIER_THRESHOLDS.SILVER) * 100;
        progressLabel = `${totalSpent.toLocaleString()}đ / ${TIER_THRESHOLDS.SILVER.toLocaleString()}đ`;
    } else if (totalSpent < TIER_THRESHOLDS.GOLD) {
        nextTierName = 'VIP Vàng';
        spentNeeded = TIER_THRESHOLDS.GOLD - totalSpent;
        progressPercent = ((totalSpent - TIER_THRESHOLDS.SILVER) / (TIER_THRESHOLDS.GOLD - TIER_THRESHOLDS.SILVER)) * 100;
        progressLabel = `${totalSpent.toLocaleString()}đ / ${TIER_THRESHOLDS.GOLD.toLocaleString()}đ`;
    } else if (totalSpent < TIER_THRESHOLDS.DIAMOND) {
        nextTierName = 'VIP Kim Cương';
        spentNeeded = TIER_THRESHOLDS.DIAMOND - totalSpent;
        progressPercent = ((totalSpent - TIER_THRESHOLDS.GOLD) / (TIER_THRESHOLDS.DIAMOND - TIER_THRESHOLDS.GOLD)) * 100;
        progressLabel = `${totalSpent.toLocaleString()}đ / ${TIER_THRESHOLDS.DIAMOND.toLocaleString()}đ`;
    } else {
        progressPercent = 100;
        progressLabel = `${totalSpent.toLocaleString()}đ (Tối đa)`;
    }

    // Lấy thông tin hiển thị thẻ VIP
    const getCardClass = (level) => {
        return `vip-card tier-${level}`;
    };

    const getVipBadgeName = (level) => {
        if (level === 1) return 'VIP Bạc (Silver)';
        if (level === 2) return 'VIP Vàng (Gold)';
        if (level === 3) return 'VIP Kim Cương (Diamond)';
        return 'Thành viên Thường';
    };

    return (
        <div className="membership-container">
            {/* Breadcrumbs */}
            <div className="membership-breadcrumb">
                <Link to="/"><FaHome style={{ marginBottom: '-2px' }} /> Trang chủ</Link>
                <FaChevronRight size={10} />
                <span>Hạng thành viên</span>
            </div>

            {/* Layout Grid */}
            <div className="membership-grid">
                {/* Cột trái: Thẻ VIP ảo */}
                <div className="membership-card-section">
                    <div className="vip-card-wrapper">
                        <div className={getCardClass(user?.vip_level)}>
                            <div className="vip-card-shine"></div>
                            <div className="vip-card-header">
                                <span className="vip-card-logo">SuperStar</span>
                                <div className="vip-card-chip"></div>
                            </div>
                            <div className="vip-card-number">
                                •••• •••• •••• {user?.id ? String(user.id).padStart(4, '0') : '0000'}
                            </div>
                            <div className="vip-card-footer">
                                <div className="vip-card-holder">
                                    <span className="vip-card-label">CHỦ THẺ</span>
                                    <span className="vip-card-name">{user?.name || user?.username}</span>
                                </div>
                                <div className="vip-card-badge-box">
                                    {getVipBadgeName(user?.vip_level)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Tiến trình tích lũy */}
                <div className="membership-progress-section">
                    <div className="membership-progress-header">
                        <h3>Tiến trình thăng hạng</h3>
                    </div>
                    <div className="spent-summary">
                        <div className="spent-label">Tổng chi tiêu 365 ngày qua:</div>
                        <div className="spent-amount">{totalSpent.toLocaleString()}đ</div>
                        <div className="spent-note">
                            <FaInfoCircle style={{ marginRight: '5px', marginBottom: '-1px' }} />
                            Hệ thống tự động tính toán lại phân hạng thành viên mỗi 24h hoặc ngay sau khi bạn thanh toán hóa đơn mới thành công.
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-bar-container">
                        <div className="progress-labels">
                            <span>Tiến độ tích lũy</span>
                            <span>{progressLabel}</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    {/* Thông báo thăng cấp tiếp theo */}
                    {totalSpent < TIER_THRESHOLDS.DIAMOND ? (
                        <div className="next-tier-info">
                            Bạn cần chi tiêu thêm <strong>{spentNeeded.toLocaleString()}đ</strong> để nâng hạng thành viên lên <strong>{nextTierName}</strong>.
                        </div>
                    ) : (
                        <div className="next-tier-info" style={{ borderColor: '#10b981', color: '#10b981' }}>
                            Chúc mừng! Bạn đã đạt cấp độ thành viên cao nhất: <strong>VIP Kim Cương</strong>.
                        </div>
                    )}
                </div>
            </div>

            {/* Quyền lợi VIP */}
            <div className="membership-benefits-section">
                <h3>Đặc quyền các hạng thành viên</h3>
                <div className="benefits-grid">
                    {/* Hạng Thường */}
                    <div className={`benefit-card tier-0 ${user?.vip_level === 0 ? 'active' : ''}`}>
                        <div className="benefit-card-header">
                            <span className="benefit-tier-name">Thường</span>
                            {user?.vip_level === 0 && <span className="benefit-active-label">Đang áp dụng</span>}
                        </div>
                        <div className="benefit-discount-box">0%</div>
                        <ul className="benefit-details-list">
                            <li>Mua vé xem phim trực tuyến</li>
                            <li>Tích lũy chi tiêu thăng hạng</li>
                        </ul>
                    </div>

                    {/* Hạng Bạc */}
                    <div className={`benefit-card tier-1 ${user?.vip_level === 1 ? 'active' : ''}`}>
                        <div className="benefit-card-header">
                            <span className="benefit-tier-name">VIP Bạc</span>
                            {user?.vip_level === 1 && <span className="benefit-active-label">Đang áp dụng</span>}
                        </div>
                        <div className="benefit-discount-box">5%</div>
                        <ul className="benefit-details-list">
                            <li>Giảm giá 5% hóa đơn vé & combo bắp nước</li>
                            <li>Hỗ trợ đặt vé VIP trực tuyến</li>
                        </ul>
                    </div>

                    {/* Hạng Vàng */}
                    <div className={`benefit-card tier-2 ${user?.vip_level === 2 ? 'active' : ''}`}>
                        <div className="benefit-card-header">
                            <span className="benefit-tier-name">VIP Vàng</span>
                            {user?.vip_level === 2 && <span className="benefit-active-label">Đang áp dụng</span>}
                        </div>
                        <div className="benefit-discount-box">10%</div>
                        <ul className="benefit-details-list">
                            <li>Giảm giá 10% hóa đơn vé & combo bắp nước</li>
                            <li>Hỗ trợ soát vé VIP tại rạp</li>
                        </ul>
                    </div>

                    {/* Hạng Kim Cương */}
                    <div className={`benefit-card tier-3 ${user?.vip_level === 3 ? 'active' : ''}`}>
                        <div className="benefit-card-header">
                            <span className="benefit-tier-name">Kim Cương</span>
                            {user?.vip_level === 3 && <span className="benefit-active-label">Đang áp dụng</span>}
                        </div>
                        <div className="benefit-discount-box">15%</div>
                        <ul className="benefit-details-list">
                            <li>Giảm giá 15% hóa đơn vé & combo bắp nước</li>
                            <li>Đội ngũ chăm sóc VIP đặc biệt</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Lịch sử giao dịch tích lũy */}
            <div className="membership-history-section">
                <h3>Các giao dịch tích lũy trong 365 ngày qua</h3>
                <div className="history-table-container">
                    {rollingPayments.length > 0 ? (
                        <table className="history-table">
                            <thead>
                                <tr>
                                    <th>Mã hóa đơn</th>
                                    <th>Thời gian giao dịch</th>
                                    <th>Hình thức</th>
                                    <th>Số tiền tích lũy</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rollingPayments.map((p) => (
                                    <tr key={p.id}>
                                        <td>#{p.id}</td>
                                        <td>{new Date(p.created_at).toLocaleString('vi-VN')}</td>
                                        <td>Đặt vé xem phim</td>
                                        <td style={{ fontWeight: 'bold' }}>{parseFloat(p.total_price).toLocaleString()}đ</td>
                                        <td>
                                            <span className="history-status-badge">Đã thanh toán</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-history-box">
                            Bạn chưa có giao dịch đặt vé thành công nào trong vòng 365 ngày qua để tích lũy hạng VIP.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
