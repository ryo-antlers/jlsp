import Link from 'next/link'
import { notFound } from 'next/navigation'
import { decodeAnswers, matchClubs, scoreAnswers } from '@/lib/jlsp/diagnose'
import { loadJlspState } from '@/lib/jlsp/loader'
import { loadClubDetail } from '@/lib/jlsp/club-detail'
import { AXES } from '@/lib/jlsp/axes'
import ShareButtons from './ShareButtons'

export const dynamic = 'force-dynamic'

function pct(score) {
  return Math.round(score * 100)
}

export async function generateMetadata({ params }) {
  const { clubId } = await params
  const state = await loadJlspState()
  const club = state.clubs.find((c) => c.id === clubId) ?? state.allClubs.find((c) => c.id === clubId)
  if (!club) return { title: '結果が見つかりません — JLSP' }
  return {
    title: `あなたの推しクラブは「${club.name}」 — JLSP`,
    description: club.description,
    openGraph: {
      title: `あなたの推しクラブは「${club.name}」`,
      description: club.description,
      images: [`/api/og/${club.id}`],
    },
    twitter: {
      card: 'summary_large_image',
      title: `あなたの推しクラブは「${club.name}」`,
      description: club.description,
      images: [`/api/og/${club.id}`],
    },
  }
}

