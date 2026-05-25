import sql from '../db.js'

/**
 * 主なOB選手の「このクラブでの J リーグ戦 出場数・ゴール数」を一括取得。
 *
 * - 名前のスペース有無差を吸収 (DB: '内田 篤人' vs NOTABLE_ALUMNI: '内田篤人')
 * - 同名で canonical_id が複数あるケースは出場数の多い方を採用
 * - 集計対象: J1/J2/J3 リーグ戦のみ (cup / cs_league / 'J' / 'F' 等は除外)
 *   → 例: 鹿島 曽ヶ端準 = 533 試合 (616 = カップ含む)
 *
 * 戻り値: { [originalName]: { apps, goals, canonicalId, jpName } | null }
 */
export async function loadAlumniStats(teamId, names) {
  if (!teamId || !Array.isArray(names) || names.length === 0) return {}

  // 入力名と DB 値の両方からスペース除去して突合
  const normalized = Array.from(new Set(names.map((n) => normalize(n))))
  const rows = await sql`
    SELECT
      REPLACE(pm.name_ja, ' ', '') AS norm_name,
      pm.name_ja AS jp_name,
      pm.id AS canonical_id,
      SUM(COALESCE(pcs.league_apps, 0))::int AS apps,
      SUM(COALESCE(pcs.league_goals, 0))::int AS goals
    FROM player_career_summary pcs
    JOIN players_master pm ON pm.id = pcs.canonical_id
    WHERE pcs.team_id = ${teamId}
      AND pcs.league IN ('J1', 'J2', 'J3')
      AND REPLACE(pm.name_ja, ' ', '') = ANY(${normalized})
    GROUP BY pm.name_ja, pm.id
  `.catch(() => [])

  // 同名複数 canonical のうち、apps の大きい方を採用
  const byNorm = {}
  for (const r of rows) {
    const prev = byNorm[r.norm_name]
    if (!prev || prev.apps < r.apps) {
      byNorm[r.norm_name] = {
        apps: r.apps,
        goals: r.goals,
        canonicalId: r.canonical_id,
        jpName: r.jp_name,
      }
    }
  }

  // 元の入力名のキーで引けるマップに変換
  const out = {}
  for (const original of names) {
    out[original] = byNorm[normalize(original)] ?? null
  }
  return out
}

function normalize(s) {
  return (s ?? '').replace(/\s+/g, '')
}
