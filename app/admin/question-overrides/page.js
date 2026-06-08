import sql from '@/lib/db'
import { CLUBS, RAW_CLUBS, sortJ1Geo } from '@/lib/jlsp/clubs'
import { QUESTIONS } from '@/lib/jlsp/questions'
import { AXES, AXIS_BY_ID } from '@/lib/jlsp/axes'
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
    const axis = AXIS_BY_ID[q.axis]
    return {
      id: q.id,
      text: q.statement ?? q.text ?? '',  // questions.js は statement フィールド
      axis: q.axis,
      axisLabel: axis?.label,
      positiveLabel: axis?.positive,
      negativeLabel: axis?.negative,
      direction: q.direction,
    }
  })

  // base 期待値 (vector × direction) を事前計算してクライアントへ
  // 形: { [club_id|question_id]: baseExpected }
  const baseExpectations = {}
  for (const c of clubs) {
    for (const q of questions) {
      baseExpectations[`${c.id}|${q.id}`] = clamp((c.vector[q.axis] ?? 0) * q.direction)
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
          axes={AXES}
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
