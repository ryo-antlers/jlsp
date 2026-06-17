import { saveClubMetaOverride } from '@/lib/jlsp/club-meta-loader'
import sql from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * club_meta_overrides の upsert / delete エンドポイント。
 *
 * Body:
 *   {
 *     club_id: string (必須)
 *     description_long: string | null
 *     mascot_name: string | null
 *     mascot_wiki_title: string | null
 *     mascot_description: string | null
 *   }
 *
 * 4 フィールドすべて null/空文字 → 行を削除 (= 静的デフォルトに戻す)
 * いずれか非 null → upsert
 */
export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body.club_id !== 'string') {
    return Response.json({ error: 'club_id required' }, { status: 400 })
  }
  const { club_id } = body
  const fields = {
    description_long: nonEmpty(body.description_long),
    mascots: nonEmptyArray(body.mascots),
    stadium: nonEmpty(body.stadium),
    sightseeing: nonEmptyArray(body.sightseeing),
    notable_alumni: nonEmptyArray(body.notable_alumni),
    current_players: nonEmptyArray(body.current_players),
  }
  const allEmpty = Object.values(fields).every((v) => v == null)
  try {
    if (allEmpty) {
      await sql`DELETE FROM club_meta_overrides WHERE club_id = ${club_id}`
      return Response.json({ ok: true, deleted: true })
    }
    await saveClubMetaOverride(club_id, fields)
    return Response.json({ ok: true })
  } catch (e) {
    console.error('[POST /api/admin/club-meta]', e)
    return Response.json({ error: e.message ?? String(e) }, { status: 500 })
  }
}

function nonEmpty(v) {
  if (v == null) return null
  if (typeof v !== 'string') return null
  const t = v.trim()
  return t.length > 0 ? t : null
}
function nonEmptyArray(v) {
  if (!Array.isArray(v) || v.length === 0) return null
  const cleaned = v.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
  return cleaned.length > 0 ? cleaned : null
}
