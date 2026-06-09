const $ = (id) => document.getElementById(id);
const MAX_REFERENCE_IMAGES = 10;

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

const STORAGE_KEY = "lumi.stickerTextDatabase.v1";
const TRENDING_SEED_TEXTS = [
  "今日也辛苦了", "先不要", "我沒事", "請支援收銀", "社畜模式 ON", "好想下班", "快樂水時間", "先躺一下",
  "尊重友善包容", "這我不懂", "收到收到", "不要叫我", "情緒穩定", "先喝一口", "給你一朵花", "突然開心",
  "醒醒該上班了", "已讀不回中", "等等我啦", "救命好可愛", "我就爛", "安靜離開", "超派", "蛤？"
];
const EXPRESSION_RULES = [
  { id: "happy", label: "開心", color: "#06c755", emojis: ["😄", "💕", "🌸"], keywords: ["哈", "笑", "開心", "快樂", "讚", "棒", "耶", "愛", "喜", "恭喜", "可愛"] },
  { id: "angry", label: "生氣", color: "#ff4d4f", emojis: ["💢", "🔥", "!"], keywords: ["怒", "生氣", "不爽", "氣", "煩", "吵", "不要", "不行", "閉嘴"] },
  { id: "cry", label: "哭哭", color: "#4dabf7", emojis: ["😭", "💧", "🥺"], keywords: ["哭", "淚", "難過", "委屈", "救命", "拜託", "心碎"] },
  { id: "surprised", label: "驚訝", color: "#845ef7", emojis: ["😲", "❗", "⚡"], keywords: ["蛤", "咦", "哇", "驚", "真的假的", "什麼", "？", "?"] },
  { id: "sleepy", label: "疲倦", color: "#5c7cfa", emojis: ["😴", "💤", "🌙"], keywords: ["睡", "晚安", "累", "睏", "躺", "休息", "下班", "失神", "醒醒"] },
  { id: "shy", label: "害羞", color: "#f783ac", emojis: ["😳", "💗", "✨"], keywords: ["害羞", "謝謝", "想你", "抱", "親", "愛你"] },
  { id: "smug", label: "得意", color: "#f59f00", emojis: ["😏", "😎", "👍"], keywords: ["懂", "可以", "沒問題", "掌聲", "超派", "帥", "chill", "尊重"] },
  { id: "confused", label: "疑惑", color: "#7048e8", emojis: ["🤔", "❓", "🌀"], keywords: ["不懂", "疑惑", "不理解", "為什麼", "怎樣", "隨便", "都行"] }
];
const POSE_RULES = [
  { id: "phone", label: "接電話", keywords: ["喂", "電話", "call", "找我"] },
  { id: "armsUp", label: "舉手歡呼", keywords: ["耶", "加油", "掌聲", "恭喜", "棒", "衝", "出發", "gg", "讚"] },
  { id: "sleeping", label: "躺平睡覺", keywords: ["睡", "晚安", "躺", "累", "休息", "下班", "明天", "睏"] },
  { id: "working", label: "社畜工作", keywords: ["工作", "上班", "會議", "老闆", "社畜", "收銀", "先忙", "忙"] },
  { id: "eating", label: "吃吃喝喝", keywords: ["吃", "餓", "飯", "喝", "水", "飲料", "快樂水", "香蕉"] },
  { id: "hug", label: "抱抱送愛", keywords: ["抱", "想你", "愛", "謝謝", "花", "可愛", "安慰"] },
  { id: "facepalm", label: "扶額傻眼", keywords: ["傻眼", "失神", "蛤", "不懂", "救命", "胡說八道", "不理解"] },
  { id: "chill", label: "放鬆漂浮", keywords: ["chill", "隨便", "都行", "沒事", "安靜", "離開", "漂"] },
  { id: "jump", label: "飛跳撒花", keywords: ["飛", "跳", "雲端", "開心", "派對", "閃亮"] },
  { id: "bow", label: "低頭拜託", keywords: ["拜託", "跪", "求", "不好意思", "抱歉", "謝罪"] },
  { id: "dizzy", label: "暈眩轉圈", keywords: ["暈", "忙瘋", "混亂", "昏", "不行了"] },
  { id: "peek", label: "探頭偷看", keywords: ["看看", "偷看", "在嗎", "嗨", "哈囉", "等等"] },
  { id: "umbrella", label: "撐傘散步", keywords: ["雨", "傘", "不錯", "保護", "撐"] },
  { id: "nope", label: "拒絕揮手", keywords: ["不要", "不管", "不想", "拒絕", "不可以", "不"] },
  { id: "crawl", label: "趴地爬行", keywords: ["爬", "不想動", "懶", "拖延", "趴"] },
  { id: "cheek", label: "托腮賣萌", keywords: ["可愛", "乖", "萌", "撒嬌", "啾"] }
];

function uniqueTexts(list) {
  const seen = new Set();
  return list.map((text) => text.trim()).filter((text) => text && !seen.has(text) && seen.add(text));
}

function loadTextDatabase() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return uniqueTexts([...saved, ...TRENDING_SEED_TEXTS, ...FALLBACK_TEXTS]);
  } catch {
    return uniqueTexts([...TRENDING_SEED_TEXTS, ...FALLBACK_TEXTS]);
  }
}

