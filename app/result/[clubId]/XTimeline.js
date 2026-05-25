'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

/**
 * X (旧 Twitter) Timeline ウィジェット。
 *
 * platform.twitter.com/widgets.js を Next.js の Script で読み込み、
 * 指定アカウントの直近投稿を iframe で埋め込む。
 *
 * - x.com / twitter.com 両 URL を username に正規化
 * - widgets.js は 1 度だけ読み込まれ、複数 component で共有
 * - 一定時間経っても iframe が描画されなければ fallback リンクに切替
 *   (= ブラウザの拡張機能 / プライバシー設定で widgets.js がブロックされた等)
 */
export default function XTimeline({ profileUrl, tweetLimit = 3, height = 600 }) {
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)
  const username = parseUsername(profileUrl)

  function loadWidget() {
    if (!ref.current) return
    if (window.twttr?.widgets?.load) {
      window.twttr.widgets.load(ref.current)
    }
  }

  useEffect(() => {
    if (!username) return
    // すでにスクリプトが読み込まれている場合 (=他のページから戻ってきた等)
    if (window.twttr?.widgets) loadWidget()

    // 一定時間経っても <iframe> が描画されなければ failed と判定
    const t = setTimeout(() => {
      if (ref.current && !ref.current.querySelector('iframe')) {
        setFailed(true)
      }
    }, 8000)
    return () => clearTimeout(t)
  }, [username])

  if (!username) return null

  if (failed) {
    return (
      <a
        href={`https://x.com/${username}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block bg-zinc-50 border border-black/10 rounded-lg p-6 text-center text-sm text-zinc-600 hover:text-zinc-900 transition-colors"
      >
        埋め込みが読み込めませんでした。
        <br />
        <span className="font-bold underline">@{username} を X で開く →</span>
      </a>
    )
  }

  return (
    <>
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onLoad={loadWidget}
      />
      <div ref={ref} className="bg-white rounded-lg border border-black/10 overflow-hidden">
        <a
          className="twitter-timeline"
          data-tweet-limit={tweetLimit}
          data-height={height}
          data-chrome="noheader nofooter noborders transparent"
          data-theme="light"
          href={`https://twitter.com/${username}`}
        >
          Tweets by @{username}
        </a>
      </div>
    </>
  )
}

function parseUsername(url) {
  if (!url) return null
  const m = String(url).match(/(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/)
  return m?.[1] ?? null
}
