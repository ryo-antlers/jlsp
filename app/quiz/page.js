'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
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

// 反対側=オレンジ、中央=グレー、賛成側=緑 (ポップ感)
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

function LikertRow({ index, question, selected, onSelect }) {
  return (
    <div className="py-3 sm:py-4">
      <div className="flex items-baseline gap-3 mb-6 sm:mb-8">
        <span className="text-xs text-[var(--muted)] font-mono shrink-0">Q{index}</span>
        <p className="text-sm sm:text-base font-semibold leading-relaxed text-[var(--foreground)]">
          {question.statement}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 select-none">
        <span className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] shrink-0">反対</span>
        <div className="flex items-center flex-1 justify-between" style={{ gap: '14px' }}>
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
        <span className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] shrink-0">賛成</span>
      </div>
    </div>
  )
}

export default function QuizPage() {
  const router = useRouter()
  const pages = useMemo(() => {
    const out = []
    for (let i = 0; i < QUESTIONS.length; i += QUESTIONS_PER_PAGE) {
      out.push(QUESTIONS.slice(i, i + QUESTIONS_PER_PAGE))
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
  const endQ = startQ + currentPage.length - 1
  const progress = Math.round((answers.size / QUESTIONS.length) * 100)

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
    <div className="mx-auto max-w-2xl w-full px-5 sm:px-6 py-8">
      <div ref={topRef} />

      <div className="mb-6">
        <div className="flex justify-between text-xs text-[var(--muted)] mb-2">
          <span>Q{startQ}–{endQ} / {QUESTIONS.length}</span>
          <span>{pageIndex + 1} / {totalPages} ページ</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
          <div
            className="h-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
          />
        </div>
      </div>

      <div className="space-y-6 sm:space-y-7 bg-[var(--card)] rounded-2xl border border-[var(--border)] px-5 sm:px-7 py-6 sm:py-8 shadow-sm">
        {currentPage.map((q, i) => (
          <LikertRow
            key={q.id}
            index={startQ + i}
            question={q}
            selected={answers.get(q.id)}
            onSelect={(step) => setAnswer(q.id, step)}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          type="button"
          onClick={goBack}
          disabled={pageIndex === 0}
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ← 前のページ
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!answeredOnPage}
          style={
            answeredOnPage
              ? { backgroundColor: 'var(--accent)', color: '#fff' }
              : { backgroundColor: '#e5e5e5', color: '#a1a1aa' }
          }
          className="inline-flex items-center justify-center rounded-full font-bold px-7 py-3 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
        >
          {isLastPage ? '結果を見る →' : '次のページ →'}
        </button>
      </div>

      {!answeredOnPage && (
        <p className="mt-3 text-right text-xs text-[var(--muted)]">
          このページの {currentPage.length} 問すべてに回答してください
        </p>
      )}
    </div>
  )
}
