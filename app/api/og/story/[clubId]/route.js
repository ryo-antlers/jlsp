import { ImageResponse } from 'next/og'
import { CLUBS, ALL_CLUBS } from '@/lib/jlsp/clubs'
import { decodeAnswers, matchClubs } from '@/lib/jlsp/diagnose'

export const runtime = 'edge'

/**
 * 1080×1920 (9:16) の Instagram ストーリー用 OGP 画像。
 * クラブカラー背景に、クラブ名 + 相性% + タイプを大きく表示。
 *
 * ?a= が指定されていれば user-specific (% match + FANTYPE)、
 * なければクラブ単独の宣材っぽい画像になる。
 */
export async function GET(req, { params }) {
  const { clubId } = await params
  const club = CLUBS.find((c) => c.id === clubId) ?? ALL_CLUBS.find((c) => c.id === clubId)
  if (!club) return new Response('Not Found', { status: 404 })

  const { searchParams } = new URL(req.url)
  const a = searchParams.get('a')

  let pctVal = null
  if (a) {
    const answers = decodeAnswers(a)
    if (answers) {
      const all = matchClubs(answers, CLUBS.length)
      const mine = all.find((m) => m.club.id === clubId)
      if (mine) pctVal = Math.round(mine.score * 100)
    }
  }

  const isLight = isLightColor(club.color)
  const fg = isLight ? '#0a0a0a' : '#ffffff'
  const chipBg = isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.20)'
  const dividerBg = isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.25)'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: club.color,
          color: fg,
          padding: '90px 70px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top: JLSP */}
        <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 12, opacity: 0.9 }}>
          JLSP
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 90,
            fontSize: 44,
            fontWeight: 700,
            opacity: 0.85,
            lineHeight: 1.4,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>あなたが好きになる</span>
          <span>J リーグクラブは</span>
        </div>

        {/* Club name */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            fontSize: club.name.length > 8 ? 100 : club.name.length > 6 ? 130 : 160,
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: -3,
          }}
        >
          {club.name}
        </div>

        {/* Chips */}
        <div
          style={{
            marginTop: 36,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            fontSize: 38,
            fontWeight: 700,
            opacity: 0.85,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ padding: '12px 26px', borderRadius: 999, background: chipBg }}>
            {club.division}
          </span>
          <span>{club.region}・{club.prefecture}</span>
        </div>

        {/* Match info */}
        {pctVal != null && (
          <div
            style={{
              marginTop: 80,
              paddingTop: 60,
              borderTop: `3px solid ${dividerBg}`,
              display: 'flex',
              flexDirection: 'column',
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 28, fontWeight: 700, opacity: 0.7, marginBottom: 8 }}>
              MATCH
            </span>
            <span style={{ fontSize: 200, fontWeight: 900 }}>
              {pctVal}
              <span style={{ fontSize: 80, marginLeft: 8, opacity: 0.7 }}>%</span>
            </span>
          </div>
        )}

        {/* Bottom URL */}
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 30, fontWeight: 700, opacity: 0.75, letterSpacing: 1 }}>
            jlsp.jleakstats.com
          </span>
          <span style={{ fontSize: 24, opacity: 0.5, marginLeft: 'auto', letterSpacing: 6 }}>
            STORY · 9:16
          </span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    },
  )
}

function isLightColor(hex) {
  const m = (hex || '').match(/^#([0-9a-f]{6})$/i)
  if (!m) return false
  const v = parseInt(m[1], 16)
  const r = (v >> 16) & 0xff
  const g = (v >> 8) & 0xff
  const b = v & 0xff
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65
}
