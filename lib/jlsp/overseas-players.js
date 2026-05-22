import sql from '../db.js'

/**
 * 海外でプレー中の日本人選手を J クラブ単位でグループ化して取得する。
 *
 * データソース:
 *   - player_overseas_status: API-Football discover の結果 (canonical_id 単位)
 *   - player_career_summary  : 各選手の J 所属履歴 (team_id 付き)
 *
 * 各選手の「J 所属歴の最新シーズン」のクラブをキーに振り分ける。
 * J 所属歴が無い選手 (海外ユース上がり等) は対象外。
 *
 * 戻り値:
 *   { [jTeamId: number]: [{ name, club, country, league, position }, ...] }
 *
 * 注: discover script は is_active=false の選手のみ upsert する仕様。
 *     player_overseas_status に行があれば「現在Jにいない海外組」とみなしてよい。
 */
export async function loadOverseasPlayersByJTeam() {
  const rows = await sql`
    WITH latest_j AS (
      SELECT DISTINCT ON (canonical_id)
        canonical_id,
        team_id AS j_team_id,
        season_year
      FROM player_career_summary
      WHERE team_id IS NOT NULL
      ORDER BY canonical_id, season_year DESC
    )
    SELECT
      pos.canonical_id,
      COALESCE(pm.name_ja, pm.name_en) AS name,
      pm.name_en,
      pos.team_name AS overseas_club,
      pos.country,
      pos.league_name,
      pos.position,
      lj.j_team_id
    FROM player_overseas_status pos
    JOIN players_master pm ON pm.id = pos.canonical_id
    LEFT JOIN latest_j lj ON lj.canonical_id = pos.canonical_id
    ORDER BY pos.country, name
  `

  /** @type {Record<string, Array<{name,club,country,league,position}>>} */
  const byJTeam = {}
  for (const r of rows) {
    if (!r.j_team_id) continue // J 所属歴なし → 該当クラブに紐付かない
    const key = String(r.j_team_id)
    if (!byJTeam[key]) byJTeam[key] = []
    byJTeam[key].push({
      name: r.name,
      club: r.overseas_club,
      country: COUNTRY_JA[r.country] ?? r.country,
      league: r.league_name,
      position: r.position,
    })
  }
  return byJTeam
}

// API-Football の country 名を日本語に変換 (UI 表示用)
const COUNTRY_JA = {
  England: 'イングランド',
  Spain: 'スペイン',
  Italy: 'イタリア',
  Germany: 'ドイツ',
  France: 'フランス',
  Netherlands: 'オランダ',
  Portugal: 'ポルトガル',
  Belgium: 'ベルギー',
  Scotland: 'スコットランド',
  'South Korea': '韓国',
  USA: 'アメリカ',
  Switzerland: 'スイス',
  Austria: 'オーストリア',
  Denmark: 'デンマーク',
  Sweden: 'スウェーデン',
  Norway: 'ノルウェー',
  Turkey: 'トルコ',
  Cyprus: 'キプロス',
  'Saudi Arabia': 'サウジアラビア',
}
