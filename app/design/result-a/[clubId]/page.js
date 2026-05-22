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

export default async function ResultDesignA({ params, searchParams }) {
  const { clubId } = await params
  const sp = (await searchParams) ?? {}
  const a = typeof sp.a === 'string' ? sp.a : null
  const data = await loadResultData({ clubId, a })
  if (!data) notFound()
  const { top1, top3, worst3, detail, userType, userVector } = data
  const clubColor = top1.club.color

  return (
    <div className="dsRA min-h-screen w-full">
      <ResultPreviewNav current="a" clubId={clubId} a={a} />

      <header className="px-6 sm:px-10 pt-6 sm:pt-8 pb-3 flex items-center justify-between">
        <Link href="/" className="text-xs sm:text-sm font-mono tracking-[0.3em] font-black text-white hover:opacity-60">
          JLSP
        </Link>
        <span className="text-[10px] sm:text-xs font-mono tracking-[0.18em] text-zinc-500">
          YOUR RESULT · DESIGN A
        </span>
      </header>

      <main className="px-6 sm:px-10 py-6 sm:py-10 grid grid-cols-12 gap-3 sm:gap-4 auto-rows-[minmax(110px,auto)]">

        {/* TYPE CARD (big) */}
        {userType && (
          <article className="dsRA-card col-span-12 sm:col-span-7 sm:row-span-2 p-6 sm:p-8 flex flex-col justify-between" style={{ '--d': '0.05s' }}>
            <div>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">YOUR FANTYPE</p>
              <div className="flex items-baseline gap-4 flex-wrap">
                <span className="text-5xl sm:text-7xl font-black tracking-[0.06em]" style={{ color: '#c7384d' }}>
                  {userType.code}
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-white">{userType.nickname}</span>
              </div>
              <p className="mt-4 text-sm sm:text-base font-bold text-white leading-snug">{userType.tagline}</p>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mt-6">{userType.description}</p>
          </article>
        )}

        {/* CLUB CARD (big, full club color) */}
        <article
          className="dsRA-card dsRA-card-color col-span-12 sm:col-span-5 sm:row-span-2 p-6 sm:p-8 flex flex-col justify-between"
          style={{ '--d': '0.15s', backgroundColor: clubColor }}
        >
          <div>
            <p className="text-[10px] font-mono tracking-[0.3em] text-white/70 mb-4">YOUR CLUB · #01</p>
            <h1 className="text-3xl sm:text-5xl font-black leading-[1.05] tracking-tight text-white">
              {top1.club.name}
            </h1>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl sm:text-7xl font-black text-white tabular-nums">{pct(top1.score)}</span>
              <span className="text-base font-mono tracking-[0.2em] text-white/80">% MATCH</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-[10px] font-mono tracking-[0.15em] text-white/90 rounded-full bg-white/15 backdrop-blur-sm">
                {top1.club.division}
              </span>
              <span className="px-3 py-1 text-[10px] font-mono tracking-[0.15em] text-white/90 rounded-full bg-white/15 backdrop-blur-sm">
                {top1.club.region}・{top1.club.prefecture}
              </span>
            </div>
          </div>
        </article>

        {/* CLUB DESCRIPTION */}
        <article className="dsRA-card col-span-12 sm:col-span-7 p-5 sm:p-6" style={{ '--d': '0.25s' }}>
          <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">ABOUT</p>
          <p className="text-sm sm:text-base text-white leading-relaxed">{top1.club.description}</p>
        </article>

        {/* NOW (standings) */}
        {detail?.standings && (
          <article className="dsRA-card col-span-6 sm:col-span-4 p-5 sm:p-6" style={{ '--d': '0.3s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">NOW · {detail.standings.group_name}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-6xl font-black text-white tabular-nums">{detail.standings.rank}</span>
              <span className="text-base font-mono text-zinc-500">位</span>
            </div>
            <p className="mt-3 font-mono text-xs text-zinc-400">
              {detail.standings.win}-{detail.standings.draw}-{detail.standings.lose}
              <span className="mx-2 opacity-50">·</span>
              {detail.standings.points}pt
            </p>
            {detail.standings.form && (
              <div className="flex gap-1 mt-3">
                {detail.standings.form.slice(-5).split('').map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold text-white"
                    style={{ backgroundColor: c === 'W' ? '#22c55e' : c === 'D' ? '#71717a' : '#f97316' }}
                  >
                    {c === 'W' ? '勝' : c === 'D' ? '分' : '敗'}
                  </span>
                ))}
              </div>
            )}
          </article>
        )}

        {/* NEXT MATCH */}
        {detail?.upcomingMatches?.[0] && (
          <article className="dsRA-card col-span-6 sm:col-span-4 p-5 sm:p-6" style={{ '--d': '0.35s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">NEXT MATCH</p>
            <p className="font-mono text-xs text-zinc-400 mb-2">{fmtDate(detail.upcomingMatches[0].date)}</p>
            <p className="text-base sm:text-lg font-bold text-white leading-snug">
              vs {detail.upcomingMatches[0].home_team_id === data.teamId
                ? detail.upcomingMatches[0].away_name
                : detail.upcomingMatches[0].home_name}
            </p>
            <p className="mt-2 text-[11px] text-zinc-500">
              {detail.upcomingMatches[0].home_team_id === data.teamId ? 'HOME' : 'AWAY'}
              {detail.upcomingMatches[0].venue_name_ja && ' · ' + detail.upcomingMatches[0].venue_name_ja}
            </p>
          </article>
        )}

        {/* SHARE */}
        <article className="dsRA-card col-span-12 sm:col-span-4 p-5 sm:p-6" style={{ '--d': '0.4s' }}>
          <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">SHARE</p>
          <p className="text-xs text-zinc-400 mb-3">この結果を SNS で。</p>
          <div className="flex gap-2 flex-wrap">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`私の FANTYPE は ${userType?.code} ${userType?.nickname}、推しクラブは「${top1.club.name}」でした!`)}&hashtags=JLSP`}
              target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:opacity-80 transition-opacity"
            >X でシェア</a>
            <a
              href={`https://social-plugins.line.me/lineit/share?url=&text=${encodeURIComponent('JLSP 診断結果')}`}
              target="_blank" rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-full bg-[#06C755] text-white text-xs font-bold hover:opacity-80 transition-opacity"
            >LINE</a>
          </div>
        </article>

        {/* WHY THIS MATCH (4軸) */}
        <article className="dsRA-card col-span-12 sm:col-span-7 p-5 sm:p-7" style={{ '--d': '0.45s' }}>
          <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">WHY THIS MATCH</p>
          <div className="space-y-3">
            {AXES.map((axis) => {
              const userN = Math.max(-1, Math.min(1, userVector[axis.id] / 18))
              const clubN = Math.max(-1, Math.min(1, top1.club.vector[axis.id] / 2))
              const userPct = ((userN + 1) / 2) * 100
              const clubPct = ((clubN + 1) / 2) * 100
              return (
                <div key={axis.id}>
                  <div className="flex justify-between text-[10px] font-mono tracking-[0.15em] text-zinc-500 mb-1">
                    <span>{axis.negative.letter} {axis.negative.name}</span>
                    <span className="text-zinc-300 font-bold">{axis.label}</span>
                    <span>{axis.positive.name} {axis.positive.letter}</span>
                  </div>
                  <div className="relative h-2 rounded-full bg-zinc-800">
                    <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white" style={{ left: `${userPct}%` }} />
                    <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-white" style={{ left: `${clubPct}%`, backgroundColor: clubColor }} />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-[10px] font-mono text-zinc-500">○ 白 = あなた / ● {top1.club.name} カラー = クラブ</p>
        </article>

        {/* KEY PLAYERS */}
        {detail?.keyPlayers?.length > 0 && (
          <article className="dsRA-card col-span-12 sm:col-span-5 p-5 sm:p-6" style={{ '--d': '0.5s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">KEY PLAYERS</p>
            <ul className="space-y-3">
              {detail.keyPlayers.map((p) => (
                <li key={p.id} className="flex items-center gap-3 border-b border-zinc-800 pb-2 last:border-0 last:pb-0">
                  <span className="font-mono text-[10px] text-zinc-500 w-12 shrink-0">
                    {p.no != null ? `#${p.no}` : ''} {p.position || ''}
                  </span>
                  <span className="flex-1 text-sm font-bold text-white truncate">{p.name_ja}</span>
                  <span className="text-[10px] font-mono text-zinc-400 tabular-nums shrink-0">
                    {p.goals}G {p.assists}A
                  </span>
                </li>
              ))}
            </ul>
          </article>
        )}

        {/* TOP 3 */}
        <article className="dsRA-card col-span-12 sm:col-span-6 p-5 sm:p-6" style={{ '--d': '0.55s' }}>
          <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">TOP 3</p>
          <ol className="space-y-2">
            {top3.map((m, i) => (
              <li key={m.club.id} className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-zinc-500 w-4 tabular-nums">{i + 1}</span>
                <span className="w-1 h-5 rounded-full" style={{ backgroundColor: m.club.color }} />
                <span className="flex-1 text-sm font-bold text-white truncate">{m.club.name}</span>
                <span className="font-mono text-xs font-bold tabular-nums" style={{ color: m.club.color }}>{pct(m.score)}%</span>
              </li>
            ))}
          </ol>
        </article>

        {/* BOTTOM 3 */}
        <article className="dsRA-card col-span-12 sm:col-span-6 p-5 sm:p-6" style={{ '--d': '0.6s' }}>
          <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">BOTTOM 3</p>
          <ol className="space-y-2">
            {worst3.map((m, i) => (
              <li key={m.club.id} className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-zinc-500 w-4 tabular-nums">{i + 1}</span>
                <span className="w-1 h-5 rounded-full opacity-60" style={{ backgroundColor: m.club.color }} />
                <span className="flex-1 text-sm font-bold text-zinc-300 truncate">{m.club.name}</span>
                <span className="font-mono text-xs text-zinc-500 tabular-nums">{pct(m.score)}%</span>
              </li>
            ))}
          </ol>
        </article>

        {/* CTA */}
        <article className="dsRA-card col-span-12 p-5 sm:p-6 flex items-center justify-between gap-4 flex-wrap" style={{ '--d': '0.65s' }}>
          <div>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-1">AGAIN?</p>
            <p className="text-sm font-bold text-white">違う気分でもう一度</p>
          </div>
          <Link
            href="/quiz"
            className="inline-flex items-center justify-center rounded-full bg-white text-black font-bold px-6 py-3 text-sm hover:opacity-80 transition-opacity"
          >
            診断をやり直す →
          </Link>
        </article>
      </main>

      <footer className="px-6 sm:px-10 py-6 text-[10px] text-zinc-600 text-center">
        本サービスは非公式の診断コンテンツです。J リーグ・各クラブとは一切関係ありません。
      </footer>
    </div>
  )
}
