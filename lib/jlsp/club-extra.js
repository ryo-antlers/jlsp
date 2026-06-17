/**
 * クラブ別の手入力データ（結果ページの左カラム成績・右カラムマスコット・開幕戦fallback）。
 *
 * まずは鹿島のみ仮入力。形を確認してから管理方法（admin化 等）を決める。
 *
 *  recentResults : 直近の成績（新しい順 or 古い順、表示はそのまま）
 *  mascots       : マスコット（名前のみ・複数可。画像はクラブIPのため出さない）
 *  upcomingManual: 開幕戦などの手入力fallback。DBに upcomingMatches があればそちらを優先。
 */
export const CLUB_EXTRA = {
  kashima: {
    recentResults: [
      { year: 2024, comp: 'J1', place: '5位' },
      { year: 2025, comp: 'J1', place: '優勝' },
      { year: 2026, comp: '百年', place: '2位' },
    ],
    mascots: [
      { name: 'しかお', note: '鹿島神宮の神鹿モチーフ。一家のリーダー' },
      { name: 'シカコ', note: 'しかおの妻' },
    ],
    // 2026/27 J1 第1〜5節（公式日程 2026-06-16 発表 PDF より）。
    upcomingManual: [
      { date: '2026-08-07', home: false, opponent: '横浜F・マリノス', venue: '国立競技場' },
      { date: '2026-08-15', home: true,  opponent: '名古屋グランパス', venue: 'メルカリスタジアム' },
      { date: '2026-08-22', home: true,  opponent: 'アビスパ福岡', venue: 'メルカリスタジアム' },
      { date: '2026-08-30', home: false, opponent: '東京ヴェルディ', venue: '味の素スタジアム' },
      { date: '2026-09-02', home: false, opponent: '水戸ホーリーホック', venue: 'ケーズデンキスタジアム水戸' },
    ],
  },
}

export function getClubExtra(id) {
  return CLUB_EXTRA[id] ?? {}
}
