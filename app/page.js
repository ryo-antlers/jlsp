import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16 relative">
      <div className="speed-lines" aria-hidden="true">
        <div className="line r" style={{ top: '12%', width: '320px', '--dur': '2.4s', '--delay': '0s' }} />
        <div className="line l" style={{ top: '22%', width: '180px', '--dur': '3.6s', '--delay': '0.8s' }} />
        <div className="line r" style={{ top: '34%', width: '240px', '--dur': '3.0s', '--delay': '1.4s' }} />
        <div className="line l" style={{ top: '46%', width: '300px', '--dur': '2.6s', '--delay': '0.2s' }} />
        <div className="line r" style={{ top: '58%', width: '160px', '--dur': '3.8s', '--delay': '2.0s' }} />
        <div className="line l" style={{ top: '70%', width: '260px', '--dur': '2.8s', '--delay': '0.6s' }} />
        <div className="line r" style={{ top: '82%', width: '220px', '--dur': '3.2s', '--delay': '1.6s' }} />
        <div className="line l" style={{ top: '92%', width: '140px', '--dur': '2.2s', '--delay': '1.0s' }} />
      </div>
      <main className="w-full max-w-xl text-center relative z-10">
        <p className="text-6xl sm:text-8xl font-black tracking-[0.12em] text-[var(--foreground)] mb-8 sm:mb-10 select-none">
          <span className="jlsp-letter">J</span>
          <span className="jlsp-letter">L</span>
          <span className="jlsp-letter">S</span>
          <span className="jlsp-letter">P</span>
        </p>
        <h1 className="text-3xl sm:text-5xl font-black leading-[1.25] mb-6 tracking-tight">
          <span className="club-color-cycle">あなたのクラブ</span>を<br className="sm:hidden" />見つける
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] mb-10 leading-relaxed">
          W杯や海外サッカーで目覚めたサッカー熱、<br className="hidden sm:inline" />
          次は J リーグでも。
        </p>
        <Link href="/quiz" className="cta-button">
          診断する
        </Link>
        <p className="mt-16 text-[10px] text-[var(--muted)] leading-relaxed">
          本サービスは非公式の診断コンテンツです。<br />
          J リーグ、各クラブ、関連団体とは一切関係ありません。
        </p>
      </main>
    </div>
  )
}
