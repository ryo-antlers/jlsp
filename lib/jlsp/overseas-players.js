import sql from '../db.js'

/**
 * 結果ページに表示する海外リーグの allowlist。
 *
 * jleakstats DB の player_overseas_status には 30+ リーグ分の選手が格納されているが、
 * 「強豪国 1 部 + 主要 2 部 + ステータス感ある国」に絞って表示する方針。
 * 拡張・除外は league_id を足し引きするだけ。
 *
 * 除外中の主なリーグ:
 *   - K League 1/2 (韓国), A-League (豪), Super League (中国), Stars League (カタール),
 *   - England League One/Two/National League, 3. Liga (DE), Serie C (IT), National 1 (FR),
 *   - Süper Lig (Turkey), Süper Lig (Cyprus), NB I (Hungary), Liga MX (Mexico),
 *   - Super League 1 (Greece), Liga 1 (Indonesia)
 */
const DISPLAY_LEAGUE_IDS = [
  // 欧州 5 大 1+2 部
  39, 40,           // England Premier + Championship
  140, 141,         // Spain La Liga + Segunda División
  135, 136,         // Italy Serie A + Serie B
  78, 79,           // Germany Bundesliga + 2. Bundesliga
  61, 62,           // France Ligue 1 + Ligue 2
  // 主要欧州 1 部
  88,               // Netherlands Eredivisie
  94,               // Portugal Primeira Liga
  144,              // Belgium Jupiler Pro League
  179,              // Scotland Premiership
  // 北欧 1 部
  119,              // Denmark Superliga
  103,              // Norway Eliteserien
  113,              // Sweden Allsvenskan
  // 中欧 1 部
  207,              // Switzerland Super League
  218,              // Austria Bundesliga
  106,              // Poland Ekstraklasa
  345,              // Czech Republic Czech Liga
  210,              // Croatia HNL
  // 主要欧州 2 部 (loan 先)
  89,               // Netherlands Eerste Divisie
  145,              // Belgium Challenger Pro League
  // 北米南米
  71,               // Brazil Brasileirão Série A
  253,              // USA Major League Soccer
  // 中東 (主要 + 日本人実績)
  301,              // United Arab Emirates Pro League
  307,              // Saudi Arabia Pro League
  // アジア
  296,              // Thailand Thai League 1
]

/**
 * 海外でプレー中の日本人選手 + 元 J 外国人 を J クラブ単位でグループ化して取得する。
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
        -- U-23 / 選抜 (派生チーム) を「元クラブ」として拾わない
        AND team_id NOT IN (4316, 4320, 4325, 7000)
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
    WHERE pos.league_id = ANY(${DISPLAY_LEAGUE_IDS})
      AND pos.nationality = 'Japan'  -- 日本人選手だけに絞る (元 J 外国人は admin で確認可)
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
  Greece: 'ギリシャ',
  Hungary: 'ハンガリー',
  Poland: 'ポーランド',
  'Czech Republic': 'チェコ',
  Croatia: 'クロアチア',
  Mexico: 'メキシコ',
  Brazil: 'ブラジル',
  'United Arab Emirates': 'UAE',
  Qatar: 'カタール',
  Australia: 'オーストラリア',
  Thailand: 'タイ',
  Indonesia: 'インドネシア',
  China: '中国',
}
