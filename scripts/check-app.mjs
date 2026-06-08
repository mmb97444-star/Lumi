import { readFileSync, statSync } from 'node:fs';

const required = ['public/index.html', 'public/styles.css', 'public/src/app.js', '.github/workflows/deploy-pages.yml', 'README.md'];
for (const file of required) {
  const stat = statSync(file);
  if (!stat.isFile() || stat.size === 0) throw new Error(`${file} is missing or empty`);
}
const html = readFileSync('public/index.html', 'utf8');
const js = readFileSync('public/src/app.js', 'utf8');
const workflow = readFileSync('.github/workflows/deploy-pages.yml', 'utf8');
if (!html.includes('href="./styles.css"') || !html.includes('src="./src/app.js"')) {
  throw new Error('Static assets must use relative paths for GitHub Pages project URLs');
}
if (!html.includes('最多 10 張') || !html.includes('手機可直接選相簿')) {
  throw new Error('Mobile upload copy must mention 10 reference images');
}
if (!js.includes('slice(0, MAX_REFERENCE_IMAGES)') || !js.includes('detectedPhoto')) {
  throw new Error('Reference upload must enforce max image count and detect photo-like input');
}
if (!workflow.includes('actions/deploy-pages') || !workflow.includes('path: public')) {
  throw new Error('GitHub Pages workflow must deploy the public directory');
}
for (const id of ['referenceImages', 'stickerType', 'uploadCount', 'stickerTexts', 'removeBgNow', 'generate', 'downloadZip', 'openLine', 'trendTexts', 'textDatabase', 'importTrendTexts', 'useDatabaseTexts', 'copyDatabaseTexts', 'clearTextDatabase', 'photoStyle', 'treatAsPhoto']) {
  if (!html.includes(`id="${id}"`) || !js.includes(`$("${id}")`)) throw new Error(`Missing wired control: ${id}`);
}
for (const token of ['encodeApng', 'makeZip', 'removeBackgroundFromCanvas', 'OFFICIAL_SPECS', 'analyzeStickerIntent', 'saveTextDatabase', 'MAX_REFERENCE_IMAGES', 'applyPhotoStyle', 'estimatePhotoScore']) {
  if (!js.includes(token)) throw new Error(`Missing implementation token: ${token}`);
}
new Function(js.replace(/^const \$ =.*$/m, ''));
console.log('Static app checks passed.');
