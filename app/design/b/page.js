import Link from 'next/link'
import PreviewNav from '../../_preview-nav'

/**
 * Design B: Kinetic Type / Marquee
 *   - 上下に巨大なテキスト marquee が流れ続ける
 *   - 中央に静止コンテンツ (JLSP / sub / CTA)
 *   - 横切るリボン + クラブ名カラフルティッカー
 *   - 全体に勢いとリズム
 */
const CLUBS_RIBBON = [
  ['鹿島アントラーズ', '#E60012'],
  ['浦和レッズ', '#C8102E'],
  ['川崎フロンターレ', '#003490'],
  ['横浜F・マリノス', '#0033A0'],
  ['FC東京', '#102E81'],
  ['東京ヴェルディ', '#00714A'],
  ['柏レイソル', '#FCB116'],
  ['名古屋グランパス', '#E60012'],
  ['ガンバ大阪', '#0B2A75'],
  ['セレッソ大阪', '#D8127D'],
  ['ヴィッセル神戸', '#9E1B32'],
  ['サンフレッチェ広島', '#5E0F75'],
  ['アビスパ福岡', '#1C3F94'],
  ['京都サンガF.C.', '#582C83'],
  ['FC町田ゼルビア', '#003C71'],
  ['ジェフユナイテッド千葉', '#FFCC00'],
  ['水戸ホーリーホック', '#005CAB'],
  ['清水エスパルス', '#F39800'],
  ['ファジアーノ岡山', '#E60012'],
  ['V・ファーレン長崎', '#005CAB'],
  ['湘南ベルマーレ', '#2BAAE2'],
  ['ジュビロ磐田', '#0085C7'],
  ['北海道コンサドーレ札幌', '#C7000C'],
  ['アルビレックス新潟', '#F37A1F'],
  ['横浜FC', '#0072CE'],
  ['大宮アルディージャ', '#FF6600'],
]

export default function DesignB() {
  // 連結を seamless にするため 2 周分を流す
  const ribbon = [...CLUBS_RIBBON, ...CLUBS_RIBBON]

  return (
    <div className="dsB">
      <PreviewNav current="b" />

      {/* 上端: 巨大マーキー (右→左) */}
      <div className="dsB-marquee dsB-marquee-top" aria-hidden="true">
        <div className="dsB-track dsB-track-r2l">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="dsB-track-item">
              あなたのクラブを見つける<span className="dsB-bullet">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* 中央コンテンツ */}
      <main className="dsB-main">
        <p className="dsB-mark">JLSP</p>
        <p className="dsB-sub">
          W杯や海外サッカーで目覚めたサッカー熱、<br className="dsB-br" />
          次は J リーグでも。
        </p>
        <Link href="/quiz" className="dsB-cta">
          <span>診断する</span>
          <span className="dsB-cta-arrow" aria-hidden="true">→</span>
        </Link>
      </main>

      {/* 下端: クラブ名カラフルティッカー (左→右) */}
      <div className="dsB-marquee dsB-marquee-bottom" aria-hidden="true">
        <div className="dsB-track dsB-track-l2r">
          {ribbon.map(([name, color], i) => (
            <span key={i} className="dsB-club" style={{ color }}>
              {name}
              <span className="dsB-club-dot" style={{ background: color }} />
            </span>
          ))}
        </div>
      </div>

      {/* 隅っこに小さいタグ */}
      <span className="dsB-tag dsB-tag-l">J1 · J2 / 40 CLUBS</span>
      <span className="dsB-tag dsB-tag-r">2026 EDITION</span>
    </div>
  )
}
