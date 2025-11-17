import http from 'node:http';
import { config } from 'dotenv';

config();

const BOT_ID = process.env.VITE_BOTPRESS_BOT_ID;
const API_KEY = process.env.VITE_BOTPRESS_API_KEY;
const PORT = process.env.PROXY_PORT || 8787;

const sendJson = (res, statusCode, payload) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
};

const server = http.createServer(async (req, res) => {
  if (req.method !== 'POST' || req.url !== '/api/botpress') {
    res.writeHead(404);
    return res.end('Not found');
  }

  if (!BOT_ID || !API_KEY) {
    return sendJson(res, 500, { error: 'Variables Botpress manquantes dans .env.' });
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      const { text, conversationId } = JSON.parse(body || '{}');

      if (!text || !conversationId) {
        return sendJson(res, 400, { error: 'Paramètres manquants.' });
      }

      const endpoint = `https://api.botpress.cloud/v1/bots/${BOT_ID}/conversations/${conversationId}/messages`;

      const bpResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ type: 'text', text }),
      });

      const data = await bpResponse.text();
      res.writeHead(bpResponse.status, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (error) {
      console.error('[localProxy] Botpress error:', error);
      sendJson(res, 500, { error: 'Erreur proxy locale.' });
    }
  });
});

server.listen(PORT, () => {
  console.log(`Proxy Botpress local actif sur http://localhost:${PORT}/api/botpress`);
});

