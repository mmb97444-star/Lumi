import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync('public/src/app.js', 'utf8');
const elements = new Map();
function getElement(id) {
  if (!elements.has(id)) {
    elements.set(id, {
      id,
      value: id === 'stickerType' ? 'sticker' : '',
      checked: false,
      innerHTML: '',
      textContent: '',
      className: '',
      addEventListener() {},
      append() {},
      appendChild() {}
    });
  }
  return elements.get(id);
}

const context = {
  console,
  localStorage: { getItem() { return null; }, setItem() {} },
  document: {
    getElementById: getElement,
    createElement(tag) {
      if (tag === 'canvas') return { width: 0, height: 0, getContext() { return {}; } };
      return { addEventListener() {}, append() {}, appendChild() {}, className: '', textContent: '' };
    }
  },
  Image: class {},
  TextEncoder,
  Uint8Array,
  DataView,
  Blob,
  URL: { createObjectURL() {}, revokeObjectURL() {} },
  requestAnimationFrame(fn) { return setTimeout(fn, 0); },
  window: { open() {} },
  Math,
  setTimeout
};

vm.createContext(context);
vm.runInContext(source, context);

const samples = [
  '好想下班🥱',
  '這我不懂🔥',
  '先喝一口✨',
  '醒醒該上班了🔥',
  '已讀不回中🥱~',
  '等等我啦',
  '蛤？',
  '晚安🌙',
  '我不管了',
  '飛上雲端笑ㄏㄏ',
  '拜託拜託'
];
const intents = samples.map((text, index) => vm.runInContext(`analyzeStickerIntent(${JSON.stringify(text)}, ${index})`, context));
const poseIds = new Set(intents.map((intent) => intent.pose.id));
const expressionIds = new Set(intents.map((intent) => intent.expression.id));
if (poseIds.size < 7) throw new Error(`Expected diverse poses, got ${poseIds.size}: ${[...poseIds].join(', ')}`);
if (expressionIds.size < 5) throw new Error(`Expected diverse expressions, got ${expressionIds.size}: ${[...expressionIds].join(', ')}`);
const confused = intents[samples.indexOf('這我不懂🔥')];
if (confused.expression.id !== 'confused' || confused.pose.id !== 'facepalm') {
  throw new Error(`Text-first intent failed for 不懂: ${confused.expression.id}/${confused.pose.id}`);
}
console.log(`Intent checks passed with ${poseIds.size} poses and ${expressionIds.size} expressions.`);
