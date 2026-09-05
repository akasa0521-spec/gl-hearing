# gl-hearing（GL ヒアリング画面の置き場）

Chrome拡張「GL ヒアリング」が PORTERS の上に出す板の中身（ヒアリング画面）を、拡張の中ではなくこのサイトから読むための置き場。
公開先は https://akasa0521-spec.github.io/gl-hearing/ 。画面は合言葉で暗号化してあり（AES-GCM／PBKDF2-SHA256 30万回）、合言葉を知らない人が URL を開いても中身は見えない。
拡張を入れ直さなくても、ここを更新すれば次に板を開いたときに全員へ届く。

## ここにあるもの
- `index.html` … 入口。初回だけ「合言葉」を聞き、合った鍵をブラウザに覚える（合言葉そのものは保存しない）。次からはそのまま画面が開く
- `payload.json` … 暗号化した画面（hearing.html に hearing.js と bridge.js を埋め込んだ一枚）。公開するのはこれと index.html と README だけ
- `build.mjs` … 画面を束ねて暗号化する道具（Node、追加ライブラリ不要）

## 画面を直したとき（作り直し）
1. `../ext_hearing/` の `hearing.html` / `hearing.js` / `bridge.js` を直す（元はこちら。ここには置かない）
2. このフォルダで `GLH_PASS='合言葉' node build.mjs`（続けて `GLH_PASS='合言葉' node build.mjs --selftest` で往復確認）
3. `payload.json` を commit → push
4. 使う人は、次に板を開いたときに新しい画面になる（拡張の入れ直し・再読み込みは不要）

## 合言葉を変えるとき
- 新しい合言葉で 2. を実行して push する。使う人は次に開いたとき一度だけ新しい合言葉を入れ直す（古い鍵は自動で捨てる）
- 合言葉はどこにも書かない。環境変数 `GLH_PASS` で渡すだけ

## ここに無いもの
- 個人情報・ヒアリングの内容は一切置かない。入力した値は使う人のブラウザ（localStorage）と PORTERS にだけ残る
- 合言葉、鍵、PORTERS の情報。`payload.json` は画面の型だけ

## 拡張側との関係
- 拡張の `content.js` は `REMOTE_URL='https://akasa0521-spec.github.io/gl-hearing/'` を iframe で開き、`SITE_ORIGIN` からの postMessage だけ受ける
- 画面の中（bridge.js）は `https://hrbc-jp.porterscloud.com` へだけ postMessage する。単体で開くと「PORTERSの中で開くと書き込みが使えます」の帯が出る（下見用）

## 求職者向けページ（この人向けページを作る）

ヒアリング画面の「近くの施設」→ 起点の住所で探す → 「この人の職種」を選ぶ → 「この人向けページを作る」。`おすすめ求人.json` が落ちるので、

```bash
node publish_seeker.mjs ~/Downloads/おすすめ求人.json
```

で公開され、長いURLが出る（合言葉なし・推測不可）。そのURLを求職者に送る。消すときは `~/Downloads/gl-recommend-repo/r/<slug>/` を削除して push。
施設の写真を載せる：`node add_facility_photo.mjs <施設名> <写真…>`。
作法・事故の記録・データの作り直し方は `_盤/93_CRM/93-077_求職者向けページの掟.md`。
