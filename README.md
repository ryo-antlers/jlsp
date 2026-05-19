# JLSP

Jリーグ クラブ相性診断 — 32問の質問からあなたに合うクラブ TOP3 を診断する Web サービス。

- **本番**: https://jlsp.jleakstats.com (予定)
- **対象**: サッカーには詳しいが、Jリーグはあまり追っていない層
- **クラブ範囲**: J1 + J2 (40クラブ)

## 技術スタック

- Next.js 16.2.6 (App Router) + React 19.2.4
- Tailwind CSS v4
- Neon Postgres (jleakstats と共有、テーブルは `jlsp_*` プレフィックス)
- Vercel ホスティング

## 開発

```bash
npm install
npm run dev
```

http://localhost:3000 で起動。

## 姉妹サイト

- [jleakstats](https://jleakstats.com) — J1/J2/J3 統計 + 採点 + 掲示板
- [FANTYPE](https://jleakstats.com/fantype) — サポーター気質 16タイプ診断 (MBTI 風)
