import crypto from 'crypto';
import { google } from 'googleapis';

const SESSION_COOKIE = 'gmail_manager_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

const CLIENT_ID =
  process.env.CLIENT_ID ||
  process.env.GOOGLE_OAUTH_CLIENT_ID ||
  process.env.CLIENT_ID_GMAIL_API ||
  '';
const CLIENT_SECRET =
  process.env.CLIENT_SECRET ||
  process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
  process.env.SECRET_GMAIL_API ||
  '';

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const isSafeJsonMethod = (method) => method === 'GET' || method === 'HEAD';

const jsonResponse = (payload, status = 200, headers = {}) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...headers,
    },
  });

const redirectResponse = (location, headers = {}) =>
  new Response(null, {
    status: 302,
    headers: {
      location,
      ...headers,
    },
  });

const parseCookies = (cookieHeader = '') =>
  cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separator = part.indexOf('=');
      if (separator === -1) return acc;
      const key = part.slice(0, separator).trim();
      const value = decodeURIComponent(part.slice(separator + 1).trim());
      acc[key] = value;
      return acc;
    }, {});

const base64UrlEncode = (value) => Buffer.from(value, 'utf8').toString('base64url');
const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const getRequestOrigin = (request) => {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL;
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return 'http://localhost:5173';
  }
};

const getRedirectUrl = (request) =>
  process.env.REDIRECT_URL || `${getRequestOrigin(request)}/api/auth/callback`;

const logAuthEvent = (event, details = {}) => {
  try {
    console.info(
      JSON.stringify({
        type: 'auth-debug',
        event,
        ...details,
      })
    );
  } catch {
    console.info(`[auth-debug] ${event}`);
  }
};

const getSessionSecret = (request) => {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }

  if (CLIENT_SECRET) {
    return CLIENT_SECRET;
  }

  const origin = getRequestOrigin(request);
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return 'local-dev-session-secret';
  }

  throw new HttpError(
    500,
    'SESSION_SECRET belum dikonfigurasi. Tambahkan secret ini di environment Vercel atau pastikan CLIENT_SECRET tersedia.'
  );
};

const serializeCookie = (name, value, request, maxAgeSeconds) => {
  const secure = getRequestOrigin(request).startsWith('https://');
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (secure) {
    attributes.push('Secure');
  }

  return attributes.join('; ');
};

const signPayload = (payload, request) =>
  crypto.createHmac('sha256', getSessionSecret(request)).update(payload).digest('base64url');

const encodeSessionCookie = (session, request) => {
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = signPayload(payload, request);
  return `${payload}.${signature}`;
};

const decodeSessionCookie = (signedValue, request) => {
  if (!signedValue) return null;

  const separator = signedValue.lastIndexOf('.');
  if (separator === -1) return null;

  const payload = signedValue.slice(0, separator);
  const signature = signedValue.slice(separator + 1);
  const expectedSignature = signPayload(payload, request);

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(payload));
  } catch {
    return null;
  }
};

const emptySession = () => ({
  tokens: null,
  oauthState: null,
  profile: null,
  createdAt: Date.now(),
  lastSeenAt: Date.now(),
});

const readSession = (request) => {
  const cookies = parseCookies(request.headers.get('cookie') || '');
  const session = decodeSessionCookie(cookies[SESSION_COOKIE], request);
  if (!session) return emptySession();

  return {
    ...emptySession(),
    ...session,
    lastSeenAt: Date.now(),
  };
};

const buildSessionHeader = (session, request) =>
  serializeCookie(SESSION_COOKIE, encodeSessionCookie(session, request), request, SESSION_TTL_SECONDS);

const buildClearSessionHeader = (request) =>
  serializeCookie(SESSION_COOKIE, '', request, 0);

const ensureOAuthConfigured = () => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new HttpError(
      500,
      'Google OAuth belum dikonfigurasi. Lengkapi CLIENT_ID dan CLIENT_SECRET di environment Vercel.'
    );
  }
};

const createOAuthClient = (request) => {
  ensureOAuthConfigured();
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, getRedirectUrl(request));
};

const normalizeTokens = (tokens, previousTokens = null) => ({
  access_token: tokens.access_token || previousTokens?.access_token || null,
  refresh_token: tokens.refresh_token || previousTokens?.refresh_token || null,
  expiry_date: tokens.expiry_date || previousTokens?.expiry_date || null,
});

const extractHeader = (headers = [], name) => {
  const header = headers.find((item) => item.name?.toLowerCase() === name.toLowerCase());
  return header?.value || '';
};

