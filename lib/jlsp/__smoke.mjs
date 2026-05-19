// スモークテスト: lib/jlsp/ の各モジュールがロード可能で、診断が動くことを確認する。
// 実行: node lib/jlsp/__smoke.mjs

import { AXES, AXIS_IDS, emptyVector } from './axes.js'
import { QUESTIONS } from './questions.js'
import { CLUBS, ALL_CLUBS } from './clubs.js'
import { diagnose, matchClubs, encodeAnswers, decodeAnswers, scoreAnswers } from './diagnose.js'

const fail = (msg) => { console.error('✗', msg); process.exitCode = 1 }
const ok = (msg) => console.log('✓', msg)

// --- 基本 sanity ---
if (AXES.length === 4) ok(`AXES count = 4 (${AXIS_IDS.join(', ')})`)
else fail(`AXES count expected 4, got ${AXES.length}`)

if (QUESTIONS.length === 32) ok(`QUESTIONS count = 32`)
else fail(`QUESTIONS count expected 32, got ${QUESTIONS.length}`)

if (ALL_CLUBS.length === 60) ok(`ALL_CLUBS count = 60 (J1+J2+J3)`)
else fail(`ALL_CLUBS count expected 60, got ${ALL_CLUBS.length}`)

if (CLUBS.length === 40) ok(`CLUBS count = 40 (J1+J2 only)`)
else fail(`CLUBS count expected 40, got ${CLUBS.length}`)

// 4軸ごとに +/- それぞれ 4 問あること
const counts = { shoubu: { pos: 0, neg: 0 }, soshiki: { pos: 0, neg: 0 }, keiei: { pos: 0, neg: 0 }, nekkyou: { pos: 0, neg: 0 } }
for (const q of QUESTIONS) {
  if (q.direction === +1) counts[q.axis].pos++
  else counts[q.axis].neg++
}
let balanced = true
for (const [axis, c] of Object.entries(counts)) {
  if (c.pos !== 4 || c.neg !== 4) { balanced = false; fail(`axis ${axis} unbalanced: pos=${c.pos} neg=${c.neg}`) }
}
if (balanced) ok(`Question balance: 各軸 +4/-4 問`)

// --- 診断 ---
// パターン1: 全質問に neutral (0) で答える → 全クラブ中央寄り → TOP3 は接戦のはず
const neutralAnswers = QUESTIONS.map((q) => ({ questionId: q.id, step: 0 }))
const neutralResult = diagnose(neutralAnswers)
if (neutralResult.matches.length === 3) ok(`診断 (neutral): TOP3 = ${neutralResult.matches.map(m => `${m.club.name}(${(m.score * 100).toFixed(1)}%)`).join(', ')}`)
else fail(`診断 (neutral): matches count = ${neutralResult.matches.length}`)

// パターン2: 強烈な「勝利至上 R + 組織 S + マネー W + 過激 U」サポーター
// direction === +1 の質問は +3、direction === -1 の質問は -3
// ただし nekkyou は U=過激=negative なので逆に振る
const rambo = QUESTIONS.map((q) => {
  let step = q.direction === +1 ? +3 : -3
  if (q.axis === 'nekkyou') step = -step  // 過激派を狙うので逆向き
  return { questionId: q.id, step }
})
const ramboResult = diagnose(rambo)
ok(`診断 (R-S-W-U 強烈派): vector = ${JSON.stringify(ramboResult.vector)}`)
ok(`診断 (R-S-W-U 強烈派): TOP3 = ${ramboResult.matches.map(m => `${m.club.name}(${(m.score * 100).toFixed(1)}%)`).join(', ')}`)

// パターン3: encodeAnswers / decodeAnswers が round-trip
const encoded = encodeAnswers(rambo)
const decoded = decodeAnswers(encoded)
if (decoded && decoded.length === 32 && decoded.every((a, i) => a.step === rambo[i].step)) ok(`encode/decode round-trip OK (len=${encoded.length})`)
else fail(`encode/decode round-trip 失敗`)

// パターン4: 不正な encoded 文字列は null
if (decodeAnswers('garbage') === null) ok(`decodeAnswers('garbage') === null`)
else fail(`decodeAnswers should reject garbage`)
if (decodeAnswers('1_2_3') === null) ok(`decodeAnswers (短すぎる) === null`)
else fail(`decodeAnswers should reject short input`)

// パターン5: scoreAnswers の最大値 = MAX_PER_AXIS の範囲を超えない
const maxR = QUESTIONS.filter(q => q.axis === 'shoubu').length * 3
const ramboVec = scoreAnswers(rambo)
if (Math.abs(ramboVec.shoubu) <= maxR) ok(`scoreAnswers shoubu = ${ramboVec.shoubu} (max ±${maxR})`)
else fail(`scoreAnswers shoubu out of range`)

// パターン6: TOP3 の clubs は CLUBS (J1+J2) に含まれる
for (const m of neutralResult.matches) {
  if (!CLUBS.find(c => c.id === m.club.id)) fail(`TOP3 club ${m.club.id} not in CLUBS`)
}
ok(`TOP3 のクラブは全て CLUBS (J1+J2) 内`)

if (process.exitCode) console.log('\n✗ SMOKE TEST FAILED')
else console.log('\n✓ SMOKE TEST PASSED')
