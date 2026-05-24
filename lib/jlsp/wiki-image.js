/**
 * Wikipedia (ja) の REST API ページサマリーから thumbnail を取得するヘルパー。
 *
 * - API key 不要
 * - SSR から fetch、Data Cache に 1 週間乗せて運用 (CDN ガード)
 * - 観光地名がそのまま記事タイトルにヒットしない場合は null
 *
 * 戻り値:
 *   {
 *     title:   検索キー (= 観光地名)
 *     image:   サムネイル URL or null
 *     extract: 1-2 行の説明 or null
 *     pageUrl: ja.wikipedia.org 記事 URL or null
 *   }
 *
 * じゃらん affiliate ID が手に入ったら、呼び出し側の href だけ差し替えれば
 * このヘルパーはそのまま使い回せる。
 */
async function fetchWikiSummaryOnce(title) {
  if (!title) return null
  try {
    const res = await fetch(
      `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          // Wikimedia API 利用ポリシーに従い、識別可能な User-Agent を付ける。
          'User-Agent': 'JLSP/1.0 (https://jlsp.jleakstats.com; jackcrispin13@gmail.com)',
          'accept': 'application/json',
        },
        next: { revalidate: 60 * 60 * 24 * 7 }, // 1 週間キャッシュ
      },
    )
    if (!res.ok) return null
    const data = await res.json()
    if (data.type === 'disambiguation') return null // 曖昧さ回避ページは画像が文脈不一致になりがち
    const image =
      data.thumbnail?.source ??
      data.originalimage?.source ??
      null
    if (!image) return null
    return {
      image,
      extract: data.extract ?? null,
      pageUrl: data.content_urls?.desktop?.page ?? null,
    }
  } catch {
    return null
  }
}

/**
 * Wikipedia (ja) のサムネを取得。タイトル直接で見つからなければ:
 *   1. 「・」「&」「と」で複合名を分割し最初の要素で再試行
 *   2. 末尾の「くん / ちゃん / さん」を取り除いて再試行
 * これでマスコット名のヒット率を底上げする。
 */
export async function getWikiThumbnail(title) {
  const base = { title, image: null, extract: null, pageUrl: null }
  if (!title) return base

  // 試行候補を順番に生成 (重複は Set で排除)
  const candidates = new Set([title])
  const splitChars = ['・', '&', 'と', '＆']
  for (const ch of splitChars) {
    if (title.includes(ch)) candidates.add(title.split(ch)[0].trim())
  }
  // 「くん」「ちゃん」「さん」を末尾から落とす
  const trimmedSuffix = title.replace(/(くん|ちゃん|さん|ファミリー)$/u, '').trim()
  if (trimmedSuffix && trimmedSuffix !== title) candidates.add(trimmedSuffix)

  for (const c of candidates) {
    const r = await fetchWikiSummaryOnce(c)
    if (r) {
      return { title, image: r.image, extract: r.extract, pageUrl: r.pageUrl }
    }
  }
  return base
}

export async function getWikiThumbnails(titles) {
  if (!Array.isArray(titles) || titles.length === 0) return []
  return Promise.all(titles.map(getWikiThumbnail))
}
