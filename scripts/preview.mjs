// Serves the production build the way GitHub Pages does, to try it before deploying:
// `npm run build`, then `npm run preview` and open http://localhost:4300/Huda/ (or pass a port).
// A page x.html answers /x; a folder answers /x with a redirect to /x/, and /x/ with its
// index.html; any other address gets 404.html with the status 404.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/huda/browser/', import.meta.url));
const port = Number(process.argv[2]) || 4300;
const base =
  readFileSync(join(dist, 'index.html'), 'utf8').match(/<base href="([^"]*)"/)?.[1] ?? '/';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const isFile = (path) => existsSync(path) && statSync(path).isFile();
const send = (res, status, file) => {
  res.writeHead(status, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
};
const redirect = (res, location) => {
  res.writeHead(301, { Location: location });
  res.end();
};

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (path === base.slice(0, -1)) return redirect(res, base);
  const file = normalize(join(dist, path.slice(base.length)));
  if (!path.startsWith(base) || !file.startsWith(normalize(dist).replace(/[\\/]$/, ''))) {
    return send(res, 404, join(dist, '404.html'));
  }
  if (isFile(file)) return send(res, 200, file);
  if (existsSync(file)) {
    if (!path.endsWith('/')) return redirect(res, `${path}/`);
    if (isFile(join(file, 'index.html'))) return send(res, 200, join(file, 'index.html'));
  } else if (isFile(`${file.replace(/[\\/]$/, '')}.html`)) {
    return send(res, 200, `${file.replace(/[\\/]$/, '')}.html`);
  }
  send(res, 404, join(dist, '404.html'));
}).listen(port, () =>
  console.log(`GitHub Pages preview of dist/huda/browser: http://localhost:${port}${base}`),
);
