import Link from 'next/link'

export const metadata = {
  title: 'プライバシーポリシー・運営者情報 | JLSP',
  description: 'JLSP（Jリーグ クラブ相性診断）のプライバシーポリシーと運営者情報。',
}

const UPDATED = '2026年6月28日'
const CONTACT = 'bambooinside.app@gmail.com'

function Section({ title, children }) {
  return (
    <section className="mt-10">
      <h2 className="text-base font-bold text-[var(--foreground)] mb-3">{title}</h2>
      <div className="text-sm leading-[1.9] text-[var(--muted)] space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-5 py-16 sm:py-20">
      <p className="text-[10px] font-mono tracking-[0.3em] text-[var(--muted)] mb-2">JLSP</p>
      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--foreground)]">
        プライバシーポリシー・運営者情報
      </h1>
      <p className="mt-3 text-xs text-[var(--muted)]">最終更新日: {UPDATED}</p>

      <Section title="運営者情報">
        <p>
          サイト名: JLSP（Jリーグ クラブ相性診断）<br />
          運営者: JLSP運営<br />
          連絡先: <a className="underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </Section>

      <Section title="本サービスについて">
        <p>
          JLSP は、質問への回答からあなたに合う Jリーグのクラブを提案する、非公式の診断コンテンツです。
          公益社団法人日本プロサッカーリーグ（Jリーグ）、各クラブ、その他の関連団体とは一切関係ありません。
        </p>
      </Section>

      <Section title="アクセス解析について">
        <p>
          当サイトは、サイトの利用状況を把握するためにアクセス解析ツール（Vercel Analytics）を利用しています。
          これにより、ページの閲覧数や参照元などの統計情報を、個人を特定しない形で収集します。
        </p>
      </Section>

      <Section title="アフィリエイトプログラムについて">
        <p>
          当サイトは、第三者が提供するアフィリエイトプログラム（バリューコマース、アクセストレード、
          ドコモアフィリエイト等）を利用しており、掲載する広告（宿泊・レンタカー・動画配信・物販などのリンク）を
          経由した申込・購入により、運営者が成果報酬を受け取ることがあります。
        </p>
        <p>
          これらのプログラムでは、広告効果の測定のために Cookie 等を利用して利用者のアクセス情報を取得する場合が
          あります。取得される情報や利用目的の詳細は、各プログラム提供事業者のプライバシーポリシーをご確認ください。
        </p>
      </Section>

      <Section title="個人情報の取り扱い">
        <p>
          当サイトでは、お問い合わせ等を通じて取得した個人情報（メールアドレス等）を適切に管理し、
          ご本人の同意なく第三者に開示・提供することはありません。
        </p>
      </Section>

      <Section title="免責事項">
        <p>
          診断結果および掲載情報の正確性・完全性について保証するものではありません。
          当サイトの利用により生じたいかなる損害についても、運営者は責任を負いません。
        </p>
        <p>
          当サイトからリンクする外部サイトの内容については、各サイトの運営者が責任を負うものとし、
          当サイトは責任を負いません。
        </p>
      </Section>

      <Section title="著作権について">
        <p>
          クラブ名・エンブレム・選手名等に関する権利は、それぞれの権利者に帰属します。
        </p>
      </Section>

      <Section title="本ポリシーの改定">
        <p>本ポリシーの内容は、予告なく変更されることがあります。</p>
      </Section>

      <div className="mt-14 pt-8 border-t border-[var(--border)]">
        <Link href="/" className="text-sm underline text-[var(--muted)] hover:text-[var(--foreground)]">
          ← トップへ戻る
        </Link>
      </div>
    </main>
  )
}
