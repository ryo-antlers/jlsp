import Link from 'next/link'
import PreviewNav from '../../_preview-nav'

/**
 * Design C: Glassmorphism on animated mesh gradient
 *   - 背景に巨大なクラブカラーブロブがゆっくり交差移動するメッシュグラデ
 *   - 中央に backdrop-filter で霞らせたグラスカード
 *   - Stripe / Linear / Apple Vision 系の現代的プレミアム感
 */
export default function DesignC() {
  return (
    <div className="dsC">
      <PreviewNav current="c" />

      {/* 背景: 大型メッシュ + 上のノイズ膜 */}
      <div className="dsC-mesh" aria-hidden="true">
        <div className="dsC-blob dsC-blob-1" />
        <div className="dsC-blob dsC-blob-2" />
        <div className="dsC-blob dsC-blob-3" />
        <div className="dsC-blob dsC-blob-4" />
      </div>
      <div className="dsC-grain" aria-hidden="true" />

      <main className="dsC-stage">
        <div className="dsC-card">
          <div className="dsC-card-top">
            <span className="dsC-status">
              <span className="dsC-status-dot" />
              <span>LIVE · 2026</span>
            </span>
            <span className="dsC-mark">JLSP</span>
          </div>

          <h1 className="dsC-headline">
            あなたの<br />
            <span className="dsC-headline-accent">クラブを</span>見つける。
          </h1>

          <p className="dsC-sub">
            W杯や海外サッカーで目覚めたサッカー熱、<br className="dsC-br" />
            次は J リーグでも。
          </p>

          <Link href="/quiz" className="dsC-cta">
            <span>診断する</span>
            <span className="dsC-cta-arrow" aria-hidden="true">↗</span>
          </Link>

          <div className="dsC-stats">
            <div className="dsC-stat">
              <span className="dsC-stat-num">48</span>
              <span className="dsC-stat-label">QUESTIONS</span>
            </div>
            <div className="dsC-stat-divider" />
            <div className="dsC-stat">
              <span className="dsC-stat-num">40</span>
              <span className="dsC-stat-label">J1·J2 CLUBS</span>
            </div>
            <div className="dsC-stat-divider" />
            <div className="dsC-stat">
              <span className="dsC-stat-num">3</span>
              <span className="dsC-stat-label">YOUR MATCH</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
