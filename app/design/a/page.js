import Link from 'next/link'
import PreviewNav from '../../_preview-nav'

/**
 * Design A: Editorial Asymmetric Minimal
 *   - 大胆な余白 + 12 列グリッド
 *   - 左上 caption, 中央〜左寄り極大ディスプレイヘッドライン, 右側に細い円リング
 *   - 全体カームで、ロード時の微 stagger と背景の超低速回転のみ
 *   - Apple / Pentagram / Studio Snippet 系の編集風
 */
export default function DesignA() {
  return (
    <div className="dsA">
      <PreviewNav current="a" />

      <header className="dsA-header">
        <span className="dsA-mark">
          <span>J</span><span>L</span><span>S</span><span>P</span>
        </span>
        <span className="dsA-mono dsA-mono-r">EST. 2026 / J1·J2 — 40 CLUBS</span>
      </header>

      <div className="dsA-spine" aria-hidden="true">
        <span className="dsA-spine-dot" />
      </div>

      <main className="dsA-main">
        <p className="dsA-eyebrow">— A FOOTBALL FAN&apos;S COMPASS</p>
        <h1 className="dsA-headline">
          <span className="dsA-line">あなたの</span>
          <span className="dsA-line">クラブを、</span>
          <span className="dsA-line dsA-italic">見つける。</span>
        </h1>
        <p className="dsA-sub">
          W杯や海外サッカーで目覚めたサッカー熱、<br />
          次は J リーグでも。
        </p>
        <Link href="/quiz" className="dsA-cta">
          <span className="dsA-cta-text">診断する</span>
          <span className="dsA-cta-arrow" aria-hidden="true">→</span>
        </Link>
      </main>

      <aside className="dsA-aside" aria-hidden="true">
        <div className="dsA-ring dsA-ring-1" />
        <div className="dsA-ring dsA-ring-2" />
        <div className="dsA-ring dsA-ring-3" />
      </aside>

      <footer className="dsA-footer">
        <span className="dsA-step">01 / FIND</span>
        <span className="dsA-step">02 / 48 QUESTIONS</span>
        <span className="dsA-step">03 / YOUR TOP 3</span>
      </footer>
    </div>
  )
}
