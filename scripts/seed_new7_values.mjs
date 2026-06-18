// JLSP — 新規7問のクラブ別の値をシードする追記専用スクリプト。
//   node --env-file=.env.local scripts/seed_new7_values.mjs
//
// 既存 override の削除・符号反転は一切しない（追記/上書きのみ）。
// 実行前に jlsp_question_overrides 全体を /tmp にバックアップする。
//
// 値フレーム: その文章に「賛成」するクラブのサポーター=+ / 反対=− (-3..+3)。0 は省略。
// 対象7問 (2026-06-18 追加):
//   rv1 ダービー / e2 残留争い / sl1 育てて売る / tt1 タイトル至上
//   pt1 フロント継続(監督を切らない) / gl1 国際志向 / sp1 新興IT/ベンチャー
import { neon } from '@neondatabase/serverless'
import { writeFileSync } from 'node:fs'

const sql = neon(process.env.DATABASE_URL)

const V = {
  // ダービー・ライバル熱（大阪/東京/さいたまダービー等が強い ⇔ 強いダービー相手がいない）
  rv1: { gamba: 3, cerezo: 3, urawa: 3, fctokyo: 2, verdy: 2, kawasaki: 2, 'f-marinos': 2, kashima: 1, reysol: 1, chiba: 1, avispa: 1, nagasaki: 1, mito: 1, shimizu: 1, kobe: -1, kyoto: -1, sanfrecce: -1, okayama: -1, machida: -1, grampus: -2 },
  // 残留争いを楽しめる（下位・残留争い常連 ⇔ 優勝争いビッグ）
  e2: { okayama: 3, avispa: 3, mito: 2, shimizu: 2, chiba: 2, kyoto: 2, verdy: 2, nagasaki: 2, reysol: 1, machida: 1, cerezo: 1, gamba: -1, fctokyo: -1, sanfrecce: -1, grampus: -1, kobe: -2, kawasaki: -2, 'f-marinos': -2, urawa: -3, kashima: -3 },
  // 育てて売る誇り（育成・ステップアップ輩出 ⇔ 買い集めるビッグ）
  sl1: { mito: 3, cerezo: 3, kawasaki: 3, sanfrecce: 3, reysol: 2, shimizu: 2, verdy: 2, kashima: 2, fctokyo: 2, gamba: 1, kyoto: 1, nagasaki: 1, okayama: 1, machida: -1, grampus: -1, 'f-marinos': -1, urawa: -2, kobe: -3 },
  // タイトル至上（常勝・タイトル豊富 ⇔ タイトル縁遠い市民クラブ）
  tt1: { kashima: 3, kobe: 3, urawa: 2, gamba: 2, 'f-marinos': 2, kawasaki: 2, grampus: 2, sanfrecce: 1, reysol: 1, fctokyo: -1, cerezo: -1, verdy: -1, shimizu: -1, machida: -1, avispa: -1, kyoto: -2, nagasaki: -2, chiba: -2, mito: -3, okayama: -3 },
  // フロントの継続・我慢（不振でも監督を切らず積み上げる ⇔ 即解任）
  pt1: { kawasaki: 3, sanfrecce: 3, avispa: 2, okayama: 2, kyoto: 2, machida: 2, grampus: 1, reysol: 1, mito: 1, verdy: 1, fctokyo: -1, 'f-marinos': -1, cerezo: -1, shimizu: -1, kashima: -2, gamba: -2, urawa: -2, kobe: -3 },
  // 国際志向（世界・アジアを目指す ⇔ 地元・国内志向）
  gl1: { kobe: 3, 'f-marinos': 3, kashima: 2, urawa: 2, kawasaki: 1, gamba: 1, grampus: 1, sanfrecce: 1, fctokyo: 1, reysol: -1, kyoto: -1, machida: -1, verdy: -1, nagasaki: -1, avispa: -2, shimizu: -2, chiba: -2, mito: -3, okayama: -3 },
  // 新興IT/ベンチャーがバック（楽天/サイバー/メルカリ/ミクシィ ⇔ トヨタ/日産/三菱等の老舗メーカー）
  sp1: { kobe: 3, machida: 3, kashima: 2, fctokyo: 2, nagasaki: 1, sanfrecce: -1, cerezo: -1, shimizu: -1, chiba: -1, verdy: -1, gamba: -2, urawa: -2, kawasaki: -2, 'f-marinos': -2, reysol: -2, kyoto: -2, grampus: -3 },
}

async function main() {
  // ① backup（全行）
  const before = await sql`SELECT club_id, question_id, value, updated_at FROM jlsp_question_overrides ORDER BY club_id, question_id`
  const path = '/tmp/jlsp_question_overrides_pre_seed_new7.json'
  writeFileSync(path, JSON.stringify(before, null, 2))
  console.log(`backup ${before.length} rows -> ${path}`)

  // ② 新規7問の値を upsert（追記のみ。既存質問には触れない）
  let upserts = 0
  for (const [qid, clubVals] of Object.entries(V)) {
    for (const [clubId, value] of Object.entries(clubVals)) {
      if (!value) continue
      await sql`
        INSERT INTO jlsp_question_overrides (club_id, question_id, value, updated_at)
        VALUES (${clubId}, ${qid}, ${value}, NOW())
        ON CONFLICT (club_id, question_id) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `
      upserts++
    }
  }
  console.log(`upserted ${upserts} values across ${Object.keys(V).length} questions`)

  const after = await sql`SELECT COUNT(*) AS n FROM jlsp_question_overrides WHERE question_id = ANY(${Object.keys(V)})`
  console.log(`new7 rows now in DB: ${after[0].n}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
