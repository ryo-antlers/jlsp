'use client'

import { useState, useTransition } from 'react'

/**
 * クラブ列を accordion で並べ、開いた行で 5 項目を編集する admin。
 *   1. クラブ説明文 (YOUR CLUB)
 *   2. スタジアム名 (空欄で J-League 同期名を使用)
 *   3. マスコット一覧 (1 行 1 体・名前のみ)
 *   4. 観光スポット
 *   5. 主なOB選手
 *
 * 保存ボタンで POST /api/admin/club-meta → club_meta_overrides に upsert。
 */
export default function ClubMetaClient({ clubs }) {
  const [openId, setOpenId] = useState(null)
  return (
    <div className="space-y-2">
      {clubs.map((c) => (
        <ClubRow key={c.id} club={c} open={openId === c.id} onToggle={() => setOpenId(openId === c.id ? null : c.id)} />
      ))}
    </div>
  )
}

function ClubRow({ club, open, onToggle }) {
  const hasOverride = !!(
    club.overrideDescriptionLong ||
    club.overrideStadium ||
    (club.overrideCurrentPlayers && club.overrideCurrentPlayers.length) ||
    (club.overrideMascots && club.overrideMascots.length) ||
    (club.overrideSightseeing && club.overrideSightseeing.length) ||
    (club.overrideAlumni && club.overrideAlumni.length)
  )
  return (
    <div className={`rounded-lg border ${hasOverride ? 'border-emerald-500/30' : 'border-zinc-800'} bg-zinc-900/50 overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <span className="block w-1 h-7 rounded-full shrink-0" style={{ background: club.color }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">
            {club.name}
            <span className="text-zinc-500 font-mono text-[10px] ml-2">{club.id}</span>
          </p>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            {club.division} · {club.prefecture}
            {hasOverride && <span className="text-emerald-400 ml-2">● 編集済</span>}
          </p>
        </div>
        <span className={`text-zinc-500 transition-transform ${open ? 'rotate-90' : ''}`}>▸</span>
      </button>
      {open && <ClubEditor club={club} />}
    </div>
  )
}

function ClubEditor({ club }) {
  const [descriptionLong, setDescriptionLong] = useState(
    club.overrideDescriptionLong || club.staticDescriptionLong,
  )
  const [stadium, setStadium] = useState(club.overrideStadium ?? '')
  const [currentPlayersText, setCurrentPlayersText] = useState((club.overrideCurrentPlayers ?? []).join('\n'))
  const [mascotsText, setMascotsText] = useState((club.overrideMascots ?? []).join('\n'))
  const [sightseeingText, setSightseeingText] = useState(
    (club.overrideSightseeing ?? club.staticSightseeing ?? []).join('\n'),
  )
  const [alumniText, setAlumniText] = useState(
    (club.overrideAlumni ?? club.staticAlumni ?? []).join('\n'),
  )
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [pending, startTransition] = useTransition()

  function loadStaticDesc() { setDescriptionLong(club.staticDescriptionLong) }
  function loadWikiDesc() { if (club.clubWikiExtract) setDescriptionLong(club.clubWikiExtract) }
  function loadStaticSightseeing() { setSightseeingText((club.staticSightseeing ?? []).join('\n')) }
  function loadStaticAlumni() { setAlumniText((club.staticAlumni ?? []).join('\n')) }

  function linesToArr(text) {
    return text.split('\n').map((s) => s.trim()).filter(Boolean)
  }

  function clearAll() {
    if (!confirm('この行の override をすべてクリアして静的デフォルトに戻しますか？')) return
    startTransition(async () => {
      setSaved(false)
      setError(null)
      try {
        const res = await fetch('/api/admin/club-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ club_id: club.id }),
        })
        if (!res.ok) throw new Error(await res.text())
        setSaved(true)
        location.reload()
      } catch (e) {
        setError(e.message ?? String(e))
      }
    })
  }

  function save() {
    startTransition(async () => {
      setSaved(false)
      setError(null)
      try {
        const currentArr = linesToArr(currentPlayersText)
        const mascotsArr = linesToArr(mascotsText)
        const sightseeingArr = linesToArr(sightseeingText)
        const alumniArr = linesToArr(alumniText)
        const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b ?? [])

        const res = await fetch('/api/admin/club-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            club_id: club.id,
            // 静的デフォルトと一致する値は null で保存 (= override クリア扱い)
            description_long:
              descriptionLong && descriptionLong !== club.staticDescriptionLong ? descriptionLong : null,
            current_players: currentArr.length ? currentArr : null,
            mascots: mascotsArr.length ? mascotsArr : null,
            stadium: stadium.trim() || null,
            sightseeing: sightseeingArr.length && !eq(sightseeingArr, club.staticSightseeing) ? sightseeingArr : null,
            notable_alumni: alumniArr.length && !eq(alumniArr, club.staticAlumni) ? alumniArr : null,
          }),
        })
        if (!res.ok) throw new Error(await res.text())
        setSaved(true)
      } catch (e) {
        setError(e.message ?? String(e))
      }
    })
  }

  return (
    <div className="px-4 pb-4 space-y-5 border-t border-zinc-800">
      {/* CLUB DESCRIPTION */}
      <section>
        <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 mt-4 mb-2">
          クラブ説明文 (YOUR CLUB)
        </p>
        <SourcePanels
          static_={club.staticDescriptionLong}
          wiki={club.clubWikiExtract}
          wikiTitle={club.clubWikiTitle}
          wikiPageUrl={club.clubWikiPageUrl}
          onApplyStatic={loadStaticDesc}
          onApplyWiki={loadWikiDesc}
        />
        <textarea
          value={descriptionLong}
          onChange={(e) => setDescriptionLong(e.target.value)}
          className="w-full mt-2 rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 leading-relaxed resize-y min-h-[120px]"
          placeholder="JLSP 結果ページに表示する文章"
        />
        <CharCount text={descriptionLong} />
      </section>

      {/* STADIUM */}
      <section className="border-t border-zinc-800 pt-4">
        <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 mb-2">スタジアム名</p>
        <input
          type="text"
          value={stadium}
          onChange={(e) => setStadium(e.target.value)}
          className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm"
          placeholder="空欄で J-League 同期の名称を使用 (例: メルカリスタジアム)"
        />
      </section>

      {/* CURRENT PLAYERS */}
      <section className="border-t border-zinc-800 pt-4">
        <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 mb-2">
          現在所属の有名選手 (1 行 1 名、上から順に表示)
        </p>
        <textarea
          value={currentPlayersText}
          onChange={(e) => setCurrentPlayersText(e.target.value)}
          className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 leading-relaxed resize-y min-h-[100px]"
          placeholder={'鈴木優磨\n知念慶'}
        />
        <p className="text-[10px] text-zinc-500 mt-1">現在 {linesToArr(currentPlayersText).length} 名</p>
      </section>

      {/* MASCOTS */}
      <section className="border-t border-zinc-800 pt-4">
        <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 mb-2">
          マスコット一覧 (1 行 1 体・名前のみ)
        </p>
        <textarea
          value={mascotsText}
          onChange={(e) => setMascotsText(e.target.value)}
          className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 leading-relaxed resize-y min-h-[80px]"
          placeholder={'しかお\nシカコ'}
        />
        <p className="text-[10px] text-zinc-500 mt-1">
          現在 {linesToArr(mascotsText).length} 体
        </p>
      </section>

      {/* SIGHTSEEING */}
      <section className="border-t border-zinc-800 pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400">
            観光スポット (1 行 1 件、最大 3 件まで表示)
          </p>
          <SmallBtn onClick={loadStaticSightseeing}>静的に戻す ←</SmallBtn>
        </div>
        <p className="text-[10px] text-zinc-500 mb-1">
          Wikipedia 記事タイトルをそのまま入れると画像と説明が自動取得されます (例: 「香取神社」より「香取神宮」のほうがヒットしやすい)。
        </p>
        <textarea
          value={sightseeingText}
          onChange={(e) => setSightseeingText(e.target.value)}
          className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm font-mono text-zinc-100 leading-relaxed resize-y min-h-[90px]"
          placeholder={'鹿島神宮\n息栖神社\n大洗磯前神社'}
        />
        <p className="text-[10px] text-zinc-500 mt-1">
          現在 {linesToArr(sightseeingText).length} 件
          {linesToArr(sightseeingText).length > 3 && (
            <span className="text-amber-500 ml-2">⚠ 4 件目以降は表示されません</span>
          )}
        </p>
      </section>

      {/* NOTABLE ALUMNI */}
      <section className="border-t border-zinc-800 pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400">
            有名OB (1 行 1 名、上から順に表示)
          </p>
          <SmallBtn onClick={loadStaticAlumni}>静的に戻す ←</SmallBtn>
        </div>
        <textarea
          value={alumniText}
          onChange={(e) => setAlumniText(e.target.value)}
          className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 leading-relaxed resize-y min-h-[120px]"
          placeholder={'内田篤人\n大迫勇也\n柴崎岳'}
        />
        <p className="text-[10px] text-zinc-500 mt-1">
          現在 {linesToArr(alumniText).length} 名
        </p>
      </section>

      {/* ACTIONS */}
      <div className="flex items-center gap-3 pt-4 border-t border-zinc-800">
        <button
          onClick={save}
          disabled={pending}
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-sm font-bold transition-colors"
        >
          {pending ? '保存中…' : '保存'}
        </button>
        <button
          onClick={clearAll}
          disabled={pending}
          className="px-3 py-2 rounded border border-zinc-700 hover:border-zinc-500 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          title="DB から override 行を削除"
        >
          override 削除
        </button>
        {saved && <span className="text-emerald-400 text-xs">✓ 保存しました</span>}
        {error && <span className="text-rose-400 text-xs">エラー: {error}</span>}
        {club.overrideUpdatedAt && (
          <span className="ml-auto text-[10px] text-zinc-500">
            最終更新: {new Date(club.overrideUpdatedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}
          </span>
        )}
      </div>
    </div>
  )
}

function SourcePanels({ static_, wiki, wikiTitle, wikiPageUrl, onApplyStatic, onApplyWiki }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <SourcePanel label="STATIC (club-meta.js)" text={static_} onApply={onApplyStatic} applyLabel="↓ 適用" accent="zinc" />
      <SourcePanel
        label={`WIKI (${wikiTitle ?? '見つからず'})`}
        text={wiki}
        onApply={wiki ? onApplyWiki : null}
        applyLabel="↓ 適用"
        accent="sky"
        linkUrl={wikiPageUrl}
      />
    </div>
  )
}

function SourcePanel({ label, text, onApply, applyLabel, accent, linkUrl }) {
  const accentClass = accent === 'sky' ? 'text-sky-400' : 'text-zinc-400'
  return (
    <div className="rounded bg-zinc-900 border border-zinc-800 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <p className={`text-[10px] font-mono tracking-[0.15em] ${accentClass}`}>{label}</p>
        {onApply && (
          <button onClick={onApply} className="text-[10px] font-mono text-emerald-400 hover:text-emerald-200">
            {applyLabel}
          </button>
        )}
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap line-clamp-6">
        {text || <span className="text-zinc-600 italic">(なし)</span>}
      </p>
      {linkUrl && (
        <a href={linkUrl} target="_blank" rel="noreferrer" className="inline-block mt-1.5 text-[10px] text-sky-400 hover:underline">
          Wikipedia 記事を開く ↗
        </a>
      )}
    </div>
  )
}

function CharCount({ text }) {
  return (
    <p className="text-[10px] text-zinc-500 mt-1 text-right tabular-nums">{(text ?? '').length} 字</p>
  )
}

function SmallBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-700 hover:border-zinc-500 px-2 py-1 rounded"
    >
      {children}
    </button>
  )
}
