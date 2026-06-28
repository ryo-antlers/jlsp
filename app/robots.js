// /admin・/api・/design(廃止した性格タイプ) はクロール対象外。本体は許可。
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/design/'],
    },
    sitemap: 'https://jlsp.jleakstats.com/sitemap.xml',
  }
}
