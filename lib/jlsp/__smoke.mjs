// スモークテスト: lib/jlsp/ の各モジュールがロード可能で、診断が動くことを確認する。
// 実行: node lib/jlsp/__smoke.mjs
//
// DATABASE_URL が .env.local にあれば DB 経路 (loader.js) も検証する。

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { AXES, AXIS_IDS, emptyVector } from './axes.js'
import { QUESTIONS } from './questions.js'
import { CLUBS, ALL_CLUBS, RAW_CLUBS } from './clubs.js'
import { diagnose, matchClubs, encodeAnswers, decodeAnswers, scoreAnswers, vectorToCode } from './diagnose.js'
import { TYPE_META } from './type-meta.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')

// .env.local を手動ロード (DATABASE_URL があれば DB 検証も実施)
try {
  const envText = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8')
  for (const line of envText.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) {
      const [, k, v] = m
      process.env[k] = v.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
    }
  }
} catch {
  // .env.local が無い → DB 検証スキップ
}

const fail = (msg) => { console.error('✗', msg); process.exitCode = 1 }
const ok = (msg) => console.log('✓', msg)

// --- 基本 sanity ---
const expectedAxisIds = ['shoubu', 'keiei', 'kansen', 'kanshin']
if (AXES.length === 4 && expectedAxisIds.every((id) => AXIS_IDS.includes(id))) {
  ok(`AXES count = 4 (${AXIS_IDS.join(', ')})`)
} else {
  fail(`AXES check failed: ${AXIS_IDS.join(', ')}`)
}

if (QUESTIONS.length === 48) ok(`QUESTIONS count = 48`)
else fail(`QUESTIONS count expected 48, got ${QUESTIONS.length}`)

if (ALL_CLUBS.length === 60) ok(`ALL_CLUBS count = 60 (J1+J2+J3)`)
else fail(`ALL_CLUBS count expected 60, got ${ALL_CLUBS.length}`)

if (CLUBS.length === 40) ok(`CLUBS count = 40 (J1+J2 only)`)
else fail(`CLUBS count expected 40, got ${CLUBS.length}`)

// 4軸ごとに +/- それぞれ 6 問
const counts = { shoubu: { pos: 0, neg: 0 }, keiei: { pos: 0, neg: 0 }, kansen: { pos: 0, neg: 0 }, kanshin: { pos: 0, neg: 0 } }
for (const q of QUESTIONS) {
  if (counts[q.axis] == null) { fail(`unknown axis: ${q.axis}`); continue }
  if (q.direction === +1) counts[q.axis].pos++
  else counts[q.axis].neg++
}
let balanced = true
for (const [axis, c] of Object.entries(counts)) {
  if (c.pos !== 6 || c.neg !== 6) { balanced = false; fail(`axis ${axis} unbalanced: pos=${c.pos} neg=${c.neg}`) }
}
if (balanced) ok(`Question balance: 各軸 +6/-6 問`)

// TYPE_META 16 entries
if (Object.keys(TYPE_META).length === 16) ok(`TYPE_META 16 タイプ (${Object.keys(TYPE_META).slice(0, 4).join(', ')}...)`)
else fail(`TYPE_META count expected 16, got ${Object.keys(TYPE_META).length}`)

// --- 診断 ---
// neutral
const neutralAnswers = QUESTIONS.map((q) => ({ questionId: q.id, step: 0 }))
const neutralResult = diagnose(neutralAnswers)
const neutralCode = vectorToCode(neutralResult.vector)
ok(`診断 (neutral): code=${neutralCode}, TOP3 = ${neutralResult.matches.map(m => `${m.club.name}(${(m.score * 100).toFixed(1)}%)`).join(', ')}`)

// RWUO 強烈派: 勝利至上 + 補強 + 熱狂 + 試合派
const rwuoAnswers = QUESTIONS.map((q) => ({ questionId: q.id, step: q.direction === +1 ? +3 : -3 }))
const rwuoResult = diagnose(rwuoAnswers)
const rwuoCode = vectorToCode(rwuoResult.vector)
if (rwuoCode === 'RWUO') ok(`診断 (全 +3): vectorToCode = RWUO ✓`)
else fail(`診断 (全 +3): expected RWUO, got ${rwuoCode}`)
ok(`診断 (RWUO 強烈派): TOP3 = ${rwuoResult.matches.map(m => `${m.club.name}(${(m.score * 100).toFixed(1)}%)`).join(', ')}`)
ok(`診断 (RWUO 強烈派): タイプ = ${rwuoCode} ${TYPE_META[rwuoCode]?.nickname}`)

