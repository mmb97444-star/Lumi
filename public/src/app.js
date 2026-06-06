const $ = (id) => document.getElementById(id);

const OFFICIAL_SPECS = {
  sticker: {
    label: "一般貼圖",
    ext: "PNG",
    counts: [8, 16, 24, 32, 40],
    exportDefault: 40,
    canvas: { w: 370, h: 320 },
    main: { w: 240, h: 240 },
    tab: { w: 96, h: 74 },
    notes: ["貼圖圖像最大 370×320px", "PNG、透明背景、RGB、72dpi 以上", "寬高請使用偶數，單檔小於 1MB，ZIP 小於 60MB", "內容外側建議保留約 10px 邊界"]
  },
  animated: {
    label: "動態貼圖",
    ext: "APNG（副檔名 .png）",
    counts: [8, 16, 24],
    exportDefault: 24,
    canvas: { w: 320, h: 270 },
    main: { w: 240, h: 240, apng: true },
    tab: { w: 96, h: 74 },
    animated: true,
    notes: ["官方上架張數為 8、16 或 24；本工具仍會先產生 40 張候選", "APNG 最大 320×270px，寬或高至少 270px", "每個 APNG 5–20 幀、1–4 次循環、總播放時間不超過 4 秒", "RGB、透明背景、單檔小於 1MB"]
  },
  popup: {
    label: "全螢幕貼圖（Pop-up）",
    ext: "PNG + APNG",
    counts: [8, 16, 24],
    exportDefault: 24,
    canvas: { w: 370, h: 320 },
    popupCanvas: { w: 480, h: 480 },
    main: { w: 240, h: 240 },
    popupMain: { w: 480, h: 480, apng: true },
    tab: { w: 96, h: 74 },
    popup: true,
    notes: ["官方上架張數為 8、16 或 24；本工具先產生 40 張候選", "貼圖圖像最大 370×320px，Pop-up 圖最大 480×480px", "Pop-up 圖寬或高需剛好 480px；播放最多 3 秒、1–3 次循環、5–20 幀", "PNG/APNG 透明背景、RGB、單檔小於 1MB"]
  },
  big: {
    label: "大貼圖",
    ext: "PNG",
    counts: [8, 16, 24, 32, 40],
    exportDefault: 40,
    canvas: { w: 396, h: 660 },
    main: { w: 240, h: 240 },
    tab: { w: 96, h: 74 },
    notes: ["大貼圖尺寸最小 80×524px、最大 396×660px", "PNG、透明背景、RGB、72dpi 以上", "寬高請使用偶數，單檔小於 1MB，ZIP 小於 60MB", "系統會自動加入適當邊界"]
  },
  emoji: {
    label: "表情貼",
    ext: "PNG",
    counts: [8, 16, 24, 32, 40],
    exportDefault: 40,
    canvas: { w: 180, h: 180 },
    tab: { w: 96, h: 74 },
    notes: ["一般表情貼 8–40 張，每張 180×180px", "PNG、透明背景、RGB、72dpi 以上", "單檔小於 1MB，ZIP 小於 20MB", "建議粗深描邊、表情簡單清楚"]
  }
};

const FALLBACK_TEXTS = [
  "早安☀️", "收到", "謝謝💕", "加油!", "OK", "晚安🌙", "辛苦了", "太棒了", "哈哈", "拜託🥺",
  "沒問題", "等等我", "抱抱", "讚啦", "想你", "開心", "驚訝!", "哭哭", "生氣", "餓了",
  "出發", "回家", "快到了", "先忙", "恭喜", "放心", "可以", "不行啦", "耶!", "愛你",
  "救命", "好累", "喝水", "吃飯", "睡覺", "收到囉", "拍手", "閃亮✨", "謝啦", "明天見"
];
const EMOJIS = ["😊", "✨", "💚", "🌈", "⭐", "🥳", "😆", "🐾", "💤", "🔥", "🍀", "🌸"];
let references = [];
let generated = [];

function updateCounts() {
  const spec = OFFICIAL_SPECS[$("stickerType").value];
  $("uploadCount").innerHTML = spec.counts.map((count) => `<option value="${count}" ${count === spec.exportDefault ? "selected" : ""}>${count} 張</option>`).join("");
  renderSpecs();
}

