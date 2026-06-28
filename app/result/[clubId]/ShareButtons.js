'use client'

import { useEffect, useState } from 'react'

export default function ShareButtons({ clubName, matchPct }) {
  const [pageUrl, setPageUrl] = useState('')
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // window はマウント後にしか読めないので effect で取得（SSR安全）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPageUrl(window.location.href)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanNativeShare(typeof navigator !== 'undefined' && !!navigator.share)
  }, [])

  const text = matchPct != null
    ? `私と相性ぴったりのJクラブは「${clubName}」(相性${matchPct}%)でした!`
    : `私の推しクラブは「${clubName}」でした!`

  const xUrl = pageUrl
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}&hashtags=JLSP`
    : '#'
  const lineUrl = pageUrl
    ? `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(text)}`
    : '#'

  async function handleCopy() {
    if (!pageUrl) return
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // クリップボード不可の環境は無視（X/LINE で代替）
    }
  }

  async function handleNativeShare() {
    if (!pageUrl) return
    try {
      await navigator.share({ title: 'JLSP クラブ相性診断', text, url: pageUrl })
    } catch {
      // ユーザーキャンセル等は無視
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mr-1">SHARE</span>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-black hover:opacity-80 text-white font-bold px-4 py-2 text-xs sm:text-sm transition-opacity"
      >
        <span aria-hidden>𝕏</span>
        <span>でシェア</span>
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#06C755] hover:opacity-80 text-white font-bold px-4 py-2 text-xs sm:text-sm transition-opacity"
      >
        <span>LINE</span>
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-full border border-black/20 hover:border-black/50 text-zinc-700 hover:text-[#0e0e10] font-bold px-4 py-2 text-xs sm:text-sm transition-colors"
      >
        <span aria-hidden>{copied ? '✓' : '🔗'}</span>
        <span>{copied ? 'コピーしました' : 'リンクをコピー'}</span>
      </button>
      {canNativeShare && (
        <button
          type="button"
          onClick={handleNativeShare}
          className="inline-flex items-center gap-2 rounded-full border border-black/20 hover:border-black/50 text-zinc-700 hover:text-[#0e0e10] font-bold px-4 py-2 text-xs sm:text-sm transition-colors"
        >
          <span aria-hidden>📲</span>
          <span>その他で共有</span>
        </button>
      )}
    </div>
  )
}
