import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import "../../assets/css/user/Login.css"

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert('Vui lòng điền đầy đủ thông tin');
        return;
        }

        try {
            const response = await axiosClient.post('users/login/', { username, password });
            const data = response.data;
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userInfo', JSON.stringify(data));
            const redirectTo = location.state?.from || '/';
            navigate(redirectTo, { replace: true });
        } catch (err) {
            alert('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
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

                <button type="submit" className="button-login">Đăng nhập</button>
                <div className="register-lg">
                    <p className="register">Không có tài khoản? <a href="/register">Đăng ký</a></p>
                </div>
            </form>
        </div>
    );
}
