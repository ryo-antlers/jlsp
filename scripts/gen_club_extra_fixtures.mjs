// 2026/27 J1 第1〜5節を全20クラブの upcomingManual に展開し club-extra.js を生成。
//   node scripts/gen_club_extra_fixtures.mjs
// 日程は公式PDF(2026-06-16発表)より。会場名は jleakstats DB の現行ホームスタジアム。
import { writeFileSync } from 'node:fs'
import { CLUBS } from '../lib/jlsp/clubs.js'

const NAME = Object.fromEntries(CLUBS.map((c) => [c.id, c.name]))

const STADIUM = {
  kashima: 'メルカリスタジアム', urawa: '埼玉スタジアム2002',
  kawasaki: 'Uvanceとどろきスタジアム by Fujitsu', 'f-marinos': '日産スタジアム',
  fctokyo: '味の素スタジアム', verdy: '味の素スタジアム', reysol: '三協フロンテア柏スタジアム',
  grampus: '豊田スタジアム', gamba: 'パナソニックスタジアム吹田', cerezo: 'ヨドコウ桜スタジアム',
  kobe: 'ノエビアスタジアム神戸', sanfrecce: 'エディオンピースウイング広島', avispa: 'ベスト電器スタジアム',
  kyoto: 'サンガスタジアム by KYOCERA', machida: '町田GIONスタジアム', chiba: 'フクダ電子アリーナ',
  mito: 'ケーズデンキスタジアム水戸', shimizu: 'IAIスタジアム日本平', okayama: 'JFE晴れの国スタジアム',
  nagasaki: 'ピーススタジアム',
}

// [date, homeId, awayId, specialVenue?]
const MATCHES = [
  // 第1節
  ['2026-08-07', 'f-marinos', 'kashima', '国立競技場'],
  ['2026-08-08', 'gamba', 'urawa'], ['2026-08-08', 'reysol', 'mito'], ['2026-08-08', 'fctokyo', 'machida'],
  ['2026-08-09', 'verdy', 'kawasaki'], ['2026-08-09', 'grampus', 'shimizu'], ['2026-08-09', 'cerezo', 'okayama'],
  ['2026-08-09', 'sanfrecce', 'chiba'], ['2026-08-09', 'avispa', 'kobe'], ['2026-08-09', 'nagasaki', 'kyoto'],
  // 第2節
  ['2026-08-14', 'verdy', 'reysol', '国立競技場'],
  ['2026-08-15', 'kashima', 'grampus'], ['2026-08-15', 'mito', 'gamba'],
  ['2026-08-16', 'urawa', 'sanfrecce'], ['2026-08-16', 'chiba', 'machida'], ['2026-08-16', 'kawasaki', 'kyoto'],
  ['2026-08-16', 'shimizu', 'f-marinos'], ['2026-08-16', 'kobe', 'fctokyo'], ['2026-08-16', 'okayama', 'nagasaki'],
  ['2026-08-16', 'avispa', 'cerezo'],
  // 第3節
  ['2026-08-21', 'fctokyo', 'chiba', '国立競技場'], ['2026-08-21', 'reysol', 'nagasaki'],
  ['2026-08-23', 'machida', 'urawa', '国立競技場'],
  ['2026-08-22', 'kashima', 'avispa'], ['2026-08-22', 'f-marinos', 'kobe'],
  ['2026-08-23', 'grampus', 'gamba'], ['2026-08-23', 'kyoto', 'mito'], ['2026-08-23', 'cerezo', 'shimizu'],
  ['2026-08-23', 'okayama', 'verdy'], ['2026-08-23', 'sanfrecce', 'kawasaki'],
  // 第4節
  ['2026-08-29', 'mito', 'machida'], ['2026-08-29', 'urawa', 'f-marinos'],
  ['2026-08-30', 'verdy', 'kashima'], ['2026-08-30', 'kawasaki', 'chiba'], ['2026-08-30', 'shimizu', 'reysol'],
  ['2026-08-30', 'grampus', 'okayama'], ['2026-08-30', 'kyoto', 'avispa'], ['2026-08-30', 'gamba', 'sanfrecce'],
  ['2026-08-30', 'kobe', 'cerezo'], ['2026-08-30', 'nagasaki', 'fctokyo'],
  // 第5節
  ['2026-09-02', 'mito', 'kashima'], ['2026-09-02', 'chiba', 'okayama'], ['2026-09-02', 'verdy', 'kobe'],
  ['2026-09-02', 'machida', 'kawasaki'], ['2026-09-02', 'f-marinos', 'kyoto'], ['2026-09-02', 'shimizu', 'fctokyo'],
  ['2026-09-02', 'cerezo', 'reysol'], ['2026-09-02', 'sanfrecce', 'grampus'], ['2026-09-02', 'avispa', 'urawa'],
  ['2026-09-02', 'nagasaki', 'gamba'],
]

