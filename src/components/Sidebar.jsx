import React from 'react';
import { categories } from '../data/mockData';

export default function Sidebar({
  activeCategory,
  onCategoryChange,
  emailsByCategory,
  isAuthenticated,
  user,
  onLogout,
}) {
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { key: 'compose', label: 'Tulis Email', icon: '✏️' },
    { key: 'settings', label: 'Pengaturan', icon: '⚙️' },
  ];

  const displayName = user?.name || 'Belum Terhubung';
  const displayEmail = user?.email || 'Hubungkan akun Google';
  const userInitial = (displayName.charAt(0) || 'G').toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">📧</div>
        <div className="logo-text">E-Manage<span>vian</span></div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">Menu</div>
        {navItems.map(item => (
          <div key={item.key} className={`sidebar-item ${item.key === 'dashboard' ? 'active' : ''}`}>
            <span className="sidebar-item-icon">{item.icon}</span>
            <span className="sidebar-item-label">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Categories/Labels */}
      <div className="sidebar-section" style={{ flex: 1 }}>
        <div className="sidebar-section-title">Filter Label</div>
        {categories.map(cat => {
          const count = cat.key === 'all'
            ? emailsByCategory.total
            : cat.key === 'starred'
            ? emailsByCategory.starred
            : (emailsByCategory[cat.key] || 0);

          return (
            <div
              key={cat.key}
              className={`sidebar-item ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.key)}
            >
              <span className="sidebar-item-icon">{cat.icon}</span>
              <span className="sidebar-item-label">{cat.label}</span>
              {count > 0 && (
                <span className={`sidebar-badge ${cat.key === 'spam' ? 'danger' : cat.key === 'promotions' ? 'warning' : ''}`}>
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">{userInitial}</div>
          <div className="user-info">
            <div className="user-name">{displayName}</div>
            <div className="user-email">{displayEmail}</div>
          </div>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 12,
                padding: 0,
              }}
            >
              Logout
            </button>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>⋯</span>
          )}
        </div>
      </div>
    </aside>
  );
}
