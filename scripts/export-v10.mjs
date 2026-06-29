import { mkdirSync, rmSync, cpSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const artifacts = join(root, '.artifacts');
const outDir = join(artifacts, 'Lumi-system-v10');
const zipFile = join(artifacts, 'Lumi-system-v10.zip');

rmSync(outDir, { recursive: true, force: true });
rmSync(zipFile, { force: true });
mkdirSync(outDir, { recursive: true });

const exclude = new Set(['.git', 'node_modules', '.artifacts']);
const entries = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .split('\n')
  .filter(Boolean)
  .filter((file) => !file.split('/').some((part) => exclude.has(part)));

for (const file of entries) {
  cpSync(join(root, file), join(outDir, file), { recursive: true });
}

writeFileSync(join(outDir, 'GITHUB_REPO_NAME.txt'), 'Lumi-system-v10\n', 'utf8');
execFileSync('zip', ['-qr', zipFile, 'Lumi-system-v10'], { cwd: artifacts });

console.log(`Exported ${entries.length} files to ${outDir}`);
console.log(`Created ${zipFile}`);
