import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../assets/css/admin/snackForm.css';

export default function VoucherForm({ mode = 'create' }) {
	const navigate = useNavigate();
	const { id } = useParams();

	const [formData, setFormData] = useState({
		code: '',
		name: '',
		discount_type: 'amount',
		discount_amount: '',
		min_spent: '0',
		max_discount: '0',
		quantity: '100',
		active: true,
		start_date: '',
		end_date: '',
	});

	useEffect(() => {
		if (mode === 'edit') {
			axiosClient.get(`payments/vouchers/${id}/`, { tokenType: 'admin' }).then((res) => {
				const data = res.data;
				setFormData({
					code: data.code || '',
					name: data.name || '',
					discount_type: data.discount_type || 'amount',
					discount_amount: data.discount_amount || '',
					min_spent: data.min_spent || '0',
					max_discount: data.max_discount || '0',
					quantity: data.quantity || '100',
					active: data.active !== undefined ? data.active : true,
					start_date: data.start_date ? data.start_date.substring(0, 16) : '',
					end_date: data.end_date ? data.end_date.substring(0, 16) : '',
				});
			});
		}
	}, [id, mode]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const payload = {
			...formData,
			discount_amount: parseInt(formData.discount_amount),
			min_spent: parseInt(formData.min_spent),
			max_discount: parseInt(formData.max_discount),
			quantity: parseInt(formData.quantity),
			start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
			end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
		};

		try {
			if (mode === 'edit') {
				await axiosClient.put(`payments/vouchers/${id}/`, payload, { tokenType: 'admin' });
			} else {
				await axiosClient.post('payments/vouchers/', payload, { tokenType: 'admin' });
			}
			navigate('/admin/vouchers');
		} catch (err) {
			console.error('Lỗi khi lưu voucher:', err);
			if (err.response && err.response.data) {
				alert('Lỗi: ' + JSON.stringify(err.response.data));
			}
		}
	};

	return (
		<div className="snack-form-container">
			<h2>{mode === 'edit' ? 'Sửa Voucher' : 'Thêm Voucher mới'}</h2>
			<form className="snack-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
				{/* Cột trái */}
				<div className="snack-form-left" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label htmlFor="code">Mã Code (In hoa, không dấu cách)</label>
							<input
								id="code"
								type="text"
								name="code"
								value={formData.code}
								onChange={handleChange}
								placeholder="VD: KHUYENMAI20"
								style={{ textTransform: 'uppercase' }}
								required
							/>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label htmlFor="name">Tên hiển thị Voucher</label>
							<input
								id="name"
								type="text"
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="VD: Giảm 20k dịp lễ 2/9"
								required
							/>
						</div>
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label htmlFor="discount_type">Loại chiết khấu</label>
							<select
								id="discount_type"
								name="discount_type"
								value={formData.discount_type}
								onChange={handleChange}
							>
								<option value="amount">Số tiền cố định (đ)</option>
								<option value="percentage">Phần trăm (%)</option>
							</select>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label htmlFor="discount_amount">Giá trị giảm</label>
							<input
								id="discount_amount"
								type="number"
								name="discount_amount"
								value={formData.discount_amount}
								onChange={handleChange}
								placeholder="Nhập số tiền hoặc % giảm"
								required
							/>
						</div>
					</div>

					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label htmlFor="min_spent">Giá trị đơn hàng tối thiểu (đ)</label>
							<input
								id="min_spent"
								type="number"
								name="min_spent"
								value={formData.min_spent}
								onChange={handleChange}
								placeholder="VD: 150000"
							/>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label htmlFor="max_discount">Số tiền giảm tối đa (nếu chọn %)</label>
							<input
								id="max_discount"
								type="number"
								name="max_discount"
								value={formData.max_discount}
								onChange={handleChange}
								placeholder="Nhập 0 nếu không giới hạn"
							/>
						</div>
					</div>
				</div>

				{/* Cột phải */}
				<div className="snack-form-right" style={{ width: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: 0, alignItems: 'stretch' }}>
					<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label htmlFor="start_date">Ngày bắt đầu</label>
							<input
								id="start_date"
								type="datetime-local"
								name="start_date"
								value={formData.start_date}
								onChange={handleChange}
							/>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label htmlFor="end_date">Ngày kết thúc</label>
							<input
								id="end_date"
								type="datetime-local"
								name="end_date"
								value={formData.end_date}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<label htmlFor="quantity">Số lượng phát hành</label>
						<input
							id="quantity"
							type="number"
							name="quantity"
							value={formData.quantity}
							onChange={handleChange}
							placeholder="VD: 100"
							required
						/>
					</div>

					<div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', height: '45px', boxSizing: 'border-box' }}>
						<span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Kích hoạt hoạt động</span>
						<label style={{ position: 'relative', display: 'inline-block', width: '38px', height: '20px', margin: 0 }}>
							<input
								id="active"
								type="checkbox"
								name="active"
								checked={formData.active}
								onChange={handleChange}
								style={{ opacity: 0, width: 0, height: 0 }}
							/>
							<span style={{
								position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
								backgroundColor: formData.active ? '#10b981' : '#cbd5e1',
								transition: '.3s', borderRadius: '20px'
							}}>
								<span style={{
									position: 'absolute', height: '14px', width: '14px', left: '3px', bottom: '3px',
									backgroundColor: 'white', transition: '.3s', borderRadius: '50%',
									transform: formData.active ? 'translateX(18px)' : 'translateX(0)'
								}} />
							</span>
						</label>
					</div>

					<div className="snack-form-actions" style={{ marginTop: '20px', display: 'flex', flexDirection: 'row', gap: '12px' }}>
						<button type="submit" className="btn-save"><FaSave style={{ marginRight: '6px' }} /> Lưu Voucher</button>
						<button type="button" className="btn-back" onClick={() => navigate('/admin/vouchers')}>
							<FaArrowLeft style={{ marginRight: '6px' }} /> Quay lại
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}
