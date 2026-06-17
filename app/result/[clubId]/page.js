import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadResultData } from '@/lib/jlsp/result-page-data'
// CLUB_META は loader 経由で DB override を反映済みのものを result-page-data から受け取る
import { NOTABLE_ALUMNI, OVERSEAS_PLAYERS } from '@/lib/jlsp/club-players' // 静的 fallback
import { SIGHTSEEING_SPOTS } from '@/lib/jlsp/sightseeing-spots'
import { getWikiThumbnails } from '@/lib/jlsp/wiki-image'
import { getClubExtra } from '@/lib/jlsp/club-extra'
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
// 国名(日本語) → flagcdn の国コード。海外組の国旗画像用。
const COUNTRY_FLAG = {
  'ドイツ': 'de', 'オランダ': 'nl', 'スイス': 'ch', 'ベルギー': 'be', 'フランス': 'fr',
  'スペイン': 'es', 'イタリア': 'it', 'ポルトガル': 'pt', 'オーストリア': 'at',
  'クロアチア': 'hr', 'デンマーク': 'dk', 'ノルウェー': 'no', 'スウェーデン': 'se',
  'ポーランド': 'pl', 'トルコ': 'tr', 'ギリシャ': 'gr', 'チェコ': 'cz', 'ハンガリー': 'hu',
  'イングランド': 'gb-eng', 'スコットランド': 'gb-sct', 'ウェールズ': 'gb-wls',
  'アメリカ': 'us', 'アメリカ合衆国': 'us', 'メキシコ': 'mx', 'ブラジル': 'br',
  'オーストラリア': 'au', 'タイ': 'th', '韓国': 'kr', '大韓民国': 'kr',
  'カタール': 'qa', 'サウジアラビア': 'sa', 'アラブ首長国連邦': 'ae', 'UAE': 'ae',
}
function flagUrl(country) {
  const c = COUNTRY_FLAG[country]
  return c ? `https://cdn.jsdelivr.net/gh/HatScripts/circle-flags/flags/${c}.svg` : null
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
  const extra = getClubExtra(top1.club.id)
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
  // スタジアム名: admin override > jleakstats 同期名
  const stadiumName = clubMeta.stadium ?? detail?.stadium?.home_stadium_name
  // 地図クエリ: スタジアム名を override した場合は名前で検索(移転・改称に追従)、
  // override が無ければ同期座標を使用。
  const stadiumOverridden = clubMeta.stadium != null && clubMeta.stadium !== ''
  const mapQuery = stadiumOverridden
    ? encodeURIComponent(stadiumName)
    : lat != null && lng != null
      ? `${lat},${lng}`
      : null
  const mapsUrl = mapQuery ? `https://www.google.com/maps?q=${mapQuery}` : null
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

        {/* LEFT COLUMN — 相性 / 公式 / 成績 / 次節 */}
        <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-10 self-start space-y-8 order-2 lg:order-1">
          {/* 公式リンク */}
          {hasOfficial && (
            <div className="dsRB-fade space-y-2" style={{ '--d': '0.12s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">OFFICIAL</p>
              {clubMeta.official.hp && <OfficialRow href={clubMeta.official.hp} label="公式 HP" clubColor={clubColor} />}
              {clubMeta.official.x && <OfficialRow href={clubMeta.official.x} label="X (Twitter)" clubColor={clubColor} />}
              {clubMeta.official.instagram && <OfficialRow href={clubMeta.official.instagram} label="Instagram" clubColor={clubColor} />}
            </div>
          )}
          {/* 直近の成績 (タイムライン・中空リング) */}
          {extra.recentResults?.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-5" style={{ '--d': '0.2s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">RECENT</p>
              <ol className="relative pl-[18px]">
                <span className="absolute left-1 top-1.5 bottom-1.5 w-px bg-black/10" aria-hidden />
                {extra.recentResults.map((r) => (
                  <li key={`${r.year}-${r.comp}`} className="relative pb-[18px] last:pb-0">
                    <span
                      className="absolute -left-[18px] top-0.5 w-[9px] h-[9px] rounded-full box-border"
                      style={{ backgroundColor: '#fafaf7', border: `2px solid ${clubColor}` }}
                      aria-hidden
                    />
                    <p className="text-[11px] font-mono text-zinc-900 tabular-nums leading-none tracking-wide">{r.year}/{r.comp}</p>
                    <p className="text-[15px] font-bold text-zinc-900 mt-1 leading-none">{r.place}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {/* 開幕の予定 (DB優先・無ければ手入力) */}
          <NextMatches
            dbMatches={detail?.upcomingMatches}
            manual={extra.upcomingManual}
            teamId={teamId}
            clubColor={clubColor}
            ticketUrl={clubMeta.ticketUrl}
          />
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
          {stadiumName && (
            <section className="dsRB-fade" style={{ '--d': '0.2s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">STADIUM</p>
              <div className="border-t border-black/10 pt-6 space-y-4">
                <p className="text-xl sm:text-2xl font-black">{stadiumName}</p>
                {mapQuery && (
                  <div className="rounded-lg overflow-hidden border border-black/10 bg-zinc-100">
                    <iframe
                      title={`${stadiumName} 地図`}
                      src={`https://maps.google.com/maps?q=${mapQuery}&z=15&output=embed`}
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
                      href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}&travelmode=transit`}
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

          {/* EXPLORE */}
          {sightseeingCards.length > 0 && (
            <section className="dsRB-fade" style={{ '--d': '0.28s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-4">EXPLORE</p>
              <p className="text-xs sm:text-sm text-zinc-600 mb-4 leading-relaxed">
                {detail?.stadium?.home_stadium_name ?? top1.club.prefecture} 観戦のついでに。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sightseeingCards.map(({ title, image }) => {
                  const shown = displayTitle(title)
                  return (
                    <a
                      key={title}
                      href={`https://www.jalan.net/kankou/?keyword=${encodeURIComponent(shown)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative block aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100"
                    >
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={image}
                          alt={shown}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{ background: `linear-gradient(135deg, ${clubColor}55, ${clubColor}aa)` }}
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0) 55%)' }}
                      />
                      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-3.5 text-white">
                        <p className="text-[9px] font-mono tracking-[0.15em] opacity-85 mb-1">
                          {top1.club.prefecture}
                        </p>
                        <p className="text-sm sm:text-base font-bold leading-tight flex items-end justify-between gap-1.5">
                          <span className="line-clamp-2">{shown}</span>
                          <span className="opacity-80 group-hover:translate-x-0.5 transition-transform shrink-0">→</span>
                        </p>
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

        {/* RIGHT COLUMN — 人 (OB / 海外組 / マスコット) */}
        <aside className="lg:col-span-3 lg:sticky lg:top-10 self-start space-y-8 sm:space-y-10 order-3">
          {/* 現在所属の有名選手 (admin手入力) */}
          {clubMeta.currentPlayers?.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-5" style={{ '--d': '0.28s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">現在の有名選手</p>
              <ul className="space-y-2">
                {clubMeta.currentPlayers.map((name) => (
                  <li key={name} className="text-sm font-bold leading-tight">{name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 現在 海外でプレー中の OB */}
          {overseas.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-5" style={{ '--d': '0.32s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">
                現在 海外でプレー中
              </p>
              <ul className="space-y-2.5">
                {overseas.map((p) => {
                  const flag = flagUrl(p.country)
                  return (
                    <li key={p.name} className="flex items-center gap-1.5 leading-tight whitespace-nowrap">
                      <span className="text-sm font-bold shrink-0">{p.name}</span>
                      <span className="text-[11px] font-mono text-zinc-500 truncate min-w-0">{p.club}</span>
                      {flag ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={flag} alt={p.country} loading="lazy" className="w-4 h-4 shrink-0 rounded-full" />
                      ) : (
                        p.country && <span className="text-[10px] font-mono text-zinc-400 shrink-0">{p.country}</span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* 有名OB (スタッツ無し) */}
          {alumni.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-5" style={{ '--d': '0.36s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">有名OB</p>
              <ul className="space-y-2">
                {alumni.map((name) => (
                  <li key={name} className="text-sm font-bold leading-tight">{name}</li>
                ))}
              </ul>
            </div>
          )}

          {/* マスコット (admin手入力・複数可・名前のみ) */}
          {clubMeta.mascots?.length > 0 && (
            <div className="dsRB-fade border-t border-black/10 pt-5" style={{ '--d': '0.4s' }}>
              <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-3">マスコット</p>
              <ul className="space-y-2">
                {clubMeta.mascots.map((name) => (
                  <li key={name} className="text-sm font-bold leading-tight">{name}</li>
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
/** 開幕戦などの予定。DB の upcomingMatches を優先、無ければ手入力 manual を表示。 */
function NextMatches({ dbMatches, manual, teamId, clubColor, ticketUrl }) {
  const hasDb = dbMatches?.length > 0
  const hasManual = manual?.length > 0
  if (!hasDb && !hasManual) return null
  const cards = hasDb
    ? dbMatches.slice(0, 5).map((m) => ({
        key: m.id,
        isHome: m.home_team_id === teamId,
        t: fmtMatchDate(m.date),
        opponent: m.home_team_id === teamId ? m.away_name : m.home_name,
        venue: m.venue_name_ja,
      }))
    : manual.slice(0, 5).map((m, i) => ({
        key: i,
        isHome: m.home,
        t: fmtMatchDate(m.date),
        opponent: m.opponent,
        venue: m.venue,
      }))
  return (
    <div className="dsRB-fade border-t border-black/10 pt-5 space-y-3" style={{ '--d': '0.28s' }}>
      <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500">NEXT MATCH</p>
      <div>
        {cards.map((c) => (
          <div key={c.key} className="border-t border-black/5 pt-3 mt-3 first:border-t-0 first:pt-0 first:mt-0">
            <MatchCard isHome={c.isHome} t={c.t} opponent={c.opponent} venue={c.venue} clubColor={clubColor} />
          </div>
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

/** 次節 1試合 (対戦チップ型: HOME/AWAY をピルで表示)。 */
function MatchCard({ isHome, t, opponent, venue, clubColor }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="text-[13px] font-mono font-bold tabular-nums">{t.month}/{t.day}</span>
        <span className="text-[10px] text-zinc-400">({t.dow})</span>
        <span
          className="ml-auto text-[9px] font-bold rounded-full px-2.5 py-0.5 tracking-wider"
          style={isHome ? { color: '#fff', backgroundColor: clubColor } : { color: '#52525b', backgroundColor: '#e4e4e0' }}
        >
          {isHome ? 'HOME' : 'AWAY'}
        </span>
      </div>
      <p className="text-[15px] font-bold leading-tight truncate">vs {opponent}</p>
      {venue && <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{venue}</p>}
    </div>
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