function renderSpecs() {
  const type = $("stickerType").value;
  const spec = OFFICIAL_SPECS[type];
  const warning = spec.counts.includes(40) ? "" : `<div class="spec-warning">注意：${spec.label} 官方上架最多 ${Math.max(...spec.counts)} 張；工具會產生 40 張候選稿，下載上架 ZIP 時只放入你選擇的合規張數。</div>`;
  $("specPanel").innerHTML = `
    <h2>${spec.label}上架規格</h2>
    ${warning}
    <ul>${spec.notes.map((note) => `<li>${note}</li>`).join("")}</ul>
    <small>依 LINE Creators Market 官方 Guidelines：Stickers / Animated Stickers / Big Stickers / Pop-up stickers / Emoji 頁面整理。</small>
  `;
}

async function handleFiles(event) {
  const files = [...event.target.files].slice(0, 3);
  references = await Promise.all(files.map(fileToImageData));
  renderReferencePreview();
}

function fileToImageData(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      const max = 700;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      canvas.width = Math.max(2, Math.round(img.width * scale));
      canvas.height = Math.max(2, Math.round(img.height * scale));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve({ canvas, name: file.name });
    };
    img.onerror = reject;
    img.src = url;
  });
}

function renderReferencePreview() {
  $("referencePreview").innerHTML = "";
  references.forEach((ref) => {
    const img = new Image();
    img.src = ref.canvas.toDataURL("image/png");
    img.alt = ref.name;
    $("referencePreview").appendChild(img);
  });
}

