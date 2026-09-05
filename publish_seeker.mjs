#!/usr/bin/env node
// 求職者向けページを公開する。合言葉なし・長いURLだけで開ける（推測できない）。
// 使い方： node publish_seeker.mjs <ダウンロードしたHTMLファイル>
// 前提： ~/Downloads/gl-recommend-repo に akasa0521-spec/gl-recommend を clone 済みであること（初回は自動でclone）
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { homedir } from 'node:os';

const file = process.argv[2];
if (!file) { console.error('使い方： node publish_seeker.mjs <HTMLファイル>'); process.exit(2); }
const html = readFileSync(file, 'utf8');

const REPO_DIR = join(homedir(), 'Downloads', 'gl-recommend-repo');
const REPO_URL = 'https://github.com/akasa0521-spec/gl-recommend.git';

function sh(cmd, cwd) { return execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }

if (!existsSync(REPO_DIR)) {
  console.log('初回：clone しています…');
  sh(`git clone ${REPO_URL} "${REPO_DIR}"`);
  const robots = join(REPO_DIR, 'robots.txt');
  if (!existsSync(robots)) writeFileSync(robots, 'User-agent: *\nDisallow: /\n');
}

const slug = randomBytes(16).toString('hex'); // 32文字。推測不可
const dir = join(REPO_DIR, 'r', slug);
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'index.html'), html);

sh('git add -A', REPO_DIR);
sh(`git -c user.name=beta -c user.email=akasa0521@gmail.com commit -q -m "おすすめページを追加\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"`, REPO_DIR);
sh('git push origin main', REPO_DIR);

console.log('公開しました：');
console.log('https://akasa0521-spec.github.io/gl-recommend/r/' + slug + '/');
