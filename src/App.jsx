import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import StatsCards from './components/StatsCards';
import CategoryChart from './components/CategoryChart';
import EmailList from './components/EmailList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const APP_NAME = 'E-Manage vian';
const SUPPORT_EMAIL = 'najwanoctavian@gmail.com';

const AUTH_ERROR_MESSAGES = {
  session_missing: 'Sesi login tidak ditemukan. Ulangi proses login dari aplikasi ini.',
  no_code: 'Google tidak mengirimkan authorization code ke aplikasi.',
  invalid_state: 'Validasi keamanan login gagal. Coba login ulang.',
  callback_failed: 'Proses callback Google gagal diproses oleh server.',
  access_denied: 'Izin akses Gmail dibatalkan dari halaman Google.',
};

const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  return response;
};

function LegalPage({ title, children }) {
  return (
    <main className="public-shell legal-shell">
      <div className="public-card legal-card">
        <a className="public-back-link" href="/">Kembali ke beranda</a>
        <div className="public-eyebrow">{APP_NAME}</div>
        <h1 className="public-title">{title}</h1>
        <div className="legal-copy">{children}</div>
      </div>
    </main>
  );
}

function PublicLanding({ onLogin, error, notice }) {
  return (
    <main className="public-shell">
      <section className="auth-layout">
        <div className="auth-brand-panel">
          <div className="auth-badge">Google OAuth Enabled</div>
          <h1 className="auth-brand-title">{APP_NAME}</h1>
          <p className="auth-brand-copy">
            Dashboard email untuk membaca, meninjau, dan mengelola inbox Gmail melalui
            Gmail API resmi Google dengan otorisasi akun yang aman.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Menampilkan inbox Gmail dan kategori email secara terstruktur.</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Dipakai untuk kebutuhan manajemen email pribadi atau operasional kerja.</span>
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot" />
              <span>Menggunakan login Google dan permission sesuai scope Gmail API.</span>
            </div>
          </div>

          <div className="auth-brand-footer">
            <div>
              <div className="auth-footer-label">Developer Contact</div>
              <div className="auth-footer-value">{SUPPORT_EMAIL}</div>
            </div>
            <div>
              <div className="auth-footer-label">Application Domain</div>
              <div className="auth-footer-value">email.najwan.my.id</div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-logo-row">
            <div className="auth-logo-mark">E</div>
            <div>
              <div className="auth-logo-title">{APP_NAME}</div>
              <div className="auth-logo-subtitle">Secure Google Account Connection</div>
            </div>
          </div>

          <div className="auth-card-copy">
            <h2>Masuk untuk melanjutkan</h2>
            <p>
              Hubungkan akun Google Anda untuk membuka dashboard email dan meninjau inbox
              dengan izin akses yang Anda setujui sendiri.
            </p>
          </div>

          <button className="auth-google-button" onClick={onLogin}>
            <span className="auth-google-glyph" aria-hidden="true">G</span>
            <span>Lanjutkan dengan Google</span>
          </button>

          <div className="auth-helper-copy">
            Dengan melanjutkan, Anda akan diarahkan ke Google untuk proses login dan consent.
          </div>

          <div className="auth-link-row">
            <a className="auth-inline-link" href="/privacy">Privacy Policy</a>
            <a className="auth-inline-link" href="/terms">Terms of Service</a>
          </div>

          {notice && <div className="public-notice success">{notice}</div>}
          {error && <div className="public-notice error">{error}</div>}
        </div>
      </section>
    </main>
  );
}

