'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'

const VALUE_RANGE = [-3, -2, -1, 0, 1, 2, 3]

/**
 * 質問選択 (左 / モバイルは上) + 選択した質問のクラブ別編集 (右 / モバイルは下)。
 *
 * 各セル: -3..+3 ボタン群。base 値と同じなら gray、上書き中は緑強調。
 * 個別セル保存ではなく行 (= クラブ単位) を編集して「保存」ボタンで upsert。
 */
export default function QuestionOverridesClient({
  questions,
  clubs,
  axes,
  overrides,
  baseExpectations,
}) {
  const [selectedId, setSelectedId] = useState(questions[0]?.id ?? null)
  const [filter, setFilter] = useState('all') // 'all' | axis_id

  const filteredQs = useMemo(
    () => (filter === 'all' ? questions : questions.filter((q) => q.axis === filter)),
    [questions, filter],
  )

  // 質問ごとの override 集計 (左サイドバーで「いくつ touched か」表示用)
  const overrideCountByQ = useMemo(() => {
    const m = {}
    for (const key of Object.keys(overrides)) {
      const qid = key.split('|')[1]
      m[qid] = (m[qid] ?? 0) + 1
    }
    return m
  }, [overrides])

  const selectedQ = questions.find((q) => q.id === selectedId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
      {/* 質問リスト */}
      <aside className="lg:max-h-[80vh] lg:overflow-y-auto lg:sticky lg:top-4 lg:pr-2">
        <div className="flex gap-1 mb-3 flex-wrap">
          <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>
            全て {questions.length}
          </FilterPill>
          {axes.map((a) => (
            <FilterPill
              key={a.id}
              active={filter === a.id}
              onClick={() => setFilter(a.id)}
            >
              {a.label}
            </FilterPill>
          ))}
        </div>
        <ul className="space-y-1">
          {filteredQs.map((q, i) => {
            const overrides_n = overrideCountByQ[q.id] ?? 0
            const isActive = q.id === selectedId
            return (
              <li key={q.id}>
                <button
                  onClick={() => setSelectedId(q.id)}
                  className={`w-full text-left p-2 rounded text-xs leading-snug transition-colors ${
                    isActive
                      ? 'bg-emerald-700 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[10px] opacity-70 shrink-0">
                      {q.id}
                    </span>
                    <span
                      className={`font-mono text-[9px] tabular-nums shrink-0 ${
                        overrides_n > 0 ? 'text-emerald-400' : 'opacity-50'
                      }`}
                    >
                      {overrides_n > 0 ? `${overrides_n}/20` : '—'}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-3">{q.text}</p>
                  <p className="text-[9px] mt-1 opacity-60 font-mono">
                    {q.axisLabel} · dir={q.direction > 0 ? '+1' : '-1'}
                  </p>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>

      {/* 選択質問のクラブ別エディタ */}
      <main>
        {selectedQ && (
          <QuestionEditor
            question={selectedQ}
            clubs={clubs}
            initialOverrides={overrides}
            baseExpectations={baseExpectations}
          />
        )}
      </main>
    </div>
  )
}

function QuestionEditor({ question, clubs, initialOverrides, baseExpectations }) {
  return (
    <div>
      <div className="border-b border-zinc-800 pb-4 mb-4">
        <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-500 mb-1">
          {question.id} · {question.axisLabel} · dir={question.direction > 0 ? '+1' : '-1'}
        </p>
        <h2 className="text-lg font-bold leading-snug mb-2">{question.text}</h2>
        <p className="text-[11px] text-zinc-500">
          step = <span className="text-zinc-300">{question.positiveLabel?.letter}</span>{' '}
          {question.positiveLabel?.name} 寄り (+) /{' '}
          <span className="text-zinc-300">{question.negativeLabel?.letter}</span>{' '}
          {question.negativeLabel?.name} 寄り (-) で答える質問。
          {question.direction < 0 && (
            <span className="text-amber-400 ml-2">
              ※ direction=-1 のため、step の符号が軸方向の符号と反転します
            </span>
          )}
        </p>
      </div>
      <div className="space-y-1.5">
        {clubs.map((c) => (
          <ClubRow
            key={c.id}
            club={c}
            question={question}
            initialValue={initialOverrides[`${c.id}|${question.id}`]}
            baseExpected={baseExpectations[`${c.id}|${question.id}`]}
          />
        ))}
      </div>
    </div>
  )
}

function ClubRow({ club, question, initialValue, baseExpected }) {
  const effectiveInitial = initialValue !== undefined ? initialValue : baseExpected
  const [value, setValue] = useState(effectiveInitial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [pending, startTransition] = useTransition()
  const [overridden, setOverridden] = useState(initialValue !== undefined)
  // 直近 save 済の値。これと value が異なる時だけ debounce 保存をかける
  const lastSavedRef = useRef(effectiveInitial)
  const lastSavedOverriddenRef = useRef(initialValue !== undefined)

  async function doSave(targetValue) {
    setError(null)
    try {
      const res = await fetch('/api/admin/question-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          club_id: club.id,
          question_id: question.id,
          value: targetValue,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const j = await res.json()
      lastSavedRef.current = targetValue
      lastSavedOverriddenRef.current = !j.deleted
      setOverridden(!j.deleted)
      setSaved(true)
      // 1.5 秒後に ✓ を消す
      setTimeout(() => setSaved(false), 1500)
    } catch (e) {
      setError(e.message ?? String(e))
    }
  }

  // value 変更を 500ms debounce で自動保存
  useEffect(() => {
    if (value === lastSavedRef.current) return
    const t = setTimeout(() => {
      startTransition(() => doSave(value))
    }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function clearToBase() {
    setValue(baseExpected)
  }

  return (
    <div className={`rounded-lg p-2.5 border ${overridden ? 'border-emerald-500/40' : 'border-zinc-800'} bg-zinc-900/40`}>
      <div className="flex items-center gap-3 mb-1.5">
        <span
          className="block w-1 h-5 rounded-full shrink-0"
          style={{ background: club.color }}
        />
        <span className="text-sm font-bold flex-1 truncate">
          {club.short_name ?? club.name}
        </span>
        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
          base: {baseExpected > 0 ? `+${baseExpected}` : baseExpected}
        </span>
        {overridden && value === baseExpected ? null : overridden && (
          <button
            onClick={clearToBase}
            className="text-[9px] font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-700 hover:border-zinc-500 px-1.5 py-0.5 rounded"
          >
            base
          </button>
        )}
        {pending && <span className="text-zinc-500 text-[10px]">保存中…</span>}
        {saved && !pending && <span className="text-emerald-400 text-xs">✓ 自動保存</span>}
        {error && <span className="text-rose-400 text-[10px]">{error}</span>}
      </div>
      <div className="flex gap-0.5">
        {VALUE_RANGE.map((v) => {
          const active = v === value
          return (
            <button
              key={v}
              onClick={() => setValue(v)}
              className={`flex-1 px-1 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                active
                  ? 'bg-emerald-600 text-white'
                  : v === baseExpected
                  ? 'bg-zinc-700/60 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
              title={v === baseExpected ? `${v} (base)` : `${v}`}
            >
              {v > 0 ? `+${v}` : v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FilterPill({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-colors ${
        active
          ? 'bg-emerald-600 text-white'
          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
      }`}
    >
      {children}
    </button>
  )
}
