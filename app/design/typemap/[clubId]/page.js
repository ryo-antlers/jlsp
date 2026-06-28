import Link from 'next/link'
import { notFound } from 'next/navigation'
import { loadResultData } from '@/lib/jlsp/result-page-data'
import { AXES } from '@/lib/jlsp/axes'

export const dynamic = 'force-dynamic'

// 廃止した性格タイプの社内プレビュー。検索インデックス除外。
export const metadata = { robots: { index: false, follow: false } }

const VARIANTS = [
  { id: 'A', name: 'Radar (現状)', desc: '4スポーク・蜘蛛の巣型ポリゴン。MBTI 系定番' },
  { id: 'B', name: 'Parallel Coordinates', desc: '4 本の垂直軸を線で繋ぐ。Bloomberg 風データ可視化' },
  { id: 'C', name: 'Diverging Bars (人口ピラミッド型)', desc: '中央 0 起点で左右に伸びる横棒。一致のズレが直感的' },
  { id: 'D', name: 'Petal / Flower', desc: '4 弁の花。各弁の長さ=スコア、向きで正極/負極' },
  { id: 'E', name: 'Type Grid (16 セル)', desc: '4×4 グリッドで 16 タイプ、近いタイプも視認' },
]

export default async function TypemapPreview({ params, searchParams }) {
  const { clubId } = await params
  const sp = (await searchParams) ?? {}
  const a = typeof sp.a === 'string' ? sp.a : null
  const data = await loadResultData({ clubId, a })
  if (!data) notFound()
  const { top1, userVector, userTypeCode } = data
  const clubColor = top1.club.color

  return (
    <div className="min-h-screen bg-[#fafaf7] text-[#0e0e10] px-5 sm:px-10 py-10">
      <header className="max-w-3xl mx-auto mb-10">
        <Link href={`/result/${clubId}?a=${a}`} className="text-xs font-mono tracking-[0.3em] text-zinc-500 hover:text-zinc-900">
          ← 結果ページに戻る
        </Link>
        <h1 className="mt-6 text-3xl sm:text-5xl font-black tracking-[-0.02em] leading-tight">
          TYPE MAP <span className="text-zinc-400">/</span> 5 案
        </h1>
        <p className="mt-3 text-sm text-zinc-600">
          サンプル: {userTypeCode} × {top1.club.name}
        </p>
      </header>

      <div className="max-w-3xl mx-auto space-y-16">
        {VARIANTS.map((v) => (
          <article key={v.id}>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-xs font-mono tracking-[0.3em] text-zinc-500">CASE {v.id}</span>
              <h2 className="text-xl font-black">{v.name}</h2>
            </div>
            <p className="text-xs text-zinc-600 mb-5">{v.desc}</p>
            <div className="border border-black/10 rounded-lg p-6 sm:p-8 bg-white">
              {v.id === 'A' && <PlotA userVector={userVector} clubVector={top1.club.vector} clubColor={clubColor} />}
              {v.id === 'B' && <PlotB userVector={userVector} clubVector={top1.club.vector} clubColor={clubColor} />}
              {v.id === 'C' && <PlotC userVector={userVector} clubVector={top1.club.vector} clubColor={clubColor} />}
              {v.id === 'D' && <PlotD userVector={userVector} clubVector={top1.club.vector} clubColor={clubColor} />}
              {v.id === 'E' && <PlotE userTypeCode={userTypeCode} clubVector={top1.club.vector} clubColor={clubColor} />}
            </div>
          </article>
        ))}

        <div className="text-center pt-8">
          <Link href={`/result/${clubId}?a=${a}`} className="cta-button">結果ページに戻る</Link>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ */
/* CASE A: Radar (現状)                                          */
/* ------------------------------------------------------------ */
function PlotA({ userVector, clubVector, clubColor }) {
  const R = 44
  const AXES_DEF = [
    { id: 'shoubu',  angle: 0,   posLetter: 'R', negLetter: 'E' },
    { id: 'kansen',  angle: 45,  posLetter: 'U', negLetter: 'A' },
    { id: 'keiei',   angle: 90,  posLetter: 'W', negLetter: 'H' },
    { id: 'kanshin', angle: 135, posLetter: 'O', negLetter: 'F' },
  ]
  const clamp = (v) => Math.max(-1, Math.min(1, v))
  function pointOf(score, baseAngle) {
    const s = clamp(score)
    const actualAngle = s >= 0 ? baseAngle : baseAngle + 180
    const dist = Math.abs(s) * R
    const rad = (actualAngle * Math.PI) / 180
    return { x: dist * Math.cos(rad), y: -dist * Math.sin(rad) }
  }
  function polyStr(pts) {
    const sorted = [...pts].sort((a, b) => Math.atan2(-a.y, a.x) - Math.atan2(-b.y, b.x))
    return sorted.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  }
  const up = AXES_DEF.map((a) => pointOf(userVector[a.id] / 18, a.angle))
  const cp = AXES_DEF.map((a) => pointOf(clubVector[a.id] / 2, a.angle))
  return (
    <svg viewBox="-58 -58 116 116" className="w-full max-w-md mx-auto h-auto block">
      {[11, 22, 33, 44].map((r) => <circle key={r} cx="0" cy="0" r={r} fill="none" stroke="#0e0e10" strokeOpacity="0.07" strokeWidth="0.35" />)}
      {AXES_DEF.map((a) => {
        const rad = (a.angle * Math.PI) / 180
        const x = R * Math.cos(rad), y = -R * Math.sin(rad)
        return <line key={a.id} x1={-x} y1={-y} x2={x} y2={y} stroke="#0e0e10" strokeOpacity="0.18" strokeWidth="0.4" />
      })}
      {AXES_DEF.flatMap((a) => {
        const rad = (a.angle * Math.PI) / 180
        const lx = 52 * Math.cos(rad), ly = -52 * Math.sin(rad)
        return [
          <text key={`${a.id}+`} x={lx} y={ly + 2} fontSize="7" textAnchor="middle" fontWeight="900" fill="#0e0e10" opacity="0.85" fontFamily="monospace">{a.posLetter}</text>,
          <text key={`${a.id}-`} x={-lx} y={-ly + 2} fontSize="7" textAnchor="middle" fontWeight="900" fill="#0e0e10" opacity="0.5" fontFamily="monospace">{a.negLetter}</text>,
        ]
      })}
      <polygon points={polyStr(cp)} fill={clubColor} fillOpacity="0.22" stroke={clubColor} strokeWidth="1.3" />
      <polygon points={polyStr(up)} fill="#0e0e10" fillOpacity="0.16" stroke="#0e0e10" strokeWidth="1.2" />
    </svg>
  )
}

/* ------------------------------------------------------------ */
/* CASE B: Parallel Coordinates                                  */
/* ------------------------------------------------------------ */
function PlotB({ userVector, clubVector, clubColor }) {
  const AXES_DEF = [
    { id: 'shoubu',  posLetter: 'R', negLetter: 'E', label: '勝負' },
    { id: 'keiei',   posLetter: 'W', negLetter: 'H', label: '経営' },
    { id: 'kansen',  posLetter: 'U', negLetter: 'A', label: '観戦' },
    { id: 'kanshin', posLetter: 'O', negLetter: 'F', label: '関心' },
  ]
  const clamp = (v) => Math.max(-1, Math.min(1, v))
  // 4 axes at x = 12, 38, 64, 90 in a 100x80 coordinate space
  const xs = [12, 38, 64, 90]
  const userYs = AXES_DEF.map((a) => 40 - clamp(userVector[a.id] / 18) * 30)
  const clubYs = AXES_DEF.map((a) => 40 - clamp(clubVector[a.id] / 2) * 30)
  return (
    <svg viewBox="0 0 100 80" className="w-full max-w-2xl mx-auto h-auto block">
      {/* axis lines */}
      {xs.map((x, i) => (
        <g key={i}>
          <line x1={x} y1="8" x2={x} y2="72" stroke="#0e0e10" strokeOpacity="0.2" strokeWidth="0.4" />
          {/* tick marks */}
          {[16, 28, 40, 52, 64].map((y) => (
            <line key={y} x1={x - 1} y1={y} x2={x + 1} y2={y} stroke="#0e0e10" strokeOpacity="0.12" strokeWidth="0.3" />
          ))}
          <text x={x} y="6" fontSize="3.5" textAnchor="middle" fontWeight="900" fontFamily="monospace" opacity="0.85">{AXES_DEF[i].posLetter}</text>
          <text x={x} y="78" fontSize="3.5" textAnchor="middle" fontWeight="900" fontFamily="monospace" opacity="0.5">{AXES_DEF[i].negLetter}</text>
          <text x={x} y="76" fontSize="2.6" textAnchor="middle" opacity="0.4">{AXES_DEF[i].label}</text>
        </g>
      ))}
      <line x1="8" y1="40" x2="94" y2="40" stroke="#0e0e10" strokeOpacity="0.15" strokeWidth="0.3" strokeDasharray="1 1" />
      {/* club line (背景) */}
      <polyline points={clubYs.map((y, i) => `${xs[i]},${y}`).join(' ')} fill="none" stroke={clubColor} strokeWidth="1.4" strokeOpacity="0.85" strokeLinecap="round" strokeLinejoin="round" />
      {clubYs.map((y, i) => <circle key={`c${i}`} cx={xs[i]} cy={y} r="1.6" fill={clubColor} stroke="#fafaf7" strokeWidth="0.4" />)}
      {/* user line */}
      <polyline points={userYs.map((y, i) => `${xs[i]},${y}`).join(' ')} fill="none" stroke="#0e0e10" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {userYs.map((y, i) => <circle key={`u${i}`} cx={xs[i]} cy={y} r="1.4" fill="#0e0e10" stroke="#fafaf7" strokeWidth="0.4" />)}
    </svg>
  )
}

/* ------------------------------------------------------------ */
/* CASE C: Diverging Bars                                        */
/* ------------------------------------------------------------ */
function PlotC({ userVector, clubVector, clubColor }) {
  const AXES_DEF = [
    { id: 'shoubu',  posLetter: 'R', negLetter: 'E', label: '勝負観' },
    { id: 'keiei',   posLetter: 'W', negLetter: 'H', label: '経営観' },
    { id: 'kansen',  posLetter: 'U', negLetter: 'A', label: '観戦観' },
    { id: 'kanshin', posLetter: 'O', negLetter: 'F', label: '関心軸' },
  ]
  const clamp = (v) => Math.max(-1, Math.min(1, v))
  return (
    <div className="space-y-7">
      {AXES_DEF.map((a) => {
        const userN = clamp(userVector[a.id] / 18)
        const clubN = clamp(clubVector[a.id] / 2)
        const userPctAbs = Math.abs(userN) * 50
        const clubPctAbs = Math.abs(clubN) * 50
        return (
          <div key={a.id}>
            <div className="flex justify-between text-[10px] font-mono mb-1.5">
              <span className="font-bold">{a.negLetter} <span className="text-zinc-500 ml-1">{a.label}</span></span>
              <span className="font-bold text-right">{a.posLetter}</span>
            </div>
            {/* user row */}
            <div className="relative h-3 mb-1">
              <span className="absolute left-1/2 top-0 bottom-0 w-px bg-black/30" />
              {userN >= 0 ? (
                <span className="absolute top-0 bottom-0 bg-[#0e0e10] rounded-r" style={{ left: '50%', width: `${userPctAbs}%` }} />
              ) : (
                <span className="absolute top-0 bottom-0 bg-[#0e0e10] rounded-l" style={{ right: '50%', width: `${userPctAbs}%` }} />
              )}
            </div>
            {/* club row */}
            <div className="relative h-3">
              <span className="absolute left-1/2 top-0 bottom-0 w-px bg-black/30" />
              {clubN >= 0 ? (
                <span className="absolute top-0 bottom-0 rounded-r" style={{ left: '50%', width: `${clubPctAbs}%`, backgroundColor: clubColor, opacity: 0.85 }} />
              ) : (
                <span className="absolute top-0 bottom-0 rounded-l" style={{ right: '50%', width: `${clubPctAbs}%`, backgroundColor: clubColor, opacity: 0.85 }} />
              )}
            </div>
          </div>
        )
      })}
      <div className="flex gap-3 text-[10px] font-mono text-zinc-500 mt-4">
        <span className="flex items-center gap-1.5"><span className="w-3 h-2 bg-[#0e0e10] rounded" />you</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded" style={{ backgroundColor: clubColor }} />club</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ */
/* CASE D: Petal / Flower                                        */
/* ------------------------------------------------------------ */
function PlotD({ userVector, clubVector, clubColor }) {
  const AXES_DEF = [
    { id: 'shoubu',  angle: 0,   posLetter: 'R', negLetter: 'E' },
    { id: 'kansen',  angle: 45,  posLetter: 'U', negLetter: 'A' },
    { id: 'keiei',   angle: 90,  posLetter: 'W', negLetter: 'H' },
    { id: 'kanshin', angle: 135, posLetter: 'O', negLetter: 'F' },
  ]
  const clamp = (v) => Math.max(-1, Math.min(1, v))
  const RMAX = 44

  function petalPath(score, baseAngle, scale) {
    const s = clamp(score)
    const actualAngle = s >= 0 ? baseAngle : baseAngle + 180
    const dist = Math.abs(s) * RMAX * scale
    const rad = (actualAngle * Math.PI) / 180
    const tipX = dist * Math.cos(rad)
    const tipY = -dist * Math.sin(rad)
    // Two control points to form a leaf-like petal
    const w = dist * 0.35
    const perpRad = rad + Math.PI / 2
    const ctrl1X = (tipX / 2) + w * Math.cos(perpRad)
    const ctrl1Y = (tipY / 2) - w * Math.sin(perpRad)
    const ctrl2X = (tipX / 2) - w * Math.cos(perpRad)
    const ctrl2Y = (tipY / 2) + w * Math.sin(perpRad)
    return `M 0 0 Q ${ctrl1X.toFixed(2)} ${ctrl1Y.toFixed(2)} ${tipX.toFixed(2)} ${tipY.toFixed(2)} Q ${ctrl2X.toFixed(2)} ${ctrl2Y.toFixed(2)} 0 0 Z`
  }

  return (
    <svg viewBox="-58 -58 116 116" className="w-full max-w-md mx-auto h-auto block">
      <circle cx="0" cy="0" r={RMAX} fill="none" stroke="#0e0e10" strokeOpacity="0.06" strokeWidth="0.3" />
      {/* club petals (背景) */}
      {AXES_DEF.map((a) => (
        <path key={`c${a.id}`} d={petalPath(clubVector[a.id] / 2, a.angle, 1)} fill={clubColor} fillOpacity="0.3" stroke={clubColor} strokeWidth="0.8" />
      ))}
      {/* user petals */}
      {AXES_DEF.map((a) => (
        <path key={`u${a.id}`} d={petalPath(userVector[a.id] / 18, a.angle, 1)} fill="#0e0e10" fillOpacity="0.25" stroke="#0e0e10" strokeWidth="0.7" />
      ))}
      <circle cx="0" cy="0" r="2" fill="#fafaf7" stroke="#0e0e10" strokeWidth="0.6" />
      {AXES_DEF.flatMap((a) => {
        const rad = (a.angle * Math.PI) / 180
        const lx = 52 * Math.cos(rad), ly = -52 * Math.sin(rad)
        return [
          <text key={`${a.id}+`} x={lx} y={ly + 2} fontSize="7" textAnchor="middle" fontWeight="900" fill="#0e0e10" opacity="0.85" fontFamily="monospace">{a.posLetter}</text>,
          <text key={`${a.id}-`} x={-lx} y={-ly + 2} fontSize="7" textAnchor="middle" fontWeight="900" fill="#0e0e10" opacity="0.5" fontFamily="monospace">{a.negLetter}</text>,
        ]
      })}
    </svg>
  )
}

/* ------------------------------------------------------------ */
/* CASE E: Type Grid (16 セル)                                   */
/* ------------------------------------------------------------ */
function PlotE({ userTypeCode, clubVector, clubColor }) {
  // 16 types: 4 letters from RE/WH/UA/OF
  // Build 4x4 grid: rows = shoubu × keiei (RW, RH, EW, EH), cols = kansen × kanshin (UO, UF, AO, AF)
  const rows = [
    { sk: 'RW', label: 'R / W' },
    { sk: 'RH', label: 'R / H' },
    { sk: 'EW', label: 'E / W' },
    { sk: 'EH', label: 'E / H' },
  ]
  const cols = [
    { kk: 'UO', label: 'U / O' },
    { kk: 'UF', label: 'U / F' },
    { kk: 'AO', label: 'A / O' },
    { kk: 'AF', label: 'A / F' },
  ]
  function letterDistance(a, b) {
    let d = 0
    for (let i = 0; i < 4; i++) if (a[i] !== b[i]) d++
    return d
  }
  // club's typeCode (closest type based on its vector)
  const clubCode =
    (clubVector.shoubu  >= 0 ? 'R' : 'E') +
    (clubVector.keiei   >= 0 ? 'W' : 'H') +
    (clubVector.kansen  >= 0 ? 'U' : 'A') +
    (clubVector.kanshin >= 0 ? 'O' : 'F')
  return (
    <div className="grid grid-cols-4 gap-2">
      {rows.map((r) => cols.map((c) => {
        const code = r.sk[0] + r.sk[1] + c.kk[0] + c.kk[1]
        const isYou = code === userTypeCode
        const isClub = code === clubCode
        const d = letterDistance(code, userTypeCode)
        const opacity = isYou ? 1 : 1 - d * 0.18
        return (
          <div
            key={code}
            className="aspect-square rounded p-2 flex flex-col items-center justify-center text-center"
            style={{
              border: isYou ? `2px solid #0e0e10` : isClub ? `2px solid ${clubColor}` : '1px solid rgba(0,0,0,0.08)',
              backgroundColor: isYou ? '#0e0e10' : isClub ? `${clubColor}22` : 'transparent',
              opacity,
            }}
          >
            <p className="text-xs font-black font-mono tracking-[0.05em]" style={{ color: isYou ? '#fafaf7' : isClub ? clubColor : '#0e0e10' }}>
              {code}
            </p>
            {isYou && <p className="text-[8px] font-mono mt-1 text-[#fafaf7] opacity-80">YOU</p>}
            {isClub && !isYou && <p className="text-[8px] font-mono mt-1" style={{ color: clubColor }}>CLUB</p>}
          </div>
        )
      })).flat()}
    </div>
  )
}
