import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import '../../assets/css/user/PaymentHistory.css';

const ReviewModal = ({ ticket, onClose }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const submitReview = async () => {
        try {
            await axiosClient.post("movies/reviews/", {
                movie: ticket.movie_id,
                rate: rating,
                comment,
                }, {
                tokenType: "user",
            });

            alert("Đánh giá thành công!");
            window.location.reload();
            onClose();
        } catch (err) {
            console.error("Lỗi khi gửi đánh giá:", err);
            alert("Không thể gửi đánh giá");
        }
    };

    console.log(ticket)

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>Đánh giá phim: {ticket.movie_name}</h2>
                <div className="rating">
                    <label>Số sao:</label>
                    <input
                        type="number"
                        value={rating}
                        onChange={(e) => setRating(Math.min(5, Math.max(1, e.target.value)))}
                        min="1"
                        max="5"
                    />
                </div>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Viết đánh giá..."
                />
                <div className="modal-buttons">
                    <button onClick={submitReview}>Gửi đánh giá</button>
                    <button onClick={onClose}>Đóng</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