const extractSender = (fromHeader) => {
  const senderName = fromHeader.split('<')[0].replace(/"/g, '').trim();
  const emailMatch = fromHeader.match(/<([^>]+)>/);
  const email = emailMatch ? emailMatch[1] : fromHeader;
  const sender = senderName || email;

  return {
    sender,
    email,
    initials: sender.charAt(0).toUpperCase() || '?',
  };
};

const mapCategoryFromLabels = (labelIds = []) => {
  if (labelIds.includes('SPAM')) return 'spam';
  if (labelIds.includes('DRAFT')) return 'drafts';
  if (labelIds.includes('CATEGORY_SOCIAL')) return 'social';
  if (labelIds.includes('CATEGORY_PROMOTIONS')) return 'promotions';
  if (labelIds.includes('CATEGORY_UPDATES')) return 'updates';
  return 'inbox';
};

const getUserProfile = async (auth) => {
  const gmail = google.gmail({ version: 'v1', auth });
  const { data } = await gmail.users.getProfile({ userId: 'me' });

  return {
    email: data.emailAddress || '',
    name: data.emailAddress?.split('@')[0] || 'Google User',
    messagesTotal: data.messagesTotal || 0,
    threadsTotal: data.threadsTotal || 0,
  };
};

const getAuthorizedState = async (request) => {
  const session = readSession(request);
  if (!session.tokens) {
    return { session, auth: null };
  }

  const auth = createOAuthClient(request);
  auth.setCredentials(session.tokens);

  try {
    if (!session.profile) {
      session.profile = await getUserProfile(auth);
    }

    session.lastSeenAt = Date.now();
    return { session, auth };
  } catch (error) {
    logAuthEvent('authorized_state_failed', {
      message: error instanceof Error ? error.message : 'unknown_error',
      hasRefreshToken: Boolean(session.tokens?.refresh_token),
      hasAccessToken: Boolean(session.tokens?.access_token),
    });
    session.tokens = null;
    session.profile = null;
    session.oauthState = null;
    return { session, auth: null };
  }
};

export const handleHealth = async (request) =>
  jsonResponse({
    ok: true,
    oauthConfigured: Boolean(CLIENT_ID && CLIENT_SECRET),
    redirectUrl: getRedirectUrl(request),
    appBaseUrl: getRequestOrigin(request),
    deploymentTarget: 'vercel-react',
    sessionStrategy: 'signed-cookie',
  });

export const handleAuthUrl = async (request) => {
  try {
    const session = readSession(request);
    const auth = createOAuthClient(request);
    session.oauthState = crypto.randomUUID();
    session.lastSeenAt = Date.now();

    const url = auth.generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      prompt: 'consent',
      scope: SCOPES,
      state: session.oauthState,
    });

    logAuthEvent('auth_url_generated', {
      origin: getRequestOrigin(request),
      redirectUrl: getRedirectUrl(request),
      hasOAuthState: Boolean(session.oauthState),
    });

    return jsonResponse(
      { url },
      200,
      { 'set-cookie': buildSessionHeader(session, request) }
    );
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Gagal membuat URL login Google.' },
      status
    );
  }
};

export const handleAuthCallback = async (request) => {
  const url = new URL(request.url);
  const authError = url.searchParams.get('error');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const appBaseUrl = getRequestOrigin(request);
  const session = readSession(request);

  logAuthEvent('auth_callback_received', {
    hasAuthError: Boolean(authError),
    hasCode: Boolean(code),
    hasState: Boolean(state),
    hasSessionState: Boolean(session.oauthState),
    stateMatchesSession: Boolean(state && session.oauthState && state === session.oauthState),
  });

  if (authError) {
    return redirectResponse(
      `${appBaseUrl}/?authError=${encodeURIComponent(authError)}`,
      { 'set-cookie': buildSessionHeader(session, request) }
    );
  }

  if (!session.oauthState) {
    return redirectResponse(
      `${appBaseUrl}/?authError=session_missing`,
      { 'set-cookie': buildClearSessionHeader(request) }
    );
  }

  if (!code) {
    return redirectResponse(
      `${appBaseUrl}/?authError=no_code`,
      { 'set-cookie': buildSessionHeader(session, request) }
    );
  }

  if (state !== session.oauthState) {
    session.oauthState = null;
    return redirectResponse(
      `${appBaseUrl}/?authError=invalid_state`,
      { 'set-cookie': buildSessionHeader(session, request) }
    );
  }

  try {
    const auth = createOAuthClient(request);
    const { tokens } = await auth.getToken(code);

    session.tokens = normalizeTokens(tokens, session.tokens);
    session.oauthState = null;
    session.lastSeenAt = Date.now();

    auth.setCredentials(session.tokens);
    session.profile = await getUserProfile(auth);
    const sessionCookie = buildSessionHeader(session, request);

    logAuthEvent('auth_callback_success', {
      hasAccessToken: Boolean(session.tokens?.access_token),
      hasRefreshToken: Boolean(session.tokens?.refresh_token),
      hasExpiryDate: Boolean(session.tokens?.expiry_date),
      hasProfile: Boolean(session.profile?.email),
      sessionCookieBytes: Buffer.byteLength(sessionCookie, 'utf8'),
    });

    return redirectResponse(`${appBaseUrl}/?auth=success`, {
      'set-cookie': sessionCookie,
    });
  } catch (error) {
    session.tokens = null;
    session.profile = null;
    session.oauthState = null;
    logAuthEvent('auth_callback_failed', {
      message: error instanceof Error ? error.message : 'unknown_error',
    });
    return redirectResponse(
      `${appBaseUrl}/?authError=callback_failed`,
      { 'set-cookie': buildSessionHeader(session, request) }
    );
  }
};

