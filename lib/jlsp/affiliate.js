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

// クラブ本拠地スタジアムの「市区町村」じゃらん宿一覧ページ（実在URLを確認済み）。
// area = ボタン表示用の地名、url = じゃらんの市区町村ホテル一覧。
// ここに無いクラブは本拠地の都道府県ページに fallback する。
const JALAN_AREA = {
  kashima:     { area: '鹿嶋',     url: 'https://www.jalan.net/100000/CTY_020000000000444/' },
  urawa:       { area: 'さいたま', url: 'https://www.jalan.net/110000/CTY_020000000000549/' },
  kawasaki:    { area: '川崎',     url: 'https://www.jalan.net/140000/CTY_020000000000766/' },
  'f-marinos': { area: '横浜',     url: 'https://www.jalan.net/140000/CTY_020000000000753/' },
  fctokyo:     { area: '調布',     url: 'https://www.jalan.net/130000/CTY_020000000000712/' },
  verdy:       { area: '調布',     url: 'https://www.jalan.net/130000/CTY_020000000000712/' },
  reysol:      { area: '柏',       url: 'https://www.jalan.net/120000/CTY_020000000000640/' },
  grampus:     { area: '豊田',     url: 'https://www.jalan.net/230000/CTY_020000000001121/' },
  gamba:       { area: '吹田',     url: 'https://www.jalan.net/270000/CTY_020000000001299/' },
  cerezo:      { area: '大阪',     url: 'https://www.jalan.net/270000/CTY_020000000001280/' },
  kobe:        { area: '神戸',     url: 'https://www.jalan.net/280000/CTY_020000000001340/' },
  sanfrecce:   { area: '広島',     url: 'https://www.jalan.net/340000/CTY_020000000001524/' },
  avispa:      { area: '福岡',     url: 'https://www.jalan.net/400000/CTY_020000000001679/' },
  kyoto:       { area: '亀岡',     url: 'https://www.jalan.net/260000/CTY_020000000001243/' },
  machida:     { area: '町田',     url: 'https://www.jalan.net/130000/CTY_020000000000713/' },
  chiba:       { area: '千葉',     url: 'https://www.jalan.net/120000/CTY_020000000000621/' },
  mito:        { area: '水戸',     url: 'https://www.jalan.net/100000/CTY_020000000000427/' },
  shimizu:     { area: '清水',     url: 'https://www.jalan.net/210000/CTY_020000000001046/' },
  okayama:     { area: '岡山',     url: 'https://www.jalan.net/330000/CTY_020000000001496/' },
  nagasaki:    { area: '長崎',     url: 'https://www.jalan.net/420000/CTY_020000000001769/' },
}

/** ボタン表示用のエリア名。市区町村マップがあればそれ、無ければ都道府県短縮。 */
export function stayAreaLabel(clubId, prefecture) {
  return JALAN_AREA[clubId]?.area ?? prefShort(prefecture)
}

/**
 * クラブ本拠地の宿・ホテル検索（じゃらん）への成果リンク。
 * スタジアム所在の市区町村ページを優先、無ければ都道府県ページに fallback。
 * 都道府県も不明 / じゃらん未提携なら null。
 */
export function jalanStayLink(clubId, prefecture) {
  const area = JALAN_AREA[clubId]
  if (area) return vcLink('jalan', area.url)
  const romaji = PREF_ROMAJI[prefecture]
  if (!romaji) return null
  return vcLink('jalan', `https://www.jalan.net/ikisaki/map/${romaji}/`)
}

/** じゃらん観光（キーワード検索）への成果リンク。未提携なら素のURLを返す。 */
export function jalanKankouLink(keyword) {
  const target = `https://www.jalan.net/kankou/?keyword=${encodeURIComponent(keyword)}`
  return vcLink('jalan', target) ?? target
}
