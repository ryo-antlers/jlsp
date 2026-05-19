<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# JLCL = J League Club Match (クラブ推薦診断)

このリポはユーザーに合う J リーグクラブを推薦する診断サイト。jleakstats / FANTYPE とは別 Vercel プロジェクト、別ドメイン (`jlcl.jleakstats.com` 予定)。

## ハンドオフ資料
- `/Users/ryo/Desktop/JMBTI/docs/handoff-to-jlcl.md` — 立ち上げ手順 (Phase A-1〜A-6) と全体像
- `/Users/ryo/Desktop/JMBTI/lib/jmbti/` — 旧 JMBTI ロジック (TS)。JS 化して `lib/club-match/` に移植予定
- `/Users/ryo/Desktop/jleakstats/` — 姉妹サイト (Public)。FANTYPE のクイズ/結果 UI が参考になる

## 技術スタック
- Next.js 16.2.6, React 19.2.4, App Router, JavaScript (no TS)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Neon Postgres (jleakstats と共有、テーブルは `jlcl_*` プレフィックス)
- Vercel (Hobby スタート、独自ドメイン jlcl.jleakstats.com)

## 作業スタイル (ryo さん)
- 小変更は main 直 push、機能単位は PR
- コミットメッセージは日本語
- destructive operation は確認してから実行
