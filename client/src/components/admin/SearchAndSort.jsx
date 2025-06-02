import React from 'react';

export default function SearchAndSort({
    searchTerm,
    onSearchChange,
    sortKey,
    sortOrder,
    onSort,
    columns = [],
}) {
    return (
        <div style={{ marginBottom: '16px' }}>
        {/* Ô tìm kiếm */}
        <input
            type="text"
            placeholder="🔍 Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
            padding: '6px 12px',
            width: '250px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            marginBottom: '10px',
            }}
        />

        {/* Nút sắp xếp theo cột */}
        <div style={{ marginTop: '10px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {columns.map((col) => (
            <button
                key={col.key}
                onClick={() => onSort(col.key)}
                style={{
                padding: '6px 10px',
                background: sortKey === col.key ? '#0d6efd' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                }}
            >
                {col.label} {sortKey === col.key && (sortOrder === 'asc' ? '🔼' : '🔽')}
            </button>
            ))}
        </div>
        </div>
    );
}
