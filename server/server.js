/**
 * Production Web Server for Pujo Aurora
 * - Mounts secure Pujo AI endpoints (/api/pujo-ai/*)
 * - Serves optimized Vite production static assets from dist/
 * - Supports SPA client-side fallback (dist/index.html)
 * - Handles health check probe (/healthz)
 * - Listens on process.env.PORT (required by Render)
 * - Zero external dependencies (pure Node.js built-in http/fs/path modules)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { handlePujoAiRequest } from './pujoAiMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

function sendError(res, statusCode, message) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(message);
}

function serveStaticFile(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const isHashedAsset = filePath.includes(path.sep + 'assets' + path.sep);
  const cacheControl = isHashedAsset
    ? 'public, max-age=31536000, immutable'
    : ext === '.html'
      ? 'no-cache'
      : 'public, max-age=86400';

  res.statusCode = 200;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', cacheControl);

  const stream = fs.createReadStream(filePath);
  stream.on('error', (err) => {
    console.error(`[Static File Stream Error: ${filePath}]:`, err.message);
    if (!res.headersSent) {
      sendError(res, 500, 'Internal Server Error');
    }
  });
  stream.pipe(res);
}

export function createProductionServer() {
  return http.createServer(async (req, res) => {
    // 1. Health check probe for Render
    if (req.url === '/healthz' || req.url === '/ping') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('OK');
    }

    // 2. Route API requests to Pujo AI middleware
    if (req.url && req.url.startsWith('/api/pujo-ai')) {
      try {
        await handlePujoAiRequest(req, res);
      } catch (err) {
        console.error('[Pujo AI Server Error]:', err.message);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
        }
      }
      return;
    }

    // 3. Static files & SPA Routing
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let decodedPathname;
    try {
      decodedPathname = decodeURIComponent(parsedUrl.pathname);
    } catch {
      return sendError(res, 400, 'Bad Request');
    }

    // Path traversal security check: resolve path relative to dist directory
    const safePath = path.normalize(decodedPathname).replace(/^(\.\.[/\\])+/, '');
    let targetFile = path.resolve(DIST_DIR, '.' + path.sep + safePath);

    // Verify resolved path stays strictly within DIST_DIR
    if (!targetFile.startsWith(DIST_DIR)) {
      return sendError(res, 403, 'Forbidden');
    }

    // If target is directory, look for index.html inside it
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).isDirectory()) {
      targetFile = path.join(targetFile, 'index.html');
    }

    // If file exists, serve it directly
    if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
      return serveStaticFile(req, res, targetFile);
    }

    // SPA Fallback: If not found, serve dist/index.html
    const indexPath = path.join(DIST_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      return serveStaticFile(req, res, indexPath);
    }

    sendError(res, 404, 'Not Found: Static assets not built. Run "npm run build" first.');
  });
}

export function startServer(port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000, host = '0.0.0.0') {
  const server = createProductionServer();
  server.listen(port, host, () => {
    console.log(`[Pujo Aurora] Production server running on http://${host}:${port}`);
    console.log(`[Pujo Aurora] Serving static assets from ${DIST_DIR}`);
  });
  return server;
}

// Start immediately when executed directly
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  startServer(port);
}
