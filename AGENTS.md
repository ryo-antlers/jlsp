<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# JLSP = Jリーグ クラブ相性診断

このリポはユーザーに合う J リーグクラブ TOP3 を提案する診断サイト。jleakstats / FANTYPE とは別 Vercel プロジェクト、別ドメイン (`jlsp.jleakstats.com` 予定)。

「JLSP」はブランド記号 (MBTI 同様、略を持たない 4 文字)。

## サービスの設計方針

| 項目 | 決定 |
|---|---|
| ターゲット | サッカーには詳しいが Jリーグはあまり追わない層 (海外サッカー好き・代表だけ見る派 など) |
| 質問 | 32問・サッカー濃度高め (旧 JMBTI 踏襲、戦術論/移籍/育成/スタジアム文化 など) |
| 軸 | 旧 JMBTI 4軸 — 勝負観 R/E、組織観 S/I、経営観 W/H、熱狂度 F/U |
| 結果 | TOP3 を表示、1位に詳細解説、2-3位は薄め |
| クラブ範囲 | J1 + J2 (40 クラブ) |
| デザイン | ポップ・カジュアル、クラブカラー主役 |
| トップ | 1ボタンドン (「診断スタート」のみ) |
| 認証 | 不要 (誰でも診断できる) |
| タイプ名 | 出さない (クラブ提案にフォーカス) |

## ハンドオフ資料

- `/Users/ryo/Desktop/JMBTI/docs/handoff-to-jlcl.md` — 立ち上げ手順 (旧名 JLCL のまま記載)、Phase A-1〜A-6
- `/Users/ryo/Desktop/JMBTI/lib/jmbti/` — 旧 JMBTI ロジック (TS)。JS 化して `lib/jlsp/` に移植予定
- `/Users/ryo/Desktop/jleakstats/` — 姉妹サイト (Public)。FANTYPE のクイズ/結果 UI が参考になる

## 命名衝突に関する注意

- 旧 JLCL 名で立ち上げて途中で JLSP にリネームした経緯あり。古いコミット履歴の "jlcl" 表記はそのまま
- **jleakstats 側 FANTYPE が現在 `jlsp_*` テーブル / `lib/jlsp/` を使用中**。これは旧名残りで、別 PR で `fantype_*` / `lib/fantype/` にリネーム予定 (この新サイトが DB を本格的に触る前 = Phase A-4 までに完了する必要)

## 技術スタック

- Next.js 16.2.6, React 19.2.4, App Router, JavaScript (no TS)
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- Neon Postgres (jleakstats と共有、テーブルは `jlsp_*` プレフィックス)
- Vercel (Hobby スタート、独自ドメイン jlsp.jleakstats.com)

## 作業スタイル (ryo さん)

- 小変更は main 直 push、機能単位は PR
- コミットメッセージは日本語
- destructive operation は確認してから実行
