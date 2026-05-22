import { QUESTIONS } from './questions.js'
import { CLUBS } from './clubs.js'
import { emptyVector } from './axes.js'
import { OVERRIDES } from './overrides.js'
import { vectorToCode } from './type-meta.js'

export { vectorToCode }

/** 4軸スコア化 (各軸 -∞〜+∞ の整数。実際は ±MAX_PER_AXIS の範囲)。 */
export function scoreAnswers(answers) {
  const vec = emptyVector()
  const byId = new Map(QUESTIONS.map((q) => [q.id, q]))
  for (const a of answers) {
    const q = byId.get(a.questionId)
    if (!q) continue
    vec[q.axis] += a.step * q.direction
  }
  return vec
}

export const MAX_PER_AXIS = (() => {
  const counts = { shoubu: 0, keiei: 0, kansen: 0, kanshin: 0 }
  for (const q of QUESTIONS) counts[q.axis] += 1
  return {
    shoubu: counts.shoubu * 3,
    keiei: counts.keiei * 3,
    kansen: counts.kansen * 3,
    kanshin: counts.kanshin * 3,
  }
})()

/** 質問1問あたりの想定最大差 (user ±3 vs club ±3 → 最大6)。スコア%計算用。 */
const MAX_DIFF_PER_QUESTION = 6

/**
 * クラブのある質問への期待値。優先順位:
 *  1. OVERRIDES[clubId][qid] (overrides.json、admin 編集)
 *  2. club.overrides[qid] (clubs.js に直書き、レアケース)
 *  3. vector[axis] * direction (自動算出、-2〜+2 の範囲)
 */
export function clubExpectedAnswer(club, q) {
  const fromFile = OVERRIDES[club.id]?.[q.id]
  if (fromFile !== undefined) return fromFile
  const inline = club.overrides?.[q.id]
  if (inline !== undefined) return inline
  return club.vector[q.axis] * q.direction
}

/**
 * L1距離マッチング: 各質問でユーザー回答とクラブ期待値の差を取り、合計が小さいクラブほど良マッチ。
 * 戻り値は score 降順 (相性が高い順) の TOP n。
 *
 * clubsList を渡せば対象クラブ集合を差し替えられる (SSR で loader 経由の
 * jleakstats 色付き clubs を使う等)。未指定なら静的 CLUBS。
 */
export function matchClubs(answers, top = 3, clubsList = null) {
  const useClubs = clubsList ?? CLUBS
  const qById = new Map(QUESTIONS.map((q) => [q.id, q]))
  const maxTotal = answers.length * MAX_DIFF_PER_QUESTION

  const scored = useClubs.map((club) => {
    let distance = 0
    for (const a of answers) {
      const q = qById.get(a.questionId)
      if (!q) continue
      const expected = clubExpectedAnswer(club, q)
      distance += Math.abs(a.step - expected)
    }
    const score = Math.max(0, 1 - distance / maxTotal)
    return { club, score }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, top)
}

/**
 * 総合診断。タイプは出さず TOP3 クラブのみを返す。
 *   { vector: 4軸スコア, matches: [{ club, score }, ...] }
 */
export function diagnose(answers) {
  const vector = scoreAnswers(answers)
  const matches = matchClubs(answers, 3)
  return { vector, matches }
}

/**
 * 48 問の step を URL 用にコンパクト化する。
 *   - step は -3..+3 の 7 値 → +3 オフセットで 0..6 に
 *   - 2 答を 1 文字に詰める (7×7=49 種、49 文字のアルファベット)
 *   - 48 問 → 24 文字 (例: 旧 ~120 文字から 1/5 に)
 *
 * アルファベット: A-Z + a-w (49 文字、x/y/z 等の見間違いやすい文字は除外)
 */
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvw'
const STEP_OFFSET = 3

export function encodeAnswers(answers) {
  const byId = new Map(answers.map((a) => [a.questionId, a.step]))
  const vals = QUESTIONS.map((q) => (byId.get(q.id) ?? 0) + STEP_OFFSET)
  let out = ''
  for (let i = 0; i < vals.length; i += 2) {
    const a = vals[i]
    const b = i + 1 < vals.length ? vals[i + 1] : 0
    out += ALPHA[a * 7 + b]
  }
  return out
}

export function decodeAnswers(s) {
  const expectedLen = Math.ceil(QUESTIONS.length / 2)
  if (typeof s !== 'string' || s.length !== expectedLen) return null
  const vals = []
  for (const c of s) {
    const idx = ALPHA.indexOf(c)
    if (idx < 0 || idx >= 49) return null
    vals.push(Math.floor(idx / 7))
    vals.push(idx % 7)
  }
  return QUESTIONS.map((q, i) => ({
    questionId: q.id,
    step: vals[i] - STEP_OFFSET,
  }))
}

/**
 * 4軸ベクトルから「典型ユーザー」の32問回答を合成。
 * URL に ?a= が無い場合のフォールバック用。
 */
export function syntheticAnswersFromVector(v) {
  return QUESTIONS.map((q) => {
    const raw = v[q.axis] * q.direction
    const clamped = Math.max(-3, Math.min(3, Math.round(raw)))
    return {
      questionId: q.id,
      step: clamped,
    }
  })
}
