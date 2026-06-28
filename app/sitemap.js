// 公開ページのサイトマップ。結果ページは ?a=（回答）依存で静的列挙できないため、
// トップと診断のみを掲載する。
const BASE = 'https://jlsp.jleakstats.com'

export default function sitemap() {
  return [
    { url: `${BASE}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/quiz`, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
