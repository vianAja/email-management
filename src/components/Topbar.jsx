import React from 'react';

export default function Topbar({ searchQuery, onSearchChange, activeCategory, onRefresh, loading }) {
  const titles = {
    all: 'Semua Email',
    inbox: 'Inbox',
    starred: 'Berbintang',
    promotions: 'Promosi',
    social: 'Sosial',
    updates: 'Pembaruan',
    spam: 'Spam',
    drafts: 'Draf',
    dashboard: 'Dashboard',
  };

  return (
    <header className="topbar">
      <div className="topbar-title">{titles[activeCategory] || 'Gmail Manager'}</div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Cari email, pengirim, atau subjek..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          id="search-input"
        />
      </div>

      <div className="topbar-actions">
        <button className="icon-btn has-notification" title="Notifikasi" id="notif-btn">🔔</button>
        <button className="icon-btn" title="Filter" id="filter-btn">⚙️</button>
        <button className="icon-btn" title="Refresh" id="refresh-btn" onClick={onRefresh} disabled={loading}>
          🔄
        </button>
      </div>
    </header>
  );
}
