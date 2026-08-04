import React from 'react';
import { FaSearch, FaSort, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

export default function SearchAndSort({
    searchTerm,
    onSearchChange,
    sortKey,
    sortOrder,
    onSort,
    columns = [],
}) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', width: '100%' }}>
            {/* Ô tìm kiếm */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FaSearch style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '13px' }} />
                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    style={{
                        padding: '8px 12px 8px 34px',
                        width: '260px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#334155',
                        boxSizing: 'border-box'
                    }}
                />
            </div>

            {/* Nút sắp xếp theo cột */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaSort /> Sắp xếp theo:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {columns.map((col) => {
                        const isSorted = sortKey === col.key;
                        return (
                            <button
                                key={col.key}
                                onClick={() => onSort(col.key)}
                                style={{
                                    padding: '6px 12px',
                                    background: isSorted ? '#3b82f6' : '#f1f5f9',
                                    color: isSorted ? 'white' : '#475569',
                                    border: '1px solid',
                                    borderColor: isSorted ? '#3b82f6' : '#e2e8f0',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {col.label}
                                {isSorted ? (
                                    sortOrder === 'asc' ? <FaSortAmountUp fontSize="11px" /> : <FaSortAmountDown fontSize="11px" />
                                ) : (
                                    <FaSort style={{ opacity: 0.3 }} fontSize="11px" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
