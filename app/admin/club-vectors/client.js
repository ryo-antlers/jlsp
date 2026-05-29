'use client'

import { useMemo, useState, useTransition } from 'react'

const VALUE_RANGE = [-3, -2, -1, 0, 1, 2, 3]

/**
 * 各クラブのベクトルを inline 編集する table。
 *
 * - 行: 1 クラブ
 * - 列: 4 軸 (shoubu/keiei/kansen/kanshin)
 * - 各セル: 値 -3..+3 のボタン群
 * - base (RAW_CLUBS) と一致しない場合は緑強調 ("override 中")
 * - 行が dirty (= 入力値が現状 effective と異なる) になると Save 表示
 */
export default function ClubVectorsClient({ clubs, axes }) {
  return (
    <div className="space-y-2">
      {clubs.map((c) => (
        <ClubRow key={c.id} club={c} axes={axes} />
      ))}
    </div>
  )
}

function ClubRow({ club, axes }) {
  // 編集中の vector (= 表示中の effective 値)
  const initial = useMemo(
    () => ({ ...club.baseVector, ...club.overrideVector }),
    [club],
  )
  const [vector, setVector] = useState(initial)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [pending, startTransition] = useTransition()

  const dirty = useMemo(
    () => axes.some((a) => vector[a.id] !== initial[a.id]),
    [vector, initial, axes],
  )
  const hasOverride = useMemo(
    () => axes.some((a) => vector[a.id] !== club.baseVector[a.id]),
    [vector, club.baseVector, axes],
  )

  function setAxis(axisId, v) {
    setVector({ ...vector, [axisId]: v })
    setSaved(false)
    setError(null)
  }

  function save() {
    startTransition(async () => {
      setSaved(false)
      setError(null)
      try {
        const res = await fetch('/api/admin/club-vectors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ club_id: club.id, vector }),
        })
        if (!res.ok) throw new Error(await res.text())
        setSaved(true)
      } catch (e) {
        setError(e.message ?? String(e))
      }
    })
  }

  function reset() {
    setVector({ ...club.baseVector })
    setSaved(false)
    setError(null)
  }

  return (
    <div
      className={`rounded-lg border ${
        hasOverride ? 'border-emerald-500/40' : 'border-zinc-800'
      } bg-zinc-900/50 p-3 sm:p-4`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className="block w-1 h-6 rounded-full shrink-0"
          style={{ background: club.color }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">
            {club.name}{' '}
            <span className="text-zinc-500 font-mono text-[10px] ml-1">
              {club.id} · {club.division}
            </span>
          </p>
        </div>
        {dirty && (
          <button
            onClick={save}
            disabled={pending}
            className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-xs font-bold transition-colors"
          >
            {pending ? '保存中…' : '保存'}
          </button>
        )}
        {hasOverride && !dirty && (
          <button
            onClick={reset}
            className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 border border-zinc-700 hover:border-zinc-500 px-2 py-1 rounded"
            title="この行の override をクリアして base に戻す"
          >
            base に戻す
          </button>
        )}
        {saved && (
          <span className="text-emerald-400 text-xs">✓</span>
        )}
        {error && (
          <span className="text-rose-400 text-xs">{error}</span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {axes.map((a) => (
          <AxisEditor
            key={a.id}
            axis={a}
            value={vector[a.id]}
            baseValue={club.baseVector[a.id]}
            onChange={(v) => setAxis(a.id, v)}
          />
        ))}
      </div>
    </div>
  )
}

function AxisEditor({ axis, value, baseValue, onChange }) {
  const isOverridden = value !== baseValue
  return (
    <div className="rounded bg-zinc-950 border border-zinc-800 p-2.5">
      <div className="flex items-baseline justify-between mb-1.5">
        <p className="text-[10px] font-mono tracking-[0.15em] text-zinc-400">
          {axis.label}{' '}
          <span className="text-zinc-600">
            ({axis.negative.letter}/{axis.positive.letter})
          </span>
        </p>
        <p
          className={`text-[10px] font-mono tabular-nums ${
            isOverridden ? 'text-emerald-400' : 'text-zinc-500'
          }`}
        >
          {value > 0 ? `+${value}` : value}
          {isOverridden && (
            <span className="opacity-60"> (base: {baseValue > 0 ? `+${baseValue}` : baseValue})</span>
          )}
        </p>
      </div>
      <div className="flex gap-0.5">
        {VALUE_RANGE.map((v) => {
          const active = v === value
          const isCenter = v === 0
          const polarity = v > 0 ? axis.positive.letter : v < 0 ? axis.negative.letter : '·'
          return (
            <button
              key={v}
              onClick={() => onChange(v)}
              className={`flex-1 px-1 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                active
                  ? 'bg-emerald-600 text-white'
                  : isCenter
                  ? 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
              title={`${v > 0 ? `+${v}` : v} (${polarity}${Math.abs(v)})`}
            >
              {v > 0 ? `+${v}` : v}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between text-[9px] font-mono text-zinc-600 mt-1">
        <span>{axis.negative.letter} {axis.negative.name}</span>
        <span>{axis.positive.letter} {axis.positive.name}</span>
      </div>
    </div>
  )
}
