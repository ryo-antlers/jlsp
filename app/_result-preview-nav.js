import Link from 'next/link'

/**
 * 結果ページデザイン比較用の右下 fixed ナビ。確定後は削除する想定。
 */
export default function ResultPreviewNav({ current, clubId, a }) {
  const items = [
    { key: 'z', label: 'Z', href: `/result/${clubId}?a=${a}` },
    { key: 'a', label: 'A', href: `/design/result-a/${clubId}?a=${a}` },
    { key: 'b', label: 'B', href: `/design/result-b/${clubId}?a=${a}` },
    { key: 'c', label: 'C', href: `/design/result-c/${clubId}?a=${a}` },
  ]
  return (
    <nav
      aria-label="result design preview"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 50,
        display: 'flex',
        gap: 6,
        padding: '6px 10px',
        borderRadius: 999,
        background: 'rgba(20,20,22,0.86)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        fontSize: 11,
        fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
        letterSpacing: '0.1em',
        color: '#fff',
      }}
    >
      <span style={{ opacity: 0.55, alignSelf: 'center', paddingRight: 4 }}>RESULT</span>
      {items.map((item) => {
        const isCurrent = item.key === current
        return (
          <Link
            key={item.key}
            href={item.href}
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              background: isCurrent ? '#fff' : 'transparent',
              color: isCurrent ? '#0a0a0a' : '#fff',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'background 0.2s ease, color 0.2s ease',
            }}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
