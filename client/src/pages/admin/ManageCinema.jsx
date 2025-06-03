import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function ManageCinemas() {
    const { clusterId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const clusterName = location.state?.clusterName || '...';

    const [cinemas, setCinemas] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const res = await axiosClient.get(`cinemas/cinemas/by-cluster/${clusterId}/`);
            setCinemas(res.data);
        } catch (err) {
            console.error('Lỗi khi tải danh sách rạp:', err);
        }
        };
        fetchData();
    }, [clusterId]);

    const handleDelete = async (id) => {
        if (window.confirm('Xoá rạp này?')) {
        try {
            await axiosClient.delete(`cinemas/${id}/`);
            setCinemas((prev) => prev.filter((c) => c.id !== id));
        } catch (err) {
            console.error('Lỗi xoá rạp:', err);
        }
        }
    };

    return (
        <div className="movie-management">
        <div className="movie-management-header">
            <h2 className="section-title">Quản lý rạp thuộc cụm {clusterName}</h2>
            <button
            className="add-movie-btn"
            onClick={() =>
                navigate(`/admin/clusters/${clusterId}/cinemas/create`, {
                state: { clusterName },
                })
            }
            >
            + Thêm rạp
            </button>
        </div>

        <table className="admin-table">
            <thead>
            <tr>
                <th>ID</th>
                <th>Tên rạp</th>
                <th>Thành phố</th>
                <th>Địa chỉ</th>
                <th>Liên hệ</th>
                <th>Thao tác</th>
            </tr>
            </thead>
            <tbody>
            {cinemas.map((c) => (
                <tr key={c.id}>
                <td>{c.id}</td>
                <td
                    style={{ color: '#0d6efd', cursor: 'pointer' }}
                    onClick={() =>
                    navigate(`/admin/clusters/${clusterId}/cinemas/${c.id}/rooms`, {
                        state: { cinemaName: c.name }
                    })
                    }
                >
                    {c.name}
                </td>
                <td>{c.city || '—'}</td>
                <td>{c.address}</td>
                <td>{c.contact}</td>
                <td>
                    <button
                    onClick={() =>
                        navigate(`/admin/clusters/${clusterId}/cinemas/${c.id}/edit`, {
                        state: { clusterName },
                        })
                    }
                    >
                    <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(c.id)}>
                    <FaTrash color="red" />
                    </button>
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
}
