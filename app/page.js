import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16">
      <main className="w-full max-w-xl text-center">
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
        <Link
          href="/quiz"
          className="cta-button text-base sm:text-lg px-10 py-5 rounded"
        >
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
