import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      const response = await axiosClient.post('/users/login/', { username, password });

      const data = response.data;

      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userInfo', JSON.stringify(data));

      login(data.token);
      navigate('/');
    } catch (err) {
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    }
  };

  return (
    <div className="login-page">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Tên đăng nhập</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
          />
        </div>

        <div className="input-group">
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}
