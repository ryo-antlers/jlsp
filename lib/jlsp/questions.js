/**
 * JLSP 48問 (4軸 × 12問 = ±6 ずつ)。
 *
 * 軸ID: shoubu (R/E) | keiei (W/H) | kansen (U/A) | kanshin (O/F)
 *   ※ FANTYPE と完全互換
 *
 * 構成:
 *   Round 1-3 (q01-q24): FANTYPE 由来の日常質問 (各軸 ±3 = 24 問)
 *   Round 4-6 (q25-q48): JLSP 既存サッカー質問 + 新規補強 (各軸 ±3 = 24 問)
 *   各ラウンド 8 問 = 4軸 × 2方向 で 1 問ずつ
 *
 * direction = +1: 賛成すると軸の正極 (R/W/U/O) に寄る
 * direction = -1: 賛成すると軸の負極 (E/H/A/F) に寄る
 */
export const QUESTIONS = [
  // ===== Round 1 (FANTYPE 日常 #1) =====
  { id: 'q01', axis: 'shoubu',  direction: +1, statement: '旅行の計画は、効率よく回るルートを組みたい。' },
  { id: 'q02', axis: 'keiei',   direction: +1, statement: '慣れない作業は、専門家にお願いするのが一番だと思う。' },
  { id: 'q03', axis: 'kansen',  direction: +1, statement: '笑ったり泣いたり、感情が大きく動く瞬間が好きだ。' },
  { id: 'q04', axis: 'kanshin', direction: +1, statement: '興味のあることは、本筋だけ知れば満足できる。' },
  { id: 'q05', axis: 'shoubu',  direction: -1, statement: '手加減されて勝つよりも、全力で勝負して負けた方がいい。' },
  { id: 'q06', axis: 'keiei',   direction: -1, statement: '試行錯誤しながら自分でやってみる時間が好きだ。' },
  { id: 'q07', axis: 'kansen',  direction: -1, statement: '物事は、いったん頭の中で整理してから動きたい。' },
  { id: 'q08', axis: 'kanshin', direction: -1, statement: 'ハマったものは、起源や歴史まで掘り下げたくなる。' },

  // ===== Round 2 (FANTYPE 日常 #2) =====
  { id: 'q09', axis: 'shoubu',  direction: +1, statement: '何かを成し遂げた話は、過程より結果が気になる。' },
  { id: 'q10', axis: 'keiei',   direction: +1, statement: 'お金を払って手間が減るなら、迷わず払う方だ。' },
  { id: 'q11', axis: 'kansen',  direction: +1, statement: 'イベントは現地で参加してこそ、本当に楽しめる。' },
  { id: 'q12', axis: 'kanshin', direction: +1, statement: '必要のない情報は、なるべく目に入れたくない。' },
  { id: 'q13', axis: 'shoubu',  direction: -1, statement: '完璧な料理より、ちょっと焦げた家庭料理に惹かれる。' },
  { id: 'q14', axis: 'keiei',   direction: -1, statement: '急に手に入れたものより、ゆっくり馴染んだものに愛着がある。' },
  { id: 'q15', axis: 'kansen',  direction: -1, statement: '賑やかな場では、つい一歩引いてしまう。' },
  { id: 'q16', axis: 'kanshin', direction: -1, statement: '一つの作品から、関連作や監督の他作品も探したくなる。' },

  // ===== Round 3 (FANTYPE 日常 #3) =====
  { id: 'q17', axis: 'shoubu',  direction: +1, statement: '「やったかどうか」より「達成したかどうか」が大事だ。' },
  { id: 'q18', axis: 'keiei',   direction: +1, statement: '評判の高い既成品の方が、安心して選べる。' },
  { id: 'q19', axis: 'kansen',  direction: +1, statement: '楽しい場では、人より声が大きくなりがちだ。' },
  { id: 'q20', axis: 'kanshin', direction: +1, statement: 'SNS の「裏垢」みたいなものは、追わない方が幸せだと思う。' },
  { id: 'q21', axis: 'shoubu',  direction: -1, statement: '失敗からの方が、得るものが多い気がする。' },
  { id: 'q22', axis: 'keiei',   direction: -1, statement: '一気に手に入るものより、コツコツ積み上げたものに価値を感じる。' },
  { id: 'q23', axis: 'kansen',  direction: -1, statement: '周りが盛り上がっていても、自分はワンテンポ遅れることが多い。' },
  { id: 'q24', axis: 'kanshin', direction: -1, statement: '業界の裏話や、舞台裏のドキュメンタリーが好きだ。' },

  // ===== Round 4 (サッカー入門) =====
  { id: 'q25', axis: 'shoubu',  direction: +1, statement: 'スポーツ観戦は応援しているチームが勝たないと意味がない。' },
  { id: 'q26', axis: 'keiei',   direction: +1, statement: 'スター選手を獲得できるクラブのオーナーは羨ましい。' },
  { id: 'q27', axis: 'kansen',  direction: +1, statement: '試合の結果が、その後の数日の気分を左右する。' },
  { id: 'q28', axis: 'kanshin', direction: +1, statement: '観るのは試合だけで十分、移籍情報や監督人事はあまり気にしない。' },
  { id: 'q29', axis: 'shoubu',  direction: -1, statement: '内容が伴わない勝利には、あまり魅力を感じない。' },
  { id: 'q30', axis: 'keiei',   direction: -1, statement: 'お金で集めた選手より、長く尽くしてきた選手こそクラブの顔だ。' },
  { id: 'q31', axis: 'kansen',  direction: -1, statement: '試合前の戦術解説やフォーメーション図を見るのが好きだ。' },
  { id: 'q32', axis: 'kanshin', direction: -1, statement: '好きな選手の Instagram や X は欠かさず追っている。' },

  // ===== Round 5 (サッカー中盤) =====
  { id: 'q33', axis: 'shoubu',  direction: +1, statement: 'オウンゴールでの得点も心から喜べるタイプだ。' },
  { id: 'q34', axis: 'keiei',   direction: +1, statement: 'オーナー企業の資金力こそ、クラブの強さを支える土台だ。' },
  { id: 'q35', axis: 'kansen',  direction: +1, statement: 'スタンドの熱が、ピッチ上の選手を動かしていると信じている。' },
  { id: 'q36', axis: 'kanshin', direction: +1, statement: '結果さえ追えれば、選手の SNS や生活までは知らなくていい。' },
  { id: 'q37', axis: 'shoubu',  direction: -1, statement: '退屈な 1-0 の勝利より、見応えのある 2-3 の敗北のほうが観ていて楽しい。' },
  { id: 'q38', axis: 'keiei',   direction: -1, statement: '親会社のマネーで急に強くなったクラブには、複雑な気持ちになる。' },
  { id: 'q39', axis: 'kansen',  direction: -1, statement: '試合観戦は家族や友人とまったりした時間として楽しみたい。' },
  { id: 'q40', axis: 'kanshin', direction: -1, statement: 'クラブの歴史やエンブレムの由来を語れる方だ。' },

  // ===== Round 6 (サッカー仕上げ) =====
  { id: 'q41', axis: 'shoubu',  direction: +1, statement: 'ホームのボールボーイは、自チームに有利に動いていい。' },
  { id: 'q42', axis: 'keiei',   direction: +1, statement: '海外でプレーしていた有名な選手をスタジアムで観たい。' },
  { id: 'q43', axis: 'kansen',  direction: +1, statement: 'クラブのために声を出し続けるのがサポーターの役目だと思う。' },
  { id: 'q44', axis: 'kanshin', direction: +1, statement: 'オフシーズンは別のスポーツや趣味に切り替えるタイプだ。' },
  { id: 'q45', axis: 'shoubu',  direction: -1, statement: '勝った試合でも、相手監督に「内容では負けていなかった」と言われると悔しい。' },
  { id: 'q46', axis: 'keiei',   direction: -1, statement: '移籍市場で大物を獲るより、現有戦力の成長を見たい。' },
  { id: 'q47', axis: 'kansen',  direction: -1, statement: '毎試合満員になるよりも、前日でもチケットが購入できる方がいい。' },
  { id: 'q48', axis: 'kanshin', direction: -1, statement: '試合がない日も、クラブのドキュメンタリーやインタビュー記事を読む。' },
]
