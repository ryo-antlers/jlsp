import { CLUBS, sortJ1Geo } from '@/lib/jlsp/clubs'
import { CLUB_META } from '@/lib/jlsp/club-meta'
import { SIGHTSEEING_SPOTS } from '@/lib/jlsp/sightseeing-spots'
import { NOTABLE_ALUMNI } from '@/lib/jlsp/club-players'
import { loadAllClubMetaOverrides } from '@/lib/jlsp/club-meta-loader'
import { getWikiThumbnail } from '@/lib/jlsp/wiki-image'
import ClubMetaClient from './client'

export const dynamic = 'force-dynamic'

/**
 * クラブ説明文 / マスコット説明文 を確認・編集する admin ページ。
 *
 * - 静的 club-meta.js (AI 生成のデフォルト) を左に
 * - Wikipedia の extract を中央に
 * - 編集可能な textarea を右に並べる
 * - 保存すると club_meta_overrides テーブルに upsert され、JLSP 結果ページに即反映
 *
 * 認証無し (jleakstats 側の /admin と同じ運用)
 */
async function loadData() {
  const overrides = await loadAllClubMetaOverrides()
  // 各クラブ + マスコットの wiki extract を並列取得
  const clubsForUI = await Promise.all(
    sortJ1Geo(CLUBS).map(async (c) => {
      const meta = CLUB_META[c.id] ?? {}
      const o = overrides[c.id] ?? null
      const clubWiki = await getWikiThumbnail(c.name).catch(() => null)
      return {
        id: c.id,
        name: c.name,
        division: c.division,
        prefecture: c.prefecture,
        color: c.color,
        staticDescriptionLong: meta.descriptionLong ?? '',
        staticSightseeing: SIGHTSEEING_SPOTS[c.id] ?? null,   // string[] | null
        staticAlumni: NOTABLE_ALUMNI[c.id] ?? null,           // string[] | null
        overrideDescriptionLong: o?.description_long ?? '',
        overrideMascots: Array.isArray(o?.mascots) ? o.mascots : null,  // string[] | null
        overrideStadium: o?.stadium ?? '',
        overrideSightseeing: Array.isArray(o?.sightseeing) ? o.sightseeing : null,
        overrideAlumni: Array.isArray(o?.notable_alumni) ? o.notable_alumni : null,
        overrideUpdatedAt: o?.updated_at ?? null,
        clubWikiTitle: clubWiki?.title ?? c.name,
        clubWikiPageUrl: clubWiki?.pageUrl ?? null,
        clubWikiExtract: clubWiki?.extract ?? null,
      }
    }),
  )
  return clubsForUI
}

export default async function ClubMetaAdminPage() {
  const clubs = await loadData()
  const overriddenCount = clubs.filter(
    (c) =>
      c.overrideDescriptionLong ||
      c.overrideMascots ||
      c.overrideStadium ||
      c.overrideSightseeing ||
      c.overrideAlumni,
  ).length

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-1">JLSP ADMIN</p>
        <h1 className="text-2xl font-black tracking-tight mb-2">クラブ説明文 編集</h1>
        <p className="text-xs text-zinc-400 mb-6">
          全 {clubs.length} クラブ・編集済み {overriddenCount} 件 / 静的デフォルト (
          <code className="font-mono text-zinc-300">lib/jlsp/club-meta.js</code>) + Wikipedia の extract
          を並べて表示。編集して保存すると JLSP 結果ページに即反映。空欄保存で静的デフォルトに戻る。
        </p>
        <ClubMetaClient clubs={clubs} />
      </div>
    </div>
  )
}