// クラブごとに 5 試合を組み立て
const fixturesByClub = {}
for (const id of Object.keys(STADIUM)) fixturesByClub[id] = []
for (const [date, homeId, awayId, special] of MATCHES) {
  const venue = special ?? STADIUM[homeId]
  fixturesByClub[homeId].push({ date, home: true, opponent: NAME[awayId], venue })
  fixturesByClub[awayId].push({ date, home: false, opponent: NAME[homeId], venue })
}
for (const id of Object.keys(fixturesByClub)) {
  fixturesByClub[id].sort((a, b) => a.date.localeCompare(b.date))
}

// 鹿島の手入力データ(成績・マスコット)は保持
const KASHIMA_EXTRA = {
  recentResults: [
    { year: 2024, comp: 'J1', place: '5位' },
    { year: 2025, comp: 'J1', place: '優勝' },
    { year: 2026, comp: '百年', place: '2位' },
  ],
  mascots: [
    { name: 'しかお', note: '鹿島神宮の神鹿モチーフ。一家のリーダー' },
    { name: 'シカコ', note: 'しかおの妻' },
  ],
}

function fixturesToStr(arr) {
  return arr
    .map((f) => `      { date: '${f.date}', home: ${f.home ? 'true ' : 'false'}, opponent: '${f.opponent}', venue: '${f.venue}' },`)
    .join('\n')
}

const order = ['kashima', ...Object.keys(STADIUM).filter((id) => id !== 'kashima')]
let body = ''
for (const id of order) {
  const key = /^[a-zA-Z_$][\w$]*$/.test(id) ? id : `'${id}'`
  body += `  ${key}: {\n`
  if (id === 'kashima') {
    body += `    recentResults: ${JSON.stringify(KASHIMA_EXTRA.recentResults).replace(/"/g, "'")},\n`
    body += `    mascots: ${JSON.stringify(KASHIMA_EXTRA.mascots).replace(/"([a-zA-Z]+)":/g, '$1:').replace(/"/g, "'")},\n`
  }
  body += `    upcomingManual: [\n${fixturesToStr(fixturesByClub[id])}\n    ],\n`
  body += `  },\n`
}

const file = `/**
 * クラブ別の手入力データ（結果ページの左カラム成績・右カラムマスコット・開幕戦）。
 *
 *  recentResults : 直近の成績（手入力。鹿島のみ。順次追加）
 *  mascots       : マスコット（名前のみ・複数可。手入力。鹿島のみ。順次追加）
 *  upcomingManual: 2026/27 J1 第1〜5節（公式PDF 2026-06-16発表 + jleakstats DB の会場名）。
 *                  DBに upcomingMatches があればそちらを優先表示。
 */
export const CLUB_EXTRA = {
${body}}

export function getClubExtra(id) {
  return CLUB_EXTRA[id] ?? {}
}
`

writeFileSync(new URL('../lib/jlsp/club-extra.js', import.meta.url), file)
console.log('wrote club-extra.js')
console.log('clubs:', order.length, ' total fixtures:', Object.values(fixturesByClub).reduce((n, a) => n + a.length, 0))
for (const id of order) console.log(id, fixturesByClub[id].length, fixturesByClub[id].map((f) => `${f.date.slice(5)}${f.home ? 'H' : 'A'}`).join(' '))
