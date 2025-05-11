import React from 'react';
import '../../assets/css/admin/admin.css';

export default function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ borderLeft: `5px solid ${color}` }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}