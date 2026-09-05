#!/usr/bin/env node
// 求職者向けページを公開する。合言葉なし・長いURLだけで開ける（推測できない）。
// 一覧ページ（index.html）＋企業ごとの1枚（c1/, c2/, …）をまとめて1つの場所に置く。
// 使い方： node publish_seeker.mjs <ダウンロードしたJSONファイル>
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { execSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

const file = process.argv[2];
if (!file) { console.error('使い方： node publish_seeker.mjs <JSONファイル>'); process.exit(2); }
const bundle = JSON.parse(readFileSync(file, 'utf8'));
if (!bundle.pages) { console.error('中身が見つかりません（pages が無い）。ヒアリング画面の「この人向けページを作る」で作り直してください。'); process.exit(2); }

const REPO_DIR = join(homedir(), 'Downloads', 'gl-recommend-repo');
const REPO_URL = 'https://github.com/akasa0521-spec/gl-recommend.git';

function sh(cmd, cwd) { return execSync(cmd, { cwd, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim(); }

if (!existsSync(REPO_DIR)) {
  console.log('初回：clone しています…');
  sh(`git clone ${REPO_URL} "${REPO_DIR}"`);
}

const slug = randomBytes(16).toString('hex'); // 32文字。推測不可
const base = join(REPO_DIR, 'r', slug);
for (const [relPath, html] of Object.entries(bundle.pages)) {
  const full = join(base, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
}

sh('git add -A', REPO_DIR);
sh(`git -c user.name=beta -c user.email=akasa0521@gmail.com commit -q -m "おすすめページを追加（${Object.keys(bundle.pages).length}ファイル）\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"`, REPO_DIR);
sh('git push origin main', REPO_DIR);

console.log('公開しました：');
console.log('https://akasa0521-spec.github.io/gl-recommend/r/' + slug + '/');
