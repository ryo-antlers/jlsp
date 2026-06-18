# JLSP 引き継ぎ資料

> 次の開発セッション向けの現状サマリ。最終更新: 2026-06-17

## 1. これは何か

**JLSP** = Jリーグ「クラブ相性診断」サイト。質問に答えると、相性のいいJリーグクラブが%で出る。
- 本番: https://jlsp.jleakstats.com
- リポジトリ: `~/Desktop/jlsp` (github.com/ryo-antlers/jlsp, Public)
- スタック: Next.js 16.2.6 (Turbopack) + Tailwind v4 + Neon(Postgres)
- デプロイ: Vercel。**`main` に push すると本番が自動デプロイ**。
- データ元: 姉妹プロジェクト **jleakstats** (`~/Desktop/jleakstats`) のDB + **API-Football**。
- dev 起動: `cd ~/Desktop/jlsp && npm run dev`（env は `.env.local`）。動作確認URL: `/result/kashima?a=qAqvmmZnmlNjlSihQUZi`（鹿島100%）

## 2. 現在の状態（重要）

旧「性格タイプ(FANTYPE)」診断は**廃止済み**。**40問のクラブ相性マッチング専用**に全面再設計し、本番稼働中。
- 再設計の経緯・確定文は `scripts/quiz_v2_draft.md`。
- ローカルの `next build` が通れば Vercel も通る（`lib/db.js` を遅延初期化済みなので env 無しでもビルド可）。

## 3. 診断ロジック

- 質問: `lib/jlsp/questions.js` … 40問。`category`(10種) でグルーピング。一部に `legacyAxis`(旧4軸: shoubu/keiei/kansen) があり、それらだけ vector 由来の値を持つ。
- マッチング: `lib/jlsp/diagnose.js` の `matchClubs()` = 全質問で `|ユーザー回答 - clubExpectedAnswer|` の L1 距離。距離が小さいほど相性高い。
- `clubExpectedAnswer(club, q)` の優先順位:
  1. `jlsp_question_overrides`(DB, クラブ×質問の値) ← **/admin/question-overrides で編集**
  2. `vector[legacyAxis] * direction`（legacyAxis を持つ質問のみ）
  3. `0`
- 結果ページは「URL の clubId」ではなく「**top1 = 最良マッチ**」を表示する点に注意（clubId は検証用）。`?a=` はユーザー回答のエンコード。

## 4. データの置き場所（どこを直せばどこが変わるか）

| データ | 置き場所 | 編集方法 |
|---|---|---|
| クラブ別の質問の値（診断チューニング） | DB `jlsp_question_overrides` | `/admin/question-overrides` |
| 直近順位 RECENT（2022-2026） | `lib/jlsp/club-extra.js`(生成物) | `scripts/standings_recent.json` 編集 → `node scripts/gen_club_extra_fixtures.mjs` で再生成 |
| 開幕日程 NEXT MATCH（2026/27 第1-5節） | 同上 `club-extra.js` `upcomingManual` | 生成スクリプト内の `MATCHES` を編集して再生成。DBに公式 upcomingMatches が入れば自動でそちら優先 |
| 説明文/現在の有名選手/有名OB/マスコット/観光地/スタジアム名 | DB `club_meta_overrides` | `/admin/club-meta`（6項目） |

- `club_meta_overrides` のカラム: `description_long, current_players(jsonb), mascots(jsonb), stadium(text), sightseeing(jsonb), notable_alumni(jsonb)`。旧 `access/away_travel/mascot_name…` は**廃止・未使用**（カラムは残存するが触らない）。
- スタジアム名: **空欄なら jleakstats 同期座標で地図表示。入力すると地図も Google 名前検索**（`?q=スタジアム名`）に切り替わる＝移転・改称に追従（例: 名古屋の瑞穂移転）。

## 5. 結果ページ構成（`app/result/[clubId]/page.js`）

