import React from 'react';

export default function StatsCards({ emails }) {
  const total = emails.length;
  const unread = emails.filter(e => !e.read).length;
  const spam = emails.filter(e => e.category === 'spam').length;
  const starred = emails.filter(e => e.starred).length;
  const promotions = emails.filter(e => e.category === 'promotions').length;

  const cards = [
    {
      label: 'Total Email',
      value: total,
      icon: '📬',
      sub: `${unread} belum dibaca`,
      accentColor: '#6c63ff',
      iconBg: 'rgba(108,99,255,0.15)',
    },
    {
      label: 'Belum Dibaca',
      value: unread,
      icon: '✉️',
      sub: `${(total === 0 ? 0 : (unread / total) * 100).toFixed(0)}% dari total`,
      accentColor: '#3b82f6',
      iconBg: 'rgba(59,130,246,0.15)',
    },
    {
      label: 'Spam',
      value: spam,
      icon: '🚫',
      sub: `Perlu dihapus`,
      accentColor: '#ef4444',
      iconBg: 'rgba(239,68,68,0.15)',
    },
    {
      label: 'Promosi',
      value: promotions,
      icon: '🏷️',
      sub: `${starred} berbintang`,
      accentColor: '#f59e0b',
      iconBg: 'rgba(245,158,11,0.15)',
    },
  ];

  return (
    <div className="stats-grid fade-in">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="stat-card"
          style={{ '--card-accent': card.accentColor, '--icon-bg': card.iconBg }}
        >
          <div className="stat-card-top">
            <div className="stat-label">{card.label}</div>
            <div className="stat-icon">{card.icon}</div>
          </div>
          <div className="stat-value">{card.value}</div>
          <div className="stat-sub">{card.sub}</div>
        </div>
      ))}
    </div>
  );
}
