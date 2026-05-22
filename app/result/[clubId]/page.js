import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadResultData } from '@/lib/jlsp/result-page-data'
import { AXES } from '@/lib/jlsp/axes'
import { TYPE_META } from '@/lib/jlsp/type-meta'
import ShareButtons from './ShareButtons'

export const dynamic = 'force-dynamic'

function pct(s) { return Math.round(s * 100) }
function fmtDate(d) {
  const x = new Date(d)
  return `${x.getMonth() + 1}/${x.getDate()} ${String(x.getHours()).padStart(2, '0')}:${String(x.getMinutes()).padStart(2, '0')}`
}
function parseSightseeing(s) {
  if (!s) return []
  return s.split(/[、,，]/).map((x) => x.trim()).filter(Boolean).slice(0, 6)
}

/**
 * 4軸を 1 枚に統合した radar chart。蜘蛛の巣 4 スポーク (0°/45°/90°/135°)、
 * 各スポークの両端が axis の正極/負極。ユーザーとクラブの 4 点を結ぶ多角形が
 * 重なるほど相性◎。
 */
function RadarPlot({ userVector, clubVector, clubColor, animDelay = 0.4 }) {
  const R = 44
  // 数学角度 (反時計) 基準: 0=右(R), 45=右上(U), 90=上(W), 135=左上(O)
  const AXES_DEF = [
    { id: 'shoubu',  angle: 0,   posLetter: 'R', negLetter: 'E' },
    { id: 'kansen',  angle: 45,  posLetter: 'U', negLetter: 'A' },
    { id: 'keiei',   angle: 90,  posLetter: 'W', negLetter: 'H' },
    { id: 'kanshin', angle: 135, posLetter: 'O', negLetter: 'F' },
  ]
  const clamp = (v) => Math.max(-1, Math.min(1, v))
  function pointOf(score, baseAngle) {
    const s = clamp(score)
    const actualAngle = s >= 0 ? baseAngle : baseAngle + 180
    const dist = Math.abs(s) * R
    const rad = (actualAngle * Math.PI) / 180
    return { x: dist * Math.cos(rad), y: -dist * Math.sin(rad) }
  }
  function polyStr(pts) {
    // 中心からの角度で時計回りに並べてポリゴンが綺麗に閉じるようにする
    const sorted = [...pts].sort((a, b) => Math.atan2(-a.y, a.x) - Math.atan2(-b.y, b.x))
    return sorted.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  }

  const userPts = AXES_DEF.map((a) => pointOf(userVector[a.id] / 18, a.angle))
  const clubPts = AXES_DEF.map((a) => pointOf(clubVector[a.id] / 2, a.angle))

  return (
    <svg viewBox="-58 -58 116 116" className="w-full h-auto block">
      {/* 同心円リング (4段) */}
      {[11, 22, 33, 44].map((r) => (
        <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#0e0e10" strokeOpacity="0.07" strokeWidth="0.35" />
      ))}
      {/* 4 スポーク (両端まで) */}
      {AXES_DEF.map((a) => {
        const rad = (a.angle * Math.PI) / 180
        const x = R * Math.cos(rad)
        const y = -R * Math.sin(rad)
        return (
          <line
            key={a.id}
            x1={-x} y1={-y} x2={x} y2={y}
            stroke="#0e0e10" strokeOpacity="0.18" strokeWidth="0.4"
          />
        )
      })}
      {/* 8 極ラベル */}
      {AXES_DEF.flatMap((a) => {
        const rad = (a.angle * Math.PI) / 180
        const lx = 52 * Math.cos(rad)
        const ly = -52 * Math.sin(rad)
        return [
          <text key={`${a.id}+`} x={lx} y={ly + 2} fontSize="7" textAnchor="middle" fontWeight="900" fill="#0e0e10" opacity="0.85" fontFamily="var(--font-geist-mono), monospace">{a.posLetter}</text>,
          <text key={`${a.id}-`} x={-lx} y={-ly + 2} fontSize="7" textAnchor="middle" fontWeight="900" fill="#0e0e10" opacity="0.5" fontFamily="var(--font-geist-mono), monospace">{a.negLetter}</text>,
        ]
      })}
      {/* クラブのポリゴン (背面) */}
      <polygon
        points={polyStr(clubPts)}
        fill={clubColor}
        fillOpacity="0.22"
        stroke={clubColor}
        strokeWidth="1.3"
        strokeLinejoin="round"
        className="dsRB-radar-poly dsRB-radar-club"
        style={{ '--delay': `${animDelay + 0.1}s` }}
      />
      {/* ユーザーのポリゴン */}
      <polygon
        points={polyStr(userPts)}
        fill="#0e0e10"
        fillOpacity="0.16"
        stroke="#0e0e10"
        strokeWidth="1.2"
        strokeLinejoin="round"
        className="dsRB-radar-poly dsRB-radar-user"
        style={{ '--delay': `${animDelay + 0.3}s` }}
      />
      {/* 頂点ドット */}
      {clubPts.map((p, i) => (
        <circle
          key={`c-${i}`}
          cx={p.x} cy={p.y} r="2.3"
          fill={clubColor} stroke="#fafaf7" strokeWidth="0.8"
          className="dsRB-radar-vertex"
          style={{ '--delay': `${animDelay + 0.5 + i * 0.05}s` }}
        />
      ))}
      {userPts.map((p, i) => (
        <circle
          key={`u-${i}`}
          cx={p.x} cy={p.y} r="2"
          fill="#0e0e10" stroke="#fafaf7" strokeWidth="0.8"
          className="dsRB-radar-vertex"
          style={{ '--delay': `${animDelay + 0.7 + i * 0.05}s` }}
        />
      ))}
      {/* 中心点 */}
      <circle cx="0" cy="0" r="1" fill="#0e0e10" opacity="0.4" />
    </svg>
  )
}

