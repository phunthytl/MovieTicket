import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import SearchAndSort from '../../components/admin/SearchAndSort';
import '../../assets/css/admin/admin.css';

export default function ManageRooms() {
    const { clusterId, cinemaId } = useParams();
    const location = useLocation();
    const cinemaName = location.state?.cinemaName || '';
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('id');
    const [sortOrder, setSortOrder] = useState('desc');
    const navigate = useNavigate();

    useEffect(() => {
      const fetchData = async () => {
        try {
          const res = await axiosClient.get(`cinemas/rooms/by-cinema/${cinemaId}/`);
          setRooms(res.data);
        } catch (err) {
          console.error('Lỗi khi tải danh sách phòng:', err);
        }
      };
      fetchData();
    }, [cinemaId]);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    const handleDelete = async (id) => {
      if (window.confirm('Xoá phòng chiếu này?')) {
        try {
          await axiosClient.delete(`cinemas/rooms/${id}/`);
          setRooms((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
          console.error('Lỗi xoá phòng:', err);
        }
      }
    };

    const filteredAndSorted = [...rooms]
        .filter((r) =>
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.status.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (!sortKey) return 0;
            const valA = a[sortKey]?.toString().toLowerCase() || '';
            const valB = b[sortKey]?.toString().toLowerCase() || '';
            return sortOrder === 'asc'
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        });

    return (
      <div className="movie-management">
        <div className="movie-management-header">
          <h2 className="section-title">Quản lý phòng chiếu - {cinemaName}</h2>
          <button
            className="add-movie-btn"
            onClick={() =>
              navigate(`/admin/clusters/${clusterId}/cinemas/${cinemaId}/rooms/create`, {
                state: { cinemaName }
              })
            }
          >
            + Thêm phòng
          </button>
        </div>

        <SearchAndSort
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            columns={[
                { key: 'id', label: 'Mã phòng' },
                { key: 'name', label: 'Tên phòng' },
                { key: 'type', label: 'Loại phòng' }
            ]}
        />

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên phòng</th>
              <th>Loại</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td
                  style={{ color: '#0d6efd', cursor: 'pointer' }}
                  onClick={() =>
                    navigate(`/admin/clusters/${clusterId}/cinemas/${cinemaId}/rooms/${r.id}/seats`, {
                      state: { roomName: r.name }
                    })
                  }
                >
                  {r.name}
                </td>
                <td>{r.type}</td>
                <td>{r.status}</td>
                <td>
                  <button
                    onClick={() =>
                      navigate(`/admin/clusters/${clusterId}/cinemas/${cinemaId}/rooms/${r.id}/edit`, {
                        state: { cinemaName }
                      })
                    }
                  >
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDelete(r.id)}>
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
