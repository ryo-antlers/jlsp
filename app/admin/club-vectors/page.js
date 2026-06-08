import sql from '@/lib/db'
import { CLUBS, RAW_CLUBS, sortJ1Geo } from '@/lib/jlsp/clubs'
import { AXES } from '@/lib/jlsp/axes'
import ClubVectorsClient from './client'

export const dynamic = 'force-dynamic'

/**
 * 全 60 クラブ × 4 軸 のベクトル値を直接編集する admin ページ。
 *
 * 静的 RAW_CLUBS.vector を base、`jlsp_vector_overrides` を override として merge。
 * 編集 → 保存で DB の jlsp_vector_overrides に upsert (base と同値なら delete)。
 * 結果ページの診断ロジック (loader.js) が次回リクエストから即反映。
 */
async function loadOverrides() {
  const rows = await sql`
    SELECT club_id, axis_id, value FROM jlsp_vector_overrides
  `.catch(() => [])
  const byClub = {}
  for (const r of rows) {
    if (!byClub[r.club_id]) byClub[r.club_id] = {}
    byClub[r.club_id][r.axis_id] = Number(r.value)
  }
  return byClub
}

export default async function ClubVectorsPage() {
  const overrides = await loadOverrides()
  // J1 のみ、地理順 (北 → 南)
  const clubs = sortJ1Geo(CLUBS).map((c) => {
    const raw = RAW_CLUBS.find((r) => r.id === c.id) ?? c
    return {
      id: c.id,
      name: c.name,
      division: c.division,
      color: c.color,
      baseVector: raw.vector,
      overrideVector: overrides[c.id] ?? {},
    }
  })
  const totalOverrides = Object.values(overrides).reduce(
    (s, v) => s + Object.keys(v).length,
    0,
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-1">JLSP ADMIN</p>
        <h1 className="text-2xl font-black tracking-tight mb-2">クラブベクトル編集</h1>
        <p className="text-xs text-zinc-400 mb-6">
          全 {clubs.length} クラブ ({totalOverrides} 軸が override されてる) ×
          4 軸 ({AXES.map((a) => `${a.label}${a.positive.letter}/${a.negative.letter}`).join(' / ')})。
          base 値は{' '}
          <code className="font-mono text-zinc-300">lib/jlsp/clubs.js</code> の
          RAW_CLUBS、編集値は{' '}
          <code className="font-mono text-zinc-300">jlsp_vector_overrides</code>{' '}
          テーブルに保存され、結果ページに即反映 (cache 無し)。
        </p>
        <ClubVectorsClient clubs={clubs} axes={AXES} />
      </div>
    </div>
  )
}
