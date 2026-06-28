import { ImageResponse } from 'next/og'
import { CLUBS, ALL_CLUBS } from '@/lib/jlsp/clubs'

export const runtime = 'edge'

/**
 * 1200×630 OGP 画像（案A: 相性% を主役にした大きな数字）。
 * クラブカラーを背景に、白(or黒)文字で「相性%」「クラブ名」を表示する。
 * 相性% は ?p=0..100 で受け取る（無ければ非表示でクラブ名主役にフォールバック）。
 */
export async function GET(req, { params }) {
  const { clubId } = await params
  const club = CLUBS.find((c) => c.id === clubId) ?? ALL_CLUBS.find((c) => c.id === clubId)
  if (!club) return new Response('Not Found', { status: 404 })

  const { searchParams } = new URL(req.url)
  const pRaw = searchParams.get('p')
  const pct = pRaw != null && /^\d{1,3}$/.test(pRaw) ? Math.min(100, parseInt(pRaw, 10)) : null

  const isLight = isLightColor(club.color)
  const fg = isLight ? '#0a0a0a' : '#ffffff'
  const fgMuted = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.72)'
  const chip = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'
  const rule = isLight ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.25)'

  // 画像に出る全文字（日本語＋英数）を渡してサブセットフォントを取得。
  const text = `JLSP·あなたの相性クラブはMATCH%Jリーグ クラブ相性診断jlsp.jleakstats.com0123456789${club.name}${club.region}${club.prefecture}${club.division}`
  const jp = await loadJpFont(text)
  const fonts = jp ? [{ name: 'NotoSansJP', data: jp, style: 'normal', weight: 800 }] : undefined
  const ff = jp ? 'NotoSansJP' : 'sans-serif'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '70px 90px',
          background: club.color,
          color: fg,
          fontFamily: ff,
        }}
      >
        {/* 上: ブランド + リード文 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: 6, opacity: 0.9 }}>
            JLSP · あなたの相性クラブは
          </div>
        </div>

        {/* 中: 相性% を主役に */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {pct != null && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ fontSize: 220, fontWeight: 800, lineHeight: 1, letterSpacing: -6 }}>{pct}</div>
              <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, paddingBottom: 16 }}>%</div>
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 800,
                  letterSpacing: 8,
                  opacity: 0.92,
                  paddingBottom: 30,
                  paddingLeft: 28,
                }}
              >
                MATCH
              </div>
            </div>
          )}
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: -2,
              marginTop: pct != null ? 6 : 0,
            }}
          >
            {club.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 22 }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                padding: '8px 20px',
                borderRadius: 999,
                background: chip,
              }}
            >
              {club.division}
            </span>
            <span style={{ fontSize: 26, fontWeight: 700, opacity: 0.9, marginLeft: 18 }}>
              {club.region}・{club.prefecture}
            </span>
          </div>
        </div>

        {/* 下: フッター */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 24,
            color: fgMuted,
            fontWeight: 700,
            letterSpacing: 3,
            borderTop: `1px solid ${rule}`,
            paddingTop: 22,
          }}
        >
          <span>Jリーグ クラブ相性診断</span>
          <span>jlsp.jleakstats.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts },
  )
}

/** Google Fonts から Noto Sans JP のサブセットを取得（失敗時 null でデフォルトに fallback）。 */
async function loadJpFont(text) {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@800&text=${encodeURIComponent(
      text,
    )}`
    // 古い UA を送ると Google が woff2 ではなく ttf を返す（Satori は ttf/otf/woff のみ対応）。
    const css = await (
      await fetch(cssUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; rv:10.0) Gecko/20100101 Firefox/10.0',
        },
      })
    ).text()
    const m = css.match(/src:\s*url\((.+?)\)\s*format/)
    if (!m) return null
    const res = await fetch(m[1])
    if (!res.ok) return null
    return await res.arrayBuffer()
  } catch {
    return null
  }
}

/** HEX カラーが明るい色か判定（テキストを黒/白どちらにするか決める）。 */
function isLightColor(hex) {
  const m = hex.match(/^#([0-9a-f]{6})$/i)
  if (!m) return false
  const v = parseInt(m[1], 16)
  const r = (v >> 16) & 0xff
  const g = (v >> 8) & 0xff
  const b = v & 0xff
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luma > 0.65
}
