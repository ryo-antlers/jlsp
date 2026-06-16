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
    // ↓は仮データ。公式日程が出たら差し替え（DBに入れば自動でこちらは不要）。
    upcomingManual: [
      { date: '2026-08-08', home: true, opponent: '浦和レッズ', venue: 'メルカリスタジアム' },
      { date: '2026-08-15', home: false, opponent: '川崎フロンターレ', venue: '等々力陸上競技場' },
    ],
  },
}

export function getClubExtra(id) {
  return CLUB_EXTRA[id] ?? {}
}
