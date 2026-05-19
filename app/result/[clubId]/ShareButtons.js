'use client'

import { useEffect, useState } from 'react'

export default function ShareButtons({ clubName, clubId }) {
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => {
    setPageUrl(window.location.href)
  }, [])

  const text = `あなたが好きになるJリーグクラブは「${clubName}」でした!`

  const xUrl = pageUrl
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}&hashtags=JLSP診断`
    : '#'
  const lineUrl = pageUrl
    ? `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(text)}`
    : '#'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-bold text-[var(--muted)] mr-1">SHARE</span>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-black hover:bg-zinc-800 text-white font-bold px-5 py-2.5 text-sm transition-colors"
      >
        <span aria-hidden>𝕏</span>
        <span>でシェア</span>
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full bg-[#06C755] hover:bg-[#05a847] text-white font-bold px-5 py-2.5 text-sm transition-colors"
      >
        <span>LINE</span>
        <span>でシェア</span>
      </a>
    </div>
  )
}