function removeBackgroundFromCanvas(canvas, tolerance = 46) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const samplePoints = [0, canvas.width - 1, (canvas.height - 1) * canvas.width, canvas.height * canvas.width - 1];
  const samples = samplePoints.map((pixel) => [data[pixel * 4], data[pixel * 4 + 1], data[pixel * 4 + 2]]);
  for (let i = 0; i < data.length; i += 4) {
    const matched = samples.some(([r, g, b]) => Math.hypot(data[i] - r, data[i + 1] - g, data[i + 2] - b) < tolerance);
    const nearWhite = data[i] > 238 && data[i + 1] > 238 && data[i + 2] > 238;
    if (matched || nearWhite) data[i + 3] = Math.min(data[i + 3], 0);
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

function oneClickRemoveBg() {
  references.forEach((ref) => removeBackgroundFromCanvas(ref.canvas));
  renderReferencePreview();
  setStatus(`已完成 ${references.length} 張參考圖去背。`);
}

function parseTexts() {
  const input = $("stickerTexts").value.trim();
  const custom = input ? input.split(/[、,，\n]/).map((t) => t.trim()).filter(Boolean) : [];
  const style = $("stylePrompt").value.trim();
  return Array.from({ length: 40 }, (_, index) => {
    if (custom[index]) return custom[index];
    const base = FALLBACK_TEXTS[index % FALLBACK_TEXTS.length];
    if (index % 4 === 1) return `${base}${EMOJIS[index % EMOJIS.length]}`;
    if (index % 5 === 2 && style.includes("可愛")) return `${base}~`;
    return base;
  });
}

function makeCanvas(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

async function generateAll() {
  const type = $("stickerType").value;
  const spec = OFFICIAL_SPECS[type];
  if ($("removeBg").checked) references.forEach((ref) => removeBackgroundFromCanvas(ref.canvas));
  const texts = parseTexts();
  generated = [];
  $("gallery").innerHTML = "";
  for (let i = 0; i < 40; i += 1) {
    const canvas = drawSticker(spec, i, texts[i], spec.canvas);
    generated.push({ index: i + 1, text: texts[i], canvas, spec });
    addCard(canvas, i + 1, texts[i], spec);
    if (i % 8 === 7) await nextFrame();
  }
  $("downloadZip").disabled = false;
  setStatus(`完成：已產生 40 張候選${spec.ext}，下載 ZIP 時會依 ${spec.label} 規格輸出 ${$("uploadCount").value} 張上架檔。`);
}

function drawSticker(spec, index, text, size, frame = 0, frameCount = 1) {
  const canvas = makeCanvas(size.w, size.h);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size.w, size.h);
  const margin = $("safeMargins").checked ? Math.max(8, Math.round(Math.min(size.w, size.h) * 0.04)) : 0;
  const cx = size.w / 2;
  const cy = size.h / 2;
  const pulse = Math.sin((frame / frameCount) * Math.PI * 2) * 0.05;
  const rotation = ((index % 7) - 3) * 0.035 + pulse;
  const ref = references[index % Math.max(1, references.length)];

  ctx.save();
  ctx.translate(cx, cy - (text && $("withText").checked ? size.h * 0.08 : 0));
  ctx.rotate(rotation);
  if (ref) {
    drawReferenceSticker(ctx, ref.canvas, size, index, pulse, margin);
  } else {
    drawMascot(ctx, size, index, pulse);
  }
  ctx.restore();

  drawDecorations(ctx, size, index, frame);
  if (text && $("withText").checked && index % 6 !== 4) drawStickerText(ctx, text, size, index);
  return canvas;
}

function drawReferenceSticker(ctx, image, size, index, pulse, margin) {
  const maxW = size.w - margin * 2;
  const maxH = size.h * (size.h > size.w ? 0.64 : 0.7) - margin;
  const scale = Math.min(maxW / image.width, maxH / image.height) * (0.88 + (index % 5) * 0.025 + pulse);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.shadowColor = "rgba(0,0,0,.22)";
  ctx.shadowBlur = 10;
  ctx.lineJoin = "round";
  ctx.drawImage(image, -w / 2 + Math.sin(index) * 4, -h / 2, w, h);
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
}

function drawMascot(ctx, size, index, pulse) {
  const r = Math.min(size.w, size.h) * (0.26 + pulse);
  const colors = ["#7de38d", "#ffd166", "#8ec5ff", "#ff8fab", "#cdb4db"];
  ctx.fillStyle = colors[index % colors.length];
  ctx.strokeStyle = "#10231b";
  ctx.lineWidth = Math.max(5, r * 0.08);
  roundedBlob(ctx, 0, 0, r, index);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#10231b";
  ctx.beginPath(); ctx.arc(-r * .32, -r * .1, r * .08, 0, Math.PI * 2); ctx.arc(r * .32, -r * .1, r * .08, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = Math.max(3, r * .04);
  ctx.beginPath(); ctx.arc(0, r * .12, r * .24, 0, Math.PI); ctx.stroke();
}

function roundedBlob(ctx, x, y, r, seed) {
  ctx.beginPath();
  for (let a = 0; a <= Math.PI * 2 + .1; a += Math.PI / 8) {
    const rr = r * (1 + Math.sin(a * 3 + seed) * .08);
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawDecorations(ctx, size, index, frame) {
  const colors = ["#06c755", "#ffcc00", "#ff6b6b", "#4dabf7", "#b197fc"];
  ctx.save();
  ctx.globalAlpha = 0.85;
  for (let i = 0; i < 5; i += 1) {
    const x = ((index * 37 + i * 61 + frame * 11) % size.w);
    const y = ((index * 53 + i * 43 + frame * 7) % size.h);
    ctx.fillStyle = colors[(index + i) % colors.length];
    ctx.beginPath();
    if (i % 2) ctx.arc(x, y, 4 + (index % 4), 0, Math.PI * 2);
    else star(ctx, x, y, 7 + (index % 5));
    ctx.fill();
  }
  ctx.restore();
}

function star(ctx, x, y, r) {
  for (let i = 0; i < 10; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * .45 : r;
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function drawStickerText(ctx, text, size, index) {
  const maxWidth = size.w * 0.9;
  const fontSize = Math.max(18, Math.min(size.w, size.h) * (text.length > 6 ? 0.12 : 0.16));
  const y = size.h - Math.max(18, size.h * 0.12);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${fontSize}px "Noto Sans TC", "Microsoft JhengHei", sans-serif`;
  ctx.lineJoin = "round";
  ctx.strokeStyle = "white";
  ctx.lineWidth = Math.max(7, fontSize * .22);
  wrapText(ctx, text, size.w / 2, y, maxWidth, fontSize * 1.08, true);
  ctx.strokeStyle = "#10231b";
  ctx.lineWidth = Math.max(3, fontSize * .09);
  wrapText(ctx, text, size.w / 2, y, maxWidth, fontSize * 1.08, true);
  ctx.fillStyle = ["#06c755", "#ff6b6b", "#228be6", "#f08c00"][index % 4];
  wrapText(ctx, text, size.w / 2, y, maxWidth, fontSize * 1.08, false);
  ctx.restore();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, strokeOnly) {
  const chars = [...text];
  const lines = [""];
  chars.forEach((char) => {
    const test = lines.at(-1) + char;
    if (ctx.measureText(test).width > maxWidth && lines.at(-1)) lines.push(char);
    else lines[lines.length - 1] = test;
  });
  const start = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => strokeOnly ? ctx.strokeText(line, x, start + i * lineHeight) : ctx.fillText(line, x, start + i * lineHeight));
}

function addCard(canvas, index, text, spec) {
  const card = document.createElement("article");
  card.className = "card";
  card.appendChild(canvas);
  const label = document.createElement("small");
  label.textContent = `${String(index).padStart(2, "0")} · ${spec.label}${text ? ` · ${text}` : ""}`;
  card.appendChild(label);
  $("gallery").appendChild(card);
}

async function downloadZip() {
  if (!generated.length) return;
  const type = $("stickerType").value;
  const spec = OFFICIAL_SPECS[type];
  const count = Number($("uploadCount").value);
  const files = [];
  const selected = generated.slice(0, count);
  files.push({ name: "README_LINE_UPLOAD_CHECKLIST.txt", data: textBytes(makeChecklist(spec, count)) });
  if (spec.main) files.push({ name: "main.png", data: await canvasToBytes(resizeCanvas(selected[0].canvas, spec.main.w, spec.main.h)) });
  if (spec.popupMain) files.push({ name: "popup/main.png", data: await makeApngBytes(spec.popupMain, 0, selected[0].text) });
  files.push({ name: "tab.png", data: await canvasToBytes(resizeCanvas(selected[0].canvas, spec.tab.w, spec.tab.h)) });

  for (const item of selected) {
    const n = String(item.index).padStart(2, "0");
    if (spec.animated) files.push({ name: `${n}.png`, data: await makeApngBytes(spec.canvas, item.index - 1, item.text) });
    else files.push({ name: `${n}.png`, data: await canvasToBytes(item.canvas) });
    if (spec.popup) {
      files.push({ name: `popup/${n}.png`, data: await makeApngBytes(spec.popupCanvas, item.index - 1, item.text) });
    }
  }
  const zip = makeZip(files);
  downloadBlob(new Blob([zip], { type: "application/zip" }), `line-${type}-${count}-upload-ready.zip`);
  setStatus(`已輸出 ${files.length} 個檔案。若 LINE 審核頁顯示單檔超過 1MB，請減少參考圖細節或文字長度後重新輸出。`);
}

function makeChecklist(spec, count) {
  return [
    `${spec.label} 上架包`,
    `輸出張數：${count}`,
    `圖片格式：${spec.ext}`,
    "檔名：main.png、tab.png、01.png...",
    "請於 LINE Creators Market 新增商品後，上傳本 ZIP。",
    "本工具已依官方最大尺寸、透明背景、偶數尺寸與 APNG 幀數產出；請仍以 LINE 上傳驗證結果為準。",
    "官方入口：https://creator.line.me/"
  ].join("\n");
}

async function makeApngBytes(size, index, text) {
  const frameCount = 8;
  const pngFrames = [];
  for (let f = 0; f < frameCount; f += 1) {
    const canvas = drawSticker(OFFICIAL_SPECS[$("stickerType").value], index, text, size, f, frameCount);
    pngFrames.push(await canvasToBytes(canvas));
  }
  return encodeApng(pngFrames, size.w, size.h, 100, 4);
}

function encodeApng(pngFrames, width, height, delayMs, loops) {
  const parsed = pngFrames.map(parsePng);
  const out = [PNG_SIGNATURE, makeChunk("IHDR", parsed[0].ihdr), makeChunk("acTL", u32(parsed.length, loops))];
  let seq = 0;
  parsed.forEach((frame, idx) => {
    out.push(makeChunk("fcTL", concatBytes(u32(seq++), u32(width, height), u32(0, 0), u16be(delayMs, 1000), new Uint8Array([0, 0]))));
    if (idx === 0) frame.idats.forEach((idat) => out.push(makeChunk("IDAT", idat)));
    else frame.idats.forEach((idat) => out.push(makeChunk("fdAT", concatBytes(u32(seq++), idat))));
  });
  out.push(makeChunk("IEND", new Uint8Array()));
  return concatBytes(...out);
}

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
function parsePng(bytes) {
  let pos = 8;
  let ihdr = null;
  const idats = [];
  while (pos < bytes.length) {
    const len = readU32(bytes, pos); pos += 4;
    const type = String.fromCharCode(...bytes.slice(pos, pos + 4)); pos += 4;
    const data = bytes.slice(pos, pos + len); pos += len + 4;
    if (type === "IHDR") ihdr = data;
    if (type === "IDAT") idats.push(data);
  }
  return { ihdr, idats };
}

function makeChunk(type, data) {
  const typeBytes = textBytes(type);
  const chunk = concatBytes(u32(data.length), typeBytes, data, u32(crc32(concatBytes(typeBytes, data))));
  return chunk;
}

function makeZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  files.forEach((file) => {
    const name = textBytes(file.name);
    const crc = crc32(file.data);
    const local = concatBytes(
      u32le(0x04034b50), u16(20, 0, 0, 0, 0, 0), u32le(crc), u32le(file.data.length), u32le(file.data.length), u16(name.length, 0), name, file.data
    );
    localParts.push(local);
    centralParts.push(concatBytes(
      u32le(0x02014b50), u16(20, 20, 0, 0, 0, 0, 0), u32le(crc), u32le(file.data.length), u32le(file.data.length),
      u16(name.length, 0, 0, 0, 0), u32le(0), u32le(offset), name
    ));
    offset += local.length;
  });
  const central = concatBytes(...centralParts);
  const end = concatBytes(u32le(0x06054b50), u16(0, 0, files.length, files.length), u32le(central.length), u32le(offset), u16(0));
  return concatBytes(...localParts, central, end);
}

function crc32(bytes) {
  let crc = -1;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ bytes[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function resizeCanvas(source, w, h) {
  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext("2d");
  const scale = Math.min(w / source.width, h / source.height) * 0.92;
  const dw = source.width * scale;
  const dh = source.height * scale;
  ctx.drawImage(source, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return canvas;
}

function canvasToBytes(canvas) {
  return new Promise((resolve) => canvas.toBlob((blob) => blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer))), "image/png"));
}
function textBytes(text) { return new TextEncoder().encode(text); }
function u16(...values) { const b = new Uint8Array(values.length * 2); const v = new DataView(b.buffer); values.forEach((n, i) => v.setUint16(i * 2, n, true)); return b; }
function u16be(...values) { const b = new Uint8Array(values.length * 2); const v = new DataView(b.buffer); values.forEach((n, i) => v.setUint16(i * 2, n, false)); return b; }
function u32(...values) { const b = new Uint8Array(values.length * 4); const v = new DataView(b.buffer); values.forEach((n, i) => v.setUint32(i * 4, n >>> 0, false)); return b; }
function u32le(...values) { const b = new Uint8Array(values.length * 4); const v = new DataView(b.buffer); values.forEach((n, i) => v.setUint32(i * 4, n >>> 0, true)); return b; }
function readU32(bytes, pos) { return new DataView(bytes.buffer, bytes.byteOffset + pos, 4).getUint32(0, false); }
function concatBytes(...arrays) { const total = arrays.reduce((sum, a) => sum + a.length, 0); const out = new Uint8Array(total); let pos = 0; arrays.forEach((a) => { out.set(a, pos); pos += a.length; }); return out; }
function nextFrame() { return new Promise((resolve) => requestAnimationFrame(resolve)); }
function downloadBlob(blob, filename) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1200); }
function setStatus(message) { $("status").textContent = message; }
function openLineCreator() { window.open("https://creator.line.me/", "_blank", "noopener,noreferrer"); }

$("stickerType").addEventListener("change", updateCounts);
$("referenceImages").addEventListener("change", handleFiles);
$("removeBgNow").addEventListener("click", oneClickRemoveBg);
$("generate").addEventListener("click", generateAll);
$("downloadZip").addEventListener("click", downloadZip);
$("openLine").addEventListener("click", openLineCreator);
updateCounts();
