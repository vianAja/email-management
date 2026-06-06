import { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import StatsCards from './components/StatsCards';
import CategoryChart from './components/CategoryChart';
import EmailList from './components/EmailList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

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

function App() {
  const [emails, setEmails] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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
  }, []);

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

          {!loading && !error && !isAuthenticated && (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Hubungkan Akun Google</div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 12 }}>
                Login Google dibutuhkan agar aplikasi bisa membaca inbox Gmail Anda secara aman.
              </div>
              <div style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 14 }}>
                Pastikan `REDIRECT_URL` di Google Cloud Console sama persis dengan URL callback aplikasi.
              </div>
              <button
                onClick={handleLogin}
                style={{
                  padding: '12px 24px',
                  background: 'white',
                  color: 'black',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
              >
                Login dengan Google
              </button>
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
