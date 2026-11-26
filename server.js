const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const BASE_DIR = __dirname;
const STORIES_DIR = path.join(BASE_DIR, 'stories');
const BACKUPS_DIR = path.join(BASE_DIR, 'backups');

if (!fs.existsSync(STORIES_DIR)) fs.mkdirSync(STORIES_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

const BLOCKED_TOP_ENTRIES = new Set([
  '.git', '.github', 'backups', 'stories', 'scripts', 'scratch', 'node_modules',
  'server.js', 'package.json', 'package-lock.json', 'agents.md', 'netlify.toml', 'vercel.json'
]);

function isAllowedLocalOrigin(origin) {
  if (!origin) return true;
  if (origin === 'null') return false;
  try {
    const u = new URL(origin);
    const h = u.hostname;
    if (h === 'localhost' || h === '127.0.0.1' || h === '::1') return true;
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h)) return true;
  } catch (e) {}
  return false;
}

function sendJson(res, statusCode, data, origin = '') {
  const payload = JSON.stringify(data);
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  if (origin && isAllowedLocalOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Vary'] = 'Origin';
  }
  res.writeHead(statusCode, headers);
  res.end(payload);
}

function parseJsonBody(req, limit = 50 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let raw = '';
    let bytes = 0;
    req.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > limit) {
        req.destroy();
        reject(new Error('Payload exceeds 50MB limit'));
        return;
      }
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function handleApiRequest(req, res, reqPath) {
  const origin = req.headers.origin || '';
  if (origin && !isAllowedLocalOrigin(origin)) {
    return sendJson(res, 403, { ok: false, error: 'Cross-origin API access denied' });
  }
  const reply = (code, data) => sendJson(res, code, data, origin);
  try {
    // 1. GET /api/status - Server health & capabilities check
    if (req.method === 'GET' && reqPath === '/api/status') {
      return reply(200, {
        ok: true,
        node: true,
        serverTime: new Date().toISOString(),
        storiesDir: STORIES_DIR,
        backupsDir: BACKUPS_DIR
      });
    }

    // 2. GET /api/stories - List all stories saved on disk
    if (req.method === 'GET' && reqPath === '/api/stories') {
      const files = fs.readdirSync(STORIES_DIR).filter(f => f.endsWith('.json'));
      const stories = [];
      for (const file of files) {
        try {
          const filePath = path.join(STORIES_DIR, file);
          const raw = fs.readFileSync(filePath, 'utf-8');
          const data = JSON.parse(raw);
          const stat = fs.statSync(filePath);
          stories.push({
            id: data.id || file.replace(/\.json$/, ''),
            title: data.title || 'Untitled',
            date: data.date || '',
            messageCount: data.messageCount || (Array.isArray(data.messages) ? data.messages.length : 0),
            activeAppMode: data.activeAppMode || 'whatsapp',
            updatedAt: data.updatedAt || stat.mtimeMs,
            fileSize: stat.size
          });
        } catch (e) {
          // ignore corrupted files
        }
      }
      stories.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return reply(200, { ok: true, count: stories.length, stories });
    }

    // 3. POST /api/stories - Save/update story to disk
    if (req.method === 'POST' && reqPath === '/api/stories') {
      const body = await parseJsonBody(req);
      const story = body.story || body;
      if (!story || typeof story !== 'object') {
        return reply(400, { ok: false, error: 'Invalid story payload' });
      }
      const rawId = story.id || ('story_' + Date.now());
      const safeId = String(rawId).replace(/[^a-zA-Z0-9_-]/g, '_');
      story.id = safeId;
      story.updatedAt = Date.now();
      const filePath = path.join(STORIES_DIR, `${safeId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(story, null, 2), 'utf-8');
      return reply(200, {
        ok: true,
        id: safeId,
        title: story.title,
        message: 'Story saved to disk successfully',
        savedAt: new Date().toISOString()
      });
    }

    // 4. GET /api/stories/:id - Read single story from disk
    if (req.method === 'GET' && reqPath.startsWith('/api/stories/')) {
      const rawId = reqPath.replace(/^\/api\/stories\//, '');
      const safeId = String(rawId).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = path.join(STORIES_DIR, `${safeId}.json`);
      if (!fs.existsSync(filePath)) {
        return reply(404, { ok: false, error: 'Story not found on disk' });
      }
      const raw = fs.readFileSync(filePath, 'utf-8');
      const story = JSON.parse(raw);
      return reply(200, { ok: true, story });
    }

    // 5. DELETE /api/stories/:id - Delete story file from disk
    if (req.method === 'DELETE' && reqPath.startsWith('/api/stories/')) {
      const rawId = reqPath.replace(/^\/api\/stories\//, '');
      const safeId = String(rawId).replace(/[^a-zA-Z0-9_-]/g, '_');
      const filePath = path.join(STORIES_DIR, `${safeId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return reply(200, { ok: true, deleted: safeId });
    }

    // 6. POST /api/backup - Save complete studio backup snapshot
    if (req.method === 'POST' && reqPath === '/api/backup') {
      const body = await parseJsonBody(req);
      const filename = `chathub_backup_${Date.now()}.json`;
      const filePath = path.join(BACKUPS_DIR, filename);
      fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8');
      return reply(200, {
        ok: true,
        filename,
        message: 'Full backup saved to disk',
        savedAt: new Date().toISOString()
      });
    }

    // 7. GET /api/backups - List all studio backup files
    if (req.method === 'GET' && reqPath === '/api/backups') {
      const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json'));
      const backups = files.map(file => {
        const stat = fs.statSync(path.join(BACKUPS_DIR, file));
        return {
          filename: file,
          size: stat.size,
          createdAt: stat.birthtimeMs || stat.mtimeMs
        };
      }).sort((a, b) => b.createdAt - a.createdAt);
      return reply(200, { ok: true, backups });
    }

    // Unmatched API endpoint
    return reply(404, { ok: false, error: `Endpoint ${req.method} ${reqPath} not found` });
  } catch (err) {
    console.error('API Error:', err);
    return reply(500, { ok: false, error: err.message || 'Internal API Error' });
  }
}

const server = http.createServer((req, res) => {
  // CORS Preflight for any route
  if (req.method === 'OPTIONS') {
    const origin = req.headers.origin || '';
    const headers = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    };
    if (origin && isAllowedLocalOrigin(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Vary'] = 'Origin';
    }
    res.writeHead(204, headers);
    res.end();
    return;
  }

  let reqPath;
  try {
    reqPath = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  // Handle REST API routes
  if (reqPath.startsWith('/api/')) {
    handleApiRequest(req, res, reqPath);
    return;
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = fs.existsSync(path.join(BASE_DIR, 'index.html'))
      ? '/index.html'
      : '/manhwa_chat_studio_clean.html';
  }

  const normalizedPosix = path.posix.normalize('/' + reqPath.replace(/\\/g, '/'));
  const relPath = normalizedPosix.replace(/^\/+/, '');
  const segments = relPath.split('/').filter(Boolean);
  if (
    segments.some(seg => seg === '..' || seg.startsWith('.')) ||
    (segments.length > 0 && BLOCKED_TOP_ENTRIES.has(segments[0].toLowerCase()))
  ) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  const filePath = path.resolve(BASE_DIR, relPath);
  if (filePath !== BASE_DIR && !filePath.startsWith(BASE_DIR + path.sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      }
      res.end('500 Internal Server Error');
    });
    stream.pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getLocalIpAddresses();
  console.log(`\n=============================================================`);
  console.log(`  🎉 Manhwa Chat Hub Studio Web App is LIVE!`);
  console.log(`=============================================================`);
  console.log(`  💻 PC / Localhost :  http://localhost:${PORT}`);
  if (ips.length > 0) {
    ips.forEach(ip => {
      console.log(`  📱 Mobile (Wi-Fi) :  http://${ip}:${PORT}`);
    });
    console.log(`\n  💡 Mobile tip: Connect your phone to the SAME Wi-Fi as your PC,`);
    console.log(`     then open the Mobile link above in Safari or Chrome!`);
  } else {
    console.log(`  📱 Mobile tip     :  Connect phone to PC hotspot or same Wi-Fi.`);
  }
  console.log(`=============================================================\n`);
});
