'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

/**
 * X (旧 Twitter) Timeline 埋め込み。
 *
 * <a class="twitter-timeline"> の auto-convert 方式は SSR ↔ hydration の
 * タイミングや拡張機能ブロックで起動失敗するケースが多いので、
 * twttr.widgets.createTimeline() プログラマティック API を使う。
 *
 * - script: next/script + onReady (next.js が呼ぶ確実な hook)
 * - 既にロード済みなら mount 時に即マウント
 * - 8 秒経っても iframe 未描画 → fallback リンク
 */
export default function XTimeline({ profileUrl, tweetLimit = 3, height = 600 }) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)
  const screenName = parseUsername(profileUrl)

  function mountTimeline() {
    if (!ref.current || !screenName) return
    if (!window.twttr?.widgets?.createTimeline) return
    if (ref.current.querySelector('iframe')) return // 既に描画済み
    window.twttr.widgets
      .createTimeline(
        { sourceType: 'profile', screenName },
        ref.current,
        {
          tweetLimit,
          chrome: 'noheader nofooter noborders transparent',
          height,
        },
      )
      .catch(() => setFailed(true))
  }

  useEffect(() => {
    if (!screenName) return
    if (window.twttr?.widgets) mountTimeline()
    const t = setTimeout(() => {
      if (ref.current && !ref.current.querySelector('iframe')) setFailed(true)
    }, 8000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenName])

  if (!screenName) return null

  if (failed) {
    return (
      <a
        href={`https://x.com/${screenName}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-zinc-50 border border-black/10 rounded-lg p-6 text-center text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
      >
        埋め込みが読み込めませんでした。
        <br />
        <span className="font-bold underline">@{screenName} を X で開く →</span>
      </a>
    )
  }

  return (
    <>
      <Script
        id="x-widgets-js"
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onReady={mountTimeline}
      />
      <div
        ref={ref}
        className="bg-white rounded-lg border border-black/10 overflow-hidden min-h-[200px]"
      />
    </>
  )
}

function parseUsername(url) {
  if (!url) return null
  const m = String(url).match(/(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/)
  return m?.[1] ?? null
}
