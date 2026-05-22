'use client'

import { useEffect, useState } from 'react'

export default function ShareButtons({ typeCode, typeNickname, clubName, clubId, encodedAnswers }) {
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => {
    setPageUrl(window.location.href)
  }, [])

  const text = typeCode
    ? `私の FANTYPE は ${typeCode}「${typeNickname}」、推しクラブは「${clubName}」でした!`
    : `推しクラブは「${clubName}」でした!`

  const xUrl = pageUrl
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}&hashtags=JLSP`
    : '#'
  const lineUrl = pageUrl
    ? `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(text)}`
    : '#'
  const storyUrl = clubId
    ? `/api/og/story/${clubId}${encodedAnswers ? `?a=${encodedAnswers}` : ''}`
    : null

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
      {storyUrl && (
        <a
          href={storyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5] hover:opacity-80 text-white font-bold px-4 py-2 text-xs sm:text-sm transition-opacity"
          title="9:16 ストーリー画像 (Instagram 用)"
        >
          <span>ストーリー画像</span>
        </a>
      )}
    </div>
  )
}
