import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/',
    headers: {
      'Content-Type': 'application/json',
    },
});

// Tự động gắn token vào mỗi request nếu có
axiosClient.interceptors.request.use((config) => {
    if (config.tokenType === 'user') {
        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            config.headers.Authorization = `Bearer ${userToken}`;
        }
    } else {
      // Mặc định gắn token admin
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            config.headers.Authorization = `Bearer ${adminToken}`;
        }
    }

    // Xóa tokenType để không gửi lên server
    delete config.tokenType;

    return config;
});

export default axiosClient;