export default async function ResultPage({ params, searchParams }) {
  const { clubId } = await params
  const sp = (await searchParams) ?? {}
  const a = typeof sp.a === 'string' ? sp.a : null
  if (!a) notFound()

  const answers = decodeAnswers(a)
  if (!answers) notFound()

  const state = await loadJlspState()
  if (!state.clubs.find((c) => c.id === clubId)) notFound()

  const all = matchClubs(answers, state.clubs.length, state.clubs)
  const top1 = all[0]
  const top3 = all.slice(0, 3)
  const worst3 = all.slice(-3).reverse() // worst at top, then 2nd worst etc

  const teamId = state.teamIdByClubId[top1.club.id]
  const detail = await loadClubDetail(teamId)

  const userVector = scoreAnswers(answers)

  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-xs sm:text-sm tracking-[0.3em] font-black hover:opacity-60 transition-opacity"
          >
            JLSP
          </Link>
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.18em] text-[var(--muted)]">
            YOUR RESULT
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 sm:py-16">
        {/* ========= TOP1 ヒーロー ========= */}
        <section>
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[var(--muted)] mb-6">
            #01 <span className="mx-2 opacity-50">—</span> YOUR CLUB
          </p>
          <div className="flex items-center gap-4 sm:gap-5 mb-6">
            <span
              className="w-1 sm:w-1.5 self-stretch rounded-full shrink-0"
              style={{ backgroundColor: top1.club.color }}
              aria-hidden="true"
            />
            <h1 className="text-2xl sm:text-4xl font-bold leading-[1.15] tracking-tight">
              {top1.club.name}
            </h1>
          </div>
          <div className="flex items-baseline gap-3 mb-7">
            <span
              className="text-3xl sm:text-5xl font-bold tabular-nums"
              style={{ color: top1.club.color }}
            >
              {pct(top1.score)}
            </span>
            <span className="text-sm sm:text-base font-mono tracking-[0.2em] text-[var(--muted)]">
              % MATCH
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            <Chip label={top1.club.division} />
            <Chip label={`${top1.club.region}・${top1.club.prefecture}`} />
          </div>
          <p className="text-base sm:text-lg leading-relaxed">{top1.club.description}</p>
        </section>

        {/* ========= NOW: 順位 + 直近成績 + スタジアム ========= */}
        <Section label="NOW">
          {detail?.standings ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <Stat
                label="順位"
                main={`${detail.standings.rank}位`}
                sub={detail.standings.group_name}
              />
              <Stat
                label="勝点"
                main={String(detail.standings.points)}
                sub={`${detail.standings.played}試合`}
              />
              <Stat
                label="得失差"
                main={fmtDiff(detail.standings.goals_for - detail.standings.goals_against)}
                sub={`${detail.standings.goals_for}/${detail.standings.goals_against}`}
              />
              <Stat
                label="勝/分/敗"
                main={`${detail.standings.win}/${detail.standings.draw}/${detail.standings.lose}`}
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)] mb-8">順位データなし</p>
          )}

          {detail?.standings?.form && (
            <div className="mb-8">
              <p className="text-[10px] font-mono tracking-[0.2em] text-[var(--muted)] mb-2">
                直近5試合
              </p>
              <FormBadges form={detail.standings.form} />
            </div>
          )}

          {top1.club && (
            <StadiumLink
              clubColor={top1.club.color}
              teamId={teamId}
              standings={detail?.standings}
            />
          )}
        </Section>

        {/* ========= NEXT MATCHES ========= */}
        {detail?.upcomingMatches?.length > 0 && (
          <Section label="NEXT MATCHES">
            <div className="space-y-3">
              {detail.upcomingMatches.map((m) => (
                <MatchRow key={m.id} match={m} teamId={teamId} kind="upcoming" />
              ))}
            </div>
          </Section>
        )}

        {/* ========= KEY PLAYERS ========= */}
        {detail?.keyPlayers?.length > 0 && (
          <Section label="KEY PLAYERS">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {detail.keyPlayers.map((p) => (
                <PlayerCard key={p.id} player={p} clubColor={top1.club.color} />
              ))}
            </div>
          </Section>
        )}

        {/* ========= WHY THIS MATCH: 4軸ブレイクダウン ========= */}
        <Section label="WHY THIS MATCH">
          <p className="text-xs text-[var(--muted)] mb-5 leading-relaxed">
            あなたとクラブの 4 軸スコアを比較。バーが近いほど相性◎。
          </p>
          <div className="space-y-5">
            {AXES.map((axis) => (
              <AxisCompare
                key={axis.id}
                axis={axis}
                userScore={userVector[axis.id]}
                clubScore={top1.club.vector[axis.id]}
                clubColor={top1.club.color}
              />
            ))}
          </div>
        </Section>

        {/* ========= EXPLORE: 観光地 ========= */}
        {top1.club.sightseeing && (
          <Section label="EXPLORE">
            <p className="text-xs text-[var(--muted)] mb-5 leading-relaxed">
              {top1.club.prefecture} の見どころ。観戦のついでに足を伸ばすなら。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parseSightseeing(top1.club.sightseeing).map((spot) => (
                <SightseeingCard key={spot} spot={spot} prefecture={top1.club.prefecture} />
              ))}
            </div>
            <a
              href={`https://www.jalan.net/kankou/?keyword=${encodeURIComponent(top1.club.prefecture)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-xs font-mono tracking-[0.18em] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              じゃらんで {top1.club.prefecture} の観光地をもっと見る
              <span aria-hidden>→</span>
            </a>
          </Section>
        )}

        {/* ========= SHARE ========= */}
        <Section label="SHARE">
          <ShareButtons clubName={top1.club.name} clubId={top1.club.id} />
        </Section>

        {/* ========= TOP3 / BOTTOM3 ========= */}
        <Section label="MATCH SUMMARY">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <RankList title="TOP 3 RECOMMENDED" items={top3} />
            <RankList title="BOTTOM 3 MISMATCH" items={worst3} />
          </div>
        </Section>

        {/* ========= CTA ========= */}
        <section className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-[var(--border)] flex justify-center">
          <Link href="/quiz" className="cta-button cta-button-sm">
            もう一度診断する
          </Link>
        </section>

        <p className="mt-14 text-center text-[10px] text-[var(--muted)] leading-relaxed">
          本サービスは非公式の診断コンテンツです。<br />
          J リーグ、各クラブ、関連団体とは一切関係ありません。
        </p>
      </main>
    </div>
  )
}

/* ============================================================
   下位コンポーネント
   ============================================================ */

function Section({ label, children }) {
  return (
    <section className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-[var(--border)]">
      <p className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[var(--muted)] mb-6">
        {label}
      </p>
      {children}
    </section>
  )
}

function Chip({ label }) {
  return (
    <span className="px-3 py-1 text-[10px] sm:text-xs font-mono tracking-[0.15em] text-[var(--muted)] rounded-full border border-[var(--border)]">
      {label}
    </span>
  )
}

function Stat({ label, main, sub }) {
  return (
    <div>
      <p className="text-[10px] font-mono tracking-[0.2em] text-[var(--muted)] mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold tabular-nums leading-tight">{main}</p>
      {sub && <p className="text-[11px] font-mono text-[var(--muted)] mt-1">{sub}</p>}
    </div>
  )
}

const FORM_COLORS = {
  W: '#22c55e',
  D: '#9ca3af',
  L: '#f97316',
}

function FormBadges({ form }) {
  // form は "WWDLW" 等の文字列。最新が末尾という前提で表示。
  const items = form.split('').slice(-5)
  if (items.length === 0) return null
  return (
    <div className="flex gap-1.5">
      {items.map((c, i) => {
        const color = FORM_COLORS[c] ?? '#d4d4d8'
        const label = c === 'W' ? '勝' : c === 'D' ? '分' : c === 'L' ? '敗' : c
        return (
          <span
            key={i}
            className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[11px] font-bold text-white"
            style={{ backgroundColor: color }}
          >
            {label}
          </span>
        )
      })}
    </div>
  )
}

async function StadiumLink({ clubColor, teamId }) {
  // teams_master から stadium 情報を引く必要があるが、loader 経由で渡せていないので
  // ここではシンプルに jleakstats のチームページへ誘導する形にする。
  if (!teamId) return null
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href={`https://jleakstats.com/team/${teamId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--foreground)] transition-colors"
      >
        <span className="text-sm font-bold">jleakstats でこのクラブを見る</span>
        <span className="text-xs font-mono text-[var(--muted)]">→</span>
      </a>
    </div>
  )
}

