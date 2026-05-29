import sql from '../db.js'

/**
 * jleakstats から指定チームの「いまの状況」をまとめて取得する。
 * 全クエリ失敗時は安全に null/空配列を返してフォールバック。
 *
 * standings は jleakstats と同じ「fixtures からリアルタイム集計」方式。
 * standings テーブル (API-Football 由来) は cron 停止で古くなりがちなので不使用。
 *
 * 戻り値:
 *   {
 *     standings:        // { rank, points, played, win, draw, lose,
 *                            goals_for, goals_against, goals_diff, form, group_name } | null
 *     recentMatches:    // last 5 終了試合 (新しい順)
 *     upcomingMatches:  // next 3 予定試合 (古い順)
 *     stadium:          // { home_stadium_name, ..._lat, ..._lng } | null
 *   }
 */
export async function loadClubDetail(teamId) {
  if (!teamId) return null
  const tid = Number(teamId)

  const [standings, recentRows, upcomingRows, stadiumRows] = await Promise.all([
    computeStandingsForTeam(tid),
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
      -- 同じ日付・対戦カードの fixture が複数 source 由来で重複登録される
      -- ケース (例: 公式記録 + API-Football 双方が同試合を別 ID で持つ) があるため
      -- DISTINCT ON (date, home, away) で 1 件に絞る。venue_name_ja が入ってる
      -- 公式由来の行を優先するため venue 有無で ORDER。
      SELECT * FROM (
        SELECT DISTINCT ON (f.date, f.home_team_id, f.away_team_id)
               f.id, f.date, f.home_team_id, f.away_team_id, f.status,
               f.venue_name_ja, f.round,
               ht.name_ja AS home_name, at.name_ja AS away_name,
               ht.color_primary AS home_color, at.color_primary AS away_color
        FROM fixtures f
        JOIN teams_master ht ON ht.id = f.home_team_id
        JOIN teams_master at ON at.id = f.away_team_id
        WHERE (f.home_team_id = ${tid} OR f.away_team_id = ${tid})
          AND f.date >= NOW()
          AND f.status IN ('NS', 'TBD', 'PST')
        ORDER BY f.date, f.home_team_id, f.away_team_id,
                 (f.venue_name_ja IS NULL) ASC, f.id ASC
      ) dedup
      ORDER BY date ASC
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
    standings,
    recentMatches: recentRows,
    upcomingMatches: upcomingRows,
    stadium: stadiumRows[0] ?? null,
  }
}

/**
 * fixtures から指定チームの順位 (グループ内) をリアルタイム集計する。
 * jleakstats /standings/page.js の buildStandings ロジック移植。
 *
 * - 同じ group_name (EAST / WEST) 内で勝点 → 得失点差 → 得点 でソート
 * - PEN 決着は 2-1 (勝者 2pt, 敗者 1pt) のスコア配分
 * - form は直近 5 試合の W/D/L 文字列
 */
async function computeStandingsForTeam(teamId) {
  // 1. このチームの group_name を取得 (EAST / WEST / J1 等)
  const teamRow = await sql`
    SELECT group_name FROM teams_master WHERE id = ${teamId} LIMIT 1
  `.catch(() => [])
  const groupName = teamRow[0]?.group_name
  if (!groupName) return null

  // 2. 同 group の全チーム
  const groupTeams = await sql`
    SELECT id FROM teams_master WHERE group_name = ${groupName}
  `.catch(() => [])
  if (groupTeams.length === 0) return null
  const teamIds = groupTeams.map((t) => Number(t.id))

  // 3. 今シーズン (= fixtures の最大 season) のグループ内対戦のみ
  const fixtures = await sql`
    SELECT id, home_team_id, away_team_id,
           home_score, away_score, home_penalty, away_penalty, status, date
    FROM fixtures
    WHERE season = (SELECT MAX(season) FROM fixtures)
      AND status IN ('FT', 'AET', 'PEN')
      AND home_team_id = ANY(${teamIds})
      AND away_team_id = ANY(${teamIds})
    ORDER BY date ASC
  `.catch(() => [])

  // 4. 集計
  const stats = {}
  const formMap = {}
  for (const id of teamIds) {
    stats[id] = { team_id: id, played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, points: 0 }
    formMap[id] = []
  }
  for (const f of fixtures) {
    const h = f.home_team_id
    const a = f.away_team_id
    if (!stats[h] || !stats[a]) continue
    const hs = Number(f.home_score)
    const as_ = Number(f.away_score)
    const isPK = f.status === 'PEN' && f.home_penalty != null && f.away_penalty != null
    const hPK = isPK ? Number(f.home_penalty) : null
    const aPK = isPK ? Number(f.away_penalty) : null

    stats[h].played++
    stats[a].played++
    stats[h].gf += hs
    stats[h].ga += as_
    stats[a].gf += as_
    stats[a].ga += hs

    let hResult, aResult
    if (hs > as_) {
      stats[h].win++
      stats[a].lose++
      stats[h].points += 3
      hResult = 'W'
      aResult = 'L'
    } else if (hs < as_) {
      stats[a].win++
      stats[h].lose++
      stats[a].points += 3
      hResult = 'L'
      aResult = 'W'
    } else if (isPK) {
      if (hPK > aPK) {
        stats[h].win++
        stats[a].lose++
        stats[h].points += 2
        stats[a].points += 1
        hResult = 'W'
        aResult = 'L'
      } else {
        stats[a].win++
        stats[h].lose++
        stats[a].points += 2
        stats[h].points += 1
        hResult = 'L'
        aResult = 'W'
      }
    } else {
      stats[h].draw++
      stats[a].draw++
      stats[h].points += 1
      stats[a].points += 1
      hResult = 'D'
      aResult = 'D'
    }
    formMap[h].push(hResult)
    formMap[a].push(aResult)
  }

  // 5. ソート + rank
  const sorted = Object.values(stats)
    .map((s) => ({
      ...s,
      goals_diff: s.gf - s.ga,
      form: formMap[s.team_id].slice(-5).join(''),
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goals_diff !== a.goals_diff) return b.goals_diff - a.goals_diff
      return b.gf - a.gf
    })
  sorted.forEach((r, i) => {
    r.rank = i + 1
  })

  const me = sorted.find((r) => r.team_id === teamId)
  if (!me) return null
  return {
    rank: me.rank,
    points: me.points,
    played: me.played,
    win: me.win,
    draw: me.draw,
    lose: me.lose,
    goals_for: me.gf,
    goals_against: me.ga,
    goals_diff: me.goals_diff,
    form: me.form,
    group_name: groupName,
  }
}