export async function generateMetadata({ params, searchParams }) {
  const { clubId } = await params
  const sp = (await searchParams) ?? {}
  const a = typeof sp.a === 'string' ? sp.a : null
  const data = await loadResultData({ clubId, a })
  if (!data) return { title: '結果が見つかりません — JLSP' }
  const { top1, userType } = data
  const title = userType
    ? `${userType.code} ${userType.nickname} × ${top1.club.name} — JLSP`
    : `あなたの推しクラブは「${top1.club.name}」 — JLSP`
  return {
    title,
    description: top1.club.description,
    openGraph: {
      title,
      description: top1.club.description,
      images: [`/api/og/${top1.club.id}`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: top1.club.description,
      images: [`/api/og/${top1.club.id}`],
    },
  }
}

export default async function ResultPage({ params, searchParams }) {
  const { clubId } = await params
  const sp = (await searchParams) ?? {}
  const a = typeof sp.a === 'string' ? sp.a : null
  const data = await loadResultData({ clubId, a })
  if (!data) notFound()
  const { top1, top3, worst3, detail, userType, userTypeCode, userVector, teamId } = data
  const clubColor = top1.club.color
  const sightseeing = parseSightseeing(top1.club.sightseeing)

  return (
    <div className="dsRB min-h-screen w-full bg-[#fafaf7] text-[#0e0e10]">
      {/* TOP STRIP */}
      <div className="border-b border-black/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 py-4 flex items-center justify-between">
          <Link href="/" className="text-xs sm:text-sm font-mono tracking-[0.3em] font-black hover:opacity-60">
            JLSP
          </Link>
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.18em] text-zinc-500">
            ISSUE · #{userTypeCode ?? '----'} <span className="opacity-50 mx-2">/</span> {top1.club.name}
          </span>
        </div>
      </div>

      {/* MOBILE TYPE STRIP — モバイルでは上に大きく出す (sticky 列が下に来るため) */}
      <div className="lg:hidden border-b border-black/10 bg-white">
        <div className="px-5 py-5">
          <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-2">YOUR FANTYPE</p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-5xl font-black tracking-[0.04em]" style={{ color: '#c7384d' }}>
              {userTypeCode ?? '----'}
            </span>
            <span className="text-2xl font-bold">{userType?.nickname ?? ''}</span>
          </div>
          {userType?.tagline && (
            <p className="mt-2 text-sm font-bold italic">{userType.tagline}</p>
          )}
        </div>
      </div>

      {/* 3 COLUMN MAIN */}
      <div className="max-w-7xl mx-auto px-5 sm:px-10 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-12 lg:gap-y-14">

        {/* LEFT COLUMN — TYPE (desktop sticky) */}
        <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-10 self-start space-y-8 order-2 lg:order-1">
          <div className="dsRB-fade" style={{ '--d': '0s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">N°01 — TYPE</p>
            <div className="border-t-2 border-[#c7384d] pt-4">
              <p className="text-5xl xl:text-6xl font-black tracking-[0.04em] leading-none" style={{ color: '#c7384d' }}>
                {userTypeCode ?? '----'}
              </p>
              <p className="text-xl xl:text-2xl font-bold mt-2 leading-tight">
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
          <div className="dsRB-fade space-y-4" style={{ '--d': '0.2s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500">TYPE MAP</p>
            <RadarPlot
              userVector={userVector}
              clubVector={top1.club.vector}
              clubColor={clubColor}
              animDelay={0.35}
            />
            <div className="flex gap-3 text-[10px] font-mono text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0e0e10]" />
                you
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: clubColor }} />
                {top1.club.name}
              </span>
            </div>
            <p className="text-[10px] font-mono text-zinc-400 leading-relaxed">
              4軸の位置を 1 枚に。形が重なるほど相性◎。<br />
              外側 = 正極 (R / W / U / O) / 反対側 = 負極。
            </p>
          </div>
        </aside>

        {/* CENTER COLUMN — CLUB MAIN */}
        <main className="lg:col-span-6 space-y-12 sm:space-y-16 order-1 lg:order-2">
          <section className="dsRB-fade" style={{ '--d': '0.05s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">YOUR CLUB</p>
            <div className="h-1 w-16 mb-5" style={{ backgroundColor: clubColor }} />
            <h1 className="text-4xl sm:text-7xl font-black leading-[0.95] tracking-[-0.03em] mb-6 sm:mb-8">
              {top1.club.name}
            </h1>
            <div className="flex items-baseline gap-3 mb-5 flex-wrap">
              <span className="dsRB-bignum text-6xl sm:text-[7rem] font-black tabular-nums leading-none" style={{ color: clubColor }}>
                {pct(top1.score)}
              </span>
              <span className="text-sm sm:text-base font-mono tracking-[0.2em] text-zinc-500">% MATCH</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-7">
              <span className="px-3 py-1 text-[10px] sm:text-xs font-mono tracking-[0.15em] text-zinc-600 rounded-full border border-black/15">
                {top1.club.division}
              </span>
              <span className="px-3 py-1 text-[10px] sm:text-xs font-mono tracking-[0.15em] text-zinc-600 rounded-full border border-black/15">
                {top1.club.region}・{top1.club.prefecture}
              </span>
            </div>
            <p className="text-base sm:text-lg leading-[1.75] text-[#0e0e10] font-medium">
              {top1.club.description}
            </p>
          </section>

          {/* WHY THIS MATCH */}
          <section className="dsRB-fade" style={{ '--d': '0.15s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">WHY THIS MATCH</p>
            <div className="border-t border-black/10 pt-6 space-y-6">
              {AXES.map((axis, i) => {
                const userN = Math.max(-1, Math.min(1, userVector[axis.id] / 18))
                const clubN = Math.max(-1, Math.min(1, top1.club.vector[axis.id] / 2))
                const userPct = ((userN + 1) / 2) * 100
                const clubPct = ((clubN + 1) / 2) * 100
                const gap = Math.abs(userN - clubN)
                const matchSymbol = gap < 0.25 ? '◎' : gap < 0.55 ? '◯' : gap < 0.85 ? '△' : '×'
                const matchColor = gap < 0.25 ? '#22c55e' : gap < 0.55 ? '#0e0e10' : gap < 0.85 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={axis.id}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-sm sm:text-base font-bold">{axis.label}</span>
                      <span className="font-mono text-xl font-black" style={{ color: matchColor }}>{matchSymbol}</span>
                    </div>
                    <div className="relative h-2.5 rounded-full bg-black/10">
                      <span
                        className="dsRB-axis-dot absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#0e0e10] ring-2 ring-[#fafaf7]"
                        style={{ left: `${userPct}%`, '--delay': `${0.4 + i * 0.05}s` }}
                      />
                      <span
                        className="dsRB-axis-dot absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full ring-2 ring-white"
                        style={{ left: `${clubPct}%`, backgroundColor: clubColor, '--delay': `${0.55 + i * 0.05}s` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
                      <span>{axis.negative.name}</span>
                      <span>{axis.positive.name}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-[10px] font-mono text-zinc-500 flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0e0e10]" /> あなた</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: clubColor }} /> {top1.club.name}</span>
            </p>
          </section>

          {/* EXPLORE */}
          {sightseeing.length > 0 && (
            <section className="dsRB-fade" style={{ '--d': '0.25s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">EXPLORE</p>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4 leading-relaxed">
                {top1.club.prefecture} の見どころ。観戦のついでにどうぞ。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sightseeing.map((spot) => (
                  <a
                    key={spot}
                    href={`https://www.jalan.net/kankou/?keyword=${encodeURIComponent(spot)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border border-black/10 hover:border-black px-4 py-3 rounded-lg bg-white transition-colors group"
                  >
                    <p className="text-[10px] font-mono tracking-[0.15em] text-zinc-500 mb-1">
                      {top1.club.prefecture}
                    </p>
                    <p className="text-sm font-bold leading-snug flex items-center justify-between">
                      <span>{spot}</span>
                      <span className="text-zinc-400 group-hover:translate-x-1 transition-transform">→</span>
                    </p>
                  </a>
                ))}
              </div>
              <a
                href={`https://www.jalan.net/kankou/?keyword=${encodeURIComponent(top1.club.prefecture)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.18em] text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                じゃらんで {top1.club.prefecture} の観光地をもっと見る →
              </a>
            </section>
          )}
        </main>

        {/* RIGHT COLUMN — DATA STACK */}
        <aside className="lg:col-span-3 lg:sticky lg:top-10 self-start space-y-7 sm:space-y-8 order-3">
          {detail?.standings && (
            <div className="dsRB-fade border-t border-black/10 pt-5" style={{ '--d': '0.1s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">N°02 — NOW</p>
              <div className="flex items-baseline gap-2">
                <span className="dsRB-bignum text-6xl font-black tabular-nums leading-none">{detail.standings.rank}</span>
                <span className="text-sm font-mono text-zinc-500">位 · {detail.standings.group_name}</span>
              </div>
              <p className="font-mono text-xs text-zinc-600 mt-3">
                {detail.standings.win}-{detail.standings.draw}-{detail.standings.lose}
                <span className="opacity-50 mx-2">·</span>
                {detail.standings.points}pt
              </p>
              {detail.standings.form && (
                <div className="flex gap-1.5 mt-3">
                  {detail.standings.form.slice(-5).split('').map((c, i) => (
                    <span
                      key={i}
                      className="dsRB-form-badge inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold text-white"
                      style={{
                        backgroundColor: c === 'W' ? '#22c55e' : c === 'D' ? '#71717a' : '#f97316',
                        '--delay': `${0.4 + i * 0.08}s`,
                      }}
                    >
                      {c === 'W' ? '勝' : c === 'D' ? '分' : '敗'}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {detail?.upcomingMatches?.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-5 space-y-3" style={{ '--d': '0.2s' }}>
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
            <div className="dsRB-fade border-t border-black/10 pt-5 space-y-2" style={{ '--d': '0.3s' }}>
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
        <div className="max-w-7xl mx-auto px-5 sm:px-10 py-10 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          <div>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">TOP 3 RECOMMENDED</p>
            <ol className="space-y-2.5">
              {top3.map((m, i) => (
                <li key={m.club.id} className="flex items-center gap-3 border-b border-black/5 pb-2.5 last:border-0">
                  <span className="font-mono text-xs text-zinc-500 w-4 tabular-nums">{i + 1}</span>
                  <span className="w-1 h-6 rounded-full" style={{ backgroundColor: m.club.color }} />
                  <span className="flex-1 text-base font-bold truncate">{m.club.name}</span>
                  <span className="font-mono text-base font-black tabular-nums" style={{ color: m.club.color }}>{pct(m.score)}%</span>
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
                  <span className="font-mono text-base text-zinc-500 tabular-nums">{pct(m.score)}%</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* 16 TYPES — expander */}
      <div className="border-t border-black/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 py-10">
          <details className="dsRB-types group">
            <summary className="cursor-pointer list-none flex items-center gap-3 hover:opacity-70 transition-opacity">
              <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500">ALL 16 TYPES</span>
              <span className="text-xs font-mono text-zinc-400 transition-transform group-open:rotate-90">▸</span>
            </summary>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.values(TYPE_META).map((t) => {
                const isMine = t.code === userTypeCode
                return (
                  <div
                    key={t.code}
                    className={`px-3 py-2.5 rounded-lg border ${
                      isMine
                        ? 'border-[#c7384d] bg-[#fff5f7]'
                        : 'border-black/10 bg-white'
                    }`}
                  >
                    <p
                      className="text-base sm:text-lg font-black tracking-[0.06em] tabular-nums leading-none"
                      style={{ color: isMine ? '#c7384d' : '#0e0e10' }}
                    >
                      {t.code}
                    </p>
                    <p className="text-xs sm:text-sm font-bold mt-1 leading-tight">{t.nickname}</p>
                    {isMine && (
                      <p className="text-[9px] font-mono text-[#c7384d] mt-1 tracking-[0.2em]">YOU</p>
                    )}
                  </div>
                )
              })}
            </div>
          </details>
        </div>
      </div>

      {/* CTA + SHARE + FOOTER */}
      <div className="border-t border-black/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 py-10 sm:py-12 flex flex-col gap-6 items-center sm:items-stretch">
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-6">
            <ShareButtons
              typeCode={userTypeCode}
              typeNickname={userType?.nickname}
              clubName={top1.club.name}
            />
            <Link href="/quiz" className="cta-button">もう一度診断する</Link>
          </div>
          <p className="text-center text-[10px] text-zinc-500 pt-6">
            本サービスは非公式の診断コンテンツです。J リーグ・各クラブとは一切関係ありません。
          </p>
        </div>
      </div>
    </div>
  )
}
