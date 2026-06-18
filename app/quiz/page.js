'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { QUESTIONS } from '@/lib/jlsp/questions'
import { encodeAnswers, matchClubs } from '@/lib/jlsp/diagnose'

const QUESTIONS_PER_PAGE = 8

const STEPS = [
  { value: -3, label: '強く反対' },
  { value: -2, label: '反対' },
  { value: -1, label: 'やや反対' },
  { value:  0, label: 'どちらでもない' },
  { value: +1, label: 'やや賛成' },
  { value: +2, label: '賛成' },
  { value: +3, label: '強く賛成' },
]

const CENTER_INDEX = 3

// 反対側=オレンジ、中央=グレー、賛成側=緑
const STEP_COLORS = ['#f97316', '#fb923c', '#fdba74', '#9ca3af', '#86efac', '#4ade80', '#22c55e']
const STEP_BORDER_COLORS = [
  'rgba(249, 115, 22, 0.45)',
  'rgba(249, 115, 22, 0.45)',
  'rgba(249, 115, 22, 0.45)',
  'rgba(156, 163, 175, 0.6)',
  'rgba(34, 197, 94, 0.45)',
  'rgba(34, 197, 94, 0.45)',
  'rgba(34, 197, 94, 0.45)',
]

const STEP_SIZE = [
  'w-10 h-10 sm:w-12 sm:h-12',
  'w-8 h-8 sm:w-10 sm:h-10',
  'w-7 h-7 sm:w-8 sm:h-8',
  'w-6 h-6 sm:w-7 sm:h-7',
  'w-7 h-7 sm:w-8 sm:h-8',
  'w-8 h-8 sm:w-10 sm:h-10',
  'w-10 h-10 sm:w-12 sm:h-12',
]

function LikertRow({ qLabel, question, selected, onSelect }) {
  return (
    <div className="pt-10 sm:pt-14 border-t border-[var(--border)] first:pt-0 first:border-t-0">
      <p className="text-[10px] sm:text-xs font-mono tracking-[0.2em] text-[var(--muted)] mb-3">
        {qLabel}
      </p>
      <p className="text-base sm:text-xl font-bold leading-[1.65] text-[var(--foreground)] mb-7 sm:mb-9">
        {question.statement}
      </p>
      <div className="flex items-center gap-3 select-none max-w-md pb-10 sm:pb-14">
        <span className="text-[10px] sm:text-xs font-mono tracking-[0.15em] text-[var(--muted)] shrink-0 w-10 text-right">反対</span>
        <div className="flex items-center flex-1 justify-between" style={{ gap: '12px' }}>
          {STEPS.map((s, i) => {
            const selectedIdx = selected !== undefined ? STEPS.findIndex((x) => x.value === selected) : -1
            let isFilled = false
            if (selectedIdx !== -1) {
              if (selectedIdx <= CENTER_INDEX && i >= selectedIdx && i <= CENTER_INDEX) isFilled = true
              if (selectedIdx >= CENTER_INDEX && i <= selectedIdx && i >= CENTER_INDEX) isFilled = true
            }
            const isExact = selected === s.value
            const color = STEP_COLORS[i]
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => onSelect(s.value)}
                aria-label={s.label}
                title={s.label}
                aria-pressed={isExact}
                style={{
                  backgroundColor: isFilled ? color : 'transparent',
                  border: `2px solid ${isFilled ? color : STEP_BORDER_COLORS[i]}`,
                  WebkitTapHighlightColor: 'transparent',
                }}
                className={`${STEP_SIZE[i]} rounded-full transition-all duration-150 hover:scale-110 cursor-pointer focus:outline-none focus-visible:outline-none active:outline-none`}
              />
            )
          })}
        </div>
        <span className="text-[10px] sm:text-xs font-mono tracking-[0.15em] text-[var(--muted)] shrink-0 w-10 text-left">賛成</span>
      </div>
    </div>
  )
}

