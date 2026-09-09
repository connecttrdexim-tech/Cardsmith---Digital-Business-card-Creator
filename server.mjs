import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleApi } from './server/api.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2' };

createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname.startsWith('/api/') && await handleApi(req, res, pathname) !== false) return;
  try {
    let target = path.join(dist, decodeURIComponent(pathname === '/' ? '/index.html' : pathname));
    if (!(target === dist || target.startsWith(`${dist}${path.sep}`)) || !(await stat(target)).isFile()) target = path.join(dist, 'index.html');
    const content = await readFile(target);
    res.writeHead(200, { 'Content-Type': `${mime[path.extname(target)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(content);
  } catch {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Build the app first with: npm run build');
  }
}).listen(port, () => console.log(`Cardsmith running at http://localhost:${port}`));
