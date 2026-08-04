import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { FaSave, FaArrowLeft, FaCamera } from 'react-icons/fa';
import '../../assets/css/admin/movieForm.css';

export default function MovieForm({ mode }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isView = mode === 'view';
    const isEdit = mode === 'edit';
    const isCreate = mode === 'create';

    const [genreOptions, setGenreOptions] = useState([]);

    const [formData, setFormData] = useState({
        id: '',
        name: '',
        duration: '',
        status: '',
        age_rating: '',
        description: '',
        country: '',
        language: '',
        trailer: '',
        poster: null,
        genres: []
    });

    useEffect(() => {
        axiosClient.get('movies/genres/')
        .then(res => {
            const genres = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
            setGenreOptions(genres);
        })
        .catch(err => {
            console.error('Lỗi khi load thể loại:', err);
            setGenreOptions([]);
        });
    }, []);

    useEffect(() => {
        if ((isEdit || isView) && id) {
        axiosClient.get(`movies/movies/${id}/`).then(res => {
            const data = res.data;

            data.genres = (data.genres || []).map(g => String(g.id));

            setFormData({
                id: data.id || '',
                name: data.name || '',
                duration: data.duration !== null && data.duration !== undefined ? String(data.duration) : '',
                status: data.status || '',
                age_rating: data.age_rating || '',
                description: data.description || '',
                country: data.country || '',
                language: data.language || '',
                trailer: data.trailer || '',
                poster: data.poster || null,
                genres: data.genres || [],
            });
        }).catch(err => {
            console.error('Lỗi khi tải phim:', err);
        });
        }

        if (isCreate) {
            setFormData({
                id: '',
                name: '',
                duration: '',
                status: '',
                age_rating: '',
                description: '',
                country: '',
                language: '',
                trailer: '',
                poster: null,
                genres: []
            });
        }
    }, [id, isEdit, isView, isCreate]);

    const handleChange = (e) => {
        const { name, value, files, type } = e.target;

        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } 
        else if (name === 'duration') {
            if (/^\d*$/.test(value)) {
                setFormData(prev => ({ ...prev, [name]: value }));
            }
        } 
        else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'genres') {
                value.forEach(genreId => data.append('genre_ids', genreId));
                } else if (key === 'poster') {
                if (value instanceof File) {
                    data.append('poster', value);
                }
                } else if (value !== '' && value !== null && value !== undefined) {
                data.append(key, value);
                }
            });

            if (isEdit) {
                await axiosClient.patch(`movies/movies/${formData.id}/`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                });
            } else if (isCreate) {
                await axiosClient.post('movies/movies/', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                });
            }

            navigate('/admin/movies');
        } catch (error) {
        console.error('Lỗi khi lưu phim:', error);
        if (error.response && error.response.data) {
            alert('Lỗi khi gửi dữ liệu:\n' + JSON.stringify(error.response.data, null, 2));
        }
        }
    };

    return (
        <div className="movie-form-container">
            <h2>{isCreate ? 'Thêm mới phim' : (isEdit ? 'Chỉnh sửa thông tin phim' : 'Chi tiết thông tin phim')}</h2>
            
            <form className="movie-form" onSubmit={handleSubmit}>
                <div className="movie-form-left">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px' }}>
                        <div>
                            <label>Mã Phim (ID)</label>
                            <input
                                name="id"
                                value={formData.id}
                                onChange={handleChange}
                                disabled={!isCreate}
                                placeholder="VD: M11"
                                required
                            />
                        </div>
                        <div>
                            <label>Tên phim</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="Nhập tên phim..."
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div>
                            <label>Thời lượng (phút)</label>
                            <input
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="VD: 120"
                                inputMode="numeric"
                                pattern="\d*"
                            />
                        </div>
                        <div>
                            <label>Giới hạn độ tuổi</label>
                            <select
                                name="age_rating"
                                value={formData.age_rating}
                                onChange={handleChange}
                                disabled={isView}
                            >
                                <option value="">-- Chọn độ tuổi --</option>
                                <option value="P">P - Mọi lứa tuổi</option>
                                <option value="13+">C13 - 13 tuổi trở lên</option>
                                <option value="16+">C16 - 16 tuổi trở lên</option>
                                <option value="18+">C18 - 18 tuổi trở lên</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div>
                            <label>Ngôn ngữ</label>
                            <input
                                name="language"
                                value={formData.language}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="VD: Tiếng Anh, Phụ đề Tiếng Việt"
                            />
                        </div>
                        <div>
                            <label>Quốc gia</label>
                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                disabled={isView}
                                placeholder="VD: Mỹ, Hàn Quốc, Việt Nam"
                            />
                        </div>
                    </div>

                    <div className="full-width">
                        <label>Mô tả nội dung</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isView}
                            placeholder="Nhập tóm tắt nội dung phim..."
                        />
                    </div>

                    <div className="full-width">
                        <label>Thể loại</label>
                        {isView ? (
                            <div className="readonly-value" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {genreOptions
                                    .filter(g => formData.genres.includes(String(g.id)))
                                    .map(g => (
                                        <span key={g.id} style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', color: '#475569', border: '1px solid #e2e8f0' }}>
                                            {g.name}
                                        </span>
                                    ))}
                                {formData.genres.length === 0 && 'Chưa chọn thể loại'}
                            </div>
                        ) : (
                            <div className="genres-checkbox-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginTop: '5px' }}>
                                {genreOptions.map((genre) => {
                                    const isChecked = formData.genres.includes(String(genre.id));
                                    return (
                                        <label key={genre.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', border: `1px solid ${isChecked ? '#3b82f6' : '#cbd5e1'}`, borderRadius: '8px', background: isChecked ? '#eff6ff' : '#f8fafc', cursor: 'pointer', transition: 'all 0.2s ease', margin: 0, fontWeight: 'normal' }}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    const checked = e.target.checked;
                                                    if (checked) {
                                                        setFormData(prev => ({ ...prev, genres: [...prev.genres, String(genre.id)] }));
                                                    } else {
                                                        setFormData(prev => ({ ...prev, genres: prev.genres.filter(g => g !== String(genre.id)) }));
                                                    }
                                                }}
                                                style={{ width: 'auto', margin: 0, cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '13px', color: '#1e293b' }}>{genre.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="movie-form-right">
                    <label style={{ textAlign: 'center', display: 'block' }}>Ảnh Poster Phim</label>
                    <div className="image-preview" style={{ marginBottom: '15px' }}>
                        {formData.poster ? (
                            typeof formData.poster === 'string' ? (
                                <img src={formData.poster} alt="Poster" />
                            ) : (
                                <img src={URL.createObjectURL(formData.poster)} alt="Poster" />
                            )
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <FaCamera size={36} color="#aaa" style={{ marginBottom: '8px' }} />
                                <span style={{ display: 'block', fontSize: '14px', color: '#999' }}>Chưa có ảnh</span>
                            </div>
                        )}
                    </div>

                    {!isView && (
                        <div style={{ position: 'relative', width: '100%', marginBottom: '15px' }}>
                            <label className="upload-btn" style={{ background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s ease' }}>
                                <FaCamera /> Tải ảnh Poster
                                <input
                                    type="file"
                                    name="poster"
                                    accept="image/*"
                                    onChange={handleChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                            {formData.poster && typeof formData.poster !== 'string' && (
                                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    Đã chọn: {formData.poster.name}
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label>Trạng thái chiếu</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={isView}
                        >
                            <option value="">-- Chọn trạng thái --</option>
                            <option value="Đang chiếu">Đang chiếu</option>
                            <option value="Sắp chiếu">Sắp chiếu</option>
                        </select>
                    </div>

                    <div>
                        <label>Link Trailer (Youtube)</label>
                        <input
                            name="trailer"
                            value={formData.trailer}
                            onChange={handleChange}
                            disabled={isView}
                            placeholder="https://www.youtube.com/watch?..."
                        />
                    </div>

                    {!isView && (
                        <div className="form-buttons" style={{ marginTop: '10px' }}>
                            <button type="submit" className="save-btn"><FaSave style={{ marginRight: '6px' }} /> Lưu thông tin</button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate('/admin/movies')}
                            >
                                <FaArrowLeft style={{ marginRight: '6px' }} /> Quay lại
                            </button>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
