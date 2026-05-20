import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16">
      <main className="w-full max-w-xl text-center">
        <p className="text-xs font-mono tracking-[0.3em] text-[var(--muted)] mb-6">
          JLSP
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          あなたが好きになる<br />
          <span className="club-color-cycle">Jリーグクラブ</span>を当てる
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] mb-10 leading-relaxed">
          32問のシンプルな質問から、J1・J2の40クラブから<br className="hidden sm:inline" />あなたに合う TOP3 を診断します。
        </p>
        <Link
          href="/quiz"
          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-base sm:text-lg px-10 py-4 transition-colors shadow-sm hover:shadow"
        >
          診断スタート →
        </Link>
        <p className="mt-16 text-[10px] text-[var(--muted)] leading-relaxed">
          本サービスは非公式の診断コンテンツです。<br />
          J リーグ、各クラブ、関連団体とは一切関係ありません。
        </p>
      </main>
    </div>
  )
}
