import Link from 'next/link'

// 検索エンジン向け構造化データ（画面には表示されない）。
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'JLSP',
      alternateName: 'JLSP — Jリーグ クラブ相性診断',
      url: 'https://jlsp.jleakstats.com',
      inLanguage: 'ja',
    },
    {
      '@type': 'WebApplication',
      name: 'JLSP — Jリーグ クラブ相性診断',
      url: 'https://jlsp.jleakstats.com',
      description:
        '高まったサッカー熱、次はJリーグで。価値観や好みから、あなたが本当に好きになるクラブを診断します。',
      applicationCategory: 'EntertainmentApplication',
      operatingSystem: 'Web',
      inLanguage: 'ja',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
    },
  ],
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <main className="w-full max-w-xl text-center">
        <p className="text-6xl sm:text-8xl font-black tracking-[0.12em] text-[var(--foreground)] mb-8 sm:mb-10 select-none">
          <span className="jlsp-letter">J</span>
          <span className="jlsp-letter">L</span>
          <span className="jlsp-letter">S</span>
          <span className="jlsp-letter">P</span>
        </p>
        <h1 className="text-3xl sm:text-5xl font-black leading-[1.25] mb-10 tracking-tight">
          <span className="club-color-cycle">あなたのクラブ</span>を<br className="sm:hidden" />見つける
        </h1>
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
