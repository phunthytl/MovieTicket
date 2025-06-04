import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
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
            // Có thể res.data hoặc res là mảng
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
        <form className="movie-form" onSubmit={handleSubmit}>

            <div className="movie-form-left">
            <div className="full-width">
                <label>ID</label>
                <input
                name="id"
                value={formData.id}
                onChange={handleChange}
                disabled={!isCreate}
                required
                />
            </div>

            <div className="full-width">
                <label>Tên phim</label>
                <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={isView}
                required
                />
            </div>

            <div>
                <label>Thời lượng (phút)</label>
                <input
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                disabled={isView}
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
                <option value="P">P</option>
                <option value="13+">13+</option>
                <option value="16+">16+</option>
                <option value="18+">18+</option>
                </select>
            </div>

            <div>
                <label>Ngôn ngữ</label>
                <input
                name="language"
                value={formData.language}
                onChange={handleChange}
                disabled={isView}
                />
            </div>

            <div>
                <label>Quốc gia</label>
                <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled={isView}
                />
            </div>

            <div className="full-width">
                <label>Mô tả</label>
                <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isView}
                />
            </div>

            <div className="full-width">
                <label>Thể loại</label>
                {isView ? (
                <div className="readonly-value">
                    {genreOptions
                    .filter(g => formData.genres.includes(String(g.id)))
                    .map(g => g.name)
                    .join(', ') || 'Không có'}
                </div>
                ) : (
                <select
                    name="genres"
                    multiple
                    value={formData.genres}
                    onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                    setFormData(prev => ({ ...prev, genres: selected }));
                    }}
                >
                    {genreOptions.map((genre) => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                </select>
                )}
            </div>
            </div>

            <div className="movie-form-right">
            <div className="image-preview">
                {formData.poster ? (
                typeof formData.poster === 'string' ? (
                    <img src={formData.poster} alt="Poster" />
                ) : (
                    <img src={URL.createObjectURL(formData.poster)} alt="Poster" />
                )
                ) : (
                <span>Chưa có ảnh</span>
                )}
            </div>

            {!isView && (
                <input
                type="file"
                name="poster"
                accept="image/*"
                onChange={handleChange}
                className="upload-btn"
                />
            )}

            <div>
                <label>Trạng thái</label>
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
                <label>Trailer</label>
                <input
                name="trailer"
                value={formData.trailer}
                onChange={handleChange}
                disabled={isView}
                />
            </div>

            {!isView && (
                <div className="form-buttons">
                <button type="submit" className="save-btn">Lưu</button>
                <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => navigate('/admin/movies')}
                >
                    Quay lại
                </button>
                </div>
            )}
            </div>
        </form>
        </div>
    );
}
