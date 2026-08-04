import React, { useEffect, useState } from 'react';
import { FaRobot, FaBrain, FaPaperPlane, FaFilm, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/admin.css';

export default function ManageAI() {
	const [activeMovies, setActiveMovies] = useState([]);
	const [chatMessage, setChatMessage] = useState('');
	const [chatHistory, setChatHistory] = useState([]);
	const [loading, setLoading] = useState(false);
	const [statusInfo, setStatusInfo] = useState({
		apiKeyConfigured: true,
		modelName: 'gemini-2.5-flash',
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const res = await axiosClient.get('movies/movies/');
				const showingOrUpcoming = res.data.filter(
					(m) => m.status === 'Đang chiếu' || m.status === 'Sắp chiếu'
				);
				setActiveMovies(showingOrUpcoming);
			} catch (error) {
				console.error('Lỗi khi lấy thông tin phim:', error);
			}
		};
		fetchData();
	}, []);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!chatMessage.trim()) return;

		const userMsg = { role: 'user', message: chatMessage };
		const updatedHistory = [...chatHistory, userMsg];
		setChatHistory(updatedHistory);
		setChatMessage('');
		setLoading(true);

		try {
			const res = await axiosClient.post('movies/ai-chat/', {
				message: userMsg.message,
				history: chatHistory
			});
			setChatHistory((prev) => [...prev, { role: 'model', message: res.data.reply, suggestions: res.data.suggested_movies }]);
		} catch (error) {
			console.error('Lỗi gọi AI Chatbot:', error);
			setChatHistory((prev) => [...prev, { role: 'model', message: 'Lỗi máy chủ: Không thể kết nối tới mô hình AI. Vui lòng kiểm tra lại GEMINI_API_KEY trong cấu hình hệ thống.' }]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="movie-management">
			<div className="movie-management-header" style={{ marginBottom: '20px' }}>
				<h2 className="section-title"><FaBrain style={{ color: '#8b5cf6', marginRight: '8px' }} /> Quản lý AI & Bàn thử nghiệm (Playground)</h2>
			</div>

			<div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
				{/* Cột trái: Cấu hình và Thông tin */}
				<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
					{/* Card Status */}
					<div style={{ background: '#fff', padding: '20px', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
						<h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
							Trạng thái hoạt động
						</h3>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<span style={{ fontSize: '14px', color: '#64748b' }}>Trạng thái API Key:</span>
								<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>
									<FaCheckCircle /> Hoạt động
								</span>
							</div>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<span style={{ fontSize: '14px', color: '#64748b' }}>Mô hình sử dụng:</span>
								<span style={{ fontSize: '14px', color: '#4f46e5', fontWeight: 'bold' }}>{statusInfo.modelName}</span>
							</div>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
								<span style={{ fontSize: '14px', color: '#64748b' }}>Số phim trong context AI:</span>
								<span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
									<FaFilm /> {activeMovies.length} phim
								</span>
							</div>
						</div>
					</div>

					{/* System Prompt Context */}
					<div style={{ background: '#fff', padding: '20px', borderRadius: '4px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
						<h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1e293b' }}>Vai trò & Chỉ thị AI (System Instructions)</h3>
						<p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 12px 0' }}>
							AI được nạp ngữ cảnh tự động từ danh sách phim thực tế đang chiếu của rạp để tư vấn cho người dùng thông qua các nguyên tắc sau:
						</p>
						<div style={{
							background: '#f8fafc', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '12px', color: '#334155', maxHeight: '250px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: 1.6
						}}>
{`System Instructions:
- Bạn là trợ lý AI tư vấn đặt vé xem phim của rạp SuperStar.
- Tìm kiếm phim theo mô tả cốt truyện, thể loại, sở thích của khách hàng.
- Chỉ đề xuất phim có thực tế trong danh sách.
- Không hiển thị mã ID phim (M01, M02...) trong câu trả lời.
- Hỗ trợ định dạng Markdown.`}
						</div>
					</div>
				</div>

				{/* Cột phải: Chat Playground */}
				<div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', display: 'flex', flexDirection: 'column', height: '560px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
					{/* Header chat */}
					<div style={{ background: '#f8fafc', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
						<div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
						<span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>Bàn thử nghiệm tư vấn AI Chatbot</span>
					</div>

					{/* Khung tin nhắn */}
					<div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fafafa' }}>
						{chatHistory.length === 0 && (
							<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', gap: '10px', padding: '40px', textAlign: 'center' }}>
								<FaRobot size={48} color="#cbd5e1" />
								<p style={{ margin: 0, fontSize: '14px' }}>Chưa có tin nhắn nào. Hãy đặt câu hỏi thử nghiệm tư vấn phim!</p>
								<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
									<button
										onClick={() => setChatMessage('Có phim nào thể loại hành động kịch tính không?')}
										style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', color: '#4f46e5', cursor: 'pointer' }}
									>
										"Có phim hành động không?"
									</button>
									<button
										onClick={() => setChatMessage('Tôi muốn xem một bộ phim về vũ trụ khoa học viễn tưởng.')}
										style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', color: '#4f46e5', cursor: 'pointer' }}
									>
										"Phim khoa học viễn tưởng"
									</button>
								</div>
							</div>
						)}

						{chatHistory.map((msg, index) => (
							<div key={index} style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
								maxWidth: '85%',
								alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start'
							}}>
								<span style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', padding: '0 4px' }}>
									{msg.role === 'user' ? 'Khách hàng' : 'AI Trợ lý'}
								</span>
								<div style={{
									background: msg.role === 'user' ? '#3b82f6' : '#fff',
									color: msg.role === 'user' ? '#fff' : '#1e293b',
									padding: '12px 16px',
									borderRadius: '8px',
									border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0',
									fontSize: '14px',
									lineHeight: 1.5,
									boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
								}}>
									{msg.message}
								</div>

								{/* Khối gợi ý phim kèm theo */}
								{msg.suggestions && msg.suggestions.length > 0 && (
									<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', width: '100%' }}>
										<span style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Phim đề xuất kèm theo:</span>
										<div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
											{msg.suggestions.map((m) => (
												<div key={m.id} style={{
													display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px', width: '220px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
												}}>
													{m.poster ? (
														<img src={m.poster} alt={m.name} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '2px' }} />
													) : (
														<div style={{ width: '40px', height: '56px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaFilm color="#cbd5e1" /></div>
													)}
													<div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
														<span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</span>
														<span style={{ fontSize: '11px', color: '#64748b' }}>Mã: {m.id}</span>
													</div>
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						))}

						{loading && (
							<div style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', background: '#fff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#64748b' }}>
								<span className="ai-chat-typing" style={{ display: 'flex', gap: '4px' }}>
									<span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
									<span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
									<span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6d28d9', display: 'inline-block' }} />
								</span>
								AI đang phân tích câu hỏi...
							</div>
						)}
					</div>

					{/* Form gửi chat */}
					<form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', gap: '10px' }}>
						<input
							type="text"
							placeholder="Nhập câu hỏi test chatbot ở đây..."
							value={chatMessage}
							onChange={(e) => setChatMessage(e.target.value)}
							style={{
								flex: 1,
								padding: '12px 16px',
								border: '1px solid #cbd5e1',
								borderRadius: '4px',
								fontSize: '14px',
								background: '#f8fafc',
								color: '#1e293b',
								outline: 'none'
							}}
							disabled={loading}
						/>
						<button type="submit" style={{
							background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold'
						}} disabled={loading}>
							Gửi <FaPaperPlane size={12} />
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