let textDatabase = loadTextDatabase();
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
  const files = [...event.target.files].slice(0, MAX_REFERENCE_IMAGES);
  references = await Promise.all(files.map(fileToImageData));
  applyReferenceStyles();
  setStatus(`已載入 ${references.length} 張參考圖${event.target.files.length > MAX_REFERENCE_IMAGES ? `（最多只取前 ${MAX_REFERENCE_IMAGES} 張）` : ""}。`);
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
      const photoScore = estimatePhotoScore(canvas);
      resolve({ sourceCanvas: canvas, canvas: cloneCanvas(canvas), name: file.name, photoScore, detectedPhoto: photoScore > 0.52 });
    };
    img.onerror = reject;
    img.src = url;
  });
}

function renderReferencePreview() {
  $("referencePreview").innerHTML = "";
  references.forEach((ref, index) => {
    const item = document.createElement("figure");
    item.className = "reference-item";
    const img = new Image();
    img.src = ref.canvas.toDataURL("image/png");
    img.alt = ref.name;
    const cap = document.createElement("figcaption");
    cap.textContent = `${String(index + 1).padStart(2, "0")} · ${ref.styleLabel}${ref.detectedPhoto ? " · 寫實偵測" : ""}`;
    item.append(img, cap);
    $("referencePreview").appendChild(item);
  });
}

function cloneCanvas(source) {
  const canvas = makeCanvas(source.width, source.height);
  canvas.getContext("2d").drawImage(source, 0, 0);
  return canvas;
}

function estimatePhotoScore(canvas) {
  const sample = makeCanvas(80, 80);
  const ctx = sample.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(canvas, 0, 0, sample.width, sample.height);
  const data = ctx.getImageData(0, 0, sample.width, sample.height).data;
  let colorVariance = 0;
  let midToneCount = 0;
  let edgeCount = 0;
  let previousLuma = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const luma = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    colorVariance += (max - min) / 255;
    if (luma > 0.18 && luma < 0.88) midToneCount += 1;
    if (Math.abs(luma - previousLuma) > 0.08) edgeCount += 1;
    previousLuma = luma;
  }
  const total = data.length / 4;
  return Math.min(1, colorVariance / total * 0.45 + midToneCount / total * 0.35 + edgeCount / total * 0.2);
}

function getReferenceStyle(ref) {
  const selected = $("photoStyle").value;
  if (selected === "auto") return ($("treatAsPhoto").checked || ref.detectedPhoto) ? "handdrawn" : "original";
  return selected;
}

function applyReferenceStyles() {
  references = references.map((ref) => {
    const style = getReferenceStyle(ref);
    return { ...ref, canvas: applyPhotoStyle(ref.sourceCanvas, style), style, styleLabel: getPhotoStyleLabel(style) };
  });
  renderReferencePreview();
}

function getPhotoStyleLabel(style) {
  return {
    original: "原圖",
    handdrawn: "手繪風",
    chibi: "Q版",
    literary: "文青風",
    watercolor: "水彩風",
    comic: "漫畫風"
  }[style] || "自動";
}

function applyPhotoStyle(source, style) {
  const canvas = cloneCanvas(source);
  if (style === "original") return canvas;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const filterMap = {
    handdrawn: "saturate(1.25) contrast(1.18) brightness(1.06)",
    chibi: "saturate(1.45) contrast(1.08) brightness(1.12)",
    literary: "sepia(.18) saturate(.72) contrast(.92) brightness(1.08)",
    watercolor: "saturate(1.15) contrast(.82) brightness(1.14) blur(.4px)",
    comic: "saturate(1.35) contrast(1.5) brightness(1.04)"
  };
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.filter = filterMap[style] || "none";
  ctx.drawImage(source, 0, 0);
  ctx.filter = "none";
  posterizeCanvas(canvas, style);
  drawStyleFinish(canvas, style);
  return canvas;
}

function posterizeCanvas(canvas, style) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const steps = style === "literary" ? 24 : style === "watercolor" ? 32 : 38;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 10) continue;
    data[i] = Math.round(data[i] / steps) * steps;
    data[i + 1] = Math.round(data[i + 1] / steps) * steps;
    data[i + 2] = Math.round(data[i + 2] / steps) * steps;
    if (style === "literary") data[i + 3] = Math.min(255, data[i + 3] * 0.96);
  }
  ctx.putImageData(image, 0, 0);
}

function drawStyleFinish(canvas, style) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (["handdrawn", "chibi", "comic"].includes(style)) drawInkEdges(ctx, canvas.width, canvas.height, style === "comic" ? 36 : 48);
  if (style === "chibi") drawChibiBubble(ctx, canvas.width, canvas.height);
  if (style === "literary" || style === "watercolor") drawPaperTexture(ctx, canvas.width, canvas.height, style);
  if (style === "comic") drawComicDots(ctx, canvas.width, canvas.height);
}

function drawInkEdges(ctx, width, height, threshold) {
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  ctx.save();
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = "#111827";
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const i = (y * width + x) * 4;
      const j = (y * width + x + 1) * 4;
      const k = ((y + 1) * width + x) * 4;
      if (data[i + 3] < 20) continue;
      const d = Math.abs(data[i] - data[j]) + Math.abs(data[i + 1] - data[j + 1]) + Math.abs(data[i + 2] - data[j + 2]) + Math.abs(data[i] - data[k]);
      if (d > threshold) ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.restore();
}

