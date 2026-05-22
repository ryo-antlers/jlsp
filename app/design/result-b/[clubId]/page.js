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

export default async function ResultDesignB({ params, searchParams }) {
  const { clubId } = await params
  const sp = (await searchParams) ?? {}
  const a = typeof sp.a === 'string' ? sp.a : null
  const data = await loadResultData({ clubId, a })
  if (!data) notFound()
  const { top1, top3, worst3, detail, userType, userVector, teamId } = data
  const clubColor = top1.club.color

  return (
    <div className="dsRB min-h-screen w-full bg-[#fafaf7] text-[#0e0e10]">
      <ResultPreviewNav current="b" clubId={clubId} a={a} />

      {/* TOP STRIP */}
      <div className="border-b border-black/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
          <Link href="/" className="text-xs sm:text-sm font-mono tracking-[0.3em] font-black hover:opacity-60">
            JLSP
          </Link>
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.18em] text-zinc-500">
            ISSUE · #{userType?.code ?? '----'} <span className="opacity-50 mx-2">/</span> {top1.club.name}
          </span>
        </div>
      </div>

      {/* 3 COLUMN MAIN */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-14">

        {/* LEFT COLUMN — TYPE */}
        <aside className="lg:col-span-3 lg:sticky lg:top-10 self-start space-y-8">
          <div className="dsRB-fade" style={{ '--d': '0s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">N°01 — TYPE</p>
            <div className="border-t-2 border-[#c7384d] pt-4">
              <p className="text-5xl sm:text-6xl font-black tracking-[0.04em]" style={{ color: '#c7384d' }}>
                {userType?.code ?? '----'}
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-2 leading-tight">
                {userType?.nickname ?? ''}
              </p>
            </div>
          </div>
          {userType && (
            <div className="dsRB-fade" style={{ '--d': '0.1s' }}>
              <p className="text-sm font-bold leading-snug mb-3 italic">{userType.tagline}</p>
              <p className="text-xs text-zinc-600 leading-relaxed">{userType.description}</p>
            </div>
          )}
          <div className="dsRB-fade space-y-3" style={{ '--d': '0.2s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500">AXIS BREAKDOWN</p>
            {AXES.map((axis) => {
              const userN = Math.max(-1, Math.min(1, userVector[axis.id] / 18))
              const pctL = ((userN + 1) / 2) * 100
              return (
                <div key={axis.id}>
                  <div className="flex items-baseline justify-between text-[10px] font-mono">
                    <span className="text-zinc-500">{axis.label}</span>
                    <span className="text-zinc-700 font-bold">
                      {userN >= 0 ? axis.positive.letter : axis.negative.letter}
                    </span>
                  </div>
                  <div className="relative h-px bg-black/10 mt-1.5">
                    <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#0e0e10]" style={{ left: `${pctL}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* CENTER COLUMN — CLUB MAIN */}
        <main className="lg:col-span-6 space-y-12 sm:space-y-16">
          <section className="dsRB-fade" style={{ '--d': '0.05s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">YOUR CLUB</p>
            <div className="h-1 w-16 mb-6" style={{ backgroundColor: clubColor }} />
            <h1 className="text-5xl sm:text-7xl font-black leading-[0.95] tracking-[-0.03em] mb-6">
              {top1.club.name}
            </h1>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-5xl sm:text-6xl font-black tabular-nums" style={{ color: clubColor }}>
                {pct(top1.score)}
              </span>
              <span className="text-base font-mono tracking-[0.2em] text-zinc-500">% MATCH</span>
              <span className="text-xs font-mono tracking-[0.15em] text-zinc-400 ml-3">
                {top1.club.division} · {top1.club.region}・{top1.club.prefecture}
              </span>
            </div>
            <p className="text-lg sm:text-xl leading-[1.7] text-[#0e0e10]" style={{ fontWeight: 500 }}>
              {top1.club.description}
            </p>
          </section>

          {/* WHY THIS MATCH */}
          <section className="dsRB-fade" style={{ '--d': '0.15s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">WHY THIS MATCH</p>
            <div className="border-t border-black/10 pt-6 space-y-5">
              {AXES.map((axis) => {
                const userN = Math.max(-1, Math.min(1, userVector[axis.id] / 18))
                const clubN = Math.max(-1, Math.min(1, top1.club.vector[axis.id] / 2))
                const userPct = ((userN + 1) / 2) * 100
                const clubPct = ((clubN + 1) / 2) * 100
                const gap = Math.abs(userN - clubN)
                const matchSymbol = gap < 0.25 ? '◎' : gap < 0.55 ? '◯' : gap < 0.85 ? '△' : '×'
                return (
                  <div key={axis.id}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm font-bold">{axis.label}</span>
                      <span className="font-mono text-lg font-bold">{matchSymbol}</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-black/10">
                      <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#0e0e10]" style={{ left: `${userPct}%` }} />
                      <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-white" style={{ left: `${clubPct}%`, backgroundColor: clubColor }} />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
                      <span>{axis.negative.name}</span>
                      <span>{axis.positive.name}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </main>

        {/* RIGHT COLUMN — DATA STACK */}
        <aside className="lg:col-span-3 lg:sticky lg:top-10 self-start space-y-8">
          {detail?.standings && (
            <div className="dsRB-fade border-t border-black/10 pt-4" style={{ '--d': '0.1s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">N°02 — NOW</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tabular-nums">{detail.standings.rank}</span>
                <span className="text-sm font-mono text-zinc-500">位 · {detail.standings.group_name}</span>
              </div>
              <p className="font-mono text-xs text-zinc-600 mt-2">
                {detail.standings.win}-{detail.standings.draw}-{detail.standings.lose}
                <span className="opacity-50 mx-2">·</span>
                {detail.standings.points}pt
              </p>
              {detail.standings.form && (
                <div className="flex gap-1 mt-3">
                  {detail.standings.form.slice(-5).split('').map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: c === 'W' ? '#22c55e' : c === 'D' ? '#71717a' : '#f97316' }}
                    >
                      {c === 'W' ? '勝' : c === 'D' ? '分' : '敗'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {detail?.upcomingMatches?.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-4 space-y-3" style={{ '--d': '0.2s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500">N°03 — NEXT</p>
              {detail.upcomingMatches.slice(0, 3).map((m) => {
                const opp = m.home_team_id === teamId ? m.away_name : m.home_name
                return (
                  <div key={m.id} className="text-sm">
                    <p className="font-mono text-[10px] text-zinc-500">{fmtDate(m.date)} · {m.home_team_id === teamId ? 'HOME' : 'AWAY'}</p>
                    <p className="font-bold leading-snug">vs {opp}</p>
                  </div>
                )
              })}
            </div>
          )}

          {detail?.keyPlayers?.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-4 space-y-2" style={{ '--d': '0.3s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-2">N°04 — KEY PLAYERS</p>
              {detail.keyPlayers.map((p) => (
                <div key={p.id} className="text-sm flex items-baseline gap-2">
                  <span className="font-mono text-[10px] text-zinc-500 w-10">
                    {p.no != null ? `#${p.no}` : ''}
                  </span>
                  <span className="font-bold flex-1 truncate">{p.name_ja}</span>
                  <span className="font-mono text-[10px] text-zinc-500">{p.goals}G</span>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>

      {/* BOTTOM STRIP — TOP3 / BOTTOM3 */}
      <div className="border-t border-black/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">TOP 3 RECOMMENDED</p>
            <ol className="space-y-2.5">
              {top3.map((m, i) => (
                <li key={m.club.id} className="flex items-center gap-3 border-b border-black/5 pb-2.5 last:border-0">
                  <span className="font-mono text-xs text-zinc-500 w-4 tabular-nums">{i + 1}</span>
                  <span className="w-1 h-6 rounded-full" style={{ backgroundColor: m.club.color }} />
                  <span className="flex-1 text-base font-bold truncate">{m.club.name}</span>
                  <span className="font-mono text-sm font-bold tabular-nums" style={{ color: m.club.color }}>{pct(m.score)}%</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">BOTTOM 3 MISMATCH</p>
            <ol className="space-y-2.5">
              {worst3.map((m, i) => (
                <li key={m.club.id} className="flex items-center gap-3 border-b border-black/5 pb-2.5 last:border-0">
                  <span className="font-mono text-xs text-zinc-500 w-4 tabular-nums">{i + 1}</span>
                  <span className="w-1 h-6 rounded-full opacity-50" style={{ backgroundColor: m.club.color }} />
                  <span className="flex-1 text-base font-bold text-zinc-600 truncate">{m.club.name}</span>
                  <span className="font-mono text-sm text-zinc-500 tabular-nums">{pct(m.score)}%</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* CTA + FOOTER */}
      <div className="border-t border-black/10">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-sm text-zinc-500">
            <span className="font-mono tracking-[0.2em] text-[10px] block mb-1">JLSP</span>
            あなたが好きになる Jリーグクラブを当てる。
          </div>
          <Link href="/quiz" className="cta-button">もう一度診断する</Link>
        </div>
        <p className="text-center text-[10px] text-zinc-500 pb-10 px-6">
          本サービスは非公式の診断コンテンツです。J リーグ・各クラブとは一切関係ありません。
        </p>
      </div>
    </div>
  )
}
