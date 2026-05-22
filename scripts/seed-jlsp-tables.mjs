// jlsp_* テーブルの作成 + JSON から seed する一発スクリプト。
// 実行: node scripts/seed-jlsp-tables.mjs
//
// - sql/create_jlsp_tables.sql の DDL を流す
// - lib/jlsp/vectors.json を jlsp_vector_overrides に投入
// - lib/jlsp/overrides.json を jlsp_question_overrides に投入
// - 既存行は ON CONFLICT で更新 (idempotent)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { neon } from '@neondatabase/serverless'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// .env.local を手動ロード (Next.js 外から実行するため)
const envText = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
  if (m) {
    const [, k, v] = m
    process.env[k] = v.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
  }
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found in .env.local')
  process.exit(1)
}

const sql = neon(process.env.DATABASE_URL)

console.log('--- 1. CREATE TABLE (IF NOT EXISTS) ---')
const ddl = fs.readFileSync(path.join(ROOT, 'sql/create_jlsp_tables.sql'), 'utf8')
// neon HTTP API は複数 statement を 1 ショットで受けないので、分割実行
const statements = ddl.split(/;\s*$/m).map((s) => s.trim()).filter((s) => s && !s.startsWith('--') || (s && s.includes('CREATE')))
for (const stmt of statements) {
  if (!stmt) continue
  // コメントのみの片はスキップ
  if (/^(\s|--.*\n)*$/.test(stmt)) continue
  console.log('  -', stmt.split('\n')[0].slice(0, 80))
  await sql.query(stmt)
}

console.log('\n--- 2a. CLEAN (axis_id 体系が変わったため旧データを全消し) ---')
await sql`DELETE FROM jlsp_vector_overrides`
await sql`DELETE FROM jlsp_question_overrides`
console.log('  cleared old rows')

console.log('\n--- 2. SEED jlsp_vector_overrides (from vectors.json) ---')
const vectors = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/jlsp/vectors.json'), 'utf8'))
let vCount = 0
for (const [clubId, axisMap] of Object.entries(vectors)) {
  for (const [axisId, value] of Object.entries(axisMap)) {
    await sql`
      INSERT INTO jlsp_vector_overrides (club_id, axis_id, value, updated_at)
      VALUES (${clubId}, ${axisId}, ${value}, NOW())
      ON CONFLICT (club_id, axis_id)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `
    vCount++
  }
}
console.log(`  inserted/updated ${vCount} rows`)

console.log('\n--- 3. SEED jlsp_question_overrides (from overrides.json) ---')
const qOverrides = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib/jlsp/overrides.json'), 'utf8'))
let qCount = 0
for (const [clubId, qMap] of Object.entries(qOverrides)) {
  for (const [questionId, value] of Object.entries(qMap)) {
    await sql`
      INSERT INTO jlsp_question_overrides (club_id, question_id, value, updated_at)
      VALUES (${clubId}, ${questionId}, ${value}, NOW())
      ON CONFLICT (club_id, question_id)
      DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `
    qCount++
  }
}
console.log(`  inserted/updated ${qCount} rows`)

console.log('\n--- 4. 確認 ---')
const v = await sql`SELECT COUNT(*) AS n FROM jlsp_vector_overrides`
const q = await sql`SELECT COUNT(*) AS n FROM jlsp_question_overrides`
console.log(`  jlsp_vector_overrides:   ${v[0].n} rows`)
console.log(`  jlsp_question_overrides: ${q[0].n} rows`)

console.log('\n  クラブ別 vector override 行数 (top 5):')
const byClub = await sql`
  SELECT club_id, COUNT(*) AS n
  FROM jlsp_vector_overrides
  GROUP BY club_id
  ORDER BY n DESC
  LIMIT 5
`
for (const r of byClub) console.log(`    ${r.club_id}: ${r.n}`)

console.log('\n✓ Seed complete')
