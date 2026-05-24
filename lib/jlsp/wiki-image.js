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
/**
 * REST summary に lead image が無い記事 (infobox 未使用など) 用の fallback。
 * MediaWiki `prop=images` でファイル一覧を取り、装飾系 (SVG / Flag / pictogram 等)
 * を除外した最初のファイルを `imageinfo` で実 URL に解決する。
 * 例: 「しかお」記事 — infobox 無いが本文に Shikao.jpg がある。
 */
async function fetchFirstPageImage(title) {
  if (!title) return null
  try {
    const listRes = await fetch(
      `https://ja.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(title)}&imlimit=20&format=json&origin=*`,
      {
        headers: { 'User-Agent': 'JLSP/1.0 (https://jlsp.jleakstats.com; jackcrispin13@gmail.com)' },
        next: { revalidate: 60 * 60 * 24 * 7 },
      },
    )
    if (!listRes.ok) return null
    const listJson = await listRes.json()
    const pages = Object.values(listJson.query?.pages ?? {})
    const files = pages[0]?.images ?? []
    // 装飾系を除外
    const DECORATIVE = /Captain_sports|Football_pictogram|Flag_of|Commons-logo|Wikidata-logo|Stub_icon|Question_book/i
    const candidate = files
      .map((f) => f.title)
      .filter((t) => !DECORATIVE.test(t.replace(/\s/g, '_')))
      .filter((t) => !/\.svg$/i.test(t))[0]
    if (!candidate) return null

    const iiRes = await fetch(
      `https://ja.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(candidate)}&prop=imageinfo&iiprop=url&iiurlwidth=400&format=json&origin=*`,
      {
        headers: { 'User-Agent': 'JLSP/1.0 (https://jlsp.jleakstats.com; jackcrispin13@gmail.com)' },
        next: { revalidate: 60 * 60 * 24 * 7 },
      },
    )
    if (!iiRes.ok) return null
    const iiJson = await iiRes.json()
    const ipp = Object.values(iiJson.query?.pages ?? {})[0]
    const info = ipp?.imageinfo?.[0]
    return info?.thumburl ?? info?.url ?? null
  } catch {
    return null
  }
}

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

  // Phase 1: summary endpoint で thumbnail を狙う (画像 + extract + pageUrl が揃う)
  let lastHitWithoutImage = null
  for (const c of candidates) {
    const r = await fetchWikiSummaryOnce(c)
    if (r) return { title, image: r.image, extract: r.extract, pageUrl: r.pageUrl }
    // 記事はあるが summary に thumbnail が無い場合 (= type=standard だが image 取れず) は
    // Phase 2 で images 列挙 fallback を試すため候補をキープ
    if (lastHitWithoutImage == null) lastHitWithoutImage = c
  }

  // Phase 2: summary に画像なし → MediaWiki images で本文中の画像を探す
  for (const c of candidates) {
    const img = await fetchFirstPageImage(c)
    if (img) {
      return { title, image: img, extract: null, pageUrl: `https://ja.wikipedia.org/wiki/${encodeURIComponent(c)}` }
    }
  }
  return base
}

export async function getWikiThumbnails(titles) {
  if (!Array.isArray(titles) || titles.length === 0) return []
  return Promise.all(titles.map(getWikiThumbnail))
}