// EHAF 反対派
const ehafAnswers = QUESTIONS.map((q) => ({ questionId: q.id, step: q.direction === +1 ? -3 : +3 }))
const ehafCode = vectorToCode(diagnose(ehafAnswers).vector)
if (ehafCode === 'EHAF') ok(`診断 (全反対): vectorToCode = EHAF ✓ (${TYPE_META[ehafCode]?.nickname})`)
else fail(`診断 (全反対): expected EHAF, got ${ehafCode}`)

// encode/decode round-trip
const encoded = encodeAnswers(rwuoAnswers)
const decoded = decodeAnswers(encoded)
if (decoded && decoded.length === 48 && decoded.every((a, i) => a.step === rwuoAnswers[i].step)) ok(`encode/decode round-trip OK (encoded len=${encoded.length})`)
else fail(`encode/decode round-trip 失敗`)

// 不正値
if (decodeAnswers('garbage') === null) ok(`decodeAnswers('garbage') === null`)
else fail(`decodeAnswers should reject garbage`)
if (decodeAnswers('1_2_3') === null) ok(`decodeAnswers (短すぎる) === null`)
else fail(`decodeAnswers should reject short input`)

// MAX_PER_AXIS
const maxR = QUESTIONS.filter(q => q.axis === 'shoubu').length * 3
const rwuoVec = scoreAnswers(rwuoAnswers)
if (Math.abs(rwuoVec.shoubu) <= maxR) ok(`scoreAnswers shoubu = ${rwuoVec.shoubu} (max ±${maxR})`)
else fail(`scoreAnswers shoubu out of range`)

// TOP3 ⊂ CLUBS
for (const m of neutralResult.matches) {
  if (!CLUBS.find(c => c.id === m.club.id)) fail(`TOP3 club ${m.club.id} not in CLUBS`)
}
ok(`TOP3 のクラブは全て CLUBS (J1+J2) 内`)

// --- DB 経路 (loader.js) ---
if (process.env.DATABASE_URL) {
  const { loadJlspState } = await import('./loader.js')
  const state = await loadJlspState()

  if (state.clubs.length === 40) ok(`loadJlspState().clubs = 40 (J1+J2)`)
  else fail(`loadJlspState().clubs length expected 40, got ${state.clubs.length}`)

  if (state.allClubs.length === 60) ok(`loadJlspState().allClubs = 60`)
  else fail(`loadJlspState().allClubs length expected 60, got ${state.allClubs.length}`)

  const vClubs = Object.keys(state.vectorOverrides).length
  const vRows = Object.values(state.vectorOverrides).reduce((sum, m) => sum + Object.keys(m).length, 0)
  ok(`vectorOverrides: ${vClubs} clubs, ${vRows} rows`)

  const qClubs = Object.keys(state.questionOverrides).length
  const qRows = Object.values(state.questionOverrides).reduce((sum, m) => sum + Object.keys(m).length, 0)
  ok(`questionOverrides: ${qClubs} clubs, ${qRows} rows`)

  // 新軸での DB ↔ JSON 一致
  const dbById = new Map(state.clubs.map((c) => [c.id, c]))
  let mismatch = 0
  for (const c of CLUBS) {
    const d = dbById.get(c.id)
    if (!d) { mismatch++; continue }
    for (const axisId of AXIS_IDS) {
      if (c.vector[axisId] !== d.vector[axisId]) {
        mismatch++
        if (mismatch <= 3) console.warn(`  mismatch ${c.id}.${axisId}: json=${c.vector[axisId]} db=${d.vector[axisId]}`)
      }
    }
  }
  if (mismatch === 0) ok(`DB 経路と JSON 経路の vector が完全一致 (40 クラブ × 4 軸)`)
  else fail(`DB と JSON で vector mismatch: ${mismatch} 件`)
} else {
  console.log('— DATABASE_URL なし、DB 経路スキップ')
}

if (process.exitCode) console.log('\n✗ SMOKE TEST FAILED')
else console.log('\n✓ SMOKE TEST PASSED')
