import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16">
      <main className="w-full max-w-xl text-center">
        <p className="text-xs font-mono tracking-[0.3em] text-[var(--muted)] mb-6">
          JLSP
        </p>
        <h1 className="text-3xl sm:text-5xl font-black leading-[1.25] mb-6 tracking-tight">
          自分の国にも、<br />
          <span className="club-color-cycle">自分のクラブ</span>が<br />
          きっとある。
        </h1>
        <div className="text-sm sm:text-base text-[var(--muted)] mb-10 leading-relaxed space-y-4">
          <p>
            W杯や海外サッカーで目覚めたサッカー熱、<br className="hidden sm:inline" />
            次は J リーグでも。
          </p>
          <p>
            でも、20 を超えるクラブから<br className="hidden sm:inline" />
            どこを応援すればいいか、<br className="hidden sm:inline" />
            意外と決められないものです。
          </p>
          <p>
            48 問の質問にサクッと答えるだけで、<br className="hidden sm:inline" />
            J1・J2 の 40 クラブから、<br className="hidden sm:inline" />
            あなたが好きになるはずの TOP3 をご提案します。
          </p>
        </div>
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
