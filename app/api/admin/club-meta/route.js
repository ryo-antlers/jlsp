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
    mascot_name: nonEmpty(body.mascot_name),
    mascot_wiki_title: nonEmpty(body.mascot_wiki_title),
    mascot_description: nonEmpty(body.mascot_description),
    access: nonEmptyObject(body.access),
    away_travel: nonEmptyObject(body.away_travel),
    sightseeing: nonEmptyArray(body.sightseeing),
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
function nonEmptyObject(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return null
  const keys = Object.keys(v)
  if (keys.length === 0) return null
  // 全 value が null/undefined/空文字なら null 扱い
  const hasValue = keys.some((k) => v[k] !== null && v[k] !== undefined && v[k] !== '')
  return hasValue ? v : null
}
function nonEmptyArray(v) {
  if (!Array.isArray(v) || v.length === 0) return null
  const cleaned = v.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean)
  return cleaned.length > 0 ? cleaned : null
}
