import sql from '@/lib/db'
import { RAW_CLUBS } from '@/lib/jlsp/clubs'
import { AXIS_IDS } from '@/lib/jlsp/axes'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * クラブベクトル override の保存。
 *
 * Body:
 *   { club_id: string, vector: { shoubu, keiei, kansen, kanshin } }
 *
 * 各軸で base (RAW_CLUBS.vector) と比較:
 *   - 一致  → DB から override 削除
 *   - 不一致 → upsert
 *
 * これにより DB に「真の上書きだけ」が残るので merge ロジックが clean。
 */
export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body.club_id !== 'string' || !body.vector) {
    return Response.json({ error: 'club_id + vector required' }, { status: 400 })
  }
  const { club_id, vector } = body
  const raw = RAW_CLUBS.find((c) => c.id === club_id)
  if (!raw) {
    return Response.json({ error: `unknown club_id: ${club_id}` }, { status: 400 })
  }
  try {
    for (const axisId of AXIS_IDS) {
      const v = Number(vector[axisId])
      if (!Number.isFinite(v) || v < -3 || v > 3 || !Number.isInteger(v)) {
        return Response.json(
          { error: `invalid value for ${axisId}: ${vector[axisId]}` },
          { status: 400 },
        )
      }
      const base = Number(raw.vector[axisId] ?? 0)
      if (v === base) {
        // base と同じ → override 不要、削除
        await sql`
          DELETE FROM jlsp_vector_overrides
          WHERE club_id = ${club_id} AND axis_id = ${axisId}
        `
      } else {
        // upsert
        await sql`
          INSERT INTO jlsp_vector_overrides (club_id, axis_id, value, updated_at)
          VALUES (${club_id}, ${axisId}, ${v}, NOW())
          ON CONFLICT (club_id, axis_id) DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = NOW()
        `
      }
    }
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[POST /api/admin/club-vectors]', e)
    return Response.json({ error: e.message ?? String(e) }, { status: 500 })
  }
}