// カテゴリが固まらないよう、各カテゴリを全体に均等配置して並べ替える。
// 各質問の位置キー = (カテゴリ内連番 + 0.5) / カテゴリ件数。これで件数の多い
// カテゴリ(keiei 等)も末尾に固まらず、似た質問が隣り合いにくくなる。
function interleaveByCategory(questions) {
  const groups = new Map()
  for (const q of questions) {
    if (!groups.has(q.category)) groups.set(q.category, [])
    groups.get(q.category).push(q)
  }
  const keyed = []
  for (const [cat, list] of groups) {
    list.forEach((q, i) => {
      keyed.push({ q, cat, sortKey: (i + 0.5) / list.length })
    })
  }
  keyed.sort((a, b) => a.sortKey - b.sortKey || a.cat.localeCompare(b.cat))
  return keyed.map((k) => k.q)
}

export default function QuizPage() {
  const router = useRouter()
  const pages = useMemo(() => {
    const ordered = interleaveByCategory(QUESTIONS)
    const out = []
    for (let i = 0; i < ordered.length; i += QUESTIONS_PER_PAGE) {
      out.push(ordered.slice(i, i + QUESTIONS_PER_PAGE))
    }
    return out
  }, [])
  const totalPages = pages.length

  const [pageIndex, setPageIndex] = useState(0)
  const [answers, setAnswers] = useState(new Map())
  const topRef = useRef(null)

  const currentPage = pages[pageIndex]
  const answeredOnPage = currentPage.every((q) => answers.has(q.id))
  const isLastPage = pageIndex === totalPages - 1
  const startQ = pageIndex * QUESTIONS_PER_PAGE + 1
  const progress = Math.round((answers.size / QUESTIONS.length) * 100)
  const isWarmup = currentPage[0]?.id.startsWith('w')
  const roundLabel = isWarmup ? 'WARM-UP' : 'SOCCER'

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [pageIndex])

  function setAnswer(qid, step) {
    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(qid, step)
      return next
    })
  }

  function goNext() {
    if (!answeredOnPage) return
    if (isLastPage) {
      const payload = QUESTIONS.map((q) => ({
        questionId: q.id,
        step: answers.get(q.id) ?? 0,
      }))
      const top = matchClubs(payload, 1)[0]
      const a = encodeAnswers(payload)
      router.push(`/result/${top.club.id}?a=${a}`)
    } else {
      setPageIndex(pageIndex + 1)
    }
  }

  function goBack() {
    if (pageIndex > 0) setPageIndex(pageIndex - 1)
  }

  return (
    <div className="min-h-screen flex flex-col w-full">
      <div ref={topRef} />

      <header className="border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto w-full px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-mono text-xs sm:text-sm tracking-[0.3em] font-black hover:opacity-60 transition-opacity"
          >
            JLSP
          </Link>
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.18em] text-[var(--muted)]">
            {String(pageIndex + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>
        </div>
        <div className="max-w-3xl mx-auto w-full px-6">
          <div className="h-px bg-[var(--border)] relative -mb-px">
            <div
              className="absolute top-0 left-0 transition-all duration-500"
              style={{ width: `${progress}%`, height: 2, backgroundColor: '#c7384d' }}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10 sm:py-14">
        <p className="text-[10px] sm:text-xs font-mono tracking-[0.3em] text-[var(--muted)] mb-10 sm:mb-14">
          ROUND {String(pageIndex + 1).padStart(2, '0')} <span className="mx-2 opacity-50">—</span> {roundLabel}
        </p>

        <div>
          {currentPage.map((q, i) => (
            <LikertRow
              key={q.id}
              qLabel={`Q${String(startQ + i).padStart(2, '0')} / ${String(QUESTIONS.length).padStart(2, '0')}`}
              question={q}
              selected={answers.get(q.id)}
              onSelect={(step) => setAnswer(q.id, step)}
            />
          ))}
        </div>

        <div className="mt-6 sm:mt-8 pt-8 sm:pt-10 border-t border-[var(--border)] flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={goBack}
            disabled={pageIndex === 0}
            className="font-mono text-xs sm:text-sm tracking-[0.15em] text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← 戻る
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!answeredOnPage}
            className="cta-button cta-button-sm"
          >
            {isLastPage ? '結果を見る' : '次へ'}
          </button>
        </div>

        {!answeredOnPage && (
          <p className="mt-4 text-right text-[10px] sm:text-xs font-mono text-[var(--muted)]">
            このページの {currentPage.length} 問すべてに回答してください
          </p>
        )}
      </main>
    </div>
  )
}