function App() {
  const [emails, setEmails] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const currentPath = window.location.pathname;

  const resetInboxState = () => {
    setEmails([]);
    setUser(null);
    setIsAuthenticated(false);
  };

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/emails');

      if (res.status === 401) {
        resetInboxState();
        throw new Error('Sesi login Gmail sudah berakhir. Silakan login kembali.');
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Gagal mengambil data email dari API.');
      }

      const data = await res.json();
      setEmails(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialState = async () => {
      if (currentPath === '/privacy' || currentPath === '/terms') {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch('/api/auth/status');
        const data = await res.json();

        setIsAuthenticated(Boolean(data.authenticated));
        setUser(data.user || null);

        if (data.authenticated) {
          const emailsResponse = await apiFetch('/api/emails');

          if (emailsResponse.status === 401) {
            setEmails([]);
            setUser(null);
            setIsAuthenticated(false);
            throw new Error('Sesi login Gmail sudah berakhir. Silakan login kembali.');
          }

          if (!emailsResponse.ok) {
            const body = await emailsResponse.json().catch(() => ({}));
            throw new Error(body.error || 'Gagal mengambil data email dari API.');
          }

          const emailData = await emailsResponse.json();
          setEmails(emailData);
        } else {
          setEmails([]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Gagal menghubungi server untuk memeriksa status auth.');
      } finally {
        setLoading(false);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const authError = params.get('authError');
    const authStatus = params.get('auth');

    if (authError) {
      setError(AUTH_ERROR_MESSAGES[authError] || `Login Google gagal: ${authError}`);
      params.delete('authError');
    }

    if (authStatus === 'success') {
      setNotice('Akun Google berhasil terhubung.');
      params.delete('auth');
    }

    if (authError || authStatus) {
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}`;
      window.history.replaceState({}, '', nextUrl);
    }

    loadInitialState();
  }, [currentPath]);

  useEffect(() => {
    if (currentPath === '/privacy') {
      document.title = `Privacy Policy | ${APP_NAME}`;
      return;
    }

    if (currentPath === '/terms') {
      document.title = `Terms of Service | ${APP_NAME}`;
      return;
    }

    document.title = isAuthenticated ? `${APP_NAME} Dashboard` : APP_NAME;
  }, [currentPath, isAuthenticated]);

  const handleLogin = async () => {
    setError(null);
    setNotice(null);

    try {
      const res = await apiFetch('/api/auth/url');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat URL login Google.');
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      resetInboxState();
      setSearchQuery('');
      setActiveCategory('all');
      setNotice('Sesi Google berhasil diputus.');
    }
  };

  const emailsByCategory = useMemo(() => {
    const counts = { total: emails.length, starred: emails.filter((e) => e.starred).length };
    ['inbox', 'promotions', 'social', 'updates', 'spam', 'drafts'].forEach((cat) => {
      counts[cat] = emails.filter((e) => e.category === cat).length;
    });
    return counts;
  }, [emails]);

  const filteredEmails = useMemo(() => {
    let result = emails;

    if (activeCategory !== 'all') {
      if (activeCategory === 'starred') {
        result = result.filter((e) => e.starred);
      } else {
        result = result.filter((e) => e.category === activeCategory);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.sender.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          e.preview.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [emails, activeCategory, searchQuery]);

  const handleToggleStar = (id) => {
    setEmails((prev) => prev.map((email) => (email.id === id ? { ...email, starred: !email.starred } : email)));
  };

  const isDashboard = activeCategory === 'all' && !searchQuery;

  if (currentPath === '/privacy') {
    return (
      <LegalPage title="Privacy Policy">
        <p>
          E-Manage vian menggunakan login Google dan Gmail API untuk membantu pengguna membaca
          serta meninjau email mereka melalui dashboard web.
        </p>
        <p>
          Aplikasi ini hanya menggunakan data Gmail untuk kebutuhan tampilan inbox, kategori email,
          dan status akun yang sedang login. Aplikasi tidak menjual data pengguna ke pihak ketiga.
        </p>
        <p>
          Jika Anda ingin meminta penghapusan akses, cabut izin aplikasi ini dari halaman Google
          Account Permissions atau hubungi developer di {SUPPORT_EMAIL}.
        </p>
      </LegalPage>
    );
  }

  if (currentPath === '/terms') {
    return (
      <LegalPage title="Terms of Service">
        <p>
          E-Manage vian disediakan untuk membantu pengguna mengelola email Gmail mereka melalui
          antarmuka dashboard berbasis web.
        </p>
        <p>
          Dengan menggunakan aplikasi ini, Anda menyetujui bahwa akses Gmail diberikan secara sadar
          melalui OAuth Google dan digunakan hanya untuk fungsi pengelolaan inbox.
        </p>
        <p>
          Pengguna bertanggung jawab atas akun Google yang dipakai untuk login. Developer dapat
          mengubah atau menghentikan layanan aplikasi sewaktu-waktu untuk keperluan pemeliharaan
          atau keamanan.
        </p>
      </LegalPage>
    );
  }

  if (!loading && !isAuthenticated) {
    return <PublicLanding onLogin={handleLogin} error={error} notice={notice} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeCategory={activeCategory}
        onCategoryChange={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
        }}
        emailsByCategory={emailsByCategory}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />

      <div className="main-content">
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCategory={activeCategory}
          onRefresh={fetchEmails}
          loading={loading}
        />

        <div className="page-content">
          {notice && (
            <div style={{ marginBottom: 16, padding: 12, borderRadius: 12, background: 'rgba(34,197,94,0.12)', color: '#86efac' }}>
              {notice}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--accent-primary)' }}>
              Memuat data dari Gmail API...
            </div>
          )}

          {error && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
              Terjadi kesalahan: {error}
            </div>
          )}

          {!loading && !error && isAuthenticated && isDashboard && (
            <>
              <StatsCards emails={emails} />
              <CategoryChart emails={emails} />
            </>
          )}

          {!loading && !error && isAuthenticated && searchQuery && (
            <div style={{ marginBottom: 16, color: 'var(--text-secondary)', fontSize: 13 }}>
              Menampilkan <strong style={{ color: 'var(--text-primary)' }}>{filteredEmails.length}</strong> hasil untuk &quot;{searchQuery}&quot;
            </div>
          )}

          {!loading && !error && isAuthenticated && (
            <div className="section-header" style={{ marginBottom: 12 }}>
              <div className="section-title">
                Daftar Email{' '}
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 13 }}>
                  ({filteredEmails.length} email)
                </span>
              </div>
            </div>
          )}

          {!loading && !error && isAuthenticated && (
            <EmailList
              emails={filteredEmails}
              onToggleStar={handleToggleStar}
              activeCategory={activeCategory}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
