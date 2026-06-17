const fs = require('fs');
const path = require('path');

const root = __dirname;
const fail = [];

function exists(rel) {
  const normalized = String(rel || '').replace(/^\.\//, '').replace(/^\/WH1_2_3_SIM\//, '');
  const p = path.join(root, normalized || 'index.html');
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

if (manifest.start_url !== '/WH1_2_3_SIM/') {
  fail.push('manifest.json start_url should be /WH1_2_3_SIM/ for the current GitHub Pages project URL');
}

if (manifest.scope !== '/WH1_2_3_SIM/') {
  fail.push('manifest.json scope should be /WH1_2_3_SIM/ for the current GitHub Pages project URL');
}

const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
const has192 = icons.some(icon => /\b192x192\b/.test(icon.sizes || ''));
const has512 = icons.some(icon => /\b512x512\b/.test(icon.sizes || '') && !String(icon.purpose || '').includes('maskable'));
const hasMaskable = icons.some(icon => /\b512x512\b/.test(icon.sizes || '') && String(icon.purpose || '').includes('maskable'));
if (!has192) fail.push('manifest.json needs a 192x192 icon');
if (!has512) fail.push('manifest.json needs a non-maskable 512x512 icon');
if (!hasMaskable) fail.push('manifest.json needs a maskable 512x512 icon');
for (const icon of icons) {
  if (icon.src) exists(icon.src);
}
for (const screenshot of Array.isArray(manifest.screenshots) ? manifest.screenshots : []) {
  if (screenshot.src) exists(screenshot.src);
}

const html = fs.existsSync(path.join(root, 'index.html')) ? fs.readFileSync(path.join(root, 'index.html'), 'utf8') : '';
if (!html.includes('rel="manifest"')) fail.push('index.html needs a manifest link');
if (!html.includes('/WH1_2_3_SIM/manifest.json')) fail.push('index.html should link the GitHub Pages project manifest path');
if (!html.includes("const serviceWorkerUrl = '/WH1_2_3_SIM/service-worker.js'") ||
    !html.includes("const serviceWorkerScope = '/WH1_2_3_SIM/'") ||
    !html.includes('navigator.serviceWorker.register(serviceWorkerUrl, { scope: serviceWorkerScope })')) {
  fail.push('index.html should register /WH1_2_3_SIM/service-worker.js with project scope');
}

function extractInlineAppScript(source) {
  const openTag = '<script type="module">';
  const start = source.indexOf(openTag);
  if (start === -1) return null;

  const bodyStart = start + openTag.length;
  const end = source.indexOf('</script>', bodyStart);
  if (end === -1) return null;

  return source.slice(bodyStart, end).trim();
}

const inlineAppScript = extractInlineAppScript(html);
const appScriptPath = path.join(root, 'app_script_consistent_teaching_final.js');
if (!inlineAppScript) {
  fail.push('index.html needs the inline Plant 076 app module');
} else if (!fs.existsSync(appScriptPath)) {
  fail.push('app_script_consistent_teaching_final.js is missing');
} else {
  const externalAppScript = fs.readFileSync(appScriptPath, 'utf8').trim();
  if (externalAppScript !== inlineAppScript) {
    fail.push('app_script_consistent_teaching_final.js is out of sync with the inline index.html app module; run node sync-app-script.js');
  }
}

const sw = fs.existsSync(serviceWorkerPath) ? fs.readFileSync(serviceWorkerPath, 'utf8') : '';
if (!/addEventListener\(['"]fetch['"]/.test(sw)) fail.push('service-worker.js needs a fetch handler');
if (!/caches\.open/.test(sw)) fail.push('service-worker.js should open a cache for offline app shell support');
if (!sw.includes("const BASE_PATH = '/WH1_2_3_SIM/'")) fail.push('service-worker.js should cache the GitHub Pages project path');

if (fail.length) {
  console.error('Android PWA check failed:');
  for (const item of fail) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Android PWA check passed.');
console.log('TWA note: add https://craig-coda.github.io/.well-known/assetlinks.json after Android package id and release SHA-256 are known.');
