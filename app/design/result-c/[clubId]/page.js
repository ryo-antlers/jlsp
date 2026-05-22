import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadResultData } from '@/lib/jlsp/result-page-data'
import { AXES } from '@/lib/jlsp/axes'
import ResultPreviewNav from '@/app/_result-preview-nav'

export const dynamic = 'force-dynamic'

function pct(s) { return Math.round(s * 100) }
function fmtDate(d) {
  const x = new Date(d)
  return `${x.getMonth() + 1}/${x.getDate()} ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`
}
function isLightColor(hex) {
  const m = (hex || '').match(/^#([0-9a-f]{6})$/i)
  if (!m) return false
  const v = parseInt(m[1], 16)
  const r = (v >> 16) & 0xff, g = (v >> 8) & 0xff, b = v & 0xff
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65
}

export default async function ResultDesignC({ params, searchParams }) {
  const { clubId } = await params
  const sp = (await searchParams) ?? {}
  const a = typeof sp.a === 'string' ? sp.a : null
  const data = await loadResultData({ clubId, a })
  if (!data) notFound()
  const { top1, top3, worst3, detail, userType, userVector, teamId } = data
  const clubColor = top1.club.color
  const onLight = isLightColor(clubColor)
  const textOnClub = onLight ? '#0e0e10' : '#ffffff'
  const subOnClub = onLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.75)'

  return (
    <div className="dsRC min-h-screen w-full">
      <ResultPreviewNav current="c" clubId={clubId} a={a} />

      {/* Fixed top header bar */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-black/30">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-3 flex items-center justify-between text-white">
          <Link href="/" className="text-xs sm:text-sm font-mono tracking-[0.3em] font-black hover:opacity-60">
            JLSP
          </Link>
          <span className="text-[10px] font-mono tracking-[0.18em] opacity-70">DESIGN C</span>
        </div>
      </header>

      {/* ========= HERO 1: TYPE ========= */}
      <section className="dsRC-hero relative" style={{ background: `radial-gradient(at top, ${clubColor}55, #0a0a0c 55%), #0a0a0c` }}>
        <div className="dsRC-inner text-white">
          <p className="dsRC-eyebrow text-white/60">— SCENE 01 / YOUR FANTYPE</p>
          <div className="dsRC-typecode" style={{ color: '#c7384d' }}>
            {userType?.code ?? '----'}
          </div>
          <h1 className="dsRC-nickname">{userType?.nickname ?? ''}</h1>
          <p className="dsRC-tagline">{userType?.tagline ?? ''}</p>
          <p className="dsRC-desc text-white/70">{userType?.description ?? ''}</p>
          <p className="dsRC-scroll text-white/40">SCROLL ↓</p>
        </div>
      </section>

      {/* ========= HERO 2: CLUB ========= */}
      <section className="dsRC-hero relative" style={{ background: clubColor, color: textOnClub }}>
        <div className="dsRC-inner">
          <p className="dsRC-eyebrow" style={{ color: subOnClub }}>— SCENE 02 / YOUR CLUB</p>
          <h2 className="dsRC-club-name">{top1.club.name}</h2>
          <div className="dsRC-club-meta">
            <span className="dsRC-club-pct">{pct(top1.score)}<small>%</small></span>
            <div className="dsRC-club-chips" style={{ color: subOnClub }}>
              <span style={{ background: onLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.18)' }}>{top1.club.division}</span>
              <span style={{ background: onLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.18)' }}>{top1.club.region}・{top1.club.prefecture}</span>
            </div>
          </div>
          <div className="dsRC-club-3col">
            <div>
              <p className="dsRC-mini-label" style={{ color: subOnClub }}>ABOUT</p>
              <p className="text-sm leading-relaxed">{top1.club.description}</p>
            </div>
            {top1.club.stadiumGourmet && (
              <div>
                <p className="dsRC-mini-label" style={{ color: subOnClub }}>STADIUM GOURMET</p>
                <p className="text-sm font-bold">{top1.club.stadiumGourmet}</p>
              </div>
            )}
            {top1.club.sightseeing && (
              <div>
                <p className="dsRC-mini-label" style={{ color: subOnClub }}>NEARBY</p>
                <p className="text-sm font-bold">{top1.club.sightseeing}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========= HERO 3: WHY THIS MATCH ========= */}
      <section className="dsRC-hero relative bg-[#fafaf7] text-[#0e0e10]">
        <div className="dsRC-inner">
          <p className="dsRC-eyebrow text-zinc-500">— SCENE 03 / WHY THIS MATCH</p>
          <h2 className="dsRC-section-title">
            あなたと <span style={{ color: clubColor }}>{top1.club.name}</span> の<br />
            相性を 4 軸で読む。
          </h2>
          <div className="dsRC-axes">
            {AXES.map((axis) => {
              const userN = Math.max(-1, Math.min(1, userVector[axis.id] / 18))
              const clubN = Math.max(-1, Math.min(1, top1.club.vector[axis.id] / 2))
              const userPct = ((userN + 1) / 2) * 100
              const clubPct = ((clubN + 1) / 2) * 100
              const gap = Math.abs(userN - clubN)
              const matchSymbol = gap < 0.25 ? '◎' : gap < 0.55 ? '◯' : gap < 0.85 ? '△' : '×'
              return (
                <div key={axis.id} className="dsRC-axis-row">
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="text-base sm:text-lg font-black">{axis.label}</p>
                    <p className="text-2xl font-black">{matchSymbol}</p>
                  </div>
                  <div className="relative h-3 rounded-full bg-black/10">
                    <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#0e0e10]" style={{ left: `${userPct}%` }} />
                    <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full ring-2 ring-white" style={{ left: `${clubPct}%`, backgroundColor: clubColor }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-2">
                    <span>{axis.negative.letter} {axis.negative.name}</span>
                    <span>{axis.positive.name} {axis.positive.letter}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ========= DATA STRIP (順位 + 次試合 + 選手) ========= */}
      <section className="dsRC-hero bg-[#0e0e10] text-white">
        <div className="dsRC-inner">
          <p className="dsRC-eyebrow text-zinc-500">— SCENE 04 / THE CLUB NOW</p>
          <div className="dsRC-3grid">
            <div className="dsRC-col">
              <p className="dsRC-mini-label text-zinc-500">NOW</p>
              {detail?.standings ? (
                <>
                  <p className="text-6xl sm:text-7xl font-black tabular-nums" style={{ color: clubColor }}>
                    {detail.standings.rank}<small className="text-xl text-zinc-500 ml-2">位</small>
                  </p>
                  <p className="font-mono text-sm text-zinc-400 mt-3">
                    {detail.standings.group_name} · {detail.standings.win}-{detail.standings.draw}-{detail.standings.lose} · {detail.standings.points}pt
                  </p>
                  {detail.standings.form && (
                    <div className="flex gap-1.5 mt-4">
                      {detail.standings.form.slice(-5).split('').map((c, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center justify-center w-8 h-8 rounded text-xs font-bold text-white"
                          style={{ backgroundColor: c === 'W' ? '#22c55e' : c === 'D' ? '#71717a' : '#f97316' }}
                        >
                          {c === 'W' ? '勝' : c === 'D' ? '分' : '敗'}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-zinc-500">順位データなし</p>
              )}
            </div>
            <div className="dsRC-col">
              <p className="dsRC-mini-label text-zinc-500">NEXT MATCHES</p>
              {detail?.upcomingMatches?.length > 0 ? (
                <ul className="space-y-4">
                  {detail.upcomingMatches.slice(0, 3).map((m) => {
                    const opp = m.home_team_id === teamId ? m.away_name : m.home_name
                    return (
                      <li key={m.id}>
                        <p className="font-mono text-[11px] text-zinc-500">{fmtDate(m.date)} · {m.home_team_id === teamId ? 'HOME' : 'AWAY'}</p>
                        <p className="text-lg font-bold leading-snug">vs {opp}</p>
                        {m.venue_name_ja && <p className="text-[11px] text-zinc-500 mt-1">{m.venue_name_ja}</p>}
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">次試合情報なし</p>
              )}
            </div>
            <div className="dsRC-col">
              <p className="dsRC-mini-label text-zinc-500">KEY PLAYERS</p>
              {detail?.keyPlayers?.length > 0 ? (
                <ul className="space-y-4">
                  {detail.keyPlayers.map((p) => (
                    <li key={p.id}>
                      <p className="font-mono text-[10px] text-zinc-500 mb-0.5">
                        {p.no != null ? `#${p.no}` : ''} {p.position || ''}
                      </p>
                      <p className="text-lg font-bold leading-snug">{p.name_ja}</p>
                      <p className="font-mono text-[11px] text-zinc-400 mt-1 tabular-nums">
                        {p.appearances} 試合 · {p.goals}G · {p.assists}A
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-zinc-500">選手データなし</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========= FINAL: TOP3 / BOTTOM3 / CTA ========= */}
      <section className="dsRC-hero bg-[#fafaf7] text-[#0e0e10]">
        <div className="dsRC-inner">
          <p className="dsRC-eyebrow text-zinc-500">— SCENE 05 / SUMMARY</p>
          <div className="dsRC-summary-grid">
            <div>
              <p className="dsRC-mini-label">TOP 3</p>
              <ol className="space-y-3 mt-2">
                {top3.map((m, i) => (
                  <li key={m.club.id} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-500 w-4 tabular-nums">{i + 1}</span>
                    <span className="w-1 h-8 rounded-full" style={{ backgroundColor: m.club.color }} />
                    <span className="flex-1 text-lg font-bold truncate">{m.club.name}</span>
                    <span className="font-mono text-base font-bold tabular-nums" style={{ color: m.club.color }}>{pct(m.score)}%</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="dsRC-mini-label">BOTTOM 3</p>
              <ol className="space-y-3 mt-2">
                {worst3.map((m, i) => (
                  <li key={m.club.id} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-zinc-500 w-4 tabular-nums">{i + 1}</span>
                    <span className="w-1 h-8 rounded-full opacity-50" style={{ backgroundColor: m.club.color }} />
                    <span className="flex-1 text-lg font-bold text-zinc-600 truncate">{m.club.name}</span>
                    <span className="font-mono text-base text-zinc-500 tabular-nums">{pct(m.score)}%</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="mt-16 sm:mt-20 text-center">
            <Link href="/quiz" className="cta-button">もう一度診断する</Link>
            <p className="mt-10 text-[10px] text-zinc-500">
              本サービスは非公式の診断コンテンツです。<br />
              J リーグ・各クラブとは一切関係ありません。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
