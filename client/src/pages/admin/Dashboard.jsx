import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaChartLine, FaUsers, FaBuilding, FaTicketAlt, FaTimes, FaGlobe } from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/Dashboard.css';

export default function Dashboard() {
	const [summaryData, setSummaryData] = useState({
		total_revenue: 0,
		total_orders: 0,
		average_order_value: 0
	});
	const [groupRevenue, setGroupRevenue] = useState([]);
	const [dailyRevenue, setDailyRevenue] = useState([]);
	const [loading, setLoading] = useState(true);
	
	// State cho Modal chi tiết rạp
	const [selectedGroup, setSelectedGroup] = useState(null);
	const [cinemaRevenue, setCinemaRevenue] = useState([]);
	const [loadingDetail, setLoadingDetail] = useState(false);

	const [dateRange, setDateRange] = useState({
		start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
		end_date: new Date().toISOString().split('T')[0]
	});

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat('vi-VN', {
			style: 'currency',
			currency: 'VND'
		}).format(amount);
	};

	const fetchData = async () => {
		setLoading(true);
		try {
			const queryParams = new URLSearchParams();
			if (dateRange.start_date) queryParams.append('start_date', dateRange.start_date);
			if (dateRange.end_date) queryParams.append('end_date', dateRange.end_date);

			// 1. Fetch Summary
			const summaryRes = await axiosClient.get(`cinemas/revenue/summary/?${queryParams.toString()}`);
			if (summaryRes.data.status === 'success') {
				setSummaryData(summaryRes.data.data);
			}

			// 2. Fetch Group Revenue
			const groupRes = await axiosClient.get(`cinemas/revenue/cinema-groups/?${queryParams.toString()}`);
			if (groupRes.data.status === 'success') {
				setGroupRevenue(groupRes.data.data);
			}

			// 3. Fetch all payments to aggregate daily trend
			const paymentsRes = await axiosClient.get('payments/payments/');
			const payments = paymentsRes.data || [];
			
			// Lọc và gom nhóm theo ngày
			const start = dateRange.start_date ? new Date(dateRange.start_date) : null;
			const end = dateRange.end_date ? new Date(dateRange.end_date) : null;
			
			const dailyMap = {};
			payments.forEach(p => {
				if (p.status === 'paid' && p.created_at) {
					const pDate = new Date(p.created_at);
					const dateStr = pDate.toISOString().split('T')[0];
					
					// Kiểm tra lọc khoảng ngày
					if (start && pDate < start) return;
					if (end && pDate > new Date(end.getTime() + 24 * 60 * 60 * 1000)) return;

					dailyMap[dateStr] = (dailyMap[dateStr] || 0) + (p.total_price || 0);
				}
			});

			// Chuyển sang dạng mảng để Recharts vẽ
			const trendData = Object.keys(dailyMap)
				.sort()
				.map(date => {
					const parts = date.split('-');
					return {
						date: `${parts[2]}/${parts[1]}`,
						'Doanh thu': dailyMap[date]
					};
				});

			setDailyRevenue(trendData);

		} catch (error) {
			console.error('Lỗi khi tải dữ liệu dashboard:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [dateRange]);

	const handleDateChange = (field, value) => {
		setDateRange(prev => ({
			...prev,
			[field]: value
		}));
	};

	const handleViewDetail = async (group) => {
		setSelectedGroup(group);
		setLoadingDetail(true);
		try {
			const queryParams = new URLSearchParams();
			if (dateRange.start_date) queryParams.append('start_date', dateRange.start_date);
			if (dateRange.end_date) queryParams.append('end_date', dateRange.end_date);

			const res = await axiosClient.get(`cinemas/revenue/cinema-groups/${group.group_id}/cinemas/?${queryParams.toString()}`);
			if (res.data.status === 'success') {
				setCinemaRevenue(res.data.data);
			}
		} catch (error) {
			console.error('Lỗi khi tải chi tiết doanh thu rạp:', error);
		} finally {
			setLoadingDetail(false);
		}
	};

	return (
		<div className="revenue-dashboard" style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px' }}>
			{/* Header */}
			<div className="revenue-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
				<div className="revenue-title" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
					<FaChartLine color="#3b82f6" /> Tổng quan kết quả kinh doanh
				</div>

				{/* Date Range Picker */}
				<div className="date-range-container" style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'white', padding: '10px 16px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
					<FaCalendarAlt color="#94a3b8" />
					<div className="date-input-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
						<label style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Từ:</label>
						<input
							type="date"
							value={dateRange.start_date}
							onChange={(e) => handleDateChange('start_date', e.target.value)}
							style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
						/>
					</div>
					<div className="date-input-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
						<label style={{ fontSize: '13px', color: '#475569', fontWeight: '600' }}>Đến:</label>
						<input
							type="date"
							value={dateRange.end_date}
							onChange={(e) => handleDateChange('end_date', e.target.value)}
							style={{ padding: '6px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '13px' }}
						/>
					</div>
				</div>
			</div>

			{loading ? (
				<div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
					<div className="loading-spinner"></div>
				</div>
			) : (
				<>
					{/* Summary Cards */}
					<div className="summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
						<div className="summary-card" style={{ background: 'white', padding: '20px', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
							<div className="summary-card-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<div className="summary-card-info">
									<h3 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Tổng doanh thu</h3>
									<p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(summaryData.total_revenue)}</p>
								</div>
								<div style={{ width: '40px', height: '40px', background: '#ecfdf5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									<FaChartLine color="#10b981" size={20} />
								</div>
							</div>
						</div>

						<div className="summary-card" style={{ background: 'white', padding: '20px', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
							<div className="summary-card-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<div className="summary-card-info">
									<h3 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Tổng vé đã bán</h3>
									<p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{summaryData.total_orders} đơn</p>
								</div>
								<div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									<FaTicketAlt color="#3b82f6" size={20} />
								</div>
							</div>
						</div>

						<div className="summary-card" style={{ background: 'white', padding: '20px', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
							<div className="summary-card-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<div className="summary-card-info">
									<h3 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase' }}>Trung bình/đơn</h3>
									<p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{formatCurrency(summaryData.average_order_value)}</p>
								</div>
								<div style={{ width: '40px', height: '40px', background: '#fffbeb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
									<FaGlobe color="#f59e0b" size={20} />
								</div>
							</div>
						</div>
					</div>

					{/* Revenue Trend Chart */}
					<div className="chart-container" style={{ background: 'white', padding: '24px', borderRadius: '4px', border: '1px solid #e2e8f0', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
						<h3 className="chart-title" style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>Biểu đồ tăng trưởng doanh thu theo ngày</h3>
						<div style={{ width: '100%', height: 300 }}>
							{dailyRevenue.length > 0 ? (
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart data={dailyRevenue} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
										<defs>
											<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
												<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
										<XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
										<YAxis stroke="#94a3b8" fontSize={12} tickLine={false} tickFormatter={(v) => `${(v/1000).toLocaleString()}k`} />
										<Tooltip formatter={(value) => [formatCurrency(value), 'Doanh thu']} />
										<Area type="monotone" dataKey="Doanh thu" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
									</AreaChart>
								</ResponsiveContainer>
							) : (
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>Không có dữ liệu doanh thu trong khoảng thời gian này.</div>
							)}
						</div>
					</div>

					{/* Group Revenue Table */}
					<div className="revenue-table-container" style={{ background: 'white', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
						<div className="revenue-table-header" style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
							<h2 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#1e293b' }}>Doanh thu theo cụm rạp</h2>
						</div>
						<table className="revenue-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
							<thead>
								<tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
									<th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Tên Cụm rạp</th>
									<th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Số lượng rạp</th>
									<th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Tổng số đơn</th>
									<th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Doanh thu tích lũy</th>
									<th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Chi tiết</th>
								</tr>
							</thead>
							<tbody>
								{groupRevenue.map((group) => (
									<tr key={group.group_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
										<td style={{ padding: '16px 20px', fontWeight: '600', color: '#1e293b' }}>{group.group_name}</td>
										<td style={{ padding: '16px 20px', color: '#64748b' }}>{group.cinema_count} rạp</td>
										<td style={{ padding: '16px 20px', color: '#64748b' }}>{group.total_orders} đơn</td>
										<td style={{ padding: '16px 20px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(group.total_revenue)}</td>
										<td style={{ padding: '16px 20px' }}>
											<button className="view-detail-btn" onClick={() => handleViewDetail(group)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '600', cursor: 'pointer' }}>Xem chi tiết</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}

			{/* Modal chi tiết rạp thuộc cụm */}
			{selectedGroup && (
				<div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
					<div style={{ background: 'white', borderRadius: '4px', width: '90%', maxWidth: '800px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
							<h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
								<FaBuilding color="#3b82f6" /> Danh sách rạp thuộc cụm {selectedGroup.group_name}
							</h3>
							<button onClick={() => setSelectedGroup(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#64748b' }}>
								<FaTimes />
							</button>
						</div>

						{loadingDetail ? (
							<div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="loading-spinner"></div></div>
						) : (
							<div style={{ maxHeight: '400px', overflowY: 'auto' }}>
								<table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
									<thead>
										<tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
											<th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Tên Rạp</th>
											<th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Địa chỉ</th>
											<th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Vé đã bán</th>
											<th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#475569' }}>Doanh thu</th>
										</tr>
									</thead>
									<tbody>
										{cinemaRevenue.length > 0 ? (
											cinemaRevenue.map((cinema) => (
												<tr key={cinema.cinema_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
													<td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e293b' }}>{cinema.cinema_name}</td>
													<td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>{cinema.cinema_address}</td>
													<td style={{ padding: '12px 16px', color: '#64748b' }}>{cinema.tickets_sold} vé</td>
													<td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(cinema.total_revenue)}</td>
												</tr>
											))
										) : (
											<tr>
												<td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Không có dữ liệu doanh thu cho từng rạp.</td>
											</tr>
										)}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
