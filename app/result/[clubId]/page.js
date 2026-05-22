import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadResultData } from '@/lib/jlsp/result-page-data'
import { AXES } from '@/lib/jlsp/axes'
import { TYPE_META } from '@/lib/jlsp/type-meta'
import { TYPE_FLAVORS } from '@/lib/jlsp/type-flavors'
import { CLUB_META } from '@/lib/jlsp/club-meta'
import ShareButtons from './ShareButtons'
import CountUp from './CountUp'

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
function fmtYen(n) {
  if (!n) return null
  return '¥' + Number(n).toLocaleString('ja-JP')
}

/**
 * Parallel Coordinates: 4 軸を縦に並べた折れ線。S-curve でなめらかに繋ぐ。
 */
function ParallelPlot({ userVector, clubVector, clubColor, animDelay = 0.4 }) {
  const AXES_DEF = [
    { id: 'shoubu',  posLetter: 'R', negLetter: 'E', label: '勝負', negLabel: '美学' },
    { id: 'keiei',   posLetter: 'W', negLetter: 'H', label: '経営', negLabel: '育成' },
    { id: 'kansen',  posLetter: 'U', negLetter: 'A', label: '観戦', negLabel: '分析' },
    { id: 'kanshin', posLetter: 'O', negLetter: 'F', label: '関心', negLabel: 'カルチャー' },
  ]
  const clamp = (v) => Math.max(-1, Math.min(1, v))
  const VB_W = 200, VB_H = 116
  const xs = [25, 75, 125, 175]
  const yTop = 24, yBottom = 86
  const yCenter = (yTop + yBottom) / 2
  const halfH = (yBottom - yTop) / 2

  const userYs = AXES_DEF.map((a) => yCenter - clamp(userVector[a.id] / 18) * halfH)
  const clubYs = AXES_DEF.map((a) => yCenter - clamp(clubVector[a.id] / 2) * halfH)

  function smoothPath(ys) {
    let d = `M ${xs[0]} ${ys[0]}`
    for (let i = 1; i < xs.length; i++) {
      const midX = (xs[i - 1] + xs[i]) / 2
      d += ` C ${midX},${ys[i - 1]} ${midX},${ys[i]} ${xs[i]},${ys[i]}`
    }
    return d
  }

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto block">
      <line
        x1={xs[0] - 4} y1={yCenter} x2={xs[xs.length - 1] + 4} y2={yCenter}
        stroke="#0e0e10" strokeOpacity="0.08" strokeWidth="0.3" strokeDasharray="0.6 1.4"
      />
      {xs.map((x, i) => (
        <g key={i}>
          <line x1={x} y1={yTop} x2={x} y2={yBottom} stroke="#0e0e10" strokeOpacity="0.22" strokeWidth="0.3" />
          {[0.25, 0.5, 0.75].map((t) => (
            <g key={t}>
              <line x1={x - 1} y1={yCenter - halfH * t} x2={x + 1} y2={yCenter - halfH * t} stroke="#0e0e10" strokeOpacity="0.14" strokeWidth="0.22" />
              <line x1={x - 1} y1={yCenter + halfH * t} x2={x + 1} y2={yCenter + halfH * t} stroke="#0e0e10" strokeOpacity="0.14" strokeWidth="0.22" />
            </g>
          ))}
          <text x={x} y={yTop - 10} fontSize="3.8" textAnchor="middle" fill="#0e0e10" fillOpacity="0.4" fontFamily="var(--font-geist-mono), monospace" letterSpacing="0.18em">{AXES_DEF[i].label}</text>
          <text x={x} y={yTop - 2.5} fontSize="6.5" textAnchor="middle" fontWeight="900" fill="#0e0e10" fillOpacity="0.92" fontFamily="var(--font-geist-mono), monospace">{AXES_DEF[i].posLetter}</text>
          <text x={x} y={yBottom + 7.5} fontSize="6.5" textAnchor="middle" fontWeight="900" fill="#0e0e10" fillOpacity="0.4" fontFamily="var(--font-geist-mono), monospace">{AXES_DEF[i].negLetter}</text>
          <text x={x} y={yBottom + 14.5} fontSize="3.6" textAnchor="middle" fill="#0e0e10" fillOpacity="0.4" fontFamily="var(--font-geist-mono), monospace" letterSpacing="0.12em">{AXES_DEF[i].negLabel}</text>
        </g>
      ))}

      <path
        d={smoothPath(clubYs)}
        fill="none"
        stroke={clubColor}
        strokeWidth="0.85"
        strokeOpacity="0.95"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dsRB-pc-line"
        style={{ '--delay': `${animDelay + 0.1}s` }}
      />
      {clubYs.map((y, i) => (
        <circle
          key={`c${i}`}
          cx={xs[i]} cy={y} r="1.5"
          fill={clubColor} stroke="#fafaf7" strokeWidth="0.45"
          className="dsRB-pc-dot"
          style={{ '--delay': `${animDelay + 0.4 + i * 0.05}s` }}
        />
      ))}

      <path
        d={smoothPath(userYs)}
        fill="none"
        stroke="#0e0e10"
        strokeWidth="0.85"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dsRB-pc-line"
        style={{ '--delay': `${animDelay + 0.35}s` }}
      />
      {userYs.map((y, i) => (
        <circle
          key={`u${i}`}
          cx={xs[i]} cy={y} r="1.3"
          fill="#0e0e10" stroke="#fafaf7" strokeWidth="0.45"
          className="dsRB-pc-dot"
          style={{ '--delay': `${animDelay + 0.65 + i * 0.05}s` }}
        />
      ))}
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
  const clubMeta = CLUB_META[top1.club.id] ?? {}
  const flavors = TYPE_FLAVORS[userTypeCode]
  const sightseeing = parseSightseeing(top1.club.sightseeing)
  const description = clubMeta.descriptionLong ?? top1.club.description
  const lat = detail?.stadium?.home_stadium_lat
  const lng = detail?.stadium?.home_stadium_lng
  const mapsUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null
  const hasOfficial = clubMeta.official && Object.values(clubMeta.official).some(Boolean)

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

      {/* クラブカラー巨大帯 */}
      <div className="dsRB-color-band" style={{ backgroundColor: clubColor }} />

      {/* MOBILE TYPE STRIP */}
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

        {/* LEFT COLUMN */}
        <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-10 self-start space-y-8 order-2 lg:order-1">
          <div className="dsRB-fade" style={{ '--d': '0s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">N°01 — TYPE</p>
            <div className="border-t-2 border-[#c7384d] pt-4">
              <p className="text-5xl xl:text-6xl font-black tracking-[0.04em] leading-none" style={{ color: '#c7384d' }}>
                {userTypeCode ?? '----'}
              </p>
              <p className="text-xl xl:text-2xl font-bold mt-2 leading-tight">{userType?.nickname ?? ''}</p>
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
            <ParallelPlot userVector={userVector} clubVector={top1.club.vector} clubColor={clubColor} animDelay={0.35} />
            <div className="flex gap-3 text-[10px] font-mono text-zinc-500 pt-1">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-px bg-[#0e0e10]" />you</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-px" style={{ backgroundColor: clubColor }} />{top1.club.name}</span>
            </div>
          </div>

          {/* TYPE FLAVORS */}
          {flavors && (
            <div className="dsRB-fade space-y-3 border-t border-black/10 pt-5" style={{ '--d': '0.35s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500">FLAVORS</p>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {userType?.nickname} が好きそうな世界観。
              </p>
              <FlavorRow label="MOVIE" items={flavors.movies} />
              <FlavorRow label="MUSIC" items={flavors.music} />
              <FlavorRow label="FOOD" items={flavors.foods} />
            </div>
          )}
        </aside>

        {/* CENTER COLUMN */}
        <main className="lg:col-span-6 space-y-12 sm:space-y-16 order-1 lg:order-2">
          {/* CLUB HERO */}
          <section className="dsRB-fade" style={{ '--d': '0.05s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">YOUR CLUB</p>
            <div className="h-1 w-16 mb-5" style={{ backgroundColor: clubColor }} />
            <h1 className="text-4xl sm:text-7xl font-black leading-[0.95] tracking-[-0.03em] mb-6 sm:mb-8">
              {top1.club.name}
            </h1>
            <div className="flex items-baseline gap-3 mb-5 flex-wrap">
              <span className="dsRB-bignum text-6xl sm:text-[7rem] font-black tabular-nums leading-none" style={{ color: clubColor }}>
                <CountUp target={pct(top1.score)} duration={1500} delay={200} />
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
            <p className="text-base sm:text-lg leading-[1.85] text-[#0e0e10] font-medium">
              {description}
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
                      <span className="dsRB-axis-dot absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[#0e0e10] ring-2 ring-[#fafaf7]" style={{ left: `${userPct}%`, '--delay': `${0.4 + i * 0.05}s` }} />
                      <span className="dsRB-axis-dot absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full ring-2 ring-white" style={{ left: `${clubPct}%`, backgroundColor: clubColor, '--delay': `${0.55 + i * 0.05}s` }} />
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

          {/* STADIUM + Maps + 最寄駅 */}
          {(detail?.stadium || clubMeta.access) && (
            <section className="dsRB-fade" style={{ '--d': '0.2s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">STADIUM</p>
              <div className="border-t border-black/10 pt-6 space-y-3">
                {detail?.stadium?.home_stadium_name && (
                  <p className="text-xl sm:text-2xl font-black">{detail.stadium.home_stadium_name}</p>
                )}
                {clubMeta.access && (
                  <p className="text-sm text-zinc-700">
                    最寄: <span className="font-bold">{clubMeta.access.station}</span>
                    {clubMeta.access.walkMinutes != null && <span> · 徒歩 {clubMeta.access.walkMinutes} 分</span>}
                    {clubMeta.access.note && <span className="text-zinc-500"> ({clubMeta.access.note})</span>}
                  </p>
                )}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-zinc-700 hover:text-[#0e0e10] border-b border-black/20 hover:border-[#0e0e10] transition-colors pb-0.5"
                  >
                    Google Maps で開く →
                  </a>
                )}
              </div>
            </section>
          )}

          {/* AWAY TRAVEL */}
          {clubMeta.awayTravel?.fromTokyo && (
            <section className="dsRB-fade" style={{ '--d': '0.22s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">AWAY TRAVEL</p>
              <div className="border-t border-black/10 pt-6">
                <p className="text-xs text-zinc-600 mb-4">東京駅からのアクセス目安。</p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 mb-1">所要時間</p>
                    <p className="text-lg sm:text-xl font-black">{clubMeta.awayTravel.fromTokyo.hours}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 mb-1">交通手段</p>
                    <p className="text-sm font-bold">{clubMeta.awayTravel.fromTokyo.transport}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 mb-1">料金目安</p>
                    <p className="text-lg sm:text-xl font-black tabular-nums">{fmtYen(clubMeta.awayTravel.fromTokyo.yen) ?? '—'}</p>
                  </div>
                </div>
                {clubMeta.awayTravel.fromTokyo.note && (
                  <p className="text-xs text-zinc-500 mt-3">{clubMeta.awayTravel.fromTokyo.note}</p>
                )}
              </div>
            </section>
          )}

          {/* MASCOT */}
          {clubMeta.mascot && (
            <section className="dsRB-fade" style={{ '--d': '0.24s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">MASCOT</p>
              <div className="border-t border-black/10 pt-6">
                <p className="text-xl sm:text-2xl font-black mb-2" style={{ color: clubColor }}>
                  {clubMeta.mascot.name}
                </p>
                <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">{clubMeta.mascot.description}</p>
              </div>
            </section>
          )}

          {/* OFFICIAL LINKS */}
          {hasOfficial && (
            <section className="dsRB-fade" style={{ '--d': '0.26s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">OFFICIAL</p>
              <div className="border-t border-black/10 pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {clubMeta.official.hp && (
                    <OfficialLink href={clubMeta.official.hp} label="公式 HP" />
                  )}
                  {clubMeta.official.x && (
                    <OfficialLink href={clubMeta.official.x} label="X (Twitter)" />
                  )}
                  {clubMeta.official.instagram && (
                    <OfficialLink href={clubMeta.official.instagram} label="Instagram" />
                  )}
                  {clubMeta.official.shop && (
                    <OfficialLink href={clubMeta.official.shop} label="SHOP" />
                  )}
                </div>
              </div>
            </section>
          )}

          {/* EXPLORE */}
          {sightseeing.length > 0 && (
            <section className="dsRB-fade" style={{ '--d': '0.28s' }}>
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
              {clubMeta.ticketUrl && (
                <a
                  href={clubMeta.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.18em] text-zinc-500 hover:text-zinc-900 border-t border-black/10 pt-3 transition-colors"
                >
                  Jリーグチケット で買う →
                </a>
              )}
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

      {/* 16 TYPES expander */}
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
                      isMine ? 'border-[#c7384d] bg-[#fff5f7]' : 'border-black/10 bg-white'
                    }`}
                  >
                    <p
                      className="text-base sm:text-lg font-black tracking-[0.06em] tabular-nums leading-none"
                      style={{ color: isMine ? '#c7384d' : '#0e0e10' }}
                    >
                      {t.code}
                    </p>
                    <p className="text-xs sm:text-sm font-bold mt-1 leading-tight">{t.nickname}</p>
                    {isMine && <p className="text-[9px] font-mono text-[#c7384d] mt-1 tracking-[0.2em]">YOU</p>}
                  </div>
                )
              })}
            </div>
          </details>
        </div>
      </div>

      {/* MORE LINKS (観戦ガイド / Jチケ / toto) */}
      <div className="border-t border-black/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 py-10">
          <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-5">MORE</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ExternalLink
              href="https://www.jleague.jp/aboutj/howto/"
              label="観戦初心者ガイド"
              sub="J リーグ公式のはじめてガイド"
            />
            {clubMeta.ticketUrl && (
              <ExternalLink
                href={clubMeta.ticketUrl}
                label="J リーグチケット"
                sub={`${top1.club.name} の試合チケット`}
              />
            )}
            <ExternalLink
              href="https://store.toto-dream.com/dcs/subos/screen/pi01/spin010/PGSPIN01001InitDispatchAction.do"
              label="toto / BIG"
              sub="J リーグを予想して当てる"
            />
          </div>
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
              clubId={top1.club.id}
              encodedAnswers={a}
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

function FlavorRow({ label, items }) {
  return (
    <div>
      <p className="text-[9px] font-mono tracking-[0.25em] text-zinc-500 mb-1">{label}</p>
      <ul className="text-xs text-zinc-700 leading-relaxed">
        {items.map((it) => (
          <li key={it} className="truncate">{it}</li>
        ))}
      </ul>
    </div>
  )
}

function OfficialLink({ href, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-black/10 hover:border-black px-3 py-2.5 rounded-lg bg-white transition-colors group"
    >
      <p className="text-[10px] font-mono tracking-[0.15em] text-zinc-500 mb-0.5">LINK</p>
      <p className="text-xs sm:text-sm font-bold flex items-center justify-between">
        <span>{label}</span>
        <span className="text-zinc-400 group-hover:translate-x-1 transition-transform">↗</span>
      </p>
    </a>
  )
}

function ExternalLink({ href, label, sub }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="block border border-black/10 hover:border-black px-5 py-4 rounded-lg bg-white transition-colors group"
    >
      <p className="text-sm sm:text-base font-black mb-1 flex items-center justify-between">
        <span>{label}</span>
        <span className="text-zinc-400 group-hover:translate-x-1 transition-transform">↗</span>
      </p>
      {sub && <p className="text-[11px] text-zinc-500">{sub}</p>}
    </a>
  )
}
