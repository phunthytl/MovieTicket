import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/ai-chatbot.css';
import { FaComments, FaPaperPlane } from 'react-icons/fa';

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState([
        {
            role: 'assistant',
            content: 'Xin chào! Tôi là trợ lý ảo SuperStar Cinema. Tôi có thể giúp bạn tìm kiếm phim theo mô tả, gợi ý phim phù hợp với sở thích hoặc giải đáp thắc mắc về đặt vé. Hãy trò chuyện cùng tôi nhé!'
        }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [history, loading, isOpen]);

    // Trình phân tích Markdown thô sơ nhưng hiệu quả cho hiển thị bôi đậm và danh sách
    const renderMessageContent = (text) => {
        if (!text) return null;
        
        // Loại bỏ các định dạng hiển thị ID phim như (ID: M10), ID: M10, (M10)
        const cleanedText = text
            .replace(/\(\s*ID\s*:\s*[a-zA-Z0-9_-]+\)/gi, '')
            .replace(/ID\s*:\s*[a-zA-Z0-9_-]+/gi, '')
            .replace(/\(\s*M\d+\)/gi, '')
            .replace(/\s+:/g, ':') // chuẩn hóa khoảng trắng trước dấu hai chấm
            .replace(/:\s*:/g, ':') // tránh dấu hai chấm kép
            .trim();

        const lines = cleanedText.split('\n');
        return lines.map((line, idx) => {
            let isBullet = false;
            let content = line;
            
            if (line.trim().startsWith('- ')) {
                isBullet = true;
                content = line.trim().substring(2);
            } else if (line.trim().startsWith('* ')) {
                isBullet = true;
                content = line.trim().substring(2);
            }
            
            // Phân tích thẻ bôi đậm **text**
            const parts = content.split('**');
            const renderedParts = parts.map((part, i) => {
                if (i % 2 === 1) {
                    return <strong key={i} style={{ color: '#22d3ee', fontWeight: '700' }}>{part}</strong>;
                }
                return part;
            });

            if (isBullet) {
                return (
                    <div key={idx} style={{ display: 'flex', gap: '8px', paddingLeft: '8px', margin: '4px 0', alignItems: 'flex-start' }}>
                        <span style={{ color: '#22d3ee', lineHeight: '1.4' }}>•</span>
                        <div style={{ flex: 1 }}>{renderedParts}</div>
                    </div>
                );
            }
            
            return <div key={idx} style={{ minHeight: '1.2em', margin: '2px 0' }}>{renderedParts}</div>;
        });
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim() || loading) return;

        const userMessage = message.trim();
        setMessage('');
        
        // Thêm tin nhắn của User vào history
        setHistory(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            // Chuẩn bị lịch sử trò chuyện gửi lên API
            const apiHistory = history.map(item => ({
                role: item.role,
                message: item.content
            }));

            const response = await axiosClient.post('movies/ai-chat/', {
                message: userMessage,
                history: apiHistory
            }, {
                tokenType: 'user'
            });

            const data = response.data;
            setHistory(prev => [...prev, {
                role: 'assistant',
                content: data.reply,
                suggested_movies: data.suggested_movies || []
            }]);
        } catch (error) {
            console.error('Error talking to AI chatbot:', error);
            setHistory(prev => [...prev, {
                role: 'assistant',
                content: 'Xin lỗi, tôi gặp chút sự cố kết nối máy chủ AI. Bạn vui lòng thử lại sau nhé!'
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-chatbot-container">
            {/* Nút tròn kích hoạt nổi */}
            <button 
                className="ai-chatbot-trigger" 
                onClick={() => setIsOpen(!isOpen)}
                title="Hỏi trợ lý AI"
            >
                <FaComments size={24} style={{ color: '#ffffff' }} />
            </button>

            {/* Bảng Chatbox hội thoại */}
            {isOpen && (
                <div className="ai-chat-window">
                    {/* Header */}
                    <div className="ai-chat-header">
                        <div className="ai-chat-title-group">
                            <div className="ai-chat-header-dot"></div>
                            <h3>Trợ lý ảo SuperStar</h3>
                        </div>
                        <button className="ai-chat-header-close" onClick={() => setIsOpen(false)}>
                            &times;
                        </button>
                    </div>

                    {/* Vùng tin nhắn */}
                    <div className="ai-chat-messages">
                        {history.map((msg, index) => (
                            <React.Fragment key={index}>
                                <div className={`chat-bubble ${msg.role}`}>
                                    <div>
                                        {renderMessageContent(msg.content)}
                                    </div>

                                    {/* Khối gợi ý phim (nếu có) */}
                                    {msg.suggested_movies && msg.suggested_movies.length > 0 && (
                                        <div className="chat-suggested-movies-box">
                                            <div style={{ 
                                                fontSize: '11px', 
                                                fontWeight: '700', 
                                                color: '#22d3ee', 
                                                marginTop: '10px', 
                                                borderTop: '1px solid #374151', 
                                                paddingTop: '8px',
                                                letterSpacing: '0.05em'
                                            }}>
                                                GỢI Ý PHIM CHO BẠN:
                                            </div>
                                            {msg.suggested_movies.map(movie => (
                                                <div key={movie.id} className="suggested-movie-card">
                                                    {movie.poster ? (
                                                        <img 
                                                            src={movie.poster} 
                                                            alt={movie.name} 
                                                            className="suggested-movie-poster"
                                                        />
                                                    ) : (
                                                        <div className="suggested-movie-poster" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#374151', color: '#9ca3af', fontSize: '9px' }}>Không có ảnh</div>
                                                    )}
                                                    <div className="suggested-movie-info">
                                                        <h4 className="suggested-movie-name">{movie.name}</h4>
                                                        <span className="suggested-movie-duration">{movie.duration} phút</span>
                                                    </div>
                                                    <Link 
                                                        to={`/movies/${movie.id}`} 
                                                        className="suggested-movie-btn"
                                                        onClick={() => setIsOpen(false)}
                                                    >
                                                        Chi tiết
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </React.Fragment>
                        ))}
                        {loading && (
                            <div className="chat-bubble assistant" style={{ alignSelf: 'flex-start' }}>
                                <div className="typing-indicator">
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                    <div className="typing-dot"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Vùng nhập nội dung */}
                    <form className="ai-chat-input-area" onSubmit={handleSend}>
                        <input
                            type="text"
                            className="ai-chat-input"
                            placeholder="Hỏi về cốt truyện, tư vấn chọn phim..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={loading}
                        />
                        <button type="submit" className="ai-chat-send-btn" disabled={loading}>
                            <span style={{ color: '#ffffff', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'translateX(1px)' }}>➤</span>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
