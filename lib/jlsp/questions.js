/**
 * 48問のリッカート尺度 (ハイブリッド構成)。各設問は「断定文」で、ユーザーは賛成(+3)〜中立(0)〜反対(-3)で回答する。
 * direction = +1: 賛成するほど軸の正極(R/S/W/F)に寄る
 * direction = -1: 賛成するほど軸の負極(E/I/H/U)に寄る
 *
 * 配列順は 8問1ラウンド × 6ラウンド。
 *   - Round 1-2 (w01–w16): 日常質問のウォームアップ。サッカー知識を要しない。
 *   - Round 3-6 (q01–q32): サッカー濃度高めの設問。
 * 1ラウンドに4軸 × 両方向 (+ −) の全8パターンが揃うので、1ページ(=1ラウンド)に全軸が登場する。
 * 各方向は warm-up 2問ずつ + soccer 4問ずつ = 計 6 問ずつ。
 */
export const QUESTIONS = [
  // ===== Round 1 (warm-up, w01–w08) — 日常質問 =====
  { id: 'w01', axis: 'shoubu',  direction: +1, statement: 'ゲームでも勝負事は本気で勝ちにいきたい。' },
  { id: 'w02', axis: 'soshiki', direction: +1, statement: 'チームでの仕事は、みんなで足並みを揃えるのが好きだ。' },
  { id: 'w03', axis: 'keiei',   direction: +1, statement: '高くてもブランド品の方が安心して使える。' },
  { id: 'w04', axis: 'nekkyou', direction: +1, statement: '休日はカフェや散歩でのんびり過ごしたい。' },
  { id: 'w05', axis: 'shoubu',  direction: -1, statement: 'プロセスが面白ければ、勝ち負けはあまり気にならない。' },
  { id: 'w06', axis: 'soshiki', direction: -1, statement: '飛び抜けた個性を持つ仲間に惹かれる。' },
  { id: 'w07', axis: 'keiei',   direction: -1, statement: '長く使い込んだものほど愛着が湧く。' },
  { id: 'w08', axis: 'nekkyou', direction: -1, statement: 'フェスやライブで全身で声を出すのが好きだ。' },

  // ===== Round 2 (warm-up, w09–w16) — 日常質問 =====
  { id: 'w09', axis: 'shoubu',  direction: +1, statement: '部活や習い事は、強いところに入りたい。' },
  { id: 'w10', axis: 'soshiki', direction: +1, statement: '一糸乱れぬダンスや行進を見るとぐっとくる。' },
  { id: 'w11', axis: 'keiei',   direction: +1, statement: '投資や経済ニュースは普段からチェックしている。' },
  { id: 'w12', axis: 'nekkyou', direction: +1, statement: '大勢でワイワイより、静かな場所で本を読みたい。' },
  { id: 'w13', axis: 'shoubu',  direction: -1, statement: '上手いと言われるより、楽しんでいると言われたい。' },
  { id: 'w14', axis: 'soshiki', direction: -1, statement: '友達は多くなくても、刺激的な数人で十分だ。' },
  { id: 'w15', axis: 'keiei',   direction: -1, statement: '親から受け継いだものを大事に使い続けたい。' },
  { id: 'w16', axis: 'nekkyou', direction: -1, statement: '感情はあまり抑えず、表に出す方が自分らしい。' },

  // ===== Round 3 (q01–q08) — サッカー =====
  { id: 'q01', axis: 'shoubu',  direction: +1, statement: 'スポーツ観戦は応援しているチームが勝たないと意味がない。' },
  { id: 'q02', axis: 'soshiki', direction: +1, statement: '試合前の戦術解説やフォーメーション図を見るのが好きだ。' },
  { id: 'q03', axis: 'keiei',   direction: +1, statement: 'スター選手を獲得できるクラブのオーナーは羨ましい。' },
  { id: 'q04', axis: 'nekkyou', direction: +1, statement: '試合観戦は家族や友人とまったりした時間として楽しみたい。' },
  { id: 'q05', axis: 'shoubu',  direction: -1, statement: '内容が伴わない勝利には、あまり魅力を感じない。' },
  { id: 'q06', axis: 'soshiki', direction: -1, statement: '1人で局面を変えてしまう選手を目で追っかけてしまう。' },
  { id: 'q07', axis: 'keiei',   direction: -1, statement: 'お金で集めた選手より、長く尽くしてきた選手こそクラブの顔だ。' },
  { id: 'q08', axis: 'nekkyou', direction: -1, statement: '試合の結果が、その後の数日の気分を左右する。' },

  // ===== Round 4 (q09–q16) — サッカー =====
  { id: 'q09', axis: 'shoubu',  direction: +1, statement: '監督の評価は結果が出ているかどうかだけで決まる。' },
  { id: 'q10', axis: 'soshiki', direction: +1, statement: 'ピッチ上の選手は、全員が同じ絵を共有していてほしい。' },
  { id: 'q11', axis: 'keiei',   direction: +1, statement: 'オーナー企業の資金力こそ、クラブの強さを支える土台だ。' },
  { id: 'q12', axis: 'nekkyou', direction: +1, statement: '子どもや友人を気軽に連れて行けるクラブが好きだ。' },
  { id: 'q13', axis: 'shoubu',  direction: -1, statement: '応援しているクラブが負けても、心震わせる試合なら満足できる。' },
  { id: 'q14', axis: 'soshiki', direction: -1, statement: '監督が誰であっても、スター選手がいれば結果は出る。' },
  { id: 'q15', axis: 'keiei',   direction: -1, statement: '親会社のマネーで急に強くなったクラブには、複雑な気持ちになる。' },
  { id: 'q16', axis: 'nekkyou', direction: -1, statement: '静かに見守るより、声を出して関わるほうが自分らしい。' },

  // ===== Round 5 (q17–q24) — サッカー =====
  { id: 'q17', axis: 'shoubu',  direction: +1, statement: 'オウンゴールでの得点も心から喜べるタイプだ。' },
  { id: 'q18', axis: 'soshiki', direction: +1, statement: '個人技で決まったゴールより、パスを繋いで崩した得点のほうが好きだ。' },
  { id: 'q19', axis: 'keiei',   direction: +1, statement: 'ユース・アカデミーへの巨額投資こそ、未来への先行投資だ。' },
  { id: 'q20', axis: 'nekkyou', direction: +1, statement: 'ホームゲームではスタジアムに来た対戦相手のサポーターを歓迎したい。' },
  { id: 'q21', axis: 'shoubu',  direction: -1, statement: '退屈な1-0での勝利より、見応えのある2-3の敗北のほうが観ていて楽しい。' },
  { id: 'q22', axis: 'soshiki', direction: -1, statement: '好きな選手が移籍したら、応援するクラブも変わってしまうかもしれない。' },
  { id: 'q23', axis: 'keiei',   direction: -1, statement: '移籍市場で大物を獲るより、現有戦力の成長を見たい。' },
  { id: 'q24', axis: 'nekkyou', direction: -1, statement: 'スタンドの熱が、ピッチ上の選手を動かしていると信じている。' },

  // ===== Round 6 (q25–q32) — サッカー =====
  { id: 'q25', axis: 'shoubu',  direction: +1, statement: 'ホームのボールボーイは、自チームに有利に動いていい。' },
  { id: 'q26', axis: 'soshiki', direction: +1, statement: 'クラブは監督が変わっても、サッカーの哲学が引き継がれていてほしい。' },
  { id: 'q27', axis: 'keiei',   direction: +1, statement: 'クラブ運営会社の経営力は、そのままピッチ上の力に直結する。' },
  { id: 'q28', axis: 'nekkyou', direction: +1, statement: '毎試合満員になるよりも、前日でもチケットが購入できる方がいい。' },
  { id: 'q29', axis: 'shoubu',  direction: -1, statement: '勝った試合でも、相手監督に『内容では負けていなかった』と言われると悔しい。' },
  { id: 'q30', axis: 'soshiki', direction: -1, statement: 'ファンタジスタという言葉に惹かれる。' },
  { id: 'q31', axis: 'keiei',   direction: -1, statement: 'エンブレムを変更しないことに誇りを感じる。' },
  { id: 'q32', axis: 'nekkyou', direction: -1, statement: 'クラブのために声を出し続けるのがサポーターの役目だと思う。' },
]
