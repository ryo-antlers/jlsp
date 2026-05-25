'use client'

import { useState, useTransition } from 'react'

/**
 * クラブ列を accordion で並べ、開いた行で description / マスコット情報を編集。
 *
 * 各 textarea は 3 つのソースから初期化可能:
 *   1. STATIC: lib/jlsp/club-meta.js (AI 生成)
 *   2. WIKI  : Wikipedia の extract
 *   3. SAVED : DB の override (= ryo さんが過去に保存した値)
 *
 * 保存ボタンで POST /api/admin/club-meta → upsert
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
    club.overrideMascotName ||
    club.overrideMascotWikiTitle ||
    club.overrideMascotDescription
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
  const [mascotName, setMascotName] = useState(
    club.overrideMascotName || club.staticMascotName,
  )
  const [mascotWikiTitle, setMascotWikiTitle] = useState(
    club.overrideMascotWikiTitle || club.staticMascotWikiTitle,
  )
  const [mascotDescription, setMascotDescription] = useState(
    club.overrideMascotDescription || club.staticMascotDescription,
  )
  const [access, setAccess] = useState(
    club.overrideAccess ?? club.staticAccess ?? { station: '', walkMinutes: '', note: '' },
  )
  const [awayTravel, setAwayTravel] = useState(
    club.overrideAwayTravel ?? club.staticAwayTravel ?? { hours: '', yen: '', transport: '', note: '' },
  )
  const [sightseeingText, setSightseeingText] = useState(
    (club.overrideSightseeing ?? club.staticSightseeing ?? []).join('\n'),
  )
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)
  const [pending, startTransition] = useTransition()

  function loadStaticDesc() { setDescriptionLong(club.staticDescriptionLong) }
  function loadWikiDesc() { if (club.clubWikiExtract) setDescriptionLong(club.clubWikiExtract) }
  function loadStaticMascotDesc() { setMascotDescription(club.staticMascotDescription) }
  function loadWikiMascotDesc() { if (club.mascotWikiExtract) setMascotDescription(club.mascotWikiExtract) }
  function loadStaticMascotName() { setMascotName(club.staticMascotName) }
  function loadStaticMascotWikiTitle() { setMascotWikiTitle(club.staticMascotWikiTitle) }
  function loadStaticAccess() {
    setAccess(club.staticAccess ?? { station: '', walkMinutes: '', note: '' })
  }
  function loadStaticAwayTravel() {
    setAwayTravel(club.staticAwayTravel ?? { hours: '', yen: '', transport: '', note: '' })
  }
  function loadStaticSightseeing() {
    setSightseeingText((club.staticSightseeing ?? []).join('\n'))
  }

  function clearAll() {
    if (!confirm('この行の override をクリアして静的デフォルトに戻しますか？')) return
    startTransition(async () => {
      setSaved(false)
      setError(null)
      try {
        const res = await fetch('/api/admin/club-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            club_id: club.id,
            description_long: null,
            mascot_name: null,
            mascot_wiki_title: null,
            mascot_description: null,
          }),
        })
        if (!res.ok) throw new Error(await res.text())
        setSaved(true)
        location.reload() // override 行削除後の状態を再読込
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
        // 観光スポット: 改行区切り → 配列。空行は除外
        const sightseeingArr = sightseeingText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
        const sightseeingSameAsStatic =
          JSON.stringify(sightseeingArr) === JSON.stringify(club.staticSightseeing ?? [])

        const accessObj = normalizeAccess(access)
        const accessSameAsStatic =
          JSON.stringify(accessObj) === JSON.stringify(club.staticAccess ?? null)

        const awayObj = normalizeAwayTravel(awayTravel)
        const awaySameAsStatic =
          JSON.stringify(awayObj) === JSON.stringify(club.staticAwayTravel ?? null)

        const res = await fetch('/api/admin/club-meta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            club_id: club.id,
            // 静的デフォルトと一致する値は null で保存 (= override クリア扱い)
            description_long:
              descriptionLong && descriptionLong !== club.staticDescriptionLong
                ? descriptionLong
                : null,
            mascot_name:
              mascotName && mascotName !== club.staticMascotName ? mascotName : null,
            mascot_wiki_title:
              mascotWikiTitle && mascotWikiTitle !== club.staticMascotWikiTitle
                ? mascotWikiTitle
                : null,
            mascot_description:
              mascotDescription && mascotDescription !== club.staticMascotDescription
                ? mascotDescription
                : null,
            access: !accessObj || accessSameAsStatic ? null : accessObj,
            away_travel: !awayObj || awaySameAsStatic ? null : awayObj,
            sightseeing:
              sightseeingArr.length === 0 || sightseeingSameAsStatic
                ? null
                : sightseeingArr,
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
          クラブ説明文 (descriptionLong)
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

      {/* MASCOT */}
      <section className="border-t border-zinc-800 pt-4">
        <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 mb-2">
          マスコット
        </p>
        <div className="flex gap-4 items-start">
          {club.mascotWikiImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={club.mascotWikiImage}
              alt="mascot"
              className="w-20 h-20 object-cover object-top rounded ring-1 ring-zinc-700"
            />
          )}
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">名前</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={mascotName}
                  onChange={(e) => setMascotName(e.target.value)}
                  className="flex-1 rounded bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-sm"
                />
                <SmallBtn onClick={loadStaticMascotName}>静的 ←</SmallBtn>
              </div>
              {club.staticMascotName !== mascotName && (
                <p className="text-[10px] text-zinc-500 mt-1">
                  静的: <span className="text-zinc-400">{club.staticMascotName}</span>
                </p>
              )}
            </div>
            <div>
              <label className="text-[10px] text-zinc-500 mb-1 block">
                Wiki タイトル (検索キー)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={mascotWikiTitle}
                  onChange={(e) => setMascotWikiTitle(e.target.value)}
                  className="flex-1 rounded bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-sm font-mono"
                  placeholder="(空欄でマスコット名を検索キーに使用)"
                />
                <SmallBtn onClick={loadStaticMascotWikiTitle}>静的 ←</SmallBtn>
              </div>
              {club.mascotWikiTitle && (
                <p className="text-[10px] text-zinc-500 mt-1">
                  Wiki 検出: <span className="text-zinc-400">{club.mascotWikiTitle}</span>
                  {club.mascotWikiPageUrl && (
                    <>
                      {' '}
                      ·{' '}
                      <a
                        href={club.mascotWikiPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-zinc-300"
                      >
                        記事
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
        <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 mt-4 mb-2">
          マスコット説明文
        </p>
        <SourcePanels
          static_={club.staticMascotDescription}
          wiki={club.mascotWikiExtract}
          wikiTitle={club.mascotWikiTitle}
          wikiPageUrl={club.mascotWikiPageUrl}
          onApplyStatic={loadStaticMascotDesc}
          onApplyWiki={loadWikiMascotDesc}
        />
        <textarea
          value={mascotDescription}
          onChange={(e) => setMascotDescription(e.target.value)}
          className="w-full mt-2 rounded bg-zinc-950 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 leading-relaxed resize-y min-h-[80px]"
        />
        <CharCount text={mascotDescription} />
      </section>

      {/* STADIUM / ACCESS */}
      <section className="border-t border-zinc-800 pt-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400">
            スタジアム アクセス
          </p>
          <SmallBtn onClick={loadStaticAccess}>静的に戻す ←</SmallBtn>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="最寄駅">
            <input
              type="text"
              value={access.station ?? ''}
              onChange={(e) => setAccess({ ...access, station: e.target.value })}
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-sm"
              placeholder="鹿島サッカースタジアム駅"
            />
          </Field>
          <Field label="徒歩 (分)">
            <input
              type="number"
              value={access.walkMinutes ?? ''}
              onChange={(e) =>
                setAccess({ ...access, walkMinutes: e.target.value === '' ? '' : Number(e.target.value) })
              }
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-sm"
              placeholder="7"
            />
          </Field>
          <Field label="補足">
            <input
              type="text"
              value={access.note ?? ''}
              onChange={(e) => setAccess({ ...access, note: e.target.value })}
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-sm"
              placeholder="試合日のみ臨時開設駅"
            />
          </Field>
        </div>

        {/* AWAY TRAVEL */}
        <div className="flex items-center justify-between mt-5 mb-2">
          <p className="text-[10px] font-mono tracking-[0.2em] text-zinc-400">
            東京駅からのアクセス目安 (AWAY TRAVEL)
          </p>
          <SmallBtn onClick={loadStaticAwayTravel}>静的に戻す ←</SmallBtn>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="所要時間">
            <input
              type="text"
              value={awayTravel.hours ?? ''}
              onChange={(e) => setAwayTravel({ ...awayTravel, hours: e.target.value })}
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-sm"
              placeholder="約 2 時間"
            />
          </Field>
          <Field label="料金 (¥)">
            <input
              type="number"
              value={awayTravel.yen ?? ''}
              onChange={(e) =>
                setAwayTravel({ ...awayTravel, yen: e.target.value === '' ? '' : Number(e.target.value) })
              }
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-sm"
              placeholder="5500"
            />
          </Field>
          <Field label="交通手段" colSpan={2}>
            <input
              type="text"
              value={awayTravel.transport ?? ''}
              onChange={(e) => setAwayTravel({ ...awayTravel, transport: e.target.value })}
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-sm"
              placeholder="高速バス (東京駅八重洲口直通)"
            />
          </Field>
          <Field label="補足" colSpan={4}>
            <input
              type="text"
              value={awayTravel.note ?? ''}
              onChange={(e) => setAwayTravel({ ...awayTravel, note: e.target.value })}
              className="w-full rounded bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-sm"
              placeholder="電車だと鹿島臨海鉄道経由で乗継複雑、バス推奨"
            />
          </Field>
        </div>
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
          現在 {sightseeingText.split('\n').filter((s) => s.trim()).length} 件
          {sightseeingText.split('\n').filter((s) => s.trim()).length > 3 && (
            <span className="text-amber-500 ml-2">⚠ 4 件目以降は表示されません</span>
          )}
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
      <SourcePanel
        label="STATIC (club-meta.js)"
        text={static_}
        onApply={onApplyStatic}
        applyLabel="↓ 適用"
        accent="zinc"
      />
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
          <button
            onClick={onApply}
            className="text-[10px] font-mono text-emerald-400 hover:text-emerald-200"
          >
            {applyLabel}
          </button>
        )}
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap line-clamp-6">
        {text || <span className="text-zinc-600 italic">(なし)</span>}
      </p>
      {linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-1.5 text-[10px] text-sky-400 hover:underline"
        >
          Wikipedia 記事を開く ↗
        </a>
      )}
    </div>
  )
}

