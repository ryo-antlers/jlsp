import { decodeAnswers, matchClubs, scoreAnswers, vectorToCode } from './diagnose.js'
import { TYPE_META } from './type-meta.js'
import { loadJlspState } from './loader.js'
import { loadClubDetail } from './club-detail.js'
import { loadOverseasPlayersByJTeam } from './overseas-players.js'
import { loadMergedClubMeta } from './club-meta-loader.js'
import { loadAlumniStats } from './alumni-stats.js'
import { NOTABLE_ALUMNI } from './club-players.js'

/**
 * 結果ページ用の共通データロード。
 * 各デザイン案 (Z / A / B / C) で同じデータを使えるように。
 *
 * 戻り値が null の場合は notFound() すべき。
 */
export async function loadResultData({ clubId, a }) {
  if (!a) return null
  const answers = decodeAnswers(a)
  if (!answers) return null

  const state = await loadJlspState()
  if (!state.clubs.find((c) => c.id === clubId)) return null

  const all = matchClubs(answers, state.clubs.length, state.clubs)
  const top1 = all[0]
  const top3 = all.slice(0, 3)
  const worst3 = all.slice(-3).reverse()
  const teamId = state.teamIdByClubId[top1.club.id]
  const [detail, overseasByJTeam, mergedClubMeta] = await Promise.all([
    loadClubDetail(teamId),
    loadOverseasPlayersByJTeam().catch(() => ({})),
    loadMergedClubMeta().catch(() => ({})),
  ])
  const clubMeta = mergedClubMeta[top1.club.id] ?? {}
  // overseasDataAvailable: DB に少なくとも1件 海外組データがあるかどうか。
  // false (= migration 未適用 / sync 未実行) なら静的 fallback を許可。
  // true ならば「このクラブには海外組ゼロ」と確定し、何も表示しない。
  const overseasDataAvailable = Object.keys(overseasByJTeam).length > 0
  const overseasPlayers = teamId ? (overseasByJTeam[String(teamId)] ?? []) : []

  // 主なOB選手の出場 / ゴール集計 (merged → 静的 fallback の順で名前を確定してから引く)
  const alumniNames =
    clubMeta?.notableAlumni ?? NOTABLE_ALUMNI[top1.club.id] ?? []
  const alumniStats = teamId
    ? await loadAlumniStats(teamId, alumniNames).catch(() => ({}))
    : {}

  const userVector = scoreAnswers(answers)
  const userTypeCode = vectorToCode(userVector)
  const userType = TYPE_META[userTypeCode]

  return {
    answers,
    state,
    all,
    top1,
    top3,
    worst3,
    teamId,
    detail,
    overseasPlayers,
    overseasDataAvailable,
    clubMeta,
    alumniStats,
    userVector,
    userTypeCode,
    userType,
  }
}
