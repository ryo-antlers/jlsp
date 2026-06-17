/**
 * クラブ別の手入力データ（結果ページの左カラム成績・右カラムマスコット・開幕戦）。
 *
 *  recentResults : 直近の成績（手入力。鹿島のみ。順次追加）
 *  mascots       : マスコット（名前のみ・複数可。手入力。鹿島のみ。順次追加）
 *  upcomingManual: 2026/27 J1 第1〜5節（公式PDF 2026-06-16発表 + jleakstats DB の会場名）。
 *                  DBに upcomingMatches があればそちらを優先表示。
 */
export const CLUB_EXTRA = {
  kashima: {
    recentResults: [{'year':2024,'comp':'J1','place':'5位'},{'year':2025,'comp':'J1','place':'優勝'},{'year':2026,'comp':'百年','place':'2位'}],
    mascots: [{name:'しかお',note:'鹿島神宮の神鹿モチーフ。一家のリーダー'},{name:'シカコ',note:'しかおの妻'}],
    upcomingManual: [
      { date: '2026-08-07', home: false, opponent: '横浜F・マリノス', venue: '国立競技場' },
      { date: '2026-08-15', home: true , opponent: '名古屋グランパス', venue: 'メルカリスタジアム' },
      { date: '2026-08-22', home: true , opponent: 'アビスパ福岡', venue: 'メルカリスタジアム' },
      { date: '2026-08-30', home: false, opponent: '東京ヴェルディ', venue: '味の素スタジアム' },
      { date: '2026-09-02', home: false, opponent: '水戸ホーリーホック', venue: 'ケーズデンキスタジアム水戸' },
    ],
  },
  urawa: {
    upcomingManual: [
      { date: '2026-08-08', home: false, opponent: 'ガンバ大阪', venue: 'パナソニックスタジアム吹田' },
      { date: '2026-08-16', home: true , opponent: 'サンフレッチェ広島', venue: '埼玉スタジアム2002' },
      { date: '2026-08-23', home: false, opponent: 'FC町田ゼルビア', venue: '国立競技場' },
      { date: '2026-08-29', home: true , opponent: '横浜F・マリノス', venue: '埼玉スタジアム2002' },
      { date: '2026-09-02', home: false, opponent: 'アビスパ福岡', venue: 'ベスト電器スタジアム' },
    ],
  },
  kawasaki: {
    upcomingManual: [
      { date: '2026-08-09', home: false, opponent: '東京ヴェルディ', venue: '味の素スタジアム' },
      { date: '2026-08-16', home: true , opponent: '京都サンガF.C.', venue: 'Uvanceとどろきスタジアム by Fujitsu' },
      { date: '2026-08-23', home: false, opponent: 'サンフレッチェ広島', venue: 'エディオンピースウイング広島' },
      { date: '2026-08-30', home: true , opponent: 'ジェフユナイテッド千葉', venue: 'Uvanceとどろきスタジアム by Fujitsu' },
      { date: '2026-09-02', home: false, opponent: 'FC町田ゼルビア', venue: '町田GIONスタジアム' },
    ],
  },
  'f-marinos': {
    upcomingManual: [
      { date: '2026-08-07', home: true , opponent: '鹿島アントラーズ', venue: '国立競技場' },
      { date: '2026-08-16', home: false, opponent: '清水エスパルス', venue: 'IAIスタジアム日本平' },
      { date: '2026-08-22', home: true , opponent: 'ヴィッセル神戸', venue: '日産スタジアム' },
      { date: '2026-08-29', home: false, opponent: '浦和レッズ', venue: '埼玉スタジアム2002' },
      { date: '2026-09-02', home: true , opponent: '京都サンガF.C.', venue: '日産スタジアム' },
    ],
  },
  fctokyo: {
    upcomingManual: [
      { date: '2026-08-08', home: true , opponent: 'FC町田ゼルビア', venue: '味の素スタジアム' },
      { date: '2026-08-16', home: false, opponent: 'ヴィッセル神戸', venue: 'ノエビアスタジアム神戸' },
      { date: '2026-08-21', home: true , opponent: 'ジェフユナイテッド千葉', venue: '国立競技場' },
      { date: '2026-08-30', home: false, opponent: 'V・ファーレン長崎', venue: 'ピーススタジアム' },
      { date: '2026-09-02', home: false, opponent: '清水エスパルス', venue: 'IAIスタジアム日本平' },
    ],
  },
  verdy: {
    upcomingManual: [
      { date: '2026-08-09', home: true , opponent: '川崎フロンターレ', venue: '味の素スタジアム' },
      { date: '2026-08-14', home: true , opponent: '柏レイソル', venue: '国立競技場' },
      { date: '2026-08-23', home: false, opponent: 'ファジアーノ岡山', venue: 'JFE晴れの国スタジアム' },
      { date: '2026-08-30', home: true , opponent: '鹿島アントラーズ', venue: '味の素スタジアム' },
      { date: '2026-09-02', home: true , opponent: 'ヴィッセル神戸', venue: '味の素スタジアム' },
    ],
  },
  reysol: {
    upcomingManual: [
      { date: '2026-08-08', home: true , opponent: '水戸ホーリーホック', venue: '三協フロンテア柏スタジアム' },
      { date: '2026-08-14', home: false, opponent: '東京ヴェルディ', venue: '国立競技場' },
      { date: '2026-08-21', home: true , opponent: 'V・ファーレン長崎', venue: '三協フロンテア柏スタジアム' },
      { date: '2026-08-30', home: false, opponent: '清水エスパルス', venue: 'IAIスタジアム日本平' },
      { date: '2026-09-02', home: false, opponent: 'セレッソ大阪', venue: 'ヨドコウ桜スタジアム' },
    ],
  },
  grampus: {
    upcomingManual: [
      { date: '2026-08-09', home: true , opponent: '清水エスパルス', venue: '豊田スタジアム' },
      { date: '2026-08-15', home: false, opponent: '鹿島アントラーズ', venue: 'メルカリスタジアム' },
      { date: '2026-08-23', home: true , opponent: 'ガンバ大阪', venue: '豊田スタジアム' },
      { date: '2026-08-30', home: true , opponent: 'ファジアーノ岡山', venue: '豊田スタジアム' },
      { date: '2026-09-02', home: false, opponent: 'サンフレッチェ広島', venue: 'エディオンピースウイング広島' },
    ],
  },
  gamba: {
    upcomingManual: [
      { date: '2026-08-08', home: true , opponent: '浦和レッズ', venue: 'パナソニックスタジアム吹田' },
      { date: '2026-08-15', home: false, opponent: '水戸ホーリーホック', venue: 'ケーズデンキスタジアム水戸' },
      { date: '2026-08-23', home: false, opponent: '名古屋グランパス', venue: '豊田スタジアム' },
      { date: '2026-08-30', home: true , opponent: 'サンフレッチェ広島', venue: 'パナソニックスタジアム吹田' },
      { date: '2026-09-02', home: false, opponent: 'V・ファーレン長崎', venue: 'ピーススタジアム' },
    ],
  },
  cerezo: {
    upcomingManual: [
      { date: '2026-08-09', home: true , opponent: 'ファジアーノ岡山', venue: 'ヨドコウ桜スタジアム' },
      { date: '2026-08-16', home: false, opponent: 'アビスパ福岡', venue: 'ベスト電器スタジアム' },
      { date: '2026-08-23', home: true , opponent: '清水エスパルス', venue: 'ヨドコウ桜スタジアム' },
      { date: '2026-08-30', home: false, opponent: 'ヴィッセル神戸', venue: 'ノエビアスタジアム神戸' },
      { date: '2026-09-02', home: true , opponent: '柏レイソル', venue: 'ヨドコウ桜スタジアム' },
    ],
  },
  kobe: {
    upcomingManual: [
      { date: '2026-08-09', home: false, opponent: 'アビスパ福岡', venue: 'ベスト電器スタジアム' },
      { date: '2026-08-16', home: true , opponent: 'FC東京', venue: 'ノエビアスタジアム神戸' },
      { date: '2026-08-22', home: false, opponent: '横浜F・マリノス', venue: '日産スタジアム' },
      { date: '2026-08-30', home: true , opponent: 'セレッソ大阪', venue: 'ノエビアスタジアム神戸' },
      { date: '2026-09-02', home: false, opponent: '東京ヴェルディ', venue: '味の素スタジアム' },
    ],
  },
  sanfrecce: {
    upcomingManual: [
      { date: '2026-08-09', home: true , opponent: 'ジェフユナイテッド千葉', venue: 'エディオンピースウイング広島' },
      { date: '2026-08-16', home: false, opponent: '浦和レッズ', venue: '埼玉スタジアム2002' },
      { date: '2026-08-23', home: true , opponent: '川崎フロンターレ', venue: 'エディオンピースウイング広島' },
      { date: '2026-08-30', home: false, opponent: 'ガンバ大阪', venue: 'パナソニックスタジアム吹田' },
      { date: '2026-09-02', home: true , opponent: '名古屋グランパス', venue: 'エディオンピースウイング広島' },
    ],
  },
  avispa: {
    upcomingManual: [
      { date: '2026-08-09', home: true , opponent: 'ヴィッセル神戸', venue: 'ベスト電器スタジアム' },
      { date: '2026-08-16', home: true , opponent: 'セレッソ大阪', venue: 'ベスト電器スタジアム' },
      { date: '2026-08-22', home: false, opponent: '鹿島アントラーズ', venue: 'メルカリスタジアム' },
      { date: '2026-08-30', home: false, opponent: '京都サンガF.C.', venue: 'サンガスタジアム by KYOCERA' },
      { date: '2026-09-02', home: true , opponent: '浦和レッズ', venue: 'ベスト電器スタジアム' },
    ],
  },
  kyoto: {
    upcomingManual: [
      { date: '2026-08-09', home: false, opponent: 'V・ファーレン長崎', venue: 'ピーススタジアム' },
      { date: '2026-08-16', home: false, opponent: '川崎フロンターレ', venue: 'Uvanceとどろきスタジアム by Fujitsu' },
      { date: '2026-08-23', home: true , opponent: '水戸ホーリーホック', venue: 'サンガスタジアム by KYOCERA' },
      { date: '2026-08-30', home: true , opponent: 'アビスパ福岡', venue: 'サンガスタジアム by KYOCERA' },
      { date: '2026-09-02', home: false, opponent: '横浜F・マリノス', venue: '日産スタジアム' },
    ],
  },
  machida: {
    upcomingManual: [
      { date: '2026-08-08', home: false, opponent: 'FC東京', venue: '味の素スタジアム' },
      { date: '2026-08-16', home: false, opponent: 'ジェフユナイテッド千葉', venue: 'フクダ電子アリーナ' },
      { date: '2026-08-23', home: true , opponent: '浦和レッズ', venue: '国立競技場' },
      { date: '2026-08-29', home: false, opponent: '水戸ホーリーホック', venue: 'ケーズデンキスタジアム水戸' },
      { date: '2026-09-02', home: true , opponent: '川崎フロンターレ', venue: '町田GIONスタジアム' },
    ],
  },
  chiba: {
    upcomingManual: [
      { date: '2026-08-09', home: false, opponent: 'サンフレッチェ広島', venue: 'エディオンピースウイング広島' },
      { date: '2026-08-16', home: true , opponent: 'FC町田ゼルビア', venue: 'フクダ電子アリーナ' },
      { date: '2026-08-21', home: false, opponent: 'FC東京', venue: '国立競技場' },
      { date: '2026-08-30', home: false, opponent: '川崎フロンターレ', venue: 'Uvanceとどろきスタジアム by Fujitsu' },
      { date: '2026-09-02', home: true , opponent: 'ファジアーノ岡山', venue: 'フクダ電子アリーナ' },
    ],
  },
  mito: {
    upcomingManual: [
      { date: '2026-08-08', home: false, opponent: '柏レイソル', venue: '三協フロンテア柏スタジアム' },
      { date: '2026-08-15', home: true , opponent: 'ガンバ大阪', venue: 'ケーズデンキスタジアム水戸' },
      { date: '2026-08-23', home: false, opponent: '京都サンガF.C.', venue: 'サンガスタジアム by KYOCERA' },
      { date: '2026-08-29', home: true , opponent: 'FC町田ゼルビア', venue: 'ケーズデンキスタジアム水戸' },
      { date: '2026-09-02', home: true , opponent: '鹿島アントラーズ', venue: 'ケーズデンキスタジアム水戸' },
    ],
  },
  shimizu: {
    upcomingManual: [
      { date: '2026-08-09', home: false, opponent: '名古屋グランパス', venue: '豊田スタジアム' },
      { date: '2026-08-16', home: true , opponent: '横浜F・マリノス', venue: 'IAIスタジアム日本平' },
      { date: '2026-08-23', home: false, opponent: 'セレッソ大阪', venue: 'ヨドコウ桜スタジアム' },
      { date: '2026-08-30', home: true , opponent: '柏レイソル', venue: 'IAIスタジアム日本平' },
      { date: '2026-09-02', home: true , opponent: 'FC東京', venue: 'IAIスタジアム日本平' },
    ],
  },
  okayama: {
    upcomingManual: [
      { date: '2026-08-09', home: false, opponent: 'セレッソ大阪', venue: 'ヨドコウ桜スタジアム' },
      { date: '2026-08-16', home: true , opponent: 'V・ファーレン長崎', venue: 'JFE晴れの国スタジアム' },
      { date: '2026-08-23', home: true , opponent: '東京ヴェルディ', venue: 'JFE晴れの国スタジアム' },
      { date: '2026-08-30', home: false, opponent: '名古屋グランパス', venue: '豊田スタジアム' },
      { date: '2026-09-02', home: false, opponent: 'ジェフユナイテッド千葉', venue: 'フクダ電子アリーナ' },
    ],
  },
  nagasaki: {
    upcomingManual: [
      { date: '2026-08-09', home: true , opponent: '京都サンガF.C.', venue: 'ピーススタジアム' },
      { date: '2026-08-16', home: false, opponent: 'ファジアーノ岡山', venue: 'JFE晴れの国スタジアム' },
      { date: '2026-08-21', home: false, opponent: '柏レイソル', venue: '三協フロンテア柏スタジアム' },
      { date: '2026-08-30', home: true , opponent: 'FC東京', venue: 'ピーススタジアム' },
      { date: '2026-09-02', home: true , opponent: 'ガンバ大阪', venue: 'ピーススタジアム' },
    ],
  },
}

export function getClubExtra(id) {
  return CLUB_EXTRA[id] ?? {}
}