function CharCount({ text }) {
  return (
    <p className="text-[10px] text-zinc-500 mt-1 text-right tabular-nums">
      {(text ?? '').length} 字
    </p>
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

function Field({ label, children, colSpan = 1 }) {
  return (
    <div className={colSpan === 2 ? 'sm:col-span-2' : colSpan === 4 ? 'sm:col-span-4' : ''}>
      <label className="text-[10px] text-zinc-500 mb-1 block">{label}</label>
      {children}
    </div>
  )
}

// 全フィールド空なら null を返す (= override クリア扱い)
function normalizeAccess(a) {
  if (!a) return null
  const station = (a.station ?? '').toString().trim()
  const note = (a.note ?? '').toString().trim()
  const walkRaw = a.walkMinutes
  const walk =
    walkRaw === '' || walkRaw == null || Number.isNaN(Number(walkRaw)) ? null : Number(walkRaw)
  if (!station && !note && walk == null) return null
  return { station: station || null, walkMinutes: walk, note: note || null }
}
function normalizeAwayTravel(a) {
  if (!a) return null
  const hours = (a.hours ?? '').toString().trim()
  const transport = (a.transport ?? '').toString().trim()
  const note = (a.note ?? '').toString().trim()
  const yenRaw = a.yen
  const yen =
    yenRaw === '' || yenRaw == null || Number.isNaN(Number(yenRaw)) ? null : Number(yenRaw)
  if (!hours && !transport && !note && yen == null) return null
  return { hours: hours || null, yen, transport: transport || null, note: note || null }
}
