import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadResultData } from '@/lib/jlsp/result-page-data'
import { TYPE_META } from '@/lib/jlsp/type-meta'
// CLUB_META は loader 経由で DB override を反映済みのものを result-page-data から受け取る
import { NOTABLE_ALUMNI, OVERSEAS_PLAYERS } from '@/lib/jlsp/club-players' // 静的 fallback
import { SIGHTSEEING_SPOTS } from '@/lib/jlsp/sightseeing-spots'
import { getWikiThumbnail, getWikiThumbnails } from '@/lib/jlsp/wiki-image'
import ShareButtons from './ShareButtons'
import CountUp from './CountUp'

export const dynamic = 'force-dynamic'

function pct(s) { return Math.round(s * 100) }
const JP_DOW = ['日', '月', '火', '水', '木', '金', '土']
function fmtMatchDate(d) {
  const x = new Date(d)
  return {
    month: x.getMonth() + 1,
    day: x.getDate(),
    dow: JP_DOW[x.getDay()],
    hh: String(x.getHours()).padStart(2, '0'),
    mm: String(x.getMinutes()).padStart(2, '0'),
    daysUntil: Math.max(0, Math.ceil((x.getTime() - Date.now()) / 86400000)),
  }
}
function parseSightseeing(s) {
  if (!s) return []
  return s.split(/[、,，]/).map((x) => x.trim()).filter(Boolean).slice(0, 6)
}
// Wikipedia の disambiguation 括弧 (例: "玉川温泉 (秋田県)") を表示用に剥がす。
function displayTitle(t) {
  return (t || '').replace(/\s*[（(][^）)]*[）)]\s*/g, '').trim()
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
  const { top1, top3, worst3, detail, overseasPlayers, overseasDataAvailable, userType, userTypeCode, userVector, teamId } = data
  const clubColor = top1.club.color
  const clubMeta = data.clubMeta ?? {}
  const alumni = clubMeta.notableAlumni ?? NOTABLE_ALUMNI[top1.club.id] ?? []
  // DB に海外組データがあれば DB を信頼 (per-club 空 = 真に海外組ゼロ)。
  // DB 全体が空 (= migration 未適用 / 初回 sync 待ち) のときだけ静的 fallback。
  const overseas = overseasDataAvailable
    ? overseasPlayers
    : (OVERSEAS_PLAYERS[top1.club.id] ?? [])
  // merged clubMeta.sightseeingSpots (DB override > 静的 SIGHTSEEING_SPOTS) を最優先、
  // それも無ければ clubs.js の sightseeing (2 件) に fallback。最大 3 件まで表示。
  const sightseeing = (
    clubMeta.sightseeingSpots ?? parseSightseeing(top1.club.sightseeing) ?? []
  ).slice(0, 3)
  // Wikipedia (ja) からサムネ画像を並列取得。失敗したものは image:null で返るので
  // テキストカードに自動 fallback できる。マスコット画像も同時取得。
  const mascotWikiTitle =
    clubMeta.mascot?.wikiTitle ?? clubMeta.mascot?.name ?? null
  const [sightseeingCards, mascotInfo] = await Promise.all([
    getWikiThumbnails(sightseeing),
    mascotWikiTitle ? getWikiThumbnail(mascotWikiTitle) : Promise.resolve(null),
  ])
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
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">TYPE</p>
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

          {/* MASCOT */}
          {clubMeta.mascot && (
            <section className="dsRB-fade" style={{ '--d': '0.24s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">MASCOT</p>
              <div className="border-t border-black/10 pt-6">
                <div className="flex gap-4 sm:gap-5 items-start">
                  {mascotInfo?.image ? (
                    <a
                      href={mascotInfo.pageUrl ?? `https://ja.wikipedia.org/wiki/${encodeURIComponent(mascotWikiTitle)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 block w-28 sm:w-36 rounded-lg overflow-hidden bg-zinc-100 ring-1 ring-black/5 hover:ring-black/30 transition"
                      title="Wikipedia で見る"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mascotInfo.image}
                        alt={clubMeta.mascot.name}
                        loading="lazy"
                        className="w-full aspect-square object-cover object-top"
                      />
                    </a>
                  ) : (
                    <div
                      className="shrink-0 w-28 sm:w-36 aspect-square rounded-lg flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${clubColor}22, ${clubColor}55)` }}
                    >
                      <span className="text-3xl font-black text-white/80 select-none">
                        {clubMeta.mascot.name.slice(0, 1)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xl sm:text-2xl font-black mb-2 leading-tight" style={{ color: clubColor }}>
                      {clubMeta.mascot.name}
                    </p>
                    <p className="text-sm sm:text-base text-zinc-700 leading-relaxed">{clubMeta.mascot.description}</p>
                    {mascotInfo?.image && (
                      <p className="text-[10px] text-zinc-400 mt-3">画像: Wikipedia (CC BY-SA)</p>
                    )}
                  </div>
                </div>
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
          {sightseeingCards.length > 0 && (
            <section className="dsRB-fade" style={{ '--d': '0.28s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">EXPLORE</p>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4 leading-relaxed">
                {top1.club.prefecture} の見どころ。観戦のついでにどうぞ。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sightseeingCards.map(({ title, image, extract }) => {
                  const shown = displayTitle(title)
                  return (
                    <a
                      key={title}
                      href={`https://www.jalan.net/kankou/?keyword=${encodeURIComponent(shown)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col overflow-hidden border border-black/10 hover:border-black rounded-lg bg-white transition-colors"
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={shown}
                          loading="lazy"
                          className="w-full aspect-[4/3] object-cover bg-zinc-100 group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div
                          className="w-full aspect-[4/3] flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${clubColor}22, ${clubColor}55)`,
                          }}
                        >
                          <span className="text-2xl font-black text-white/70 select-none">
                            {shown.slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex-1">
                        <p className="text-[10px] font-mono tracking-[0.15em] text-zinc-500 mb-1">
                          {top1.club.prefecture}
                        </p>
                        <p className="text-xs sm:text-sm font-bold leading-snug flex items-center justify-between gap-1.5">
                          <span className="line-clamp-2">{shown}</span>
                          <span className="text-zinc-400 group-hover:translate-x-1 transition-transform shrink-0">→</span>
                        </p>
                        {extract && (
                          <p className="hidden sm:block text-[11px] text-zinc-500 mt-1.5 leading-snug line-clamp-2">
                            {extract}
                          </p>
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
                <a
                  href={`https://www.jalan.net/kankou/?keyword=${encodeURIComponent(top1.club.prefecture)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.18em] text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  じゃらんで {top1.club.prefecture} の観光地をもっと見る →
                </a>
                <span className="text-[10px] text-zinc-400">画像: Wikipedia (CC BY-SA)</span>
              </div>
            </section>
          )}
        </main>

        {/* RIGHT COLUMN — DATA STACK */}
        <aside className="lg:col-span-3 lg:sticky lg:top-10 self-start space-y-8 sm:space-y-10 order-3">
          {/* STANDINGS */}
          {detail?.standings && <StandingsCard standings={detail.standings} clubColor={clubColor} />}

          {/* NEXT MATCH */}
          {detail?.upcomingMatches?.length > 0 && (
            <UpcomingCard
              matches={detail.upcomingMatches.slice(0, 3)}
              teamId={teamId}
              clubColor={clubColor}
              ticketUrl={clubMeta.ticketUrl}
            />
          )}

          {/* 主なOB選手 */}
          {alumni.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-5" style={{ '--d': '0.3s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">主なOB選手</p>
              <ul className="space-y-1">
                {alumni.map((name) => (
                  <li key={name} className="text-sm font-bold leading-tight flex items-center gap-2">
                    <span
                      className="inline-block w-1 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: clubColor, opacity: 0.4 }}
                    />
                    <span className="truncate">{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* このクラブでプレーした選手 (現在海外) */}
          {overseas.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-5" style={{ '--d': '0.35s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-1">
                このクラブでプレーした選手
              </p>
              <p className="text-[10px] text-zinc-500 mb-3">
                現在 海外でプレー中
              </p>
              <ul className="space-y-2.5">
                {overseas.map((p) => (
                  <li key={p.name} className="leading-tight">
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      {p.club}
                      {p.country && <span className="opacity-60"> · {p.country}</span>}
                    </p>
                  </li>
                ))}
              </ul>
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

/**
 * 右カラム最上段の順位カード。
 * クラブカラーの帯と大きな順位、前節からの delta、得失点、直近5の勝敗を一枚にまとめる。
 */
function StandingsCard({ standings, clubColor }) {
  const delta =
    standings.prev_rank != null && standings.rank != null
      ? standings.prev_rank - standings.rank
      : 0
  const gd = (standings.goals_for ?? 0) - (standings.goals_against ?? 0)
  const formArr = (standings.form ?? '').slice(-5).split('')

  return (
    <div className="dsRB-fade" style={{ '--d': '0.1s' }}>
      <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">
        STANDINGS
        {standings.group_name && (
          <span className="opacity-50 ml-2">{standings.group_name}</span>
        )}
      </p>
      {/* 順位 + delta */}
      <div
        className="relative overflow-hidden rounded-lg px-4 pt-4 pb-3 text-white"
        style={{ backgroundColor: clubColor }}
      >
        <div className="flex items-end justify-between">
          <div className="leading-none">
            <span className="dsRB-bignum text-[5.5rem] font-black tabular-nums">
              {standings.rank}
            </span>
            <span className="text-2xl font-black opacity-80 ml-1">位</span>
          </div>
          {delta !== 0 && (
            <div className="flex items-center gap-1 pb-3 pr-1">
              <span className={`text-xl font-black ${delta > 0 ? 'text-white' : 'text-white/85'}`}>
                {delta > 0 ? '▲' : '▼'}
              </span>
              <span className="text-xl font-black tabular-nums">{Math.abs(delta)}</span>
            </div>
          )}
          {delta === 0 && standings.prev_rank != null && (
            <span className="text-xs font-mono opacity-70 pb-3 pr-1">—</span>
          )}
        </div>
        <p className="text-[10px] font-mono tracking-[0.18em] opacity-85 mt-1">
          {standings.played}試合 · {standings.points}pt
        </p>
      </div>

      {/* W-D-L grid */}
      <div className="grid grid-cols-3 gap-px bg-black/5 mt-px rounded-b-lg overflow-hidden">
        <StatCell label="勝" value={standings.win} color="#22c55e" />
        <StatCell label="分" value={standings.draw} color="#71717a" />
        <StatCell label="敗" value={standings.lose} color="#f97316" />
      </div>

      {/* Goals */}
      <div className="flex items-baseline justify-between mt-4 text-xs">
        <span className="font-mono text-[10px] text-zinc-500 tracking-[0.15em]">GOALS</span>
        <span className="font-mono tabular-nums">
          <span className="font-bold text-zinc-700">{standings.goals_for}</span>
          <span className="text-zinc-400 mx-1">/</span>
          <span className="text-zinc-500">{standings.goals_against}</span>
          <span className={`ml-2 font-black ${gd > 0 ? 'text-emerald-600' : gd < 0 ? 'text-rose-600' : 'text-zinc-500'}`}>
            {gd > 0 ? '+' : ''}{gd}
          </span>
        </span>
      </div>

      {/* 直近5試合 */}
      {formArr.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 mb-2">直近5試合</p>
          <div className="flex gap-1.5">
            {formArr.map((c, i) => (
              <span
                key={i}
                className="dsRB-form-badge inline-flex items-center justify-center w-7 h-7 rounded text-xs font-black text-white"
                style={{
                  backgroundColor: c === 'W' ? '#22c55e' : c === 'D' ? '#71717a' : '#f97316',
                  '--delay': `${0.4 + i * 0.08}s`,
                }}
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCell({ label, value, color }) {
  return (
    <div className="bg-white flex items-baseline justify-center gap-1 py-2">
      <span className="text-xl font-black tabular-nums" style={{ color }}>
        {value ?? 0}
      </span>
      <span className="text-[10px] font-bold text-zinc-500">{label}</span>
    </div>
  )
}

/**
 * 次の対戦カード。1 試合目は大きく countdown 付き、2-3 試合目は条目で。
 */
function UpcomingCard({ matches, teamId, clubColor, ticketUrl }) {
  if (!matches.length) return null
  const [first, ...rest] = matches
  return (
    <div className="dsRB-fade border-t border-black/10 pt-5 space-y-4" style={{ '--d': '0.2s' }}>
      <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500">NEXT MATCH</p>

      {/* FIRST: hero */}
      <MatchHero match={first} teamId={teamId} clubColor={clubColor} />

      {/* REST: condensed lines */}
      {rest.length > 0 && (
        <div className="space-y-2.5 border-t border-black/10 pt-3">
          {rest.map((m) => (
            <MatchLine key={m.id} match={m} teamId={teamId} />
          ))}
        </div>
      )}

      {ticketUrl && (
        <a
          href={ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-2 text-[11px] font-mono tracking-[0.18em] text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          Jリーグチケット で買う →
        </a>
      )}
    </div>
  )
}

function MatchHero({ match, teamId, clubColor }) {
  const isHome = match.home_team_id === teamId
  const oppName = isHome ? match.away_name : match.home_name
  const oppColor = isHome ? match.away_color : match.home_color
  const t = fmtMatchDate(match.date)
  return (
    <div className="rounded-lg overflow-hidden border border-black/10 bg-white">
      {/* HOME/AWAY ribbon */}
      <div
        className="px-3 py-1.5 flex items-center justify-between text-[10px] font-mono tracking-[0.18em] text-white"
        style={{ backgroundColor: isHome ? clubColor : '#0e0e10' }}
      >
        <span>{isHome ? 'HOME' : 'AWAY'}</span>
        {t.daysUntil > 0 ? (
          <span className="opacity-90">あと {t.daysUntil} 日</span>
        ) : (
          <span className="opacity-90">今日</span>
        )}
      </div>
      <div className="px-4 py-3.5 space-y-2.5">
        {/* date row */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tabular-nums leading-none">
            {t.month}/{t.day}
          </span>
          <span className="text-xs font-mono text-zinc-500">({t.dow})</span>
        </div>
        {/* opponent */}
        <div className="flex items-center gap-2.5">
          <span
            className="block w-1 h-7 rounded-full shrink-0"
            style={{ backgroundColor: oppColor ?? '#a1a1aa' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-mono text-zinc-500 leading-none mb-0.5">vs</p>
            <p className="text-sm font-bold leading-tight truncate">{oppName}</p>
          </div>
        </div>
        {match.venue_name_ja && (
          <p className="text-[11px] text-zinc-500 truncate">{match.venue_name_ja}</p>
        )}
      </div>
    </div>
  )
}

function MatchLine({ match, teamId }) {
  const isHome = match.home_team_id === teamId
  const oppName = isHome ? match.away_name : match.home_name
  const oppColor = isHome ? match.away_color : match.home_color
  const t = fmtMatchDate(match.date)
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-right shrink-0 w-12">
        <p className="text-xs font-bold tabular-nums leading-none">
          {t.month}/{t.day}
        </p>
        <p className="text-[9px] font-mono text-zinc-500 mt-0.5">({t.dow})</p>
      </div>
      <span
        className="block w-0.5 h-7 rounded-full shrink-0"
        style={{ backgroundColor: oppColor ?? '#a1a1aa' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-mono text-zinc-500 leading-none mb-0.5">
          {isHome ? 'HOME' : 'AWAY'}
        </p>
        <p className="text-xs font-bold truncate leading-tight">vs {oppName}</p>
      </div>
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
