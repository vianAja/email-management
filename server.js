import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  handleAuthCallback,
  handleAuthLogout,
  handleAuthStatus,
  handleAuthUrl,
  handleEmails,
  handleHealth,
  toWebRequest,
} from './lib/api-handlers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT || 3100);

const app = express();
app.set('trust proxy', 1);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const sendWebResponse = async (webResponse, res) => {
  res.status(webResponse.status);

  for (const [key, value] of webResponse.headers.entries()) {
    res.setHeader(key, value);
  }

  const text = await webResponse.text();
  if (!text) {
    res.end();
    return;
  }

  res.send(text);
};

const adapt = (handler) => async (req, res) => {
  try {
    const origin = `${req.protocol}://${req.get('host')}`;
    const request = toWebRequest(
      `${origin}${req.originalUrl}`,
      req.method,
      req.headers,
      req.body
    );

    const response = await handler(request);
    await sendWebResponse(response, res);
  } catch (error) {
    console.error('[server] route failed', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

app.get('/api/health', adapt(handleHealth));
app.get('/api/auth/url', adapt(handleAuthUrl));
app.get('/api/auth/callback', adapt(handleAuthCallback));
app.get('/api/auth/status', adapt(handleAuthStatus));
app.post('/api/auth/logout', adapt(handleAuthLogout));
app.get('/api/emails', adapt(handleEmails));

app.use(express.static(path.join(__dirname, 'dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});

export default app;
