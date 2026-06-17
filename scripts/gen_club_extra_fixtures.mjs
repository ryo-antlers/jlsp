// club-extra.js を生成（全20クラブの recentResults + upcomingManual）。
//   node scripts/gen_club_extra_fixtures.mjs
//
//  recentResults : 2022〜2025 の最終順位（API-Football, jleakstats と同じ league 98/99）。
//                  → scripts/standings_2022_2025.json（確定値を同梱）。
//                  ※2026/百年構想リーグは API データが不完全なため未収録（公式確定後に追加）。
//  upcomingManual: 2026/27 J1 第1〜5節（公式PDF 2026-06-16発表 + jleakstats DB の会場名）。
import { readFileSync, writeFileSync } from 'node:fs'
import { CLUBS } from '../lib/jlsp/clubs.js'

const NAME = Object.fromEntries(CLUBS.map((c) => [c.id, c.name]))
const STANDINGS = JSON.parse(readFileSync(new URL('./standings_recent.json', import.meta.url)))

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

// [date, homeId, awayId, specialVenue?]  2026/27 J1 第1〜5節
const MATCHES = [
  ['2026-08-07', 'f-marinos', 'kashima', '国立競技場'],
  ['2026-08-08', 'gamba', 'urawa'], ['2026-08-08', 'reysol', 'mito'], ['2026-08-08', 'fctokyo', 'machida'],
  ['2026-08-09', 'verdy', 'kawasaki'], ['2026-08-09', 'grampus', 'shimizu'], ['2026-08-09', 'cerezo', 'okayama'],
  ['2026-08-09', 'sanfrecce', 'chiba'], ['2026-08-09', 'avispa', 'kobe'], ['2026-08-09', 'nagasaki', 'kyoto'],
  ['2026-08-14', 'verdy', 'reysol', '国立競技場'],
  ['2026-08-15', 'kashima', 'grampus'], ['2026-08-15', 'mito', 'gamba'],
  ['2026-08-16', 'urawa', 'sanfrecce'], ['2026-08-16', 'chiba', 'machida'], ['2026-08-16', 'kawasaki', 'kyoto'],
  ['2026-08-16', 'shimizu', 'f-marinos'], ['2026-08-16', 'kobe', 'fctokyo'], ['2026-08-16', 'okayama', 'nagasaki'],
  ['2026-08-16', 'avispa', 'cerezo'],
  ['2026-08-21', 'fctokyo', 'chiba', '国立競技場'], ['2026-08-21', 'reysol', 'nagasaki'],
  ['2026-08-23', 'machida', 'urawa', '国立競技場'],
  ['2026-08-22', 'kashima', 'avispa'], ['2026-08-22', 'f-marinos', 'kobe'],
  ['2026-08-23', 'grampus', 'gamba'], ['2026-08-23', 'kyoto', 'mito'], ['2026-08-23', 'cerezo', 'shimizu'],
  ['2026-08-23', 'okayama', 'verdy'], ['2026-08-23', 'sanfrecce', 'kawasaki'],
  ['2026-08-29', 'mito', 'machida'], ['2026-08-29', 'urawa', 'f-marinos'],
  ['2026-08-30', 'verdy', 'kashima'], ['2026-08-30', 'kawasaki', 'chiba'], ['2026-08-30', 'shimizu', 'reysol'],
  ['2026-08-30', 'grampus', 'okayama'], ['2026-08-30', 'kyoto', 'avispa'], ['2026-08-30', 'gamba', 'sanfrecce'],
  ['2026-08-30', 'kobe', 'cerezo'], ['2026-08-30', 'nagasaki', 'fctokyo'],
  ['2026-09-02', 'mito', 'kashima'], ['2026-09-02', 'chiba', 'okayama'], ['2026-09-02', 'verdy', 'kobe'],
  ['2026-09-02', 'machida', 'kawasaki'], ['2026-09-02', 'f-marinos', 'kyoto'], ['2026-09-02', 'shimizu', 'fctokyo'],
  ['2026-09-02', 'cerezo', 'reysol'], ['2026-09-02', 'sanfrecce', 'grampus'], ['2026-09-02', 'avispa', 'urawa'],
  ['2026-09-02', 'nagasaki', 'gamba'],
]

// fixtures
const fixturesByClub = {}
for (const id of Object.keys(STADIUM)) fixturesByClub[id] = []
for (const [date, homeId, awayId, special] of MATCHES) {
  const venue = special ?? STADIUM[homeId]
  fixturesByClub[homeId].push({ date, home: true, opponent: NAME[awayId], venue })
  fixturesByClub[awayId].push({ date, home: false, opponent: NAME[homeId], venue })
}
for (const id of Object.keys(fixturesByClub)) fixturesByClub[id].sort((a, b) => a.date.localeCompare(b.date))

// recentResults (2022-2025 昇順)
function recentResults(id) {
  const s = STANDINGS[id] || {}
  return [2022, 2023, 2024, 2025, 2026]
    .filter((y) => s[y])
    .map((y) => ({ year: y, comp: s[y].league, place: s[y].rank === 1 ? '優勝' : `${s[y].rank}位` }))
}

function fixturesToStr(arr) {
  return arr
    .map((f) => `      { date: '${f.date}', home: ${f.home ? 'true ' : 'false'}, opponent: '${f.opponent}', venue: '${f.venue}' },`)
    .join('\n')
}
function recentToStr(arr) {
  return arr.map((r) => `{ year: ${r.year}, comp: '${r.comp}', place: '${r.place}' }`).join(', ')
}

const order = ['kashima', ...Object.keys(STADIUM).filter((id) => id !== 'kashima')]
let body = ''
for (const id of order) {
  const key = /^[a-zA-Z_$][\w$]*$/.test(id) ? id : `'${id}'`
  body += `  ${key}: {\n`
  const rr = recentResults(id)
  if (rr.length) body += `    recentResults: [${recentToStr(rr)}],\n`
  body += `    upcomingManual: [\n${fixturesToStr(fixturesByClub[id])}\n    ],\n`
  body += `  },\n`
}

const file = `/**
 * クラブ別の手入力/取り込みデータ（結果ページの左カラム成績・次節、右カラムマスコット）。
 *
 *  recentResults : 各クラブの直近順位（API-Football league 98/99, scripts/standings_recent.json）。
 *  upcomingManual: 2026/27 J1 第1〜5節（公式PDF 2026-06-16 + jleakstats DB の会場名）。
 *  ※マスコット・説明文・観光地・OB選手・スタジアム名は admin/club-meta (DB) で管理。
 *                  DBに upcomingMatches があればそちらを優先表示。
 *
 *  生成: scripts/gen_club_extra_fixtures.mjs
 */
export const CLUB_EXTRA = {
${body}}

export function getClubExtra(id) {
  return CLUB_EXTRA[id] ?? {}
}
`

writeFileSync(new URL('../lib/jlsp/club-extra.js', import.meta.url), file)
console.log('wrote club-extra.js')
for (const id of order) console.log(id.padEnd(11), 'recent:', recentResults(id).map((r) => `${r.year}${r.comp}${r.place}`).join(' '))