- 左カラム: 相性%(大数字) / OFFICIAL / RECENT(成績タイムライン・中空リング) / NEXT MATCH(開幕5試合カード)
- 中央: クラブ名(2行・`splitClubName`) / %MATCH / 説明 / STADIUM(地図) / EXPLORE(観光地・画像オーバーレイ4:3名前のみ)
- 右カラム: 現在の有名選手 / 現在 海外でプレー中(丸国旗 circle-flags) / 有名OB / マスコット
- 下部: TOP3 RECOMMENDED / BOTTOM3 MISMATCH（各クラブ色の%）

## 6. admin

- `/admin/question-overrides` … クラブ×質問の期待値（診断の微調整）
- `/admin/club-meta` … 6項目編集（説明文/スタジアム名/現在の有名選手/有名OB/マスコット/観光地）
- 認証あり（`/admin/login`、jleakstats と同じ運用）

## 7. 運用・注意点

- **デプロイ**: `main` push = 本番。ryo の運用は「小変更は main 直push、機能は PR、コミットメッセージ日本語」。
- **Vercel プレビュー**: `DATABASE_URL` 等が Preview 環境に無いため、プレビューURL上では実データが出ない場合あり（ビルドは通る）。プレビューで実データを見たいなら Vercel Settings → Environment Variables の **Preview** に `DATABASE_URL` と `API_FOOTBALL_KEY` を追加。
- **jleakstats 連携**: jleakstats の team id = **API-Football の team id**（例: kashima=290）。standings は API-Football の `league 98=J1 / 99=J2`。API_FOOTBALL_KEY は `~/Desktop/jleakstats/.env.local`。
- **破壊的操作は確認**。worktree のuncommitted は消えるので毎回commit（ryo の方針）。

## 8. 残タスク / 次にやること

1. **club-meta の入力（運用）**: 各クラブの 説明文/現在の有名選手/有名OB/マスコット/観光地 を `/admin/club-meta` で埋める。今は鹿島のマスコット(しかお/シカコ)のみ。海外組は自動なので入力不要。
2. **質問のクラブ別の値の微調整**: 事実系(スタジアム/地域/歴史)は確定済み、価値観/スタイル系は叩き台 → `/admin/question-overrides` で詰める余地あり。
3. **2026/27 開幕後**: 公式 upcomingMatches が jleakstats DB に入れば NEXT MATCH は自動でそちら優先（手入力はfallback）。順位も翌シーズンは standings_recent.json を更新。
4. **任意の掃除**: 性格タイプ系(`result-page-data.js` の userType 計算 / `type-meta.js`)は `/design/typemap` だけが依存していて残置中。typemap を廃止すれば完全に削除可能。

## 9. 主要ファイル

- `lib/jlsp/questions.js` … 40問定義 + QUESTION_CATEGORIES
- `lib/jlsp/diagnose.js` … matchClubs / clubExpectedAnswer / encode-decodeAnswers
- `lib/jlsp/club-extra.js` … 順位・開幕日程（**生成物。直接編集しない**）
- `scripts/gen_club_extra_fixtures.mjs` + `scripts/standings_recent.json` … 上の生成元
- `lib/jlsp/club-meta-loader.js` … club_meta_overrides の load/save（merge ロジック）
- `lib/jlsp/loader.js` … loadJlspState（DB override 適用済みクラブ・teamId・色）
- `lib/jlsp/result-page-data.js` … 結果ページ用データロード
- `app/result/[clubId]/page.js` … 結果ページ本体
- `app/admin/question-overrides/` `app/admin/club-meta/` … 管理画面
- `lib/db.js` … Neon 接続（**遅延初期化**。eager にしないこと＝ビルドが壊れる）

## 10. メモリ

詳細な設計経緯はセッションメモリ参照: `project_2026-06-15_jlsp_quiz_redesign.md`（質問棚卸し・採否・確定文・実装ログ）、`project_2026-05-19_jlsp_kickoff.md`（立ち上げ）。
