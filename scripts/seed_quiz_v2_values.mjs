// JLSP クイズ v2 — クラブ別の値をシードするワンショットスクリプト。
//   node --env-file=.env.local scripts/seed_quiz_v2_values.mjs
//
//  ① 現状を /tmp にバックアップ
//  ② 新40問に含まれない question_id の override を削除（旧質問の掃除）
//  ③ q05 の既存値を符号反転（文章の意味が美学→勝利至上に反転したため）
//  ④ 新規26問のクラブ別の値を upsert（下書きシード。0は省略）
//
// 値は「その文章に賛成するクラブのサポーター=+ / 反対=−」フレーム(-3..+3)。
import { neon } from '@neondatabase/serverless'
import { writeFileSync } from 'node:fs'

const sql = neon(process.env.DATABASE_URL)

const KEEP_IDS = [
  'q25','q29','q37','q45','q05','q21','q41','u14','u16',
  'q26','q42','q18','q02','g1','q30','q22','x1','u15',
  'c4','b4','e3','d1','s4','a1','a3',
  'h1','h3','h6','u13','q35','u6','u5','u10','u11','l3',
  'p2','gd2','sn5','mc4','r1',
]

// 新規26問のクラブ別シード値（非0のみ）。clubId は clubs.js の id。
const V = {
  // --- スタジアム（事実ベース）---
  a1: { kyoto:3, nagasaki:3, chiba:2, fctokyo:2, verdy:2, kobe:2, cerezo:2, 'f-marinos':1, sanfrecce:1, urawa:-1, reysol:-1, gamba:-1, okayama:-1, avispa:-1, machida:-2, shimizu:-2, mito:-2, kashima:-3 },
  a3: { reysol:3, sanfrecce:3, kashima:2, urawa:2, chiba:2, kyoto:2, kobe:2, gamba:2, grampus:2, shimizu:2, cerezo:2, nagasaki:2, avispa:2, machida:-2, 'f-marinos':-2, fctokyo:-2, verdy:-2, kawasaki:-2, okayama:-2, mito:-2 },
  // --- 地域（事実ベース）---
  r1: { mito:3, kashima:3, okayama:2, nagasaki:2, shimizu:1, sanfrecce:1, avispa:1, kyoto:1, urawa:-1, grampus:-1, kobe:-2, gamba:-2, cerezo:-2, 'f-marinos':-2, kawasaki:-2, fctokyo:-3, verdy:-3 },
  // --- 歴史 ---
  d1: { kashima:3, urawa:3, 'f-marinos':3, verdy:3, chiba:2, grampus:2, gamba:2, shimizu:2, sanfrecce:2, reysol:1, cerezo:1, avispa:-1, mito:-1, okayama:-2, nagasaki:-2, machida:-2 },
  s4: { urawa:3, kashima:2, 'f-marinos':2, verdy:2, gamba:1, grampus:1, sanfrecce:1, shimizu:1, chiba:1, reysol:1, cerezo:1, machida:-1, okayama:-1, nagasaki:-1 },
  // --- 経営 ---
  g1: { kobe:3, kawasaki:2, urawa:2, grampus:2, gamba:2, kashima:1, fctokyo:1, 'f-marinos':1, kyoto:1, machida:1, nagasaki:1, shimizu:1, reysol:1, verdy:-1, avispa:-1, sanfrecce:-1, mito:-2, okayama:-2 },
  x1: { sanfrecce:2, cerezo:2, gamba:2, kashima:2, verdy:2, reysol:2, kawasaki:1, shimizu:1, fctokyo:1, mito:1, chiba:1, kyoto:1, 'f-marinos':-1, machida:-1, nagasaki:-1, urawa:-1, kobe:-2 },
  u15: { 'f-marinos':2, sanfrecce:1, cerezo:1, kawasaki:1, avispa:1, fctokyo:1, machida:1, nagasaki:1, urawa:-1, kobe:-2 },
  // --- プレースタイル ---
  h1: { kawasaki:3, 'f-marinos':3, kyoto:2, cerezo:1, gamba:1, nagasaki:1, kashima:-1, grampus:-1, okayama:-1, avispa:-2, machida:-3 },
  h3: { 'f-marinos':3, kawasaki:3, gamba:2, cerezo:1, sanfrecce:1, kobe:1, verdy:1, kashima:-1, okayama:-1, nagasaki:-1, kyoto:-2, avispa:-2, machida:-3 },
  h6: { machida:3, avispa:2, okayama:2, kashima:1, kyoto:1, nagasaki:1, mito:1, cerezo:-1, sanfrecce:-1, verdy:-1, gamba:-1, kawasaki:-2, 'f-marinos':-2 },
  u13: { machida:3, avispa:2, okayama:2, kashima:1, mito:1, urawa:1, kyoto:-1, gamba:-1, sanfrecce:-1, cerezo:-2, kawasaki:-2, 'f-marinos':-2 },
  // --- 勝負観（狡猾な勝利至上）---
  u14: { kashima:2, machida:2, urawa:1, kobe:1, avispa:1, gamba:1, 'f-marinos':-1, kawasaki:-1, sanfrecce:-1, cerezo:-1, kyoto:-1 },
  u16: { kashima:2, machida:2, urawa:1, kobe:1, avispa:1, gamba:1, kawasaki:-1, sanfrecce:-1, cerezo:-1, kyoto:-1 },
  // --- クラブの格・野心 ---
  c4: { urawa:2, kashima:2, kawasaki:2, kobe:2, 'f-marinos':1, fctokyo:1, gamba:1, grampus:1, chiba:-1, shimizu:-1, machida:-1, avispa:-1, okayama:-1, mito:-2 },
  b4: { mito:2, okayama:2, machida:2, nagasaki:1, avispa:1, shimizu:1, chiba:1, reysol:1, kyoto:1, gamba:-1, fctokyo:-1, kawasaki:-1, kashima:-1, grampus:-1, 'f-marinos':-2, urawa:-3 },
  e3: { machida:3, okayama:3, nagasaki:3, mito:2, avispa:2, kyoto:1, shimizu:1, chiba:1, verdy:1, gamba:-1, kobe:-1, kashima:-2, 'f-marinos':-2, kawasaki:-2, urawa:-3 },
  // --- 観戦熱量 ---
  u5: { urawa:3, gamba:2, fctokyo:2, kashima:2, kobe:1, kawasaki:1, cerezo:1, verdy:1, mito:-1, okayama:-1, sanfrecce:-1 },
  u6: { urawa:2, gamba:1, fctokyo:1, kashima:1, cerezo:1, mito:-1, okayama:-1 },
  // --- サポーター文化（友好的=+ / 敵対的=−）。u10/u11/l3 はほぼ同軸 ---
  u10: { kawasaki:2, sanfrecce:2, mito:2, okayama:2, nagasaki:2, cerezo:1, kyoto:1, shimizu:1, avispa:1, machida:1, kobe:-1, fctokyo:-1, gamba:-1, kashima:-1, urawa:-2 },
  u11: { kawasaki:2, sanfrecce:2, mito:2, okayama:2, nagasaki:2, cerezo:1, kyoto:1, shimizu:1, avispa:1, kobe:-1, fctokyo:-1, gamba:-1, kashima:-1, urawa:-2 },
  l3: { kawasaki:2, sanfrecce:2, mito:2, okayama:2, nagasaki:2, cerezo:1, kyoto:1, shimizu:1, avispa:1, machida:1, kobe:-1, fctokyo:-1, gamba:-1, kashima:-1, urawa:-2 },
  // --- ビジュアル・カルチャー ---
  p2: { kashima:3, kawasaki:3, urawa:2, kobe:2, grampus:2, sanfrecce:1, nagasaki:1, shimizu:1, cerezo:1, gamba:1, avispa:1, machida:-1, okayama:-1, mito:-1 },
  gd2: { urawa:2, kawasaki:2, kobe:2, fctokyo:1, gamba:1, cerezo:1, machida:1, 'f-marinos':1, nagasaki:1, mito:-1, okayama:-1 },
  sn5: { kawasaki:3, machida:2, nagasaki:2, fctokyo:2, kobe:1, grampus:1, cerezo:1, gamba:1, sanfrecce:1, 'f-marinos':1, kashima:1, shimizu:-1, avispa:-1, okayama:-1, mito:-1 },
  mc4: { kawasaki:2, grampus:2, fctokyo:2, okayama:2, machida:1, chiba:1, nagasaki:1, cerezo:1, 'f-marinos':1, mito:1, kashima:1, avispa:1 },
}

