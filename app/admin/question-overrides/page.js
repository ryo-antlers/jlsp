import sql from '@/lib/db'
import { CLUBS, RAW_CLUBS, sortJ1Geo } from '@/lib/jlsp/clubs'
import { QUESTIONS, QUESTION_CATEGORIES, CATEGORY_BY_ID } from '@/lib/jlsp/questions'
import { AXIS_BY_ID } from '@/lib/jlsp/axes'
import QuestionOverridesClient from './client'

export const dynamic = 'force-dynamic'

/**
 * 質問 × クラブ オーバーライド編集 admin。
 *
 * jlsp_question_overrides (club_id, question_id, value) に保存し、
 * diagnose.js clubExpectedAnswer() が vector 計算より優先して使う。
 *
 * UI: 質問を 1 つ選び → 20 J1 クラブの「期待値」を一覧編集。
 * vector × direction で算出される base を表示し、ボタンで上書き。
 */
async function loadOverrides() {
  const rows = await sql`
    SELECT club_id, question_id, value FROM jlsp_question_overrides
  `.catch(() => [])
  // key: `${club_id}|${question_id}` → value
  const byKey = {}
  for (const r of rows) byKey[`${r.club_id}|${r.question_id}`] = Number(r.value)
  return byKey
}

export default async function QuestionOverridesPage() {
  const overrides = await loadOverrides()
  const clubs = sortJ1Geo(CLUBS).map((c) => {
    const raw = RAW_CLUBS.find((r) => r.id === c.id) ?? c
    return {
      id: c.id,
      name: c.name,
      short_name: c.short_name,
      color: c.color,
      // 効果的な vector (loader 適用後)
      vector: c.vector,
      // base vector (clubs.js の RAW)
      baseVector: raw.vector,
    }
  })

  // 質問リスト + 各質問のメタ
  const questions = QUESTIONS.map((q) => {
    const cat = CATEGORY_BY_ID[q.category]
    const axis = q.legacyAxis ? AXIS_BY_ID[q.legacyAxis] : null
    return {
      id: q.id,
      text: q.statement ?? q.text ?? '',  // questions.js は statement フィールド
      category: q.category,
      categoryLabel: cat?.label ?? q.category,
      // legacy 軸を持つ質問のみ +/- の極ラベルを表示
      legacyAxis: q.legacyAxis ?? null,
      positiveLabel: axis?.positive ?? null,
      negativeLabel: axis?.negative ?? null,
      direction: q.direction ?? null,
    }
  })

  // base 期待値を事前計算してクライアントへ
  // legacy 軸あり → vector × direction、無し（新質問）→ 0
  // 形: { [club_id|question_id]: baseExpected }
  const baseExpectations = {}
  for (const c of clubs) {
    for (const q of QUESTIONS) {
      const base = q.legacyAxis ? (c.vector[q.legacyAxis] ?? 0) * q.direction : 0
      baseExpectations[`${c.id}|${q.id}`] = clamp(base)
    }
  }

  const overrideCount = Object.keys(overrides).length

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-1">JLSP ADMIN</p>
        <h1 className="text-2xl font-black tracking-tight mb-2">質問 × クラブ オーバーライド</h1>
        <p className="text-xs text-zinc-400 mb-2">
          全 {questions.length} 質問 × {clubs.length} J1 クラブ = {questions.length * clubs.length} セル
          中、 {overrideCount} が override 中。
        </p>
        <p className="text-[11px] text-zinc-500 mb-6 leading-relaxed">
          各質問について「このクラブのサポーターならこの step で答えるはず」を直接指定。
          vector × direction で計算される base 値を上書きし、jlsp_question_overrides に保存。
          base と同値で保存すると DB から自動削除されるので「明示的なオーバーライドだけ」が
          残る設計。診断ロジック (diagnose.js) は次の result ページ訪問から即反映。
        </p>
        <QuestionOverridesClient
          questions={questions}
          clubs={clubs}
          categories={QUESTION_CATEGORIES}
          overrides={overrides}
          baseExpectations={baseExpectations}
        />
      </div>
    </div>
  )
}

function clamp(v) {
  return Math.max(-3, Math.min(3, v | 0))
}
