import React, { useState } from 'react';
import { tagColors, tagLabels } from '../data/mockData';

const FILTER_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'unread', label: 'Belum Dibaca' },
  { key: 'starred', label: 'Berbintang' },
  { key: 'spam', label: 'Spam' },
  { key: 'promotions', label: 'Promosi' },
  { key: 'social', label: 'Sosial' },
];

function TagChip({ category }) {
  const style = tagColors[category] || { bg: 'rgba(255,255,255,0.1)', color: '#aaa' };
  return (
    <span
      className="tag-chip"
      style={{ background: style.bg, color: style.color }}
    >
      {tagLabels[category] || category}
    </span>
  );
}

function EmailRow({ email, isSelected, onToggleSelect, onToggleStar }) {
  return (
    <div
      className={`email-row ${isSelected ? 'selected' : ''} ${!email.read ? 'unread' : ''}`}
      id={`email-row-${email.id}`}
    >
      {/* Checkbox */}
      <div
        className={`email-checkbox ${isSelected ? 'checked' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleSelect(email.id); }}
      >
        {isSelected ? '✓' : ''}
      </div>

      {/* Star */}
      <div
        className={`email-star ${email.starred ? 'starred' : ''}`}
        onClick={e => { e.stopPropagation(); onToggleStar(email.id); }}
      >
        {email.starred ? '★' : '☆'}
      </div>

      {/* Avatar */}
      <div
        className="email-avatar"
        style={{ background: email.avatar === '#fff' ? '#1e1e2a' : email.avatar }}
      >
        {email.initials}
      </div>

      {/* Body */}
      <div className="email-body">
        <div className="email-top">
          <span className="email-sender">{email.sender}</span>
          <span className="email-time">{email.time}</span>
        </div>
        <div className="email-subject">{email.subject}</div>
        <div className="email-preview">{email.preview}</div>
      </div>

      {/* Tags */}
      <div className="email-tags">
        <TagChip category={email.category} />
        {!email.read && <div className="unread-dot" />}
      </div>
    </div>
  );
}

export default function EmailList({ emails, onToggleStar }) {
  const [filterTab, setFilterTab] = useState('all');
  const [selected, setSelected] = useState(new Set());

  const filtered = emails.filter(email => {
    if (filterTab === 'all') return true;
    if (filterTab === 'unread') return !email.read;
    if (filterTab === 'starred') return email.starred;
    return email.category === filterTab;
  });

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(e => e.id)));
    }
  };

  const clearSelection = () => setSelected(new Set());

  return (
    <div className="email-list-section fade-in">
      <div className="email-list-header">
        {/* Filter tabs */}
        <div className="filter-tabs" id="filter-tabs">
          {FILTER_TABS.map(tab => (
            <div
              key={tab.key}
              className={`filter-tab ${filterTab === tab.key ? 'active' : ''}`}
              onClick={() => { setFilterTab(tab.key); setSelected(new Set()); }}
              id={`filter-tab-${tab.key}`}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="email-list-actions">
          <button className="btn-sm" onClick={selectAll} id="select-all-btn">
            {selected.size === filtered.length && filtered.length > 0 ? 'Batal Pilih' : 'Pilih Semua'}
          </button>
          {selected.size > 0 && (
            <>
              <button className="btn-sm danger" id="delete-selected-btn">🗑️ Hapus ({selected.size})</button>
              <button className="btn-sm" id="mark-read-btn">✓ Tandai Dibaca</button>
            </>
          )}
          <button className="btn-sm primary" id="compose-btn">✏️ Tulis</button>
        </div>
      </div>

      {/* Email rows */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">Tidak ada email di sini</div>
        </div>
      ) : (
        filtered.map(email => (
          <EmailRow
            key={email.id}
            email={email}
            isSelected={selected.has(email.id)}
            onToggleSelect={toggleSelect}
            onToggleStar={onToggleStar}
          />
        ))
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <span className="bulk-count">{selected.size} email dipilih</span>
          <button className="btn-sm danger" id="bulk-delete-btn">🗑️ Hapus</button>
          <button className="btn-sm" id="bulk-mark-spam-btn">🚫 Tandai Spam</button>
          <button className="btn-sm" id="bulk-archive-btn">📦 Arsip</button>
          <button className="btn-sm" onClick={clearSelection} id="bulk-cancel-btn">✕ Batal</button>
        </div>
      )}
    </div>
  );
}
