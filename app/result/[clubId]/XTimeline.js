'use client'

import { useEffect, useRef } from 'react'

/**
 * X (旧 Twitter) Timeline ウィジェット。
 *
 * platform.twitter.com/widgets.js を読み込み、指定アカウントの直近投稿を
 * iframe で埋め込む。API key 不要、x.com / twitter.com 両対応。
 *
 * 同じスクリプトは複数 component で共有される (1 度だけロード)。
 * URL から username を取り出し、twitter.com に正規化したリンクを置いて
 * widgets.js に変換させる。
 */
export default function XTimeline({ profileUrl, tweetLimit = 3, height = 600 }) {
  const ref = useRef(null)

  const username = parseUsername(profileUrl)

  useEffect(() => {
    if (!username) return

    const SRC = 'https://platform.twitter.com/widgets.js'
    const existing = document.querySelector(`script[src="${SRC}"]`)

    function reloadWidgets() {
      // widgets.load(element) で対象 DOM を走査して timeline を生成
      if (window.twttr?.widgets?.load && ref.current) {
        window.twttr.widgets.load(ref.current)
      }
    }

    if (existing) {
      reloadWidgets()
    } else {
      const script = document.createElement('script')
      script.src = SRC
      script.async = true
      script.charset = 'utf-8'
      script.onload = reloadWidgets
      document.body.appendChild(script)
    }
  }, [username])

  if (!username) return null

  return (
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
  )
}

function parseUsername(url) {
  if (!url) return null
  const m = String(url).match(/(?:twitter\.com|x\.com)\/([A-Za-z0-9_]+)/)
  return m?.[1] ?? null
}
