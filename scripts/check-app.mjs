import { readFileSync, statSync } from 'node:fs';

const required = ['public/index.html', 'public/styles.css', 'public/src/app.js'];
for (const file of required) {
  const stat = statSync(file);
  if (!stat.isFile() || stat.size === 0) throw new Error(`${file} is missing or empty`);
}
const html = readFileSync('public/index.html', 'utf8');
const js = readFileSync('public/src/app.js', 'utf8');
for (const id of ['referenceImages', 'stickerType', 'uploadCount', 'stickerTexts', 'removeBgNow', 'generate', 'downloadZip', 'openLine']) {
  if (!html.includes(`id="${id}"`) || !js.includes(`$("${id}")`)) throw new Error(`Missing wired control: ${id}`);
}
for (const token of ['encodeApng', 'makeZip', 'removeBackgroundFromCanvas', 'OFFICIAL_SPECS']) {
  if (!js.includes(token)) throw new Error(`Missing implementation token: ${token}`);
}
new Function(js.replace(/^const \$ =.*$/m, ''));
console.log('Static app checks passed.');