async function main() {
  // ① backup
  const before = await sql`SELECT club_id, question_id, value, updated_at FROM jlsp_question_overrides ORDER BY club_id, question_id`
  const path = '/tmp/jlsp_question_overrides_pre_seed_v2.json'
  writeFileSync(path, JSON.stringify(before, null, 2))
  console.log(`backup ${before.length} rows -> ${path}`)

  // ② 旧質問の孤立 override を削除
  const del = await sql`DELETE FROM jlsp_question_overrides WHERE question_id <> ALL(${KEEP_IDS}) RETURNING question_id`
  console.log(`deleted ${del.length} orphan rows (旧質問)`)

  // ③ q05 符号反転
  const flip = await sql`UPDATE jlsp_question_overrides SET value = -value, updated_at = NOW() WHERE question_id = ${'q05'} RETURNING club_id`
  console.log(`flipped q05 sign: ${flip.length} rows`)

  // ④ 新規質問の値を upsert
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
  console.log(`upserted ${upserts} new-question values across ${Object.keys(V).length} questions`)

  const after = await sql`SELECT COUNT(*) AS n, COUNT(DISTINCT question_id) AS q, COUNT(DISTINCT club_id) AS c FROM jlsp_question_overrides`
  console.log(`final: ${after[0].n} rows / ${after[0].q} questions / ${after[0].c} clubs`)
}

main().catch((e) => { console.error(e); process.exit(1) })
