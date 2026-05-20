import Link from 'next/link'
import { notFound } from 'next/navigation'
import { decodeAnswers, matchClubs } from '@/lib/jlsp/diagnose'
import { loadJlspState } from '@/lib/jlsp/loader'
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

  const top3 = matchClubs(answers, 3, state.clubs)
  const all = matchClubs(answers, state.clubs.length, state.clubs)
  const worst = all[all.length - 1]

  const top1 = top3[0]
  const detailItems = [
    top1.club.stadiumGourmet && { label: 'スタグル', value: top1.club.stadiumGourmet },
    top1.club.sightseeing && { label: '周辺観光', value: top1.club.sightseeing },
    top1.club.mascot && { label: 'マスコット', value: top1.club.mascot },
  ].filter(Boolean)

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
        {/* TOP 1 ヒーロー */}
        <section>
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[var(--muted)] mb-6">
            #01 <span className="mx-2 opacity-50">—</span> YOUR CLUB
          </p>
          <div className="flex items-stretch gap-4 sm:gap-5 mb-6">
            <span
              className="w-1.5 sm:w-2 rounded-full shrink-0"
              style={{ backgroundColor: top1.club.color }}
              aria-hidden="true"
            />
            <h1 className="text-4xl sm:text-6xl font-black leading-[1.05] tracking-tight">
              {top1.club.name}
            </h1>
          </div>
          <div className="flex items-baseline gap-3 mb-7">
            <span
              className="text-4xl sm:text-6xl font-black tabular-nums"
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

        {/* 詳細グリッド */}
        {detailItems.length > 0 && (
          <section className="mt-10 sm:mt-14">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {detailItems.map((d) => (
                <DetailCard key={d.label} label={d.label} value={d.value} />
              ))}
            </div>
          </section>
        )}

        {/* シェア */}
        <section className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-[var(--border)]">
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[var(--muted)] mb-5">
            SHARE
          </p>
          <ShareButtons clubName={top1.club.name} clubId={top1.club.id} />
        </section>

        {/* TOP2 / TOP3 */}
        <section className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-[var(--border)]">
          <p className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[var(--muted)] mb-5">
            NEXT BEST
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {top3.slice(1).map((m, i) => (
              <RankCard key={m.club.id} rank={i + 2} match={m} />
            ))}
          </div>
        </section>

        {/* おまけ: 最下位 */}
        <section className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-[var(--border)]">
          <details className="group">
            <summary className="cursor-pointer text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors list-none flex items-center gap-2">
              <span className="inline-block transition-transform group-open:rotate-90">▸</span>
              おまけ: 最も合わなさそうなクラブを見る
            </summary>
            <div className="mt-5 flex items-center gap-3">
              <span
                className="w-3 h-3 rounded-full inline-block shrink-0"
                style={{ backgroundColor: worst.club.color }}
              />
              <span className="font-bold text-base sm:text-lg">{worst.club.name}</span>
              <span className="text-sm font-mono tracking-wider text-[var(--muted)] tabular-nums">
                {pct(worst.score)}%
              </span>
            </div>
          </details>
        </section>

        {/* CTA: 再診断 */}
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

function Chip({ label }) {
  return (
    <span className="px-3 py-1 text-[10px] sm:text-xs font-mono tracking-[0.15em] text-[var(--muted)] rounded-full border border-[var(--border)]">
      {label}
    </span>
  )
}

function DetailCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
      <p className="text-[10px] font-mono tracking-[0.2em] text-[var(--muted)] mb-1">{label}</p>
      <p className="text-sm font-bold leading-snug">{value}</p>
    </div>
  )
}

function RankCard({ rank, match }) {
  return (
    <div className="relative rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-5 flex flex-col gap-2 overflow-hidden">
      <span
        className="absolute top-0 left-0 w-1.5 h-full"
        style={{ backgroundColor: match.club.color }}
        aria-hidden="true"
      />
      <div className="pl-3 flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-mono tracking-[0.2em] text-[var(--muted)]">#0{rank}</span>
        <span className="text-2xl font-black tabular-nums" style={{ color: match.club.color }}>
          {Math.round(match.score * 100)}%
        </span>
      </div>
      <h3 className="pl-3 text-lg sm:text-xl font-bold leading-tight">{match.club.name}</h3>
      <p className="pl-3 text-xs font-mono tracking-wider text-[var(--muted)]">
        {match.club.division} · {match.club.prefecture}
      </p>
    </div>
  )
}
