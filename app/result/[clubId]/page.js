import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CLUBS } from '@/lib/jlsp/clubs'
import { decodeAnswers, matchClubs } from '@/lib/jlsp/diagnose'
import ShareButtons from './ShareButtons'

export const dynamic = 'force-dynamic'

function pct(score) {
  return Math.round(score * 100)
}

export async function generateMetadata({ params }) {
  const { clubId } = await params
  const club = CLUBS.find((c) => c.id === clubId)
  if (!club) return { title: '結果が見つかりません — JLSP' }
  return {
    title: `あなたの推しクラブは「${club.name}」 — JLSP`,
    description: `${club.description}`,
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

  const featuredClub = CLUBS.find((c) => c.id === clubId)
  if (!featuredClub) notFound()
  if (!a) notFound()

  const answers = decodeAnswers(a)
  if (!answers) notFound()

  const top3 = matchClubs(answers, 3)
  // top3[0] should be featuredClub; if URL was tampered, we still display the actual top1.
  const realTop1 = top3[0]
  const top1 = realTop1
  const top2 = top3[1]
  const top3rd = top3[2]

  // 全 40 クラブ中の相性下位 1 件 (おまけ表示用)
  const allMatches = matchClubs(answers, 40)
  const worst = allMatches[allMatches.length - 1]

  return (
    <div className="w-full">
      {/* TOP1 ヒーロー */}
      <section
        className="relative w-full overflow-hidden"
        style={{ backgroundColor: top1.club.color }}
      >
        <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16 text-white">
          <p className="text-xs sm:text-sm font-mono tracking-[0.3em] opacity-80 mb-3">
            YOUR CLUB · #1
          </p>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            {top1.club.name}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-black tabular-nums">{pct(top1.score)}</span>
            <span className="text-lg sm:text-xl font-bold opacity-90">% match</span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-xs sm:text-sm opacity-90">
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              {top1.club.division}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              {top1.club.region}・{top1.club.prefecture}
            </span>
          </div>
        </div>
      </section>

      {/* TOP1 詳細 */}
      <section className="max-w-3xl mx-auto px-6 py-10 sm:py-12">
        <p className="text-base sm:text-lg leading-relaxed text-[var(--foreground)] mb-8">
          {top1.club.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {top1.club.stadiumGourmet && (
            <DetailCard label="スタグル" value={top1.club.stadiumGourmet} />
          )}
          {top1.club.sightseeing && (
            <DetailCard label="周辺観光" value={top1.club.sightseeing} />
          )}
          {top1.club.mascot && (
            <DetailCard label="マスコット" value={top1.club.mascot} />
          )}
        </div>

        <div className="mt-10">
          <ShareButtons clubName={top1.club.name} clubId={top1.club.id} />
        </div>
      </section>

      {/* TOP2 / TOP3 */}
      <section className="max-w-3xl mx-auto px-6 pb-10">
        <h2 className="text-sm font-mono tracking-[0.2em] text-[var(--muted)] mb-4">
          NEXT BEST
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[top2, top3rd].map((m, i) => (
            <RankCard key={m.club.id} rank={i + 2} match={m} />
          ))}
        </div>
      </section>

      {/* おまけ: 最下位 */}
      <section className="max-w-3xl mx-auto px-6 pb-12">
        <details className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
          <summary className="cursor-pointer text-sm font-bold text-[var(--muted)]">
            おまけ: あなたと最も相性が合わなさそうなクラブ →
          </summary>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: worst.club.color }}
            />
            <span className="font-bold">{worst.club.name}</span>
            <span className="text-sm text-[var(--muted)] tabular-nums">{pct(worst.score)}% match</span>
          </div>
        </details>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-16 text-center">
        <Link
          href="/quiz"
          className="inline-flex items-center justify-center rounded-full border-2 border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] font-bold px-8 py-3 transition-colors"
        >
          もう一度診断する
        </Link>
        <p className="mt-10 text-[10px] text-[var(--muted)] leading-relaxed">
          本サービスは非公式の診断コンテンツです。<br />
          J リーグ、各クラブ、関連団体とは一切関係ありません。
        </p>
      </section>
    </div>
  )
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <p className="text-[10px] font-mono tracking-[0.15em] text-[var(--muted)] mb-1">{label}</p>
      <p className="text-sm font-bold leading-snug">{value}</p>
    </div>
  )
}

function RankCard({ rank, match }) {
  return (
    <div
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6 flex flex-col gap-2 relative overflow-hidden"
    >
      <span
        className="absolute top-0 left-0 w-1.5 h-full"
        style={{ backgroundColor: match.club.color }}
      />
      <div className="flex items-baseline justify-between gap-2 pl-3">
        <span className="text-xs font-mono tracking-[0.2em] text-[var(--muted)]">#{rank}</span>
        <span className="text-xl font-black tabular-nums" style={{ color: match.club.color }}>
          {pct(match.score)}%
        </span>
      </div>
      <h3 className="pl-3 text-lg sm:text-xl font-bold leading-tight">{match.club.name}</h3>
      <p className="pl-3 text-xs text-[var(--muted)]">
        {match.club.division}・{match.club.prefecture}
      </p>
    </div>
  )
}
