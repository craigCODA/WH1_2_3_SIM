const fs = require('fs');
const path = require('path');

const root = __dirname;
const indexPath = path.join(root, 'index.html');
const appScriptPath = path.join(root, 'app_script_consistent_teaching_final.js');

function extractInlineAppScript(html) {
  const openTag = '<script type="module">';
  const start = html.indexOf(openTag);
  if (start === -1) {
    throw new Error('Could not find inline app module in index.html');
  }

  const bodyStart = start + openTag.length;
  const end = html.indexOf('</script>', bodyStart);
  if (end === -1) {
    throw new Error('Could not find end of inline app module in index.html');
  }

  return html.slice(bodyStart, end).trim() + '\n';
}

const html = fs.readFileSync(indexPath, 'utf8');
const inlineAppScript = extractInlineAppScript(html);
const existingAppScript = fs.existsSync(appScriptPath)
  ? fs.readFileSync(appScriptPath, 'utf8')
  : '';

if (existingAppScript === inlineAppScript) {
  console.log('app_script_consistent_teaching_final.js is already in sync with index.html.');
  process.exit(0);
}

fs.writeFileSync(appScriptPath, inlineAppScript, 'utf8');
console.log('Synced app_script_consistent_teaching_final.js from the inline index.html app module.');
