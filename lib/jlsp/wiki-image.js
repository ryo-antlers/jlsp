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
export async function getWikiThumbnail(title) {
  const base = {
    title,
    image: null,
    extract: null,
    pageUrl: null,
  }
  if (!title) return base
  try {
    const res = await fetch(
      `https://ja.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          // Wikimedia API 利用ポリシーに従い、識別可能な User-Agent を付ける。
          'User-Agent': 'JLSP/1.0 (https://jlsp.jleakstats.com; jackcrispin13@gmail.com)',
          'accept': 'application/json',
        },
        // 結果は十分に静的なので 1 週間キャッシュ
        next: { revalidate: 60 * 60 * 24 * 7 },
      },
    )
    if (!res.ok) return base
    const data = await res.json()
    // disambiguation ページは画像があっても文脈不一致になりがちなので回避
    if (data.type === 'disambiguation') return base
    const image =
      data.thumbnail?.source ??
      data.originalimage?.source ??
      null
    return {
      title,
      image,
      extract: data.extract ?? null,
      pageUrl: data.content_urls?.desktop?.page ?? null,
    }
  } catch {
    return base
  }
}

export async function getWikiThumbnails(titles) {
  if (!Array.isArray(titles) || titles.length === 0) return []
  return Promise.all(titles.map(getWikiThumbnail))
}
