// Mock Gmail data for dashboard
export const mockEmails = [
  // INBOX
  { id: 1, sender: 'GitHub', email: 'noreply@github.com', subject: 'Your repository has new stars!', preview: '3 people starred your repository antigravity/dashboard-ui this week.', time: '9:41 AM', category: 'updates', read: false, starred: true, avatar: '#6c63ff', initials: 'GH' },
  { id: 2, sender: 'Sarah Johnson', email: 'sarah.johnson@company.com', subject: 'Re: Project proposal review', preview: 'Hi! I reviewed your proposal and I have a few suggestions we should discuss before the deadline...', time: '8:20 AM', category: 'inbox', read: false, starred: false, avatar: '#10b981', initials: 'SJ' },
  { id: 3, sender: 'Tokopedia', email: 'promo@tokopedia.com', subject: '🔥 Flash Sale 12.12 — Diskon hingga 90%!', preview: 'Jangan lewatkan kesempatan emas ini! Belanja produk impian Anda dengan diskon spesial...', time: 'Yesterday', category: 'promotions', read: true, starred: false, avatar: '#f59e0b', initials: 'TO' },
  { id: 4, sender: 'Shopee', email: 'noreply@shopee.co.id', subject: 'Pesanan #SHP2024 telah dikirim', preview: 'Pesanan Anda sedang dalam perjalanan! Estimasi tiba 2-3 hari kerja.', time: 'Yesterday', category: 'updates', read: true, starred: true, avatar: '#ef4444', initials: 'SH' },
  { id: 5, sender: 'LinkedIn Notifications', email: 'jobs-noreply@linkedin.com', subject: '15 new jobs match your profile', preview: 'Senior Frontend Developer at Google, Full Stack Engineer at Gojek, and 13 more jobs...', time: 'Mon', category: 'promotions', read: false, starred: false, avatar: '#0077b5', initials: 'LI' },
  { id: 6, sender: 'System Alert', email: 'alert@monitoring.io', subject: '[SPAM DETECTED] Verify your bank account', preview: 'Dear Customer, your account has been compromised. Click here immediately to restore...', time: 'Mon', category: 'spam', read: true, starred: false, avatar: '#dc2626', initials: 'SA' },
  { id: 7, sender: 'Twitter / X', email: 'notify@twitter.com', subject: 'Someone liked your tweet about React', preview: '@devuser and 42 others liked your tweet: "Just shipped a new Gmail dashboard in React! 🚀"', time: 'Sun', category: 'social', read: true, starred: false, avatar: '#000000', initials: 'TW' },
  { id: 8, sender: 'Vercel', email: 'noreply@vercel.com', subject: 'Your deployment is ready', preview: 'Your project bank-tracking has been successfully deployed to production. View it at...', time: 'Sun', category: 'updates', read: true, starred: true, avatar: '#fff', initials: 'VC' },
  { id: 9, sender: 'Unsubscribe Bot', email: 'deals@bestdeals.xyz', subject: 'You have WON $1,000,000 !!!', preview: 'Congratulations! You have been selected as a winner of our grand prize lottery. Claim now!', time: 'Sat', category: 'spam', read: true, starred: false, avatar: '#dc2626', initials: 'UB' },
  { id: 10, sender: 'Google Workspace', email: 'workspace-noreply@google.com', subject: 'Your storage is 82% full', preview: 'You have used 12.3 GB of your 15 GB. Upgrade your plan to get more storage.', time: 'Sat', category: 'updates', read: false, starred: false, avatar: '#4285f4', initials: 'GW' },
  { id: 11, sender: 'Meetup', email: 'notifications@meetup.com', subject: 'New event in your area: React Indonesia Meetup', preview: 'Join 320 developers at React Indonesia Monthly Meetup — Jakarta, Feb 2025', time: 'Fri', category: 'social', read: true, starred: false, avatar: '#f64060', initials: 'ME' },
  { id: 12, sender: 'Amazon Web Services', email: 'billing@aws.amazon.com', subject: 'Your AWS bill for January 2025', preview: 'Your monthly bill is ready. Total: $47.83. Services used: EC2, S3, CloudFront...', time: 'Fri', category: 'updates', read: false, starred: true, avatar: '#ff9900', initials: 'AW' },
  { id: 13, sender: 'Loteria Nacional', email: 'winner@loteria.es', subject: 'URGENTE: Ha ganado el premio gordo', preview: 'Estimado ganador, usted ha sido seleccionado para recibir €850,000 euros. Responda ahora...', time: 'Thu', category: 'spam', read: true, starred: false, avatar: '#dc2626', initials: 'LN' },
  { id: 14, sender: 'Medium', email: 'noreply@medium.com', subject: 'Stories you might like this week', preview: 'The Future of AI Agents in Software Development, How I Built a Million Dollar SaaS...', time: 'Thu', category: 'promotions', read: true, starred: false, avatar: '#000', initials: 'MD' },
  { id: 15, sender: 'Instagram', email: 'mail@mail.instagram.com', subject: '5 people follow you on Instagram', preview: 'devuser_official, creative_studio, ui_wizard and 2 others started following you.', time: 'Wed', category: 'social', read: true, starred: false, avatar: '#e1306c', initials: 'IG' },
  { id: 16, sender: 'Dicoding Indonesia', email: 'info@dicoding.com', subject: 'Selamat! Anda lulus kelas React Expert', preview: 'Sertifikat Anda telah siap diunduh. Klik tombol di bawah untuk mengunduh sertifikat...', time: 'Wed', category: 'inbox', read: false, starred: true, avatar: '#5c6ac4', initials: 'DI' },
  { id: 17, sender: 'Reddit', email: 'noreply@reddit.com', subject: 'Your post is trending in r/reactjs', preview: 'Your post "Building a Gmail Dashboard with React" has 247 upvotes and 52 comments!', time: 'Tue', category: 'social', read: true, starred: false, avatar: '#ff4500', initials: 'RD' },
  { id: 18, sender: 'Junk Mailer', email: 'free@loseweightfast.info', subject: 'Lose 20kg in 1 week with this secret', preview: 'Doctors HATE him for discovering this simple trick that melts belly fat overnight...', time: 'Tue', category: 'spam', read: true, starred: false, avatar: '#dc2626', initials: 'JM' },
  { id: 19, sender: 'Bank BCA', email: 'info@bca.co.id', subject: 'Notifikasi Transaksi - Pembelian Online', preview: 'Transaksi sebesar Rp 250.000 berhasil dilakukan pada 18 Jan 2025 pukul 14:30 WIB', time: 'Mon', category: 'updates', read: true, starred: true, avatar: '#0066cc', initials: 'BCA' },
  { id: 20, sender: 'Draft - Self', email: 'me@gmail.com', subject: '[DRAFT] Ideas for the Q2 roadmap', preview: 'Key features to ship: 1. Dark mode toggle 2. Email scheduling 3. Smart reply suggestions...', time: 'Mon', category: 'drafts', read: true, starred: false, avatar: '#64748b', initials: 'ME' },
];

export const categories = [
  { key: 'all', label: 'Semua Email', icon: '📬', color: '#6c63ff' },
  { key: 'inbox', label: 'Inbox', icon: '📥', color: '#3b82f6' },
  { key: 'starred', label: 'Berbintang', icon: '⭐', color: '#f59e0b' },
  { key: 'promotions', label: 'Promosi', icon: '🏷️', color: '#f59e0b' },
  { key: 'social', label: 'Sosial', icon: '👥', color: '#10b981' },
  { key: 'updates', label: 'Pembaruan', icon: '🔔', color: '#8b5cf6' },
  { key: 'spam', label: 'Spam', icon: '🚫', color: '#ef4444' },
  { key: 'drafts', label: 'Draf', icon: '📝', color: '#64748b' },
];

export const tagColors = {
  inbox: { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa' },
  promotions: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
  social: { bg: 'rgba(16,185,129,0.15)', color: '#34d399' },
  updates: { bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  spam: { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  drafts: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
  starred: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24' },
};

export const tagLabels = {
  inbox: 'Inbox',
  promotions: 'Promosi',
  social: 'Sosial',
  updates: 'Pembaruan',
  spam: 'Spam',
  drafts: 'Draf',
};
