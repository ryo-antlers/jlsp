/**
 * アフィリエイト設定とリンク生成。
 *
 * バリューコマースの MyLink を使い、任意の遷移先 URL を成果リンク化する。
 *   https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=..&pid=..&vc_url=<遷移先URL>
 * sid = サイトID（JLSP 固有）。pid = プログラム（広告主）ID。
 *
 * pid が未設定（空文字）のプログラムはまだ提携前。その場合 link 関数は
 * null を返すので、呼び出し側は «設定済みのときだけ表示» にできる。
 */

const VC_SID = '3774322' // JLSP のバリューコマース サイトID

// 各プログラムの pid。提携して広告コードを発行したら埋める（未提携は空文字）。
export const VC_PID = {
  jalan: '892646740', // じゃらんnet（宿・ホテル）
  jalanRentacar: '', // じゃらんレンタカー（提携申請中）
  yahooTravel: '', // Yahoo!トラベル（高速バス含む・提携申請中）
  yahooShopping: '', // Yahoo!ショッピング（クラブグッズ・提携済だが広告コード未発行）
}

/**
 * バリューコマース MyLink。targetUrl を成果リンク化して返す。
 * pid が無いプログラムは null（＝まだ出さない）。
 */
export function vcLink(program, targetUrl) {
  const pid = VC_PID[program]
  if (!pid || !targetUrl) return null
  return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=${VC_SID}&pid=${pid}&vc_url=${encodeURIComponent(
    targetUrl,
  )}`
}

// 都道府県（漢字）→ じゃらんのエリア slug（ローマ字）。
const PREF_ROMAJI = {
  北海道: 'hokkaido', 青森県: 'aomori', 岩手県: 'iwate', 宮城県: 'miyagi',
  秋田県: 'akita', 山形県: 'yamagata', 福島県: 'fukushima', 茨城県: 'ibaraki',
  栃木県: 'tochigi', 群馬県: 'gunma', 埼玉県: 'saitama', 千葉県: 'chiba',
  東京都: 'tokyo', 神奈川県: 'kanagawa', 新潟県: 'niigata', 富山県: 'toyama',
  石川県: 'ishikawa', 福井県: 'fukui', 山梨県: 'yamanashi', 長野県: 'nagano',
  岐阜県: 'gifu', 静岡県: 'shizuoka', 愛知県: 'aichi', 三重県: 'mie',
  滋賀県: 'shiga', 京都府: 'kyoto', 大阪府: 'osaka', 兵庫県: 'hyogo',
  奈良県: 'nara', 和歌山県: 'wakayama', 鳥取県: 'tottori', 島根県: 'shimane',
  岡山県: 'okayama', 広島県: 'hiroshima', 山口県: 'yamaguchi', 徳島県: 'tokushima',
  香川県: 'kagawa', 愛媛県: 'ehime', 高知県: 'kochi', 福岡県: 'fukuoka',
  佐賀県: 'saga', 長崎県: 'nagasaki', 熊本県: 'kumamoto', 大分県: 'oita',
  宮崎県: 'miyazaki', 鹿児島県: 'kagoshima', 沖縄県: 'okinawa',
}

/** 「茨城県」→「茨城」。表示用に都道府県の接尾辞を落とす。 */
export function prefShort(prefecture) {
  if (!prefecture) return ''
  return prefecture.replace(/[都道府県]$/, '')
}

/**
 * クラブの本拠地（都道府県）の宿・ホテル検索（じゃらん）への成果リンク。
 * 例: 茨城県 → https://www.jalan.net/ikisaki/map/ibaraki/ を MyLink 化。
 * 県が判定できない / じゃらん未提携なら null。
 */
export function jalanStayLink(prefecture) {
  const romaji = PREF_ROMAJI[prefecture]
  if (!romaji) return null
  return vcLink('jalan', `https://www.jalan.net/ikisaki/map/${romaji}/`)
}

/** じゃらん観光（キーワード検索）への成果リンク。未提携なら素のURLを返す。 */
export function jalanKankouLink(keyword) {
  const target = `https://www.jalan.net/kankou/?keyword=${encodeURIComponent(keyword)}`
  return vcLink('jalan', target) ?? target
}
