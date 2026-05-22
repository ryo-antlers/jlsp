import sql from '../db.js'

/**
 * jleakstats から指定チームの「いまの状況」をまとめて取得する。
 * 全クエリ失敗時は安全に null/空配列を返してフォールバック。
 *
 * 戻り値:
 *   {
 *     standings:        // { rank, prev_rank, points, played, win, draw, lose,
 *                            goals_for, goals_against, form, group_name, season } | null
 *     recentMatches:    // last 5 終了試合 (新しい順)
 *     upcomingMatches:  // next 3 予定試合 (古い順)
 *     keyPlayers:       // 出場時間上位 3 名
 *   }
 */
export async function loadClubDetail(teamId) {
  if (!teamId) return null
  const tid = Number(teamId)

  const [standingsRows, recentRows, upcomingRows, playerRows, stadiumRows] = await Promise.all([
    sql`
      SELECT rank, prev_rank, points, played, win, draw, lose,
             goals_for, goals_against, form, group_name, season
      FROM standings
      WHERE team_id = ${tid}
      ORDER BY season DESC, updated_at DESC
      LIMIT 1
    `.catch(() => []),
    sql`
      SELECT f.id, f.date, f.home_team_id, f.away_team_id,
             f.home_score, f.away_score, f.status, f.venue_name_ja, f.round,
             ht.name_ja AS home_name, at.name_ja AS away_name,
             ht.color_primary AS home_color, at.color_primary AS away_color
      FROM fixtures f
      JOIN teams_master ht ON ht.id = f.home_team_id
      JOIN teams_master at ON at.id = f.away_team_id
      WHERE (f.home_team_id = ${tid} OR f.away_team_id = ${tid})
        AND f.status = 'FT'
      ORDER BY f.date DESC
      LIMIT 5
    `.catch(() => []),
    sql`
      SELECT f.id, f.date, f.home_team_id, f.away_team_id, f.status,
             f.venue_name_ja, f.round,
             ht.name_ja AS home_name, at.name_ja AS away_name,
             ht.color_primary AS home_color, at.color_primary AS away_color
      FROM fixtures f
      JOIN teams_master ht ON ht.id = f.home_team_id
      JOIN teams_master at ON at.id = f.away_team_id
      WHERE (f.home_team_id = ${tid} OR f.away_team_id = ${tid})
        AND f.date >= NOW()
        AND f.status IN ('NS', 'TBD', 'PST')
      ORDER BY f.date ASC
      LIMIT 3
    `.catch(() => []),
    // player_season_stats が空運用なので fixture_player_stats を集計
    sql`
      SELECT pm.id, pm.name_ja, pm.position, pm.no,
             COUNT(*)::int AS appearances,
             COALESCE(SUM(fps.minutes), 0)::int AS minutes,
             COALESCE(SUM(fps.goals), 0)::int AS goals,
             COALESCE(SUM(fps.assists), 0)::int AS assists
      FROM fixture_player_stats fps
      JOIN players_master pm ON pm.id = fps.player_id
      JOIN fixtures f ON f.id = fps.fixture_id
      WHERE fps.team_id = ${tid}
        AND pm.is_active = true
        AND f.season = (
          SELECT MAX(season) FROM fixtures
          WHERE home_team_id = ${tid} OR away_team_id = ${tid}
        )
      GROUP BY pm.id, pm.name_ja, pm.position, pm.no
      ORDER BY minutes DESC NULLS LAST
      LIMIT 3
    `.catch(() => []),
    sql`
      SELECT home_stadium_name, home_stadium_lat, home_stadium_lng
      FROM teams_master
      WHERE id = ${tid}
      LIMIT 1
    `.catch(() => []),
  ])

  return {
    standings: standingsRows[0] ?? null,
    recentMatches: recentRows,
    upcomingMatches: upcomingRows,
    keyPlayers: playerRows,
    stadium: stadiumRows[0] ?? null,
  }
}
