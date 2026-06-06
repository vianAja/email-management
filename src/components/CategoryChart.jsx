import React from 'react';

const CATEGORY_CONFIG = [
  { key: 'inbox', label: 'Inbox', color: '#3b82f6' },
  { key: 'promotions', label: 'Promosi', color: '#f59e0b' },
  { key: 'social', label: 'Sosial', color: '#10b981' },
  { key: 'updates', label: 'Pembaruan', color: '#8b5cf6' },
  { key: 'spam', label: 'Spam', color: '#ef4444' },
  { key: 'drafts', label: 'Draf', color: '#64748b' },
];

// Simple SVG donut chart
function DonutChart({ data, total }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const segments = data.reduce((acc, item) => {
    const previousOffset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].len : 0;
    const pct = total > 0 ? item.count / total : 0;
    const len = pct * circumference;
    return [...acc, { ...item, pct, len, offset: previousOffset }];
  }, []);

  return (
    <div className="donut-container">
      <div className="donut-svg-wrap">
        <svg viewBox="0 0 120 120" width="140" height="140">
          {segments.map((seg, i) =>
            seg.len > 0 ? (
              <circle
                key={i}
                cx="60" cy="60" r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${seg.len} ${circumference - seg.len}`}
                strokeDashoffset={-seg.offset + circumference * 0.25}
                style={{ transition: 'stroke-dasharray 0.8s ease' }}
              />
            ) : null
          )}
          {/* Background ring if no data */}
          {total === 0 && (
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
          )}
        </svg>
        <div className="donut-center">
          <div className="donut-total">{total}</div>
          <div className="donut-sub">Total</div>
        </div>
      </div>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="legend-item">
            <div className="legend-dot" style={{ background: d.color }} />
            <span className="legend-label">{d.label}</span>
            <span className="legend-val">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CategoryChart({ emails }) {
  const total = emails.length;

  const data = CATEGORY_CONFIG.map(cat => ({
    ...cat,
    count: emails.filter(e => e.category === cat.key).length,
  }));

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="content-grid fade-in">
      {/* Bar chart */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">📊 Distribusi Kategori</div>
          <div className="section-action">Lihat semua</div>
        </div>
        <div className="category-list">
          {data.map(cat => (
            <div key={cat.key} className="category-item">
              <div className="category-meta">
                <div className="category-name">
                  <div className="category-dot" style={{ background: cat.color }} />
                  {cat.label}
                </div>
                <div className="category-count">{cat.count} email</div>
              </div>
              <div className="category-bar-track">
                <div
                  className="category-bar-fill"
                  style={{
                    width: `${(cat.count / maxCount) * 100}%`,
                    background: cat.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Donut chart */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">🍩 Proporsi Email</div>
        </div>
        <DonutChart data={data} total={total} />
      </div>
    </div>
  );
}
