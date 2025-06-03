import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";
import "../../assets/css/user/Register.css";

const Register = () => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Mật khẩu không khớp!");
            return;
        }

        try {
            const { name, username, email, password } = formData;
            const response = await axiosClient.post("users/users/", {
                name,
                username,
                email,
                password,
            });

            alert("Đăng ký thành công!");
            window.location.href = "/login";

        } catch (error) {
            console.error("Lỗi kết nối:", error);
            alert("Không thể kết nối đến server!");
        }
    };

    return (
        <div className="container-register">
            <h2>Đăng ký tài khoản</h2>
            <form onSubmit={handleSubmit}>
                <div className="input-group-re">
                <input type="text" id="name" placeholder="Họ và tên" required onChange={handleChange} />
                </div>
                <div className="input-group-re">
                <input type="text" id="username" placeholder="Tên đăng nhập" required onChange={handleChange} />
                </div>
                <div className="input-group-re">
                <input type="email" id="email" placeholder="Email" required onChange={handleChange} />
                </div>
                <div className="input-group-re">
                <input type="password" id="password" placeholder="Mật khẩu" required onChange={handleChange} />
                </div>
                <div className="input-group-re">
                <input type="password" id="confirmPassword" placeholder="Nhập lại mật khẩu" required onChange={handleChange} />
                </div>
                <button type="submit" className="btn-re">Đăng ký</button>
            </form>
            <div className="login-re">
                <p className="login-redirect">
                    Đã có tài khoản? <a href="/login">Đăng nhập</a>
                </p>
            </div>
        </div>
    );
};

export default Register;