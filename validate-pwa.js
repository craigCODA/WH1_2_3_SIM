const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const fail = [];

function exists(rel) {
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) fail.push(`Missing ${rel}`);
  return p;
}

const manifestPath = exists('manifest.json');
const serviceWorkerPath = exists('service-worker.js');
exists('index.html');

let manifest = {};
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (err) {
  fail.push(`manifest.json is not valid JSON: ${err.message}`);
}

for (const key of ['name', 'short_name', 'start_url', 'scope', 'display', 'icons']) {
  if (!manifest[key]) fail.push(`manifest.json missing ${key}`);
}

if (manifest.prefer_related_applications === true) {
  fail.push('manifest.json prefer_related_applications must not be true');
}

if (!['fullscreen', 'standalone', 'minimal-ui'].includes(manifest.display)) {
  fail.push('manifest.json display must be fullscreen, standalone, or minimal-ui');
}

const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
const has192 = icons.some(icon => /\b192x192\b/.test(icon.sizes || ''));
const has512 = icons.some(icon => /\b512x512\b/.test(icon.sizes || '') && !String(icon.purpose || '').includes('maskable'));
const hasMaskable = icons.some(icon => /\b512x512\b/.test(icon.sizes || '') && String(icon.purpose || '').includes('maskable'));
if (!has192) fail.push('manifest.json needs a 192x192 icon');
if (!has512) fail.push('manifest.json needs a non-maskable 512x512 icon');
if (!hasMaskable) fail.push('manifest.json needs a maskable 512x512 icon');
for (const icon of icons) {
  if (icon.src) exists(icon.src.replace(/^\.\//, ''));
}

const sw = fs.existsSync(serviceWorkerPath) ? fs.readFileSync(serviceWorkerPath, 'utf8') : '';
if (!/addEventListener\(['"]fetch['"]/.test(sw)) fail.push('service-worker.js needs a fetch handler');
if (!/caches\.open/.test(sw)) fail.push('service-worker.js should open a cache for offline app shell support');

if (fail.length) {
  console.error('Android PWA check failed:');
  for (const item of fail) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Android PWA check passed.');
console.log('TWA note: add /.well-known/assetlinks.json after Android package id and release SHA-256 are known.');
