'use client'

import { useEffect, useState } from 'react'

/**
 * 0 から target に向かってカウントアップする数字表示。
 * SVG / 一般テキスト共用、デフォルト 1500ms ease-out。
 */
export default function CountUp({ target, duration = 1500, delay = 0, className, style }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let startTs = null
    let rafId = null
    let timeoutId = null
    function step(ts) {
      if (startTs == null) startTs = ts
      const progress = Math.min(1, (ts - startTs) / duration)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setValue(Math.round(target * eased))
      if (progress < 1) rafId = requestAnimationFrame(step)
    }
    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(step)
    }, delay)
    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [target, duration, delay])

  return (
    <span className={className} style={style}>
      {value}
    </span>
  )
}
