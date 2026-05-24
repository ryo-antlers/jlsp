import sql from '../db.js'
import { CLUB_META } from './club-meta.js'

/**
 * club_meta_overrides テーブルから上書き値を取得し、
 * 静的 CLUB_META と merge した dict を返す。
 *
 * 優先度: DB override > 静的 club-meta.js (descriptionLong / mascot.*)
 *
 * 戻り値:
 *   { [clubId]: ClubMeta }  ※ 形は CLUB_META と同じ
 */
export async function loadMergedClubMeta() {
  const rows = await sql`
    SELECT club_id, description_long, mascot_name, mascot_description, mascot_wiki_title
    FROM club_meta_overrides
  `.catch(() => [])
  const overrides = {}
  for (const r of rows) overrides[r.club_id] = r

  const merged = {}
  for (const [id, base] of Object.entries(CLUB_META)) {
    const o = overrides[id]
    if (!o) {
      merged[id] = base
      continue
    }
    merged[id] = {
      ...base,
      descriptionLong: o.description_long ?? base.descriptionLong,
      mascot: base.mascot
        ? {
            ...base.mascot,
            name: o.mascot_name ?? base.mascot.name,
            description: o.mascot_description ?? base.mascot.description,
            wikiTitle: o.mascot_wiki_title ?? base.mascot.wikiTitle,
          }
        : base.mascot,
    }
  }
  return merged
}

/** override 行を upsert (admin 側からの保存用) */
export async function saveClubMetaOverride(clubId, fields) {
  const {
    description_long = null,
    mascot_name = null,
    mascot_description = null,
    mascot_wiki_title = null,
  } = fields
  await sql`
    INSERT INTO club_meta_overrides
      (club_id, description_long, mascot_name, mascot_description, mascot_wiki_title, updated_at)
    VALUES
      (${clubId}, ${description_long}, ${mascot_name}, ${mascot_description}, ${mascot_wiki_title}, NOW())
    ON CONFLICT (club_id) DO UPDATE SET
      description_long   = EXCLUDED.description_long,
      mascot_name        = EXCLUDED.mascot_name,
      mascot_description = EXCLUDED.mascot_description,
      mascot_wiki_title  = EXCLUDED.mascot_wiki_title,
      updated_at         = NOW()
  `
}

/** 全 override 行を取得 (admin 一覧表示用) */
export async function loadAllClubMetaOverrides() {
  const rows = await sql`
    SELECT club_id, description_long, mascot_name, mascot_description, mascot_wiki_title, updated_at
    FROM club_meta_overrides
  `.catch(() => [])
  const byId = {}
  for (const r of rows) byId[r.club_id] = r
  return byId
}
