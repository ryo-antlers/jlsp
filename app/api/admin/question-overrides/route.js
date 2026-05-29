import sql from '@/lib/db'
import { RAW_CLUBS } from '@/lib/jlsp/clubs'
import { QUESTIONS } from '@/lib/jlsp/questions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 質問 × クラブ override の保存。
 *
 * Body: { club_id, question_id, value }
 *
 * value が base (vector × direction) と一致したら DELETE
 * (= 「明示的なオーバーライドだけ DB に残す」設計)
 */
export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (
    !body ||
    typeof body.club_id !== 'string' ||
    typeof body.question_id !== 'string' ||
    !Number.isInteger(body.value)
  ) {
    return Response.json(
      { error: 'club_id, question_id, integer value required' },
      { status: 400 },
    )
  }
  const { club_id, question_id, value } = body
  if (value < -3 || value > 3) {
    return Response.json({ error: 'value must be in [-3, 3]' }, { status: 400 })
  }
  const club = RAW_CLUBS.find((c) => c.id === club_id)
  const q = QUESTIONS.find((qq) => qq.id === question_id)
  if (!club || !q) {
    return Response.json({ error: 'unknown club_id or question_id' }, { status: 400 })
  }

  const base = clamp((club.vector[q.axis] ?? 0) * q.direction)
  try {
    if (value === base) {
      await sql`
        DELETE FROM jlsp_question_overrides
        WHERE club_id = ${club_id} AND question_id = ${question_id}
      `
      return Response.json({ ok: true, deleted: true })
    }
    await sql`
      INSERT INTO jlsp_question_overrides (club_id, question_id, value, updated_at)
      VALUES (${club_id}, ${question_id}, ${value}, NOW())
      ON CONFLICT (club_id, question_id) DO UPDATE SET
        value = EXCLUDED.value,
        updated_at = NOW()
    `
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[POST /api/admin/question-overrides]', e)
    return Response.json({ error: e.message ?? String(e) }, { status: 500 })
  }
}

function clamp(v) {
  return Math.max(-3, Math.min(3, v | 0))
}