export const handleAuthStatus = async (request) => {
  try {
    const { session, auth } = await getAuthorizedState(request);
    if (!auth) {
      logAuthEvent('auth_status_unauthenticated', {
        hasTokens: Boolean(session.tokens),
        hasProfile: Boolean(session.profile),
      });
      return jsonResponse(
        { authenticated: false, user: null },
        200,
        { 'set-cookie': buildSessionHeader(session, request) }
      );
    }

    logAuthEvent('auth_status_authenticated', {
      email: session.profile?.email || null,
      hasRefreshToken: Boolean(session.tokens?.refresh_token),
    });

    return jsonResponse(
      { authenticated: true, user: session.profile },
      200,
      { 'set-cookie': buildSessionHeader(session, request) }
    );
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return jsonResponse(
      { authenticated: false, user: null, error: error instanceof Error ? error.message : 'Gagal memeriksa status login Google.' },
      status
    );
  }
};

export const handleAuthLogout = async (request) =>
  jsonResponse(
    { success: true },
    200,
    { 'set-cookie': buildClearSessionHeader(request) }
  );

export const handleEmails = async (request) => {
  try {
    const { session, auth } = await getAuthorizedState(request);

    if (!auth) {
      return jsonResponse(
        { error: 'Unauthorized. Please login again.' },
        401,
        { 'set-cookie': buildSessionHeader(session, request) }
      );
    }

    const gmail = google.gmail({ version: 'v1', auth });
    let listRes;

    try {
      listRes = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 20,
      });
    } catch (error) {
      logAuthEvent('gmail_list_failed', {
        message: error instanceof Error ? error.message : 'unknown_error',
      });
      session.tokens = null;
      session.profile = null;
      session.oauthState = null;
      return jsonResponse(
        { error: 'Unauthorized. Please login again.' },
        401,
        { 'set-cookie': buildSessionHeader(session, request) }
      );
    }

    if (!listRes.data.messages?.length) {
      return jsonResponse([], 200, { 'set-cookie': buildSessionHeader(session, request) });
    }

    const messages = [];

    for (const item of listRes.data.messages) {
      const msgRes = await gmail.users.messages.get({
        id: item.id,
        userId: 'me',
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date'],
      });

      const messageInfo = msgRes.data;
      const headers = messageInfo.payload?.headers || [];
      const fromHeader = extractHeader(headers, 'From');
      const senderInfo = extractSender(fromHeader);
      const labelIds = messageInfo.labelIds || [];
      const category = mapCategoryFromLabels(labelIds);

      messages.push({
        id: messageInfo.id,
        sender: senderInfo.sender,
        email: senderInfo.email,
        subject: extractHeader(headers, 'Subject') || '(Tanpa subjek)',
        preview: messageInfo.snippet || '',
        time: new Date(Number(messageInfo.internalDate)).toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        category,
        read: !labelIds.includes('UNREAD'),
        starred: labelIds.includes('STARRED'),
        avatar:
          category === 'spam'
            ? '#dc2626'
            : category === 'promotions'
            ? '#f59e0b'
            : category === 'social'
            ? '#10b981'
            : category === 'updates'
            ? '#8b5cf6'
            : '#3b82f6',
        initials: senderInfo.initials,
      });
    }

    return jsonResponse(messages, 200, { 'set-cookie': buildSessionHeader(session, request) });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Failed to fetch emails' },
      status
    );
  }
};

export const isSupportedMethod = (request, expectedMethod) => {
  if (request.method !== expectedMethod) {
    return jsonResponse({ error: `Method ${request.method} not allowed` }, 405, {
      allow: expectedMethod,
    });
  }

  return null;
};

export const toNodeHeaders = (headersObject = {}) => {
  const headers = new Headers();

  for (const [key, value] of Object.entries(headersObject)) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
      continue;
    }

    if (value !== undefined) {
      headers.set(key, String(value));
    }
  }

  return headers;
};

export const toWebRequest = (url, method, headers, body) => {
  const init = {
    method,
    headers: toNodeHeaders(headers),
  };

  if (body && !isSafeJsonMethod(method)) {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  return new Request(url, init);
};