function drawChibiBubble(ctx, width, height) {
  const radius = Math.min(width, height) * 0.18;
  ctx.save();
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "rgba(255, 255, 255, .88)";
  ctx.beginPath();
  ctx.roundRect(width * 0.04, height * 0.04, width * 0.92, height * 0.92, radius);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = Math.max(8, Math.min(width, height) * 0.035);
  ctx.beginPath();
  ctx.roundRect(width * 0.04, height * 0.04, width * 0.92, height * 0.92, radius);
  ctx.stroke();
  ctx.restore();
}

function drawPaperTexture(ctx, width, height, style) {
  ctx.save();
  ctx.globalAlpha = style === "watercolor" ? 0.16 : 0.1;
  for (let i = 0; i < 220; i += 1) {
    const tone = 210 + (i % 35);
    ctx.fillStyle = `rgb(${tone}, ${tone - 5}, ${tone - 16})`;
    ctx.fillRect((i * 37) % width, (i * 53) % height, 1 + (i % 3), 1 + (i % 2));
  }
  ctx.restore();
}

function drawComicDots(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#111827";
  for (let y = 6; y < height; y += 12) {
    for (let x = 6; x < width; x += 12) {
      ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
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
  references.forEach((ref) => {
    removeBackgroundFromCanvas(ref.sourceCanvas);
    removeBackgroundFromCanvas(ref.canvas);
  });
  applyReferenceStyles();
  setStatus(`已完成 ${references.length} 張參考圖去背。`);
}

function parseTexts() {
  const input = $("stickerTexts").value.trim();
  const custom = splitTextCandidates(input);
  const style = $("stylePrompt").value.trim();
  const promptWords = splitTextCandidates(style).filter((word) => word.length <= 8);
  const pool = uniqueTexts([...custom, ...textDatabase, ...promptWords, ...FALLBACK_TEXTS]);
  return Array.from({ length: 40 }, (_, index) => {
    if (custom[index]) return custom[index];
    const base = pool[index % pool.length] || FALLBACK_TEXTS[index % FALLBACK_TEXTS.length];
    if (index % 4 === 1 && !/[😊✨💚🌈⭐🥳😆🐾💤🔥🍀🌸]$/.test(base)) return `${base}${EMOJIS[index % EMOJIS.length]}`;
    if (index % 5 === 2 && style.includes("可愛") && !base.endsWith("~")) return `${base}~`;
    return base;
  });
}

function splitTextCandidates(input) {
  return uniqueTexts(input.split(/[、,，\n;；|]/).map((text) => text.replace(/^[\s#・*-]+|[\s#・*-]+$/g, "")));
}

function findIntentRule(text, rules) {
  const normalized = String(text || "").toLowerCase();
  const matches = rules.flatMap((rule) => rule.keywords
    .filter((keyword) => normalized.includes(keyword.toLowerCase()))
    .map((keyword) => ({ rule, score: keyword.length })));
  matches.sort((a, b) => b.score - a.score);
  return matches[0]?.rule;
}

function expressionForPose(pose, index) {
  const defaults = {
    phone: "surprised",
    armsUp: "happy",
    sleeping: "sleepy",
    working: "sleepy",
    eating: "smug",
    hug: "shy",
    facepalm: "confused",
    chill: "smug",
    jump: "happy",
    bow: "shy",
    dizzy: "confused",
    peek: "surprised",
    umbrella: "smug",
    nope: "angry",
    crawl: "sleepy",
    cheek: "shy"
  };
  const fallbackId = defaults[pose.id];
  return EXPRESSION_RULES.find((rule) => rule.id === fallbackId) || EXPRESSION_RULES[index % EXPRESSION_RULES.length];
}

function analyzeStickerIntent(text, index) {
  // Text should drive each sticker's emotion and pose. The global style prompt must not
  // force every generated sticker into the same "happy / hug" template.
  const pose = findIntentRule(text, POSE_RULES) || POSE_RULES[index % POSE_RULES.length];
  const expression = findIntentRule(text, EXPRESSION_RULES) || expressionForPose(pose, index);
  const motion = expression.id === "angry" || ["nope", "dizzy"].includes(pose.id) ? "shake" : expression.id === "sleepy" || ["chill", "umbrella"].includes(pose.id) ? "float" : expression.id === "cry" ? "drop" : ["armsUp", "jump"].includes(pose.id) ? "bounce" : "idle";
  return { expression, pose, motion, variant: index % 6 };
}

function saveTextDatabase(nextTexts) {
  textDatabase = uniqueTexts(nextTexts).slice(0, 240);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(textDatabase));
  renderTextDatabase();
}

function renderTextDatabase() {
  const box = $("textDatabase");
  if (!box) return;
  box.value = textDatabase.join("、");
  $("databaseCount").textContent = `${textDatabase.length} 句`;
}

async function copyDatabaseTexts() {
  await navigator.clipboard.writeText(textDatabase.join("、"));
  setStatus(`已複製 ${textDatabase.length} 句貼圖文字，可貼到文字欄或作為外部參考。`);
}

function importTrendTexts() {
  const incoming = splitTextCandidates($("trendTexts").value);
  if (!incoming.length) {
    setStatus("請先把新貼圖頁看到的文字貼到『新貼圖文字追蹤』欄位。");
    return;
  }
  saveTextDatabase([...incoming, ...textDatabase]);
  $("trendTexts").value = "";
  setStatus(`已追蹤並加入 ${incoming.length} 句新貼圖文字，之後產生貼圖會優先參考這些流行語。`);
}

function useDatabaseTexts() {
  $("stickerTexts").value = textDatabase.slice(0, 40).join("、");
  setStatus("已把資料庫前 40 句填入貼圖文字欄，可直接生成或再微調。 ");
}

function clearTextDatabase() {
  saveTextDatabase([...TRENDING_SEED_TEXTS, ...FALLBACK_TEXTS]);
  setStatus("已重置貼圖文字資料庫為內建熱門參考句。 ");
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
  saveTextDatabase([...texts, ...textDatabase]);
  for (let i = 0; i < 40; i += 1) {
    const intent = analyzeStickerIntent(texts[i], i);
    const canvas = drawSticker(spec, i, texts[i], spec.canvas, 0, 1, intent);
    generated.push({ index: i + 1, text: texts[i], canvas, spec, intent });
    addCard(canvas, i + 1, texts[i], spec, intent);
    if (i % 8 === 7) await nextFrame();
  }
  $("downloadZip").disabled = false;
  setStatus(`完成：已產生 40 張候選${spec.ext}，下載 ZIP 時會依 ${spec.label} 規格輸出 ${$("uploadCount").value} 張上架檔。`);
}

function drawSticker(spec, index, text, size, frame = 0, frameCount = 1, intent = analyzeStickerIntent(text, index)) {
  const canvas = makeCanvas(size.w, size.h);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, size.w, size.h);
  const margin = $("safeMargins").checked ? Math.max(8, Math.round(Math.min(size.w, size.h) * 0.04)) : 0;
  const cx = size.w / 2;
  const cy = size.h / 2;
  const phase = (frame / frameCount) * Math.PI * 2;
  const pulse = Math.sin(phase) * 0.05;
  const rotation = ((index % 7) - 3) * 0.035 + (intent.motion === "shake" ? Math.sin(phase * 2) * 0.09 : pulse * 0.65);
  const motionY = intent.motion === "bounce" ? Math.sin(phase) * 10 : intent.motion === "float" ? Math.sin(phase) * 6 : 0;
  const motionX = intent.motion === "shake" ? Math.sin(phase * 2) * 7 : 0;
  const poseTransform = getPoseTransform(intent.pose.id, index, pulse);
  const ref = references[index % Math.max(1, references.length)];

  drawIntentBackdrop(ctx, size, intent, index, frame);
  ctx.save();
  ctx.translate(cx + motionX + poseTransform.x, cy + motionY + poseTransform.y - (text && $("withText").checked ? size.h * 0.08 : 0));
  ctx.rotate(rotation + poseTransform.rotate);
  ctx.scale(poseTransform.scaleX, poseTransform.scaleY);
  if (ref) {
    drawReferenceSticker(ctx, ref.canvas, size, index, pulse, margin, intent);
  } else {
    drawMascot(ctx, size, index, pulse, intent);
  }
  ctx.restore();

  drawIntentProps(ctx, size, intent, index, frame);
  drawDecorations(ctx, size, index, frame, intent);
  if (text && $("withText").checked) drawStickerText(ctx, text, size, index, intent);
  return canvas;
}


function getPoseTransform(poseId, index, pulse) {
  const transforms = {
    sleeping: { x: 0, y: 22, rotate: -0.2, scaleX: 1.28, scaleY: 0.68 },
    crawl: { x: 0, y: 26, rotate: -0.08, scaleX: 1.34, scaleY: 0.62 },
    bow: { x: 0, y: 18, rotate: 0.08, scaleX: 1.12, scaleY: 0.78 },
    jump: { x: 0, y: -28 + pulse * 80, rotate: 0.16, scaleX: 0.88, scaleY: 1.08 },
    peek: { x: 0, y: 34, rotate: 0, scaleX: 0.95, scaleY: 0.8 },
    umbrella: { x: 14, y: 12, rotate: -0.04, scaleX: 0.9, scaleY: 1.02 },
    dizzy: { x: Math.sin(index) * 8, y: 0, rotate: 0.22, scaleX: 0.95, scaleY: 0.95 },
    phone: { x: -6, y: 0, rotate: -0.05, scaleX: 1, scaleY: 1 },
    working: { x: 0, y: 12, rotate: 0, scaleX: 1.08, scaleY: 0.88 },
    eating: { x: 0, y: 8, rotate: 0.04, scaleX: 1.04, scaleY: 0.95 },
    hug: { x: 0, y: 6, rotate: -0.04, scaleX: 1.05, scaleY: 1.05 },
    cheek: { x: 0, y: 8, rotate: -0.02, scaleX: 1.08, scaleY: 0.96 },
    nope: { x: Math.sin(index * 2) * 4, y: 0, rotate: -0.12, scaleX: 1, scaleY: 1 },
    chill: { x: 0, y: -8, rotate: 0.1, scaleX: 0.96, scaleY: 0.96 }
  };
  return transforms[poseId] || { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1 };
}

function drawIntentBackdrop(ctx, size, intent, index, frame) {
  const cx = size.w / 2;
  const cy = size.h / 2;
  const unit = Math.min(size.w, size.h);
  ctx.save();
  ctx.strokeStyle = "#10231b";
  ctx.lineWidth = Math.max(3, unit * .016);
  if (intent.pose.id === "umbrella") {
    ctx.fillStyle = "#ffd43b";
    ctx.beginPath();
    ctx.arc(cx, cy - unit * .34, unit * .42, Math.PI, 0);
    ctx.lineTo(cx + unit * .42, cy - unit * .34);
    ctx.quadraticCurveTo(cx, cy - unit * .22, cx - unit * .42, cy - unit * .34);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - unit * .34); ctx.lineTo(cx, cy + unit * .2); ctx.stroke();
  } else if (intent.pose.id === "jump") {
    ctx.fillStyle = "#dff6ff";
    ctx.beginPath(); ctx.ellipse(cx, cy + unit * .25, unit * .32, unit * .08, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (intent.pose.id === "peek") {
    ctx.fillStyle = "#fff7e6";
    ctx.beginPath(); ctx.roundRect(cx - unit * .38, cy + unit * .1, unit * .76, unit * .22, 16); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawReferenceSticker(ctx, image, size, index, pulse, margin, intent) {
  const maxW = size.w - margin * 2;
  const maxH = size.h * (size.h > size.w ? 0.64 : 0.7) - margin;
  const styleBoost = $("photoStyle").value === "chibi" ? 1.08 : 1;
  const scale = Math.min(maxW / image.width, maxH / image.height) * (0.88 + (index % 5) * 0.025 + pulse) * styleBoost;
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.shadowColor = "rgba(0,0,0,.22)";
  ctx.shadowBlur = 10;
  ctx.lineJoin = "round";
  const r = Math.min(w, h) * 0.5;
  applyReferencePoseWarp(ctx, intent.pose.id, r, index);
  drawReferencePoseUnderlay(ctx, r, intent.pose.id, index);
  ctx.drawImage(image, -w / 2 + Math.sin(index) * 4, -h / 2, w, h);
  drawExpressionOverlay(ctx, r, intent);
  drawReferencePoseOverlay(ctx, r, intent.pose.id, intent, index);
  ctx.shadowBlur = 0;
  ctx.globalCompositeOperation = "source-over";
}


function applyReferencePoseWarp(ctx, poseId, r, index) {
  if (["sleeping", "crawl"].includes(poseId)) {
    ctx.rotate(-0.08);
    ctx.scale(1.08, 0.82);
  } else if (poseId === "bow") {
    ctx.rotate(0.18);
    ctx.scale(1.12, 0.82);
  } else if (poseId === "jump") {
    ctx.rotate(-0.16);
    ctx.scale(0.9, 1.08);
  } else if (poseId === "peek") {
    ctx.scale(0.92, 0.72);
  } else if (poseId === "dizzy") {
    ctx.rotate(0.16 + (index % 2 ? -0.18 : 0));
  } else if (poseId === "cheek") {
    ctx.scale(1.08, 0.92);
  }
}

function drawReferencePoseUnderlay(ctx, r, poseId, index) {
  ctx.save();
  ctx.strokeStyle = "#10231b";
  ctx.lineWidth = Math.max(4, r * .07);
  ctx.fillStyle = "rgba(255, 255, 255, .9)";
  if (["sleeping", "crawl"].includes(poseId)) {
    ctx.beginPath(); ctx.ellipse(0, r * .45, r * 1.15, r * .18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (poseId === "jump") {
    ctx.beginPath(); ctx.arc(-r * .58, r * .5, r * .13, 0, Math.PI * 2); ctx.arc(r * .58, r * .5, r * .13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (poseId === "peek") {
    ctx.fillStyle = "#fff3bf";
    ctx.beginPath(); ctx.roundRect(-r * 1.05, r * .28, r * 2.1, r * .36, r * .12); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function drawReferencePoseOverlay(ctx, r, poseId, intent, index) {
  ctx.save();
  ctx.strokeStyle = "#10231b";
  ctx.lineWidth = Math.max(4, r * .065);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = "rgba(255, 240, 230, .96)";
  const paw = (x, y, scale = 1) => { ctx.beginPath(); ctx.ellipse(x, y, r * .16 * scale, r * .12 * scale, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); };
  if (poseId === "armsUp" || poseId === "jump") {
    paw(-r * .78, -r * .44); paw(r * .78, -r * .48);
    ctx.beginPath(); ctx.moveTo(-r * .58, -r * .22); ctx.lineTo(-r * .78, -r * .44); ctx.moveTo(r * .58, -r * .22); ctx.lineTo(r * .78, -r * .48); ctx.stroke();
  } else if (poseId === "phone") {
    paw(-r * .72, -r * .08);
    ctx.fillStyle = "#ffd43b"; ctx.beginPath(); ctx.roundRect(-r * 1.08, -r * .34, r * .28, r * .58, r * .12); ctx.fill(); ctx.stroke();
  } else if (poseId === "working") {
    ctx.fillStyle = "#dbeafe"; ctx.beginPath(); ctx.roundRect(-r * .72, r * .18, r * 1.45, r * .5, r * .12); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#10231b"; ctx.font = `900 ${r * .22}px sans-serif`; ctx.fillText("…", -r * .14, r * .5);
  } else if (poseId === "eating") {
    ctx.fillStyle = "#fff0f6"; ctx.beginPath(); ctx.ellipse(0, r * .55, r * .55, r * .18, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#74c0fc"; ctx.fillText("🍵", r * .42, r * .26);
  } else if (poseId === "hug") {
    paw(-r * .36, r * .34, 1.2); paw(r * .34, r * .34, 1.2);
    ctx.fillStyle = "#ff6b9a"; ctx.font = `900 ${r * .35}px sans-serif`; ctx.fillText("♥", r * .42, -r * .28);
  } else if (poseId === "facepalm" || poseId === "cheek") {
    paw(-r * .34, -r * .08, 1.08); paw(r * .34, r * .18, .9);
  } else if (poseId === "dizzy") {
    ctx.fillStyle = "#7048e8"; ctx.font = `900 ${r * .38}px sans-serif`; ctx.fillText("◎◎", -r * .5, -r * .52);
  } else if (poseId === "nope") {
    paw(-r * .84, -r * .04); ctx.strokeStyle = "#ff4d4f"; ctx.beginPath(); ctx.moveTo(r * .48, -r * .42); ctx.lineTo(r * .9, 0); ctx.moveTo(r * .9, -r * .42); ctx.lineTo(r * .48, 0); ctx.stroke();
  } else if (poseId === "umbrella") {
    paw(-r * .48, r * .2); ctx.beginPath(); ctx.moveTo(-r * .4, -r * .62); ctx.lineTo(-r * .22, r * .34); ctx.stroke();
  }
  ctx.restore();
}

function drawMascot(ctx, size, index, pulse, intent) {
  const r = Math.min(size.w, size.h) * (0.26 + pulse);
  const colors = ["#7de38d", "#ffd166", "#8ec5ff", "#ff8fab", "#cdb4db"];
  ctx.fillStyle = intent.expression.color || colors[index % colors.length];
  ctx.strokeStyle = "#10231b";
  ctx.lineWidth = Math.max(5, r * 0.08);
  drawMascotBody(ctx, r, index, intent.pose.id);
  ctx.fill(); ctx.stroke();
  drawMascotEarsAndTail(ctx, r, intent.pose.id, index);
  ctx.fillStyle = "#10231b";
  drawMascotFace(ctx, r, intent.expression.id);
  drawMascotPose(ctx, r, intent.pose.id);
}



function drawMascotBody(ctx, r, index, poseId) {
  ctx.beginPath();
  if (["sleeping", "crawl"].includes(poseId)) {
    ctx.ellipse(0, r * .12, r * 1.12, r * .55, 0, 0, Math.PI * 2);
  } else if (poseId === "peek") {
    ctx.ellipse(0, r * .18, r * .78, r * .62, 0, Math.PI, 0);
    ctx.lineTo(r * .8, r * .45); ctx.lineTo(-r * .8, r * .45); ctx.closePath();
  } else if (poseId === "jump") {
    ctx.ellipse(0, 0, r * .78, r * 1.02, -0.08, 0, Math.PI * 2);
  } else if (poseId === "bow") {
    ctx.ellipse(0, r * .1, r * 1.02, r * .62, 0.08, 0, Math.PI * 2);
  } else {
    roundedBlob(ctx, 0, 0, r, index);
  }
}

function drawMascotEarsAndTail(ctx, r, poseId, index) {
  ctx.save();
  ctx.fillStyle = ctx.fillStyle;
  ctx.strokeStyle = "#10231b";
  ctx.lineWidth = Math.max(4, r * .055);
  if (!["sleeping", "crawl"].includes(poseId)) {
    ctx.beginPath();
    ctx.ellipse(-r * .45, -r * .78, r * .16, r * .28, -0.35, 0, Math.PI * 2);
    ctx.ellipse(r * .42, -r * .76, r * .16, r * .28, 0.35, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.ellipse(-r * .62, -r * .2, r * .22, r * .13, -0.2, 0, Math.PI * 2);
    ctx.ellipse(r * .48, -r * .22, r * .18, r * .12, 0.2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }
  if (["chill", "happy", "armsUp"].includes(poseId) || index % 4 === 0) {
    ctx.beginPath(); ctx.arc(r * .82, r * .2, r * .15, 0, Math.PI * 1.5); ctx.stroke();
  }
  ctx.restore();
}

function drawMascotFace(ctx, r, expressionId) {
  ctx.fillStyle = "#10231b";
  ctx.strokeStyle = "#10231b";
  ctx.lineWidth = Math.max(3, r * .045);
  if (expressionId === "happy" || expressionId === "shy") {
    ctx.beginPath(); ctx.arc(-r * .32, -r * .12, r * .1, 0, Math.PI); ctx.arc(r * .32, -r * .12, r * .1, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, r * .16, r * .22, 0, Math.PI); ctx.stroke();
  } else if (expressionId === "angry") {
    ctx.beginPath(); ctx.moveTo(-r * .45, -r * .24); ctx.lineTo(-r * .16, -r * .12); ctx.moveTo(r * .45, -r * .24); ctx.lineTo(r * .16, -r * .12); ctx.stroke();
    ctx.beginPath(); ctx.arc(-r * .28, -r * .08, r * .055, 0, Math.PI * 2); ctx.arc(r * .28, -r * .08, r * .055, 0, Math.PI * 2); ctx.fill();
  } else if (expressionId === "cry") {
    ctx.beginPath(); ctx.arc(-r * .28, -r * .1, r * .06, 0, Math.PI * 2); ctx.arc(r * .28, -r * .1, r * .06, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, r * .22, r * .18, Math.PI, 0); ctx.stroke();
  } else if (expressionId === "surprised") {
    ctx.beginPath(); ctx.arc(-r * .3, -r * .12, r * .09, 0, Math.PI * 2); ctx.arc(r * .3, -r * .12, r * .09, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, r * .18, r * .13, 0, Math.PI * 2); ctx.stroke();
  } else if (expressionId === "sleepy") {
    ctx.beginPath(); ctx.moveTo(-r * .42, -r * .1); ctx.lineTo(-r * .17, -r * .1); ctx.moveTo(r * .17, -r * .1); ctx.lineTo(r * .42, -r * .1); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, r * .16, r * .18, 0, Math.PI); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(-r * .32, -r * .1, r * .08, 0, Math.PI * 2); ctx.arc(r * .32, -r * .1, r * .08, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(0, r * .12, r * .22, 0, Math.PI); ctx.stroke();
  }
  if (expressionId === "shy") {
    ctx.fillStyle = "rgba(255, 107, 139, .55)";
    ctx.beginPath(); ctx.arc(-r * .55, r * .08, r * .1, 0, Math.PI * 2); ctx.arc(r * .55, r * .08, r * .1, 0, Math.PI * 2); ctx.fill();
  }
}

function drawMascotPose(ctx, r, poseId) {
  ctx.strokeStyle = "#10231b";
  ctx.fillStyle = "rgba(255,245,240,.9)";
  ctx.lineWidth = Math.max(4, r * .055);
  ctx.lineCap = "round";
  const paw = (x, y, sx = 1, sy = 1) => { ctx.beginPath(); ctx.ellipse(x, y, r * .14 * sx, r * .1 * sy, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); };
  if (poseId === "armsUp" || poseId === "jump") {
    ctx.beginPath();
    ctx.moveTo(-r * .62, -r * .02); ctx.quadraticCurveTo(-r * .92, -r * .38, -r * .72, -r * .58);
    ctx.moveTo(r * .62, -r * .02); ctx.quadraticCurveTo(r * .92, -r * .38, r * .72, -r * .58); ctx.stroke();
    paw(-r * .74, -r * .62); paw(r * .74, -r * .62);
  } else if (["sleeping", "crawl"].includes(poseId)) {
    paw(-r * .48, r * .42, 1.3, .75); paw(r * .42, r * .42, 1.1, .7);
  } else if (poseId === "bow") {
    paw(-r * .36, r * .44, 1.1, .8); paw(r * .36, r * .44, 1.1, .8);
  } else if (poseId === "phone") {
    paw(-r * .7, -r * .05); ctx.fillStyle = "#ffd43b"; ctx.beginPath(); ctx.roundRect(-r * 1.02, -r * .36, r * .25, r * .56, r * .09); ctx.fill(); ctx.stroke();
  } else if (poseId === "working") {
    ctx.fillStyle = "#dbeafe"; ctx.beginPath(); ctx.roundRect(-r * .58, r * .28, r * 1.16, r * .42, r * .1); ctx.fill(); ctx.stroke();
  } else if (poseId === "eating") {
    ctx.fillStyle = "#fff0f6"; ctx.beginPath(); ctx.ellipse(0, r * .58, r * .44, r * .16, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  } else if (poseId === "facepalm" || poseId === "cheek") {
    paw(-r * .28, -r * .02, 1.05, 1.1); paw(r * .34, r * .28);
  } else if (poseId === "nope") {
    paw(-r * .72, -r * .14); ctx.strokeStyle = "#ff4d4f"; ctx.beginPath(); ctx.moveTo(r * .42, -r * .42); ctx.lineTo(r * .78, -r * .06); ctx.moveTo(r * .78, -r * .42); ctx.lineTo(r * .42, -r * .06); ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-r * .72, r * .08); ctx.quadraticCurveTo(-r * .92, r * .2, -r * .78, r * .34);
    ctx.moveTo(r * .72, r * .08); ctx.quadraticCurveTo(r * .92, r * .2, r * .78, r * .34); ctx.stroke();
  }
}

function drawExpressionOverlay(ctx, r, intent) {
  ctx.save();
  ctx.font = `900 ${Math.max(22, r * .28)}px "Noto Sans TC", sans-serif`;
  ctx.fillStyle = intent.expression.color;
  ctx.globalAlpha = .92;
  if (["happy", "shy", "smug"].includes(intent.expression.id)) {
    ctx.fillText(intent.expression.emojis[0], -r * .75, -r * .55);
  }
  if (intent.expression.id === "cry") {
    ctx.fillText("💧", -r * .55, r * .15); ctx.fillText("💧", r * .35, r * .18);
  }
  if (intent.expression.id === "angry") ctx.fillText("💢", r * .35, -r * .45);
  if (intent.expression.id === "surprised" || intent.expression.id === "confused") ctx.fillText("?!", r * .28, -r * .55);
  if (intent.expression.id === "sleepy") ctx.fillText("Zzz", r * .25, -r * .52);
  ctx.restore();
}

function drawIntentProps(ctx, size, intent, index, frame) {
  const cx = size.w / 2;
  const cy = size.h / 2;
  const unit = Math.min(size.w, size.h);
  ctx.save();
  ctx.lineWidth = Math.max(3, unit * .018);
  ctx.strokeStyle = "#10231b";
  ctx.fillStyle = "rgba(255,255,255,.9)";
  if (intent.pose.id === "sleeping") {
    ctx.fillStyle = "#9ad8ff";
    ctx.beginPath(); ctx.roundRect(cx - unit * .34, cy + unit * .08, unit * .68, unit * .22, 18); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#fff1c7";
    ctx.beginPath(); ctx.roundRect(cx - unit * .25, cy - unit * .35, unit * .5, unit * .14, 14); ctx.fill(); ctx.stroke();
  } else if (intent.pose.id === "working") {
    ctx.fillStyle = "#f1f5f9";
    ctx.beginPath(); ctx.roundRect(cx + unit * .18, cy + unit * .05, unit * .28, unit * .18, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#ff6b6b"; ctx.fillText("!", cx + unit * .48, cy - unit * .05);
  } else if (intent.pose.id === "eating") {
    ctx.fillStyle = "#ffd43b";
    ctx.beginPath(); ctx.arc(cx - unit * .33, cy + unit * .08, unit * .09, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#8ce99a"; ctx.fillText("🍵", cx + unit * .22, cy + unit * .2);
  } else if (intent.pose.id === "hug") {
    ctx.fillStyle = "#ff6b9a";
    ctx.font = `900 ${unit * .16}px sans-serif`;
    ctx.fillText("♥", cx - unit * .42, cy - unit * .18); ctx.fillText("♥", cx + unit * .28, cy + unit * .18);
  } else if (intent.pose.id === "facepalm") {
    ctx.fillStyle = "#748ffc";
    ctx.font = `900 ${unit * .13}px sans-serif`;
    ctx.fillText("…", cx + unit * .25, cy - unit * .28);
  } else if (intent.pose.id === "chill") {
    ctx.fillStyle = "#91a7ff";
    ctx.font = `900 ${unit * .12}px sans-serif`;
    ctx.fillText("CHILL", cx - unit * .45, cy - unit * .28 + frame * 2);
  }
  ctx.restore();
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

function drawDecorations(ctx, size, index, frame, intent) {
  const colors = [intent.expression.color, "#ffcc00", "#ff6b6b", "#4dabf7", "#b197fc"];
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

function drawStickerText(ctx, text, size, index, intent) {
  const maxWidth = size.w * 0.9;
  const fontSize = Math.max(18, Math.min(size.w, size.h) * (text.length > 6 ? 0.12 : 0.16));
  const y = intent.pose.id === "sleeping" ? Math.max(24, size.h * 0.17) : size.h - Math.max(18, size.h * 0.12);
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
  ctx.fillStyle = intent.expression.color || ["#06c755", "#ff6b6b", "#228be6", "#f08c00"][index % 4];
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

function addCard(canvas, index, text, spec, intent) {
  const card = document.createElement("article");
  card.className = "card";
  card.appendChild(canvas);
  const label = document.createElement("small");
  label.textContent = `${String(index).padStart(2, "0")} · ${spec.label} · ${intent.expression.label}/${intent.pose.label}${text ? ` · ${text}` : ""}`;
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
    if (spec.animated) files.push({ name: `${n}.png`, data: await makeApngBytes(spec.canvas, item.index - 1, item.text, item.intent) });
    else files.push({ name: `${n}.png`, data: await canvasToBytes(item.canvas) });
    if (spec.popup) {
      files.push({ name: `popup/${n}.png`, data: await makeApngBytes(spec.popupCanvas, item.index - 1, item.text, item.intent) });
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

async function makeApngBytes(size, index, text, intent = analyzeStickerIntent(text, index)) {
  const frameCount = 8;
  const pngFrames = [];
  for (let f = 0; f < frameCount; f += 1) {
    const canvas = drawSticker(OFFICIAL_SPECS[$("stickerType").value], index, text, size, f, frameCount, intent);
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
$("photoStyle").addEventListener("change", () => { applyReferenceStyles(); setStatus(`已套用 ${getPhotoStyleLabel(getReferenceStyle(references[0] || { detectedPhoto: true }))} 參考圖風格。`); });
$("treatAsPhoto").addEventListener("change", applyReferenceStyles);
$("removeBgNow").addEventListener("click", oneClickRemoveBg);
$("generate").addEventListener("click", generateAll);
$("downloadZip").addEventListener("click", downloadZip);
$("openLine").addEventListener("click", openLineCreator);
$("importTrendTexts").addEventListener("click", importTrendTexts);
$("useDatabaseTexts").addEventListener("click", useDatabaseTexts);
$("copyDatabaseTexts").addEventListener("click", copyDatabaseTexts);
$("clearTextDatabase").addEventListener("click", clearTextDatabase);
updateCounts();
renderTextDatabase();