function fmtDate(dateStr) {
  const d = new Date(dateStr)
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${m}/${day} ${h}:${min}`
}

function fmtDiff(n) {
  if (n > 0) return `+${n}`
  if (n < 0) return String(n)
  return '±0'
}

function MatchRow({ match, teamId }) {
  const isHome = match.home_team_id === teamId
  const opponentName = isHome ? match.away_name : match.home_name
  const opponentColor = isHome ? match.away_color : match.home_color
  const venue = match.venue_name_ja
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)]">
      <div className="text-center font-mono text-xs leading-tight shrink-0 w-14">
        <div className="text-[10px] text-[var(--muted)]">{isHome ? 'HOME' : 'AWAY'}</div>
        <div className="font-bold tabular-nums">{fmtDate(match.date)}</div>
      </div>
      <span
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: opponentColor || '#9ca3af' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-bold truncate">vs {opponentName}</p>
        {venue && <p className="text-[11px] text-[var(--muted)] truncate">{venue}</p>}
      </div>
    </div>
  )
}

function PlayerCard({ player, clubColor }) {
  return (
    <div className="relative rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 overflow-hidden">
      <span
        className="absolute top-0 left-0 h-1 w-full"
        style={{ backgroundColor: clubColor }}
        aria-hidden="true"
      />
      <p className="text-[10px] font-mono tracking-[0.2em] text-[var(--muted)] mb-1">
        {player.no != null ? `#${player.no}` : ''} {player.position || ''}
      </p>
      <p className="text-base font-bold leading-snug mb-2">{player.name_ja}</p>
      <div className="flex gap-3 text-[11px] font-mono text-[var(--muted)]">
        <span>
          <span className="text-[var(--foreground)] font-bold">{player.appearances ?? 0}</span> 試合
        </span>
        <span>
          <span className="text-[var(--foreground)] font-bold">{player.goals ?? 0}</span> G
        </span>
        <span>
          <span className="text-[var(--foreground)] font-bold">{player.assists ?? 0}</span> A
        </span>
      </div>
    </div>
  )
}

const MAX_AXIS_SCORE = 18 // 6 問 × 3 = ±18 が user の理論最大 (各軸6問)

function AxisCompare({ axis, userScore, clubScore, clubColor }) {
  // 正規化: userScore を [-1, 1] へ、club vector は [-2, 2] なので [-1, 1] へ
  const userN = clamp(userScore / MAX_AXIS_SCORE, -1, 1)
  const clubN = clamp(clubScore / 2, -1, 1)
  const userPct = ((userN + 1) / 2) * 100
  const clubPct = ((clubN + 1) / 2) * 100
  const gap = Math.abs(userN - clubN)
  const matchSymbol = gap < 0.25 ? '◎' : gap < 0.55 ? '◯' : gap < 0.85 ? '△' : '×'

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-sm font-bold">
          {axis.label}
          <span className="ml-2 font-mono text-[10px] text-[var(--muted)] tracking-[0.15em]">
            {axis.negative.letter} ↔ {axis.positive.letter}
          </span>
        </span>
        <span className="text-base font-bold">{matchSymbol}</span>
      </div>
      <div className="relative h-3 rounded-full bg-[var(--border)]">
        <span
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[var(--foreground)]"
          style={{ left: `${userPct}%` }}
          title="あなた"
        />
        <span
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
          style={{ left: `${clubPct}%`, backgroundColor: clubColor, boxShadow: '0 0 0 2px #fff' }}
          title={axis.label}
        />
      </div>
      <div className="flex justify-between text-[10px] font-mono text-[var(--muted)] tracking-[0.1em] mt-1.5">
        <span>{axis.negative.name}</span>
        <span>{axis.positive.name}</span>
      </div>
    </div>
  )
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function parseSightseeing(s) {
  if (!s) return []
  return s.split(/[、,，]/).map((x) => x.trim()).filter(Boolean).slice(0, 5)
}

function SightseeingCard({ spot, prefecture }) {
  const href = `https://www.jalan.net/kankou/?keyword=${encodeURIComponent(spot)}`
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 hover:border-[var(--foreground)] transition-colors"
    >
      <p className="text-[10px] font-mono tracking-[0.18em] text-[var(--muted)] mb-1">
        {prefecture}
      </p>
      <p className="text-sm font-bold leading-snug">{spot}</p>
    </a>
  )
}

function RankList({ title, items }) {
  return (
    <div>
      <p className="text-[10px] font-mono tracking-[0.18em] text-[var(--muted)] mb-3">{title}</p>
      <ol className="space-y-1.5">
        {items.map((m, i) => (
          <li key={m.club.id} className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[var(--muted)] w-4 tabular-nums">
              {i + 1}
            </span>
            <span
              className="w-1 h-4 rounded-full"
              style={{ backgroundColor: m.club.color }}
              aria-hidden="true"
            />
            <span className="flex-1 text-sm font-bold truncate">{m.club.name}</span>
            <span
              className="font-mono text-xs tabular-nums font-bold"
              style={{ color: m.club.color }}
            >
              {pct(m.score)}%
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
