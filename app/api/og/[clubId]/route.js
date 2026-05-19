import { ImageResponse } from 'next/og'
import { CLUBS, ALL_CLUBS } from '@/lib/jlsp/clubs'

export const runtime = 'edge'

// 1200×630 OGP 画像。クラブカラーを背景に、白文字でクラブ名を大きく表示する。
export async function GET(_req, { params }) {
  const { clubId } = await params
  // CLUBS (J1+J2) を優先しつつ、ALL_CLUBS にもフォールバック (旧シェアの retention)
  const club = CLUBS.find((c) => c.id === clubId) ?? ALL_CLUBS.find((c) => c.id === clubId)

  if (!club) {
    return new Response('Not Found', { status: 404 })
  }

  const isLight = isLightColor(club.color)
  const fg = isLight ? '#0a0a0a' : '#ffffff'
  const fgMuted = isLight ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px 90px',
          background: club.color,
          color: fg,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 26,
              letterSpacing: 8,
              fontWeight: 700,
              opacity: 0.85,
              textTransform: 'uppercase',
            }}
          >
            JLSP · Your Club
          </div>
          <div
            style={{
              marginTop: 18,
              fontSize: 32,
              fontWeight: 700,
              opacity: 0.85,
            }}
          >
            あなたが好きになるJリーグクラブは
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 110,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {club.name}
          </div>
          <div style={{ marginTop: 22, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 26,
                fontWeight: 800,
                padding: '8px 18px',
                borderRadius: 999,
                background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.18)',
              }}
            >
              {club.division}
            </span>
            <span style={{ fontSize: 26, fontWeight: 700, opacity: 0.85 }}>
              {club.region}・{club.prefecture}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 22,
            color: fgMuted,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          <span>Jリーグ クラブ相性診断</span>
          <span>jlsp.jleakstats.com</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  )
}

/**
 * HEX カラーが明るい色か判定 (テキストを黒/白どちらにするか決めるのに使う)。
 */
function isLightColor(hex) {
  const m = hex.match(/^#([0-9a-f]{6})$/i)
  if (!m) return false
  const v = parseInt(m[1], 16)
  const r = (v >> 16) & 0xff
  const g = (v >> 8) & 0xff
  const b = v & 0xff
  // ITU-R BT.601 luma
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luma > 0.65
}
