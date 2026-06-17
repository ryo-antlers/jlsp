import sql from '../db.js'
import { CLUB_META } from './club-meta.js'
import { SIGHTSEEING_SPOTS } from './sightseeing-spots.js'
import { NOTABLE_ALUMNI } from './club-players.js'

/**
 * club_meta_overrides テーブルから上書き値を取得し、
 * 静的 CLUB_META と merge した dict を返す。
 *
 * 優先度: DB override > 静的 club-meta.js / sightseeing-spots.js
 *
 * 戻り値: { [clubId]: ClubMeta }
 *   ClubMeta.sightseeingSpots: string[]  ← 結果ページが使う最終リスト (DB or static)
 */
export async function loadMergedClubMeta() {
  const rows = await sql`
    SELECT club_id, description_long, sightseeing, notable_alumni, mascots, stadium
    FROM club_meta_overrides
  `.catch(() => [])
  const overrides = {}
  for (const r of rows) overrides[r.club_id] = r

  const merged = {}
  for (const [id, base] of Object.entries(CLUB_META)) {
    const o = overrides[id] ?? {}
    merged[id] = {
      ...base,
      descriptionLong: o.description_long ?? base.descriptionLong,
      // マスコット一覧 (名前のみ・admin手入力)。
      mascots: Array.isArray(o.mascots) ? o.mascots : [],
      // スタジアム名の override (空なら結果ページ側で jleakstats 同期名にフォールバック)。
      stadium: o.stadium ?? null,
      sightseeingSpots:
        Array.isArray(o.sightseeing) && o.sightseeing.length > 0
          ? o.sightseeing
          : SIGHTSEEING_SPOTS[id] ?? null,
      notableAlumni:
        Array.isArray(o.notable_alumni) && o.notable_alumni.length > 0
          ? o.notable_alumni
          : NOTABLE_ALUMNI[id] ?? [],
    }
  }
  return merged
}

/** override 行を upsert (admin 側からの保存用) */
export async function saveClubMetaOverride(clubId, fields) {
  const {
    description_long = null,
    mascots = null,
    stadium = null,
    sightseeing = null,
    notable_alumni = null,
  } = fields
  // JSONB は明示的に JSON.stringify + ::jsonb キャストで型曖昧さを回避
  const mascotsJson = mascots == null ? null : JSON.stringify(mascots)
  const sightseeingJson = sightseeing == null ? null : JSON.stringify(sightseeing)
  const alumniJson = notable_alumni == null ? null : JSON.stringify(notable_alumni)
  await sql`
    INSERT INTO club_meta_overrides
      (club_id, description_long, mascots, stadium, sightseeing, notable_alumni, updated_at)
    VALUES
      (${clubId}, ${description_long}, ${mascotsJson}::jsonb, ${stadium},
       ${sightseeingJson}::jsonb, ${alumniJson}::jsonb, NOW())
    ON CONFLICT (club_id) DO UPDATE SET
      description_long = EXCLUDED.description_long,
      mascots          = EXCLUDED.mascots,
      stadium          = EXCLUDED.stadium,
      sightseeing      = EXCLUDED.sightseeing,
      notable_alumni   = EXCLUDED.notable_alumni,
      updated_at       = NOW()
  `
}

/** 全 override 行を取得 (admin 一覧表示用) */
export async function loadAllClubMetaOverrides() {
  const rows = await sql`
    SELECT club_id, description_long, sightseeing, notable_alumni, mascots, stadium, updated_at
    FROM club_meta_overrides
  `.catch(() => [])
  const byId = {}
  for (const r of rows) byId[r.club_id] = r
  return byId
}
