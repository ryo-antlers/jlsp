import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadResultData } from '@/lib/jlsp/result-page-data'
// CLUB_META は loader 経由で DB override を反映済みのものを result-page-data から受け取る
import { NOTABLE_ALUMNI, OVERSEAS_PLAYERS } from '@/lib/jlsp/club-players' // 静的 fallback
import { SIGHTSEEING_SPOTS } from '@/lib/jlsp/sightseeing-spots'
import { getWikiThumbnails } from '@/lib/jlsp/wiki-image'
import ShareButtons from './ShareButtons'
import CountUp from './CountUp'

export const dynamic = 'force-dynamic'

function pct(s) { return Math.round(s * 100) }
// クラブ名を「漢字地名 ｜ カタカナ/英字 愛称」の境界で2行に分割する。
// 例: 鹿島アントラーズ→[鹿島, アントラーズ] / ガンバ大阪→[ガンバ, 大阪] / FC東京→[FC, 東京]
function splitClubName(name) {
  let m = name.match(/^([一-鿿々ヶ]+)([゠-ヿA-Za-z].*)$/)
  if (m) return [m[1], m[2]]
  m = name.match(/^([゠-ヿ・A-Za-z.]+)([一-鿿々ヶ].*)$/)
  if (m) return [m[1], m[2]]
  return [name]
}
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
export async function generateMetadata({ params, searchParams }) {
  const { clubId } = await params
  const sp = (await searchParams) ?? {}
  const a = typeof sp.a === 'string' ? sp.a : null
  const data = await loadResultData({ clubId, a })
  if (!data) return { title: '結果が見つかりません — JLSP' }
  const { top1 } = data
  const title = `あなたの推しクラブは「${top1.club.name}」 — JLSP`
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
  const { top1, top3, worst3, detail, overseasPlayers, overseasDataAvailable, teamId } = data
  const clubColor = top1.club.color
  const clubMeta = data.clubMeta ?? {}
  const alumni = clubMeta.notableAlumni ?? NOTABLE_ALUMNI[top1.club.id] ?? []
  const alumniStats = data.alumniStats ?? {}
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
  // Wikipedia (ja) から観光地サムネを取得。失敗したものは image:null で返るので
  // テキストカードに自動 fallback できる。観光地・建物は被写体に保護IPが無いので商用可。
  // マスコットはクラブのキャラ著作権/商標のため画像は出さず名前のみ表示。
  const sightseeingCards = await getWikiThumbnails(sightseeing)
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
            {pct(top1.score)}% MATCH <span className="opacity-50 mx-2">/</span> {top1.club.name}
          </span>
        </div>
      </div>

      {/* クラブカラー巨大帯 */}
      <div className="dsRB-color-band" style={{ backgroundColor: clubColor }} />

      {/* 3 COLUMN MAIN */}
      <div className="max-w-7xl mx-auto px-5 sm:px-10 py-8 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-12 lg:gap-y-14">

        {/* LEFT COLUMN — MATCH */}
        <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-10 self-start space-y-8 order-2 lg:order-1">
          <div className="dsRB-fade" style={{ '--d': '0s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">MATCH</p>
            <div className="border-t-2 pt-4" style={{ borderColor: clubColor }}>
              <p className="text-6xl xl:text-7xl font-black tabular-nums leading-none" style={{ color: clubColor }}>
                {pct(top1.score)}<span className="text-2xl xl:text-3xl">%</span>
              </p>
              <p className="text-base xl:text-lg font-bold mt-2 leading-tight">{top1.club.name} との相性</p>
            </div>
          </div>
          <div className="dsRB-fade space-y-3" style={{ '--d': '0.15s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500">TOP 3 RECOMMENDED</p>
            <ol className="space-y-2">
              {top3.map((m, i) => (
                <li key={m.club.id} className="flex items-center gap-2.5">
                  <span className="font-mono text-xs text-zinc-500 w-3 tabular-nums">{i + 1}</span>
                  <span className="w-1 h-5 rounded-full" style={{ backgroundColor: m.club.color }} />
                  <span className="flex-1 text-sm font-bold text-zinc-600 truncate">{m.club.name}</span>
                  <span className="font-mono text-sm font-black tabular-nums" style={{ color: clubColor }}>{pct(m.score)}%</span>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        {/* CENTER COLUMN */}
        <main className="lg:col-span-6 space-y-12 sm:space-y-16 order-1 lg:order-2">
          {/* CLUB HERO */}
          <section className="dsRB-fade" style={{ '--d': '0.05s' }}>
            <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">YOUR CLUB</p>
            <div className="h-1 w-16 mb-5" style={{ backgroundColor: clubColor }} />
            <h1 className="text-4xl sm:text-6xl font-black leading-[1.04] tracking-[-0.03em] mb-6 sm:mb-8">
              {splitClubName(top1.club.name).map((ln, i) => (
                <span key={i} className="block">{ln}</span>
              ))}
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

          {/* STADIUM */}
          {detail?.stadium?.home_stadium_name && (
            <section className="dsRB-fade" style={{ '--d': '0.2s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">STADIUM</p>
              <div className="border-t border-black/10 pt-6 space-y-4">
                <p className="text-xl sm:text-2xl font-black">{detail.stadium.home_stadium_name}</p>
                {lat && lng && (
                  <div className="rounded-lg overflow-hidden border border-black/10 bg-zinc-100">
                    <iframe
                      title={`${detail.stadium.home_stadium_name} 地図`}
                      src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                      width="100%"
                      height="320"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
                {mapsUrl && (
                  <div className="flex flex-wrap gap-2.5">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-85"
                      style={{ backgroundColor: clubColor }}
                    >
                      現在地からのルート
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-zinc-700 hover:text-[#0e0e10] border border-black/15 hover:border-[#0e0e10] transition-colors"
                    >
                      Google Maps で開く →
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* MASCOT (名前のみ・キャラ画像はクラブのIPのため非表示) */}
          {clubMeta.mascot && (
            <section className="dsRB-fade" style={{ '--d': '0.24s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">MASCOT</p>
              <div className="border-t border-black/10 pt-6">
                <p className="text-xl sm:text-2xl font-black leading-tight" style={{ color: clubColor }}>
                  {clubMeta.mascot.name}
                </p>
              </div>
            </section>
          )}

          {/* EXPLORE */}
          {sightseeingCards.length > 0 && (
            <section className="dsRB-fade" style={{ '--d': '0.28s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">EXPLORE</p>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4 leading-relaxed">
                {detail?.stadium?.home_stadium_name ?? top1.club.prefecture} 観戦のついでに。
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

          {/* OFFICIAL (HP / X / Instagram を縦積み) */}
          {hasOfficial && (
            <div className="dsRB-fade border-t border-black/10 pt-5 space-y-2" style={{ '--d': '0.18s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">OFFICIAL</p>
              {clubMeta.official.hp && (
                <OfficialRow href={clubMeta.official.hp} label="公式 HP" clubColor={clubColor} />
              )}
              {clubMeta.official.x && (
                <OfficialRow href={clubMeta.official.x} label="X (Twitter)" clubColor={clubColor} />
              )}
              {clubMeta.official.instagram && (
                <OfficialRow href={clubMeta.official.instagram} label="Instagram" clubColor={clubColor} />
              )}
            </div>
          )}

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
              <ul className="space-y-2.5">
                {alumni.map((name) => {
                  const stats = alumniStats[name]
                  return (
                    <li key={name} className="leading-tight">
                      <p className="text-sm font-bold">{name}</p>
                      {stats && (stats.apps > 0 || stats.goals > 0) && (
                        <p className="text-[11px] font-mono text-zinc-500 mt-0.5 tabular-nums">
                          {stats.apps} 試合
                          <span className="opacity-60"> · </span>
                          {stats.goals} ゴール
                        </p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* 現在 海外でプレー中の OB */}
          {overseas.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-5" style={{ '--d': '0.35s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">
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
                  <span className="flex-1 text-base font-bold text-zinc-600 truncate">{m.club.name}</span>
                  <span className="font-mono text-base font-black tabular-nums" style={{ color: clubColor }}>{pct(m.score)}%</span>
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
                  <span className="font-mono text-base font-black tabular-nums" style={{ color: m.club.color }}>{pct(m.score)}%</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* MORE LINKS (観戦ガイド / Jチケ / WINNER) */}
      <div className="border-t border-black/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-10 py-10">
          <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-5">MORE</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ExternalLink
              href="https://www.jleague.jp/special/beginner/"
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
              href="https://store.toto-dream.com/dcs/subos/screen/pi31/spin049/PGSPIN04901InitWinnerTop.form?channelId=03"
              label="WINNER"
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
              clubName={top1.club.name}
              matchPct={pct(top1.score)}
            />
            <Link
              href="/quiz"
              className="cta-button cta-button-club"
              style={{ '--cta-color': clubColor }}
            >
              もう一度診断する
            </Link>
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
 * 次の対戦カード。全試合を MatchLine スタイルで条目表示。
 * 1 試合目だけ右端に「あと N 日」 countdown を表示してわずかに強調。
 */
function UpcomingCard({ matches, teamId, clubColor, ticketUrl }) {
  if (!matches.length) return null
  return (
    <div className="dsRB-fade border-t border-black/10 pt-5 space-y-3" style={{ '--d': '0.2s' }}>
      <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500">NEXT MATCH</p>
      <div className="space-y-3">
        {matches.map((m, i) => (
          <MatchLine
            key={m.id}
            match={m}
            teamId={teamId}
            showVenue={i === 0}
          />
        ))}
      </div>
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

function MatchLine({ match, teamId, showVenue = false }) {
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
          {showVenue && match.venue_name_ja && (
            <span className="opacity-70"> · {match.venue_name_ja}</span>
          )}
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

/** 右カラム OFFICIAL 用 (narrow column 向けの 1 行レイアウト) */
function OfficialRow({ href, label, clubColor }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white border border-black/10 hover:border-black/30 transition-colors"
    >
      <span
        className="block w-1 h-5 rounded-full shrink-0"
        style={{ backgroundColor: clubColor }}
      />
      <span className="text-sm font-bold flex-1 truncate">{label}</span>
      <span className="text-zinc-400 group-hover:translate-x-1 transition-transform">↗</span>
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
