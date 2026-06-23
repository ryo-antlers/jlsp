/**
 * JLSP クラブ相性診断 37問 (v2)。
 *
 * v1 の「4軸×性格タイプ(FANTYPE)」モデルを廃止し、クラブ相性マッチング専用に再設計。
 * 質問は軸に縛られず、それぞれが独立した観点を持つ (category はグルーピング用のタグ)。
 *
 * マッチングは diagnose.js の clubExpectedAnswer() が
 *   ① jlsp_question_overrides (クラブ×質問の値) を最優先、
 *   ② 無ければ legacyAxis があれば vector[legacyAxis]*direction、
 *   ③ それも無ければ 0
 * を返し、ユーザー回答との L1 距離でクラブを順位付けする。
 *
 * legacyAxis/direction は v1 から値が入っている質問 (勝負観/経営/熱量) のみに残す。
 * 新規質問は category だけ持ち、クラブ別の値は override (DB) で設定する。
 *
 * category: shoubu | rivalry | keiei | rank | history | stadium | style | passion | fanculture | visual | region
 */
export const QUESTIONS = [
  // ===== 勝負観 =====
  { id: 'q25', category: 'shoubu', legacyAxis: 'shoubu', direction: +1, statement: 'どんなに良い試合でも、応援するチームが負けたら意味がない。' },
  { id: 'q37', category: 'shoubu', legacyAxis: 'shoubu', direction: -1, statement: '退屈な1-0の勝利より、見応えのある2-3の敗戦の方が観ていて楽しい。' },
  { id: 'q45', category: 'shoubu', legacyAxis: 'shoubu', direction: -1, statement: '勝った試合でも「内容では負けていた」と言われると、素直に喜べない。' },
  { id: 'q41', category: 'shoubu', legacyAxis: 'shoubu', direction: +1, statement: 'ボールボーイは、ホームチームに有利に動いていい。' },
  { id: 'u14', category: 'shoubu', statement: '勝つためなら、時間稼ぎくらい当然だと思う。' },
  { id: 'u16', category: 'shoubu', statement: 'フェアプレー賞なんてもらっても嬉しくない。' },

  // ===== ライバル・ダービー =====
  { id: 'rv1', category: 'rivalry', statement: 'ダービーやライバル対決のヒリヒリした空気こそ、サッカーの醍醐味だ。' },

  // ===== 経営: 補強 ⇔ 育成 =====
  { id: 'q26', category: 'keiei', legacyAxis: 'keiei', direction: +1, statement: 'スター選手を獲得できる資金力のあるクラブを応援したい。' },
  { id: 'q42', category: 'keiei', legacyAxis: 'keiei', direction: +1, statement: '日本代表や海外でプレーしていた有名な選手を応援したい。' },
  { id: 'q18', category: 'keiei', legacyAxis: 'keiei', direction: +1, statement: '無名の若手より、実績のある完成された選手を応援したい。' },
  { id: 'q02', category: 'keiei', legacyAxis: 'keiei', direction: +1, statement: 'チームの弱点は、若手を育てるより即戦力の補強で埋めるべきだ。' },
  { id: 'g1',  category: 'keiei', statement: '大きな親会社がついている、経営の安定したクラブの方が安心だ。' },
  { id: 'q30', category: 'keiei', legacyAxis: 'keiei', direction: -1, statement: 'お金で集めた選手より、長く尽くしてきた選手こそクラブの顔だ。' },
  { id: 'q22', category: 'keiei', legacyAxis: 'keiei', direction: -1, statement: '大型補強で一気に強くなるより、地道に積み上げて強くなるクラブに価値を感じる。' },
  { id: 'x1',  category: 'keiei', statement: '高卒やユース出身の若手を、どんどん試合で起用するクラブが好きだ。' },
  { id: 'u15', category: 'keiei', statement: '他のJリーグクラブではなく、海外から獲得した助っ人選手にワクワクする。' },
  { id: 'sl1', category: 'keiei', statement: '主力が海外に引き抜かれても、それはクラブの誇りだと思える。' },
  { id: 'pt1', category: 'keiei', statement: '不振でもすぐ監督を切らず、じっくり積み上げるクラブが好きだ。' },
  { id: 'sp1', category: 'keiei', statement: '歴史ある大企業より、勢いのあるベンチャー・IT企業が支えるクラブに惹かれる。' },

  // ===== クラブの格・野心 =====
  { id: 'c4', category: 'rank', statement: '地元かどうかに関係なく、好きなクラブを選んで応援したい。' },
  { id: 'e3', category: 'rank', statement: '格上を倒す番狂わせや下剋上にこそ、興奮する。' },
  { id: 'e2',  category: 'rank', statement: '残留争いのヒリヒリした緊張感も、それはそれで楽しめる。' },
  { id: 'tt1', category: 'rank', statement: 'リーグ優勝やタイトルの数こそ、クラブの強さの証明だ。' },
  { id: 'gl1', category: 'rank', statement: 'アジアや世界の舞台で戦うことを目指すクラブにワクワクする。' },

  // ===== 歴史・伝統 =====
  { id: 'd1', category: 'history', statement: 'Jリーグ創設期から続く、伝統あるクラブに惹かれる。' },
  { id: 's4', category: 'history', statement: '伝統的なクラブカラーやエンブレムを大切に守るクラブが好きだ。' },

  // ===== スタジアム =====
  { id: 'a3', category: 'stadium', statement: '陸上トラックのない、ピッチが近い球技専用スタジアムで観たい。' },

  // ===== プレースタイル・戦術 =====
  { id: 'h1',  category: 'style', statement: '失点を恐れず、攻撃的に殴り合うサッカーが観たい。' },
  { id: 'h6',  category: 'style', statement: 'ロングボールやセットプレーを武器にするサッカーも魅力的だ。' },

  // ===== 観戦の熱量・関わり方 =====
  { id: 'q35', category: 'passion', legacyAxis: 'kansen', direction: +1, statement: 'スタンドの熱が、ピッチ上の選手を動かしていると信じている。' },

  // ===== サポーター文化 =====
  { id: 'u10', category: 'fanculture', statement: 'ブーイングという文化が、あまり好きではない。' },
  { id: 'l3',  category: 'fanculture', statement: '煽り合いより、純粋に自分のクラブを楽しみたい。' },

  // ===== ビジュアル・カルチャー =====
  { id: 'p2',  category: 'visual', statement: '試合前やハーフタイムに味わう、ご当地のスタジアムグルメも楽しみだ。' },
  { id: 'gd2', category: 'visual', statement: '毎年いろんなコラボグッズや限定アイテムを出すクラブにワクワクする。' },
  { id: 'sn5', category: 'visual', statement: 'デジタルやテクノロジーの活用に積極的なクラブに惹かれる。' },
  { id: 'mc4', category: 'visual', statement: 'ゆるくて可愛いマスコットがいるクラブに癒やされたい。' },

  // ===== 地域 =====
  { id: 'r1', category: 'region', statement: '華やかな大都市のクラブより、地方の街に根ざしたクラブに惹かれる。' },
]

/** 質問カテゴリのメタ (admin グルーピング・表示用)。 */
export const QUESTION_CATEGORIES = [
  { id: 'shoubu',     label: '勝負観' },
  { id: 'rivalry',    label: 'ライバル・ダービー' },
  { id: 'keiei',      label: '経営（補強⇔育成）' },
  { id: 'rank',       label: 'クラブの格・野心' },
  { id: 'history',    label: '歴史・伝統' },
  { id: 'stadium',    label: 'スタジアム' },
  { id: 'style',      label: 'プレースタイル' },
  { id: 'passion',    label: '観戦の熱量' },
  { id: 'fanculture', label: 'サポーター文化' },
  { id: 'visual',     label: 'ビジュアル・カルチャー' },
  { id: 'region',     label: '地域' },
]

export const CATEGORY_BY_ID = Object.fromEntries(
  QUESTION_CATEGORIES.map((c) => [c.id, c]),
)
