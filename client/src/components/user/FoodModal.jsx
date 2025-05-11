import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/user/foodModal.css';

export default function FoodModal({ show, onClose, bookingData }) {
  const [foodItems, setFoodItems] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get('payments/snacks/').then(res => setFoodItems(res.data));
  }, []);

  const toggleFood = (id, delta) => {
    const current = selectedFoods[id] || 0;
    setSelectedFoods({
      ...selectedFoods,
      [id]: Math.max(0, current + delta),
    });
  };

  const totalPrice = foodItems.reduce((total, item) => {
    const qty = selectedFoods[item.id] || 0;
    return total + item.price * qty;
  }, 0);

  const handleContinue = async () => {
    try {
      const res = await axiosClient.post('payments/payments/', {
        ...bookingData,
        food: selectedFoods
      });
      navigate(`/movies/${bookingData.movie}/payments/${res.data.id}`); 
    } catch (err) {
      console.error('Lỗi tạo đơn thanh toán:', err);
    }
  };

  if (!show || !bookingData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <h2>COMBO BẮP, NƯỚC</h2>
        <div className="food-list">
          {foodItems.map(item => (
            <div key={item.id} className="food-item">
              <img src={item.image} alt={item.name} className="food-image" />
              <div className="food-info">
                <h4>{item.name}</h4>
                <p>Giá: {item.price.toLocaleString()} VND</p>
                <div className="counter">
                  <button onClick={() => toggleFood(item.id, -1)}>-</button>
                  <span>{selectedFoods[item.id] || 0}</span>
                  <button onClick={() => toggleFood(item.id, +1)}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="food-footer">
          <div className="summary">
            <p>Tạm tính</p>
            <strong>{totalPrice.toLocaleString()} VND</strong>
          </div>
          <button className="confirm-btn" onClick={handleContinue}>TIẾP TỤC</button>
        </div>
      </div>
    </div>
  );
}