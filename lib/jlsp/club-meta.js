/**
 * 40 (J1+J2) クラブの拡充メタデータ。
 *
 * 構造:
 *   - descriptionLong: 200-300 字の長文説明 (生成、後で要校正)
 *   - official: { hp, x, instagram, shop } — 各クラブ公式リンク (※ URL は best-effort)
 *   - mascot: { name, description }
 *   - access: { station, walkMinutes, note }
 *   - awayTravel: { fromTokyo: { hours, yen, transport, note } }
 *   - ticketUrl: J リーグチケット URL (best-effort)
 *
 * 値が null/未定義の場合は UI 側で非表示。後で ryo さんが穴埋め・修正前提。
 *
 * @typedef {object} ClubMeta
 */

const m = (overrides) => ({
  descriptionLong: null,
  official: { hp: null, x: null, instagram: null, shop: null },
  mascot: null,
  access: null,
  awayTravel: null,
  ticketUrl: null,
  ...overrides,
})

export const CLUB_META = {
  // ===== J1 (in clubs.js order) =====
  kashima: m({
    descriptionLong:
      '「常勝鹿島」を背負う伝統クラブ。Jリーグ史上最多タイトルを誇り、勝者のメンタリティが文化として根づいている。茨城県鹿嶋市を本拠地に、地域密着とプロフェッショナリズムを両立。鹿島神宮の神鹿をエンブレムに描き、武家文化と結びつく硬派なイメージも特徴。タイトル獲得への執念と、選手・スタッフが代々受け継ぐ「勝利の作法」は、Jリーグの基準点として語られ続けている。',
    official: {
      hp: 'https://www.antlers.co.jp/',
      x: 'https://x.com/atlrs_official',
      instagram: 'https://www.instagram.com/kashima.antlers/',
      shop: null,
    },
    mascot: {
      name: 'シカオ・ファミリー',
      wikiTitle: 'しかお',
      description: '鹿島神宮の神鹿をモチーフにした家族マスコット。リーダーのシカオを中心に、妻のシカコ、子どもたちが揃って試合を盛り上げる。',
    },
    access: { station: '鹿島サッカースタジアム駅', walkMinutes: 7, note: '試合日のみ臨時開設駅' },
    awayTravel: { fromTokyo: { hours: '約 2 時間', yen: 5500, transport: '高速バス (東京駅八重洲口直通)', note: '電車だと鹿島臨海鉄道経由で乗継複雑、バス推奨' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/ka/',
  }),
  urawa: m({
    descriptionLong:
      '日本一の動員と熱狂を誇る赤い軍団。1998 年以来、ホーム埼玉スタジアムは聖地として知られ、ゴール裏 12 番目の選手たちの大合唱は J リーグの代名詞。3 度の ACL 制覇など国際舞台での経験も豊富で、伝統と熱量の両軸を持つ。サポーターは「We are REDS!」のチャントで世界中のスタジアムを赤く染める。タイトルへの渇望と、独自の応援文化の濃密さが他を圧倒する。',
    official: {
      hp: 'https://www.urawa-reds.co.jp/',
      x: 'https://x.com/urawareds_jp',
      instagram: 'https://www.instagram.com/urawareds_official/',
      shop: 'https://shop.urawa-reds.co.jp/',
    },
    mascot: {
      name: 'レディア',
      wikiTitle: 'レディア (浦和レッドダイヤモンズ)',
      description: '王冠とマントを身にまとった赤いライオン。レッズの誇りと王者の風格を象徴する。',
    },
    access: { station: '浦和美園駅', walkMinutes: 15, note: '埼玉高速鉄道、東京メトロ南北線直通' },
    awayTravel: { fromTokyo: { hours: '約 50 分', yen: 720, transport: '東京メトロ南北線・埼玉高速鉄道直通', note: '都心からのアクセス良好' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/ur/',
  }),
  kawasaki: m({
    descriptionLong:
      '緻密なパスワークと攻撃的なポゼッションサッカーで一時代を築いた青と黒。「ふろん太」「カブレラ」を筆頭にユーモアあふれるクラブ運営でも知られ、選手とサポーターの距離の近さは J リーグ屈指。等々力陸上競技場のホームゲームでは多彩なイベントが行われ、地域密着型クラブの理想形として語られる。タイトル獲得期 (2017-2021) を経て、育成と挑戦を続けている。',
    official: {
      hp: 'https://www.frontale.co.jp/',
      x: 'https://x.com/frontale_staff',
      instagram: 'https://www.instagram.com/frontaleofficial/',
      shop: 'https://shop.frontale.co.jp/',
    },
    mascot: {
      name: 'ふろん太・カブレラ',
      description: 'ふろん太はクラブの誕生イルカ、カブレラは助っ人キャラクター。コンビでファンを楽しませる。',
    },
    access: { station: '武蔵小杉駅 / 武蔵中原駅', walkMinutes: 15, note: '武蔵小杉から徒歩 20 分、武蔵中原から徒歩 15 分' },
    awayTravel: { fromTokyo: { hours: '約 20 分', yen: 250, transport: 'JR 南武線・東急東横線', note: '都内アクセス良好' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/kf/',
  }),
  'f-marinos': m({
    descriptionLong:
      'アタッキングフットボールを掲げ、超ハイラインの攻撃サッカーで魅了する伝統クラブ。日産自動車を母体に持ち、横浜国際総合競技場 (日産スタジアム) を本拠地とする。1993 年の J リーグ開幕メンバーで、リーグ優勝 5 回など名門の称号を欲しいままにする。横浜の港町文化と結びついた洗練されたクラブイメージ、緻密な戦術と国際感覚を備えた選手育成方針が特徴。',
    official: {
      hp: 'https://www.f-marinos.com/',
      x: 'https://x.com/prompt_marinos',
      instagram: 'https://www.instagram.com/yokohama_f_marinos/',
      shop: 'https://www.f-marinos.com/shop',
    },
    mascot: { name: 'マリノスケ', description: 'カモメをモチーフにしたクラブの公式マスコット。横浜の港の象徴。' },
    access: { station: '新横浜駅', walkMinutes: 15, note: '日産スタジアムへ徒歩 14 分' },
    awayTravel: { fromTokyo: { hours: '約 20 分', yen: 480, transport: '東海道新幹線 / JR 横浜線', note: '新横浜下車' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/ym/',
  }),
  fctokyo: m({
    descriptionLong:
      '首都・東京を背負うシティクラブ。味の素スタジアム (調布) を本拠とし、東京西部・多摩エリアの地域密着を進める。青と赤のクラブカラーは「青赤」と呼ばれ、ユニフォームから街中の旗まで親しまれている。バランス感覚に優れたサッカーと、洗練されたスタジアム体験で都市型クラブの代表格。ファミリー層からコアサポまで幅広い客層を抱える。',
    official: {
      hp: 'https://www.fctokyo.co.jp/',
      x: 'https://x.com/fctokyoofficial',
      instagram: 'https://www.instagram.com/fctokyo_official/',
      shop: 'https://shop.fctokyo.co.jp/',
    },
    mascot: { name: '東京ドロンパ', description: 'たぬきをモチーフにした青赤のマスコット。東京の街と西部の自然を象徴。' },
    access: { station: '飛田給駅', walkMinutes: 5, note: '京王線、新宿から特急 20 分' },
    awayTravel: { fromTokyo: { hours: '約 30 分', yen: 360, transport: '京王線新宿駅から特急', note: '飛田給駅すぐ' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/to/',
  }),
  verdy: m({
    descriptionLong:
      '読売クラブから続く名門。J リーグ草創期の盟主で、ラモス瑠偉やカズを擁し、テクニックと美学を重んじる伝統を持つ。緑のクラブカラーは森と日本サッカーの未来を象徴。長く J2 でリーグ復帰を目指し、2024 年に J1 復帰を果たした。育成型クラブとしても評価が高く、アカデミー出身選手が日本サッカーを支える。',
    official: { hp: 'https://www.verdy.co.jp/', x: 'https://x.com/tokyo_verdy', instagram: 'https://www.instagram.com/tokyo_verdy/', shop: null },
    mascot: { name: 'ヴェルディ君', description: '緑のヴェルディの精神を体現するキャラクター。' },
    access: { station: '飛田給駅', walkMinutes: 5, note: '味の素スタジアムを FC 東京と共用' },
    awayTravel: { fromTokyo: { hours: '約 30 分', yen: 360, transport: '京王線新宿駅から特急', note: 'FC 東京と同じスタジアム' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/vn/',
  }),
  reysol: m({
    descriptionLong:
      'アカデミーから個性派を量産する黄色いタレント工房。柏の葉公園総合競技場 (日立柏サッカー場) は J リーグ最古のサッカー専用スタジアムの一つで、ピッチとスタンドの距離が近く、独特の臨場感を持つ。アグレッシブなサッカーが持ち味で、近年は若手選手の輩出力でも注目される。レイソル＝ Rey (王) + Sol (太陽) を意味し、太陽の王者を志向する。',
    official: { hp: 'https://www.reysol.co.jp/', x: 'https://x.com/reysol_official', instagram: 'https://www.instagram.com/reysol_official/', shop: 'https://shop.reysol.co.jp/' },
    mascot: { name: 'レイくん・ソルくん', description: '黄色いキャラクターのコンビ。レイ＋ソルでクラブ名を体現。' },
    access: { station: '柏駅', walkMinutes: 20, note: 'シャトルバスあり' },
    awayTravel: { fromTokyo: { hours: '約 30 分', yen: 660, transport: 'JR 常磐線', note: '上野から直通' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/kr/',
  }),
  grampus: m({
    descriptionLong:
      '中部地方の盟主、名古屋グランパス。豊田スタジアムとパロマ瑞穂スタジアム (改修中) を本拠地とし、トヨタ自動車を主要スポンサーに堅実な経営を続ける。堅守をベースに、ピクシー (ストイコビッチ) 時代の華麗なサッカーや、ピクシー監督復帰など歴史的な瞬間を経験。クラブカラーは赤と黄。シャチをモチーフにしたエンブレムは名古屋城の金鯱に由来する。',
    official: { hp: 'https://nagoya-grampus.jp/', x: 'https://x.com/nge_PR', instagram: 'https://www.instagram.com/nagoyagrampus_official/', shop: 'https://shop.nagoya-grampus.jp/' },
    mascot: { name: 'グランパスくんファミリー', description: 'シャチをモチーフにした家族マスコット。名古屋城の金鯱から着想。' },
    access: { station: '豊田市駅', walkMinutes: 15, note: '名鉄豊田線、豊田スタジアム最寄' },
    awayTravel: { fromTokyo: { hours: '約 2 時間', yen: 11300, transport: '東海道新幹線で名古屋へ、名鉄に乗継', note: '名古屋駅から名鉄で約 45 分' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/ng/',
  }),
  gamba: m({
    descriptionLong:
      'テクニックと攻撃力で時代を築いた青と黒。パナソニックスタジアム吹田は日本初のサッカー専用スタジアムとして注目を集める。2014 年の三冠 (リーグ・天皇杯・ナビスコ杯) など輝かしい歴史を持ち、攻撃的なポゼッションサッカーが代名詞。日本代表選手を多数輩出してきたアカデミー、北摂の熱量、関西の派手なサッカー観を全て備えた名門。',
    official: { hp: 'https://www.gamba-osaka.net/', x: 'https://x.com/gambaosaka_PR', instagram: 'https://www.instagram.com/gambaosaka_official/', shop: 'https://shop.gamba-osaka.net/' },
    mascot: { name: 'ガンバボーイ', description: '青と黒のスポーツマンキャラクター。元気な少年像。' },
    access: { station: '万博記念公園駅', walkMinutes: 15, note: '大阪モノレール、太陽の塔の近く' },
    awayTravel: { fromTokyo: { hours: '約 3 時間', yen: 14000, transport: '東海道新幹線で新大阪、大阪モノレール乗継', note: '万博記念公園駅へ' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/go/',
  }),
  cerezo: m({
    descriptionLong:
      '桜色のアタッカー集団。育成型クラブとして香川真司、清武弘嗣など数多くの日本代表を輩出してきた攻撃の名門。ヤンマースタジアム長居を本拠地に、近隣には長居公園が広がる。クラブ名のセレッソ (cerezo) はスペイン語で「桜」を意味し、大阪市の花である桜から着想された。攻撃的で見応えのあるサッカーが伝統。',
    official: { hp: 'https://www.cerezo.jp/', x: 'https://x.com/crz_official', instagram: 'https://www.instagram.com/cerezo_official/', shop: 'https://shop.cerezo.jp/' },
    mascot: { name: 'ロビー', wikiTitle: 'ノブレ・バリエンテ・アッチェ・ロビート・デ・セレッソ', description: '桜の精霊をモチーフにしたピンクのキャラクター。' },
    access: { station: '長居駅', walkMinutes: 5, note: '大阪メトロ御堂筋線' },
    awayTravel: { fromTokyo: { hours: '約 3 時間', yen: 14000, transport: '東海道新幹線で新大阪、御堂筋線乗継', note: '長居駅へ' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/co/',
  }),
  kobe: m({
    descriptionLong:
      'スター選手を集めた現代の盟主。楽天グループを母体に、イニエスタ、ビジャ、ポドルスキら世界的選手を獲得し、2023 年に悲願の J1 優勝を達成。資金力と個の力でタイトルを獲り続ける、関西の派手な巨人。ノエビアスタジアム神戸はサッカー専用で熱量の高い空間。クラブカラーは深紅とブルー。神戸の港町文化と結びついた洗練されたクラブイメージを持つ。',
    official: { hp: 'https://www.vissel-kobe.co.jp/', x: 'https://x.com/visselkobe', instagram: 'https://www.instagram.com/visselkobe/', shop: 'https://shop.vissel-kobe.co.jp/' },
    mascot: { name: 'モーヴィ', description: 'クラブのマスコットキャラクター。港町神戸を象徴する。' },
    access: { station: '御崎公園駅', walkMinutes: 5, note: '神戸市営地下鉄海岸線' },
    awayTravel: { fromTokyo: { hours: '約 3 時間', yen: 15000, transport: '東海道新幹線で新神戸、地下鉄乗継', note: '新神戸から市営地下鉄で約 20 分' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/vi/',
  }),
  sanfrecce: m({
    descriptionLong:
      '規律と組織のお手本。森保一監督時代に 3 度のリーグ優勝を達成し、堅守と精密な戦術で頂点に立った経験を持つ。育成も巧みで、佐々木翔・浅野拓磨・東俊希ら多くの日本代表を輩出。クラブ名「サンフレッチェ」は、毛利元就の三本の矢の故事に由来する。エディオンピースウィング広島は新スタジアムで、街中の賑わいを取り戻す象徴的施設となっている。',
    official: { hp: 'https://www.sanfrecce.co.jp/', x: 'https://x.com/sanfrecce_pr', instagram: 'https://www.instagram.com/sanfrecce_official/', shop: 'https://shop.sanfrecce.co.jp/' },
    mascot: { name: 'サンチェ・フレッチェ', wikiTitle: 'サンチェ (サンフレッチェ広島)', description: '紫のキャラクターたち。三本の矢を体現する家族。' },
    access: { station: '原爆ドーム前', walkMinutes: 5, note: '広島電鉄、エディオンピースウィング広島へ' },
    awayTravel: { fromTokyo: { hours: '約 4 時間', yen: 19000, transport: '東海道・山陽新幹線', note: '広島駅から路面電車約 15 分' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/sh/',
  }),
  avispa: m({
    descriptionLong:
      '九州を代表する堅守のチーム。専守速攻のスタイルと、博多の熱量あるサポーターが魅力。ベスト電器スタジアムは博多の街中にあり、試合後にそのまま中洲で打ち上げる文化が根づく。クラブ名「アビスパ」はスズメバチを意味し、機敏で攻撃的なイメージを体現。九州サッカーの伝統を背負う重要なクラブ。',
    official: { hp: 'https://www.avispa.co.jp/', x: 'https://x.com/avispa_official', instagram: 'https://www.instagram.com/avispafukuoka_official/', shop: 'https://shop.avispa.co.jp/' },
    mascot: { name: 'アビー・ビビーくん', wikiTitle: 'アビー (アビスパ福岡)', description: 'スズメバチをモチーフにしたコンビ。攻撃的なクラブ像を表現。' },
    access: { station: '福岡空港駅', walkMinutes: 15, note: '福岡市営地下鉄、空港から徒歩 10 分強' },
    awayTravel: { fromTokyo: { hours: '約 2 時間 (飛行機)', yen: 25000, transport: '飛行機 / 新幹線', note: '飛行機なら羽田 → 福岡' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/af/',
  }),
  kyoto: m({
    descriptionLong:
      '走力とハイインテンシティを武器にする、紫のチャレンジャー。サンガスタジアム by KYOCERA は京都府亀岡市にあるサッカー専用スタジアムで、嵐山に近い立地。京都パープルサンガから 2020 年に現クラブ名に改称。攻撃的なサッカーで上位を狙い、京都の伝統文化と現代的なサッカーを融合させた独自のクラブイメージを築いている。',
    official: { hp: 'https://www.sanga-fc.jp/', x: 'https://x.com/kyotosanga', instagram: 'https://www.instagram.com/kyotosanga/', shop: 'https://shop.sanga-fc.jp/' },
    mascot: { name: 'パーサくん', description: '紫色のクラブマスコット。京都の雅さと活力を体現。' },
    access: { station: '亀岡駅', walkMinutes: 3, note: 'JR 嵯峨野線、京都駅から特急で 20 分' },
    awayTravel: { fromTokyo: { hours: '約 2.5 時間', yen: 13500, transport: '東海道新幹線で京都、JR 乗継', note: '京都駅から嵯峨野線で亀岡' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/ks/',
  }),
  machida: m({
    descriptionLong:
      'ハードワークと堅守速攻、徹底した勝利志向で急成長したクラブ。サイバーエージェントを母体に経営力を大幅に強化し、2024 年に J1 昇格初年度から首位争いを演じた。賛否を呼びつつ結果を出し続け、J リーグの勢力図を変えた存在。クラブカラーは青と白。町田 GION スタジアムは町田市の中心街にあり、地域に深く根ざしている。',
    official: { hp: 'https://www.zelvia.co.jp/', x: 'https://x.com/zelvia', instagram: 'https://www.instagram.com/fcm_zelvia/', shop: 'https://shop.zelvia.co.jp/' },
    mascot: { name: 'ゼルビー', description: '町田の象徴である鶴をモチーフにしたキャラクター。' },
    access: { station: '町田駅', walkMinutes: 25, note: 'シャトルバスあり' },
    awayTravel: { fromTokyo: { hours: '約 45 分', yen: 460, transport: '小田急線・JR 横浜線', note: '町田駅で下車' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/mz/',
  }),
  chiba: m({
    descriptionLong:
      '黄色と緑の伝統あるクラブ。オシム時代の走るサッカーの遺伝子を持ち、その後も育成と組織を重視するスタイルを守り続けている。フクダ電子アリーナはサッカー専用スタジアムで、スタンドからピッチが近く臨場感抜群。クラブ名「ジェフユナイテッド」は JR と古河電工に由来し、千葉県市原市と千葉市の 2 都市をホームタウンとする。',
    official: { hp: 'https://jefunited.co.jp/', x: 'https://x.com/jefunited_pr', instagram: 'https://www.instagram.com/jefunited_official/', shop: 'https://shop.jefunited.co.jp/' },
    mascot: { name: 'ジェフィ・ユニティ', description: '犬をモチーフにした家族マスコット。地域密着を象徴。' },
    access: { station: '蘇我駅', walkMinutes: 8, note: 'JR 京葉線・内房線・外房線' },
    awayTravel: { fromTokyo: { hours: '約 50 分', yen: 660, transport: 'JR 京葉線', note: '東京駅から直通' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/je/',
  }),
  mito: m({
    descriptionLong:
      '育成型クラブの旗手。次々と若手才能を輩出し、J リーグの選手供給源として知られる。地域と農業との連携でも知られ、ホーリーホックの由来 (徳川家の家紋・葵) のとおり、水戸藩の歴史と結びついた地域密着のアイデンティティを持つ。資金力には乏しいが、堅実な経営と育成哲学で長年 J リーグの舞台に立ち続けている。',
    official: { hp: 'https://www.mito-hollyhock.net/', x: 'https://x.com/mitohollyhockPR', instagram: 'https://www.instagram.com/mitohollyhock/', shop: 'https://shop.mito-hollyhock.net/' },
    mascot: { name: 'ホーリーくん', description: '葵の家紋をモチーフにした水戸の象徴的キャラクター。' },
    access: { station: '水戸駅', walkMinutes: null, note: 'シャトルバスでケーズデンキスタジアム水戸へ' },
    awayTravel: { fromTokyo: { hours: '約 1.5 時間', yen: 3000, transport: 'JR 常磐線特急', note: '上野から特急ひたち' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/mh/',
  }),
  shimizu: m({
    descriptionLong:
      'サッカー王国・静岡の象徴。市民クラブとして長く愛されてきた橙色の名門で、清水商業・東海大第一など強豪校の選手を多数擁し、長年 J1 で戦ってきた。IAI スタジアム日本平は三保松原に近く、富士山を望むロケーションも魅力。地域密着型クラブの理想形として、子どもからお年寄りまで幅広く愛される。',
    official: { hp: 'https://www.s-pulse.co.jp/', x: 'https://x.com/spulse_official', instagram: 'https://www.instagram.com/spulse_official/', shop: 'https://shop.s-pulse.co.jp/' },
    mascot: { name: 'パルちゃん', description: '橙色のクラブの公式マスコット。' },
    access: { station: '草薙駅', walkMinutes: null, note: 'シャトルバスで IAI スタジアム日本平へ' },
    awayTravel: { fromTokyo: { hours: '約 1 時間', yen: 6500, transport: '東海道新幹線で静岡、JR 乗継', note: '静岡駅から草薙駅' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/ss/',
  }),
  okayama: m({
    descriptionLong:
      '桃太郎旗のもと地域と歩んできたクラブ。2025 年シーズンに J1 初昇格を果たし、岡山県のスポーツ文化を大きく塗り替えた。シティライトスタジアムを本拠地に、岡山の街と一体になった応援文化を育てる。安定した組織サッカーで上位を狙い、地方クラブの新しいモデルケースとして注目を集めている。',
    official: { hp: 'https://www.fagiano-okayama.com/', x: 'https://x.com/fagiano_okayama', instagram: 'https://www.instagram.com/fagiano_official/', shop: 'https://shop.fagiano-okayama.com/' },
    mascot: { name: 'ファジ丸', description: '桃太郎の雉をモチーフにしたキャラクター。' },
    access: { station: '岡山駅', walkMinutes: null, note: 'シャトルバスでシティライトスタジアムへ' },
    awayTravel: { fromTokyo: { hours: '約 3.5 時間', yen: 17000, transport: '東海道・山陽新幹線', note: '岡山駅で下車' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/fo/',
  }),
  nagasaki: m({
    descriptionLong:
      'ジャパネット主導で躍進する九州クラブ。2025 年に J1 復帰を目指し、ピーススタジアム (新スタジアム) という新たな本拠地を持つ。長崎の歴史と平和への願いをクラブ理念に込め、地域とともに歩む。クラブカラーは青。長崎の街中で楽しめるサッカー文化を育てる、稀有なクラブ。',
    official: { hp: 'https://www.v-varen.com/', x: 'https://x.com/v_varen_nagasaki', instagram: 'https://www.instagram.com/vvarennagasaki/', shop: 'https://shop.v-varen.com/' },
    mascot: { name: 'ヴィヴィくん', description: 'ハタを持った長崎の象徴的キャラクター。' },
    access: { station: '長崎駅', walkMinutes: 10, note: 'ピーススタジアム (新スタジアム)' },
    awayTravel: { fromTokyo: { hours: '約 3 時間 (飛行機)', yen: 27000, transport: '飛行機、または新幹線+特急', note: '羽田 → 長崎空港から空港バス' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/vv/',
  }),

  // ===== J2 =====
  tosu: m({
    descriptionLong:
      '限られた資金の中で育成と組織を磨き続ける、九州のしぶといクラブ。スタジアムの一体感、駅前すぐという立地、選手・スタッフ・サポーターの距離の近さで、地域クラブの理想形を体現する。サガン鳥栖の「サガン」は「砂岩」を意味し、岩のように堅実なクラブを志向する命名。',
    official: { hp: 'https://www.sagantosu.jp/', x: 'https://x.com/sagantosu_pr', instagram: 'https://www.instagram.com/sagantosu_official/', shop: 'https://shop.sagantosu.jp/' },
    mascot: { name: 'ウィントス', description: 'カチガラスをモチーフにしたピンクのキャラクター。' },
    access: { station: '鳥栖駅', walkMinutes: 5, note: '駅前すぐ、駅前不動産スタジアム' },
    awayTravel: { fromTokyo: { hours: '約 5 時間', yen: 25000, transport: '飛行機 + JR or 新幹線', note: '博多駅から鳥栖駅で約 30 分' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/st/',
  }),
  shonan: m({
    descriptionLong:
      '湘南スタイル＝走り続ける 90 分。家族とゆるく楽しむファミリー層に愛され、地元と歩むクラブ。レモンガススタジアム平塚は海岸近くにあり、湘南の海風を感じながら観戦できる稀有な立地。クラブカラーは緑と青で、湘南の海と空を象徴する。育成と挑戦のクラブとして、若手選手の輩出にも積極的。',
    official: { hp: 'https://www.bellmare.co.jp/', x: 'https://x.com/sho_bellmare', instagram: 'https://www.instagram.com/shonanbellmare/', shop: 'https://shop.bellmare.co.jp/' },
    mascot: { name: 'キングベルくん', wikiTitle: 'キングベルI世', description: '湘南の海を象徴するキャラクター。' },
    access: { station: '平塚駅', walkMinutes: null, note: 'シャトルバスでレモンガススタジアム平塚へ' },
    awayTravel: { fromTokyo: { hours: '約 1.5 時間', yen: 1500, transport: 'JR 東海道線', note: '東京駅から平塚駅へ' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/bm/',
  }),
  iwata: m({
    descriptionLong:
      '黄金期の名手たちが築いた伝統。中山雅史、藤田俊哉、名波浩らを擁し 1998-2003 年に黄金期を迎えた。組織的なパスサッカーの系譜を引き継ぐ、サッカー王国・静岡の雄。ヤマハスタジアムはサッカー専用スタジアムで、ピッチとの距離が近い名スタジアム。クラブ名「ジュビロ」はポルトガル語で「歓喜」を意味する。',
    official: { hp: 'https://www.jubilo-iwata.co.jp/', x: 'https://x.com/jubiloiwata_PR', instagram: 'https://www.instagram.com/jubiloiwata/', shop: 'https://shop.jubilo-iwata.co.jp/' },
    mascot: { name: 'ジュビロくん', description: '青いクラブの公式マスコット。' },
    access: { station: '愛野駅', walkMinutes: null, note: 'シャトルバスでヤマハスタジアム or エコパスタジアムへ' },
    awayTravel: { fromTokyo: { hours: '約 2 時間', yen: 9000, transport: '東海道新幹線で掛川、JR 乗継', note: '掛川駅から愛野駅' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/ju/',
  }),
  sapporo: m({
    descriptionLong:
      'ミシャ式の攻撃サッカーで一時代を築いた赤と黒。リスクを取って撃ち合うスタイルが愛され、コアサポーターの熱い応援が札幌ドームを赤く染める。北海道唯一の J リーグクラブとして、広い北海道全土を巻き込む大規模なクラブ運営を展開。クラブ名「コンサドーレ」は北海道の方言「どさんこ」を逆さ読みしてラテン語風に。',
    official: { hp: 'https://www.consadole-sapporo.jp/', x: 'https://x.com/consaofficial', instagram: 'https://www.instagram.com/hokkaido_consadole_sapporo/', shop: 'https://shop.consadole-sapporo.jp/' },
    mascot: { name: 'ドーレくん', description: 'シマフクロウをモチーフにした北海道らしいキャラクター。' },
    access: { station: '福住駅', walkMinutes: 10, note: '札幌市営地下鉄東豊線、札幌ドーム' },
    awayTravel: { fromTokyo: { hours: '約 1.5 時間 (飛行機)', yen: 35000, transport: '飛行機', note: '羽田 → 新千歳' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/cs/',
  }),
  niigata: m({
    descriptionLong:
      '全国屈指のサポーター動員を誇る地元密着クラブ。ビッグスワンに集う家族層と一緒に応援する空気が魅力。新潟県全土から人が集まるホームゲームは、地方クラブの理想形。クラブカラーはオレンジ。アルビレックスは Albireo (北極星) + Rex (王) で、新潟の夜空に輝く王者を象徴する。',
    official: { hp: 'https://www.albirex.co.jp/', x: 'https://x.com/albirex_pr', instagram: 'https://www.instagram.com/albirex_niigata/', shop: 'https://shop.albirex.co.jp/' },
    mascot: { name: 'アルビくん・スワンちゃん', description: 'スワン (白鳥) をモチーフにしたコンビ。' },
    access: { station: '新潟駅', walkMinutes: null, note: 'シャトルバスでデンカビッグスワンスタジアムへ' },
    awayTravel: { fromTokyo: { hours: '約 2 時間', yen: 11000, transport: '上越新幹線', note: '東京駅から新潟駅' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/an/',
  }),
  yokohamafc: m({
    descriptionLong:
      'フリューゲルス消滅から市民の手で生まれたクラブ。粘り強く昇格と残留を勝ち取り続けるクラブで、市民クラブの理想を体現。三ツ沢公園球技場は古くからのサッカー専用スタジアムで、横浜の F・マリノスとは別の系譜を持つ。クラブカラーは青と白。横浜のもう一つのクラブとして独自のファンを抱える。',
    official: { hp: 'https://www.yokohamafc.com/', x: 'https://x.com/yokohamafcPR', instagram: 'https://www.instagram.com/yokohamafcofficial/', shop: 'https://shop.yokohamafc.com/' },
    mascot: { name: 'フリ丸', description: 'フリューゲルスの記憶を継ぐキャラクター。' },
    access: { station: '三ツ沢上町駅', walkMinutes: 12, note: '横浜市営地下鉄、三ツ沢公園球技場' },
    awayTravel: { fromTokyo: { hours: '約 30 分', yen: 480, transport: 'JR 京浜東北線 / 東急東横線', note: '横浜駅から徒歩 25 分も可能' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/yk/',
  }),
  omiya: m({
    descriptionLong:
      'オレンジの堅実派。エレベーターと呼ばれた粘り強さがアイデンティティ。2024 年に大宮アルディージャから ＲＢ大宮アルディージャに改称し、レッドブル系列となった。資金力強化により上位進出を狙う新時代に突入。NACK5 スタジアム大宮はサッカー専用スタジアムで、駅から徒歩圏の好立地。',
    official: { hp: 'https://www.ardija.co.jp/', x: 'https://x.com/omiya_ardija', instagram: 'https://www.instagram.com/omiyaardija_official/', shop: 'https://shop.ardija.co.jp/' },
    mascot: { name: 'アルディ・ミーヤ', wikiTitle: 'アルディ (大宮アルディージャ)', description: 'リスのコンビ。大宮公園のリス舎にも由来する。' },
    access: { station: '北大宮駅', walkMinutes: 10, note: '東武野田線、NACK5 スタジアム大宮' },
    awayTravel: { fromTokyo: { hours: '約 30 分', yen: 480, transport: 'JR 高崎線・宇都宮線', note: '東京駅から大宮、東武野田線乗継' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/oa/',
  }),
  sendai: m({
    descriptionLong:
      '東北の盟主を自負する金と紫。震災後、地域と一緒に再起した物語を持つ。ユアテックスタジアム仙台は球技専用で、選手とサポーターの距離が近い。ベガルタは七夕の織姫と彦星に由来し、仙台の七夕文化を象徴。震災以降、地域貢献活動にも積極的で、東北サッカー界の中心。',
    official: { hp: 'https://www.vegalta.co.jp/', x: 'https://x.com/vegaltaclub', instagram: 'https://www.instagram.com/vegalta_sendai/', shop: 'https://shop.vegalta.co.jp/' },
    mascot: { name: 'ベガッ太', description: '七夕の織姫と彦星をモチーフにした星型キャラクター。' },
    access: { station: '泉中央駅', walkMinutes: 5, note: '仙台市営地下鉄南北線' },
    awayTravel: { fromTokyo: { hours: '約 2 時間', yen: 11000, transport: '東北新幹線', note: '東京駅から仙台駅' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/vs/',
  }),
  yamagata: m({
    descriptionLong:
      '山形の県民総参加型クラブ。地方創生のモデルケースとしても語られる存在で、 県内全域から人が集まるホームゲームは独自の空気感を持つ。NDソフトスタジアム山形は山形市天童市にあり、東北の自然環境の中で観戦できる。クラブカラーは青と黒。モンテディオは「神の山」を意味し、月山に由来する。',
    official: { hp: 'https://www.montedioyamagata.jp/', x: 'https://x.com/montedio_pr', instagram: 'https://www.instagram.com/montedioyamagata/', shop: 'https://shop.montedioyamagata.jp/' },
    mascot: { name: 'ディーオ', description: '青いキャラクター。山形の自然を象徴。' },
    access: { station: '天童駅', walkMinutes: null, note: 'JR 奥羽本線、NDソフトスタジアム山形' },
    awayTravel: { fromTokyo: { hours: '約 3 時間', yen: 12000, transport: '山形新幹線', note: '東京駅から天童駅' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/my/',
  }),
  akita: m({
    descriptionLong:
      '圧倒的なハードワークとパワー系の堅守速攻で旋風を巻き起こした「秋田スタイル」。クラブ名のブラウブリッツはドイツ語で「青い稲妻」を意味し、秋田の自然と力強さを表現。ソユースタジアム (秋田) は屋内競技場で、雪深い秋田での観戦体験を保証する。地方クラブの誇りを背負う。',
    official: { hp: 'https://www.blaublitz.jp/', x: 'https://x.com/blaublitzakita', instagram: 'https://www.instagram.com/blaublitzakita/', shop: null },
    mascot: { name: 'ブラウゴン', description: '青い龍をモチーフにしたキャラクター。' },
    access: { station: '秋田駅', walkMinutes: null, note: 'シャトルバスでソユースタジアムへ' },
    awayTravel: { fromTokyo: { hours: '約 4 時間', yen: 18000, transport: '秋田新幹線', note: '東京駅から秋田駅' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/ba/',
  }),
  kofu: m({
    descriptionLong:
      '限られたリソースから天皇杯制覇まで成し遂げた、地域密着の戦士たち。2022 年の天皇杯優勝は J2 クラブとして史上 2 番目の快挙。山梨県笛吹市にある JIT リサイクルインクスタジアムは富士山を望むロケーション。クラブカラーは青と赤。ヴァンフォーレは武田家の戦旗「風林火山」に由来する。',
    official: { hp: 'https://www.ventforet.jp/', x: 'https://x.com/ventforet_pr', instagram: 'https://www.instagram.com/ventforetkofu/', shop: 'https://shop.ventforet.jp/' },
    mascot: { name: 'ヴァンくん・フォーレちゃん', description: '武田家の家紋を意識した青と赤のコンビ。' },
    access: { station: '甲府駅', walkMinutes: null, note: 'シャトルバスで JIT リサイクルインクスタジアムへ' },
    awayTravel: { fromTokyo: { hours: '約 1.5 時間', yen: 4000, transport: 'JR 中央本線特急かいじ', note: '新宿駅から甲府駅' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/ve/',
  }),
  tokushima: m({
    descriptionLong:
      'スペイン系のパスサッカーを志向し続ける四国の青。技術と組織を重んじる独自のスタイルを持ち、リカルド・ロドリゲス監督時代に J1 昇格を果たした。鳴門・大塚スポーツパーク ポカリスエットスタジアムは大塚製薬を母体に持つことを示し、地域企業とクラブの結びつきを象徴する。',
    official: { hp: 'https://www.vortis.jp/', x: 'https://x.com/jef_vortis', instagram: 'https://www.instagram.com/tokushima_vortis/', shop: 'https://shop.vortis.jp/' },
    mascot: { name: 'ヴォルタくん', wikiTitle: 'ヴォルタくん', description: '徳島の渦潮を象徴する青いキャラクター。' },
    access: { station: '鳴門駅', walkMinutes: null, note: 'シャトルバスで鳴門・大塚スポーツパークへ' },
    awayTravel: { fromTokyo: { hours: '約 3 時間 (飛行機)', yen: 30000, transport: '飛行機 + バス', note: '羽田 → 徳島阿波おどり空港' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/vo/',
  }),
  oita: m({
    descriptionLong:
      'ナビスコ杯制覇の経験を持つ青。ボール保持型のスタイルで強豪に挑む。レゾナックドーム大分は屋根付きで、雨天でも観戦可能な貴重なスタジアム。クラブ名「トリニータ」は別府湾、大分の Tri (三つの) 都市の融合を意味し、地域のアイデンティティを体現する。',
    official: { hp: 'https://www.oita-trinita.co.jp/', x: 'https://x.com/oita_trinita', instagram: 'https://www.instagram.com/oitatrinitaofficial/', shop: 'https://shop.oita-trinita.co.jp/' },
    mascot: { name: 'ニータン', description: '青いキャラクター。Tri から「ニータ」。' },
    access: { station: '大分駅', walkMinutes: null, note: 'シャトルバスでレゾナックドーム大分へ' },
    awayTravel: { fromTokyo: { hours: '約 2 時間 (飛行機)', yen: 32000, transport: '飛行機', note: '羽田 → 大分空港' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/ot/',
  }),
  fujieda: m({
    descriptionLong:
      'サッカー王国・静岡の若手育成型クラブ。テクニカルなパスサッカーで上位を目指す青いチャレンジャー。藤枝市民スタジアムは小規模ながらサッカー専用で、選手とサポーターの距離が近い。「MYFC」はサポーターの「私のクラブ」感を強調する独自の命名。地方クラブとしての挑戦的な姿勢が魅力。',
    official: { hp: 'https://www.fujieda-myfc.com/', x: 'https://x.com/fujieda_myfc', instagram: 'https://www.instagram.com/fujieda_myfc/', shop: null },
    mascot: { name: 'フジッピー', description: '藤枝の象徴的キャラクター。' },
    access: { station: '藤枝駅', walkMinutes: null, note: 'シャトルバスで藤枝市民スタジアムへ' },
    awayTravel: { fromTokyo: { hours: '約 1.5 時間', yen: 7000, transport: '東海道新幹線で静岡、JR 乗継', note: '静岡駅から藤枝駅' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/fj/',
  }),
  hachinohe: m({
    descriptionLong:
      '青森の海風と共に戦うクラブ。地域から積み上げる本物の地元密着型で、八戸の漁業文化と結びついた独自のクラブカラーを持つ。プライフーズスタジアムは八戸市の中心部にあり、駅前すぐの好立地。クラブ名「ヴァンラーレ」は青森の方言「ヴァン (バン)」と「来てね」を意味する。',
    official: { hp: 'https://vanraure.net/', x: 'https://x.com/vanraure', instagram: 'https://www.instagram.com/vanraurehachinohe/', shop: null },
    mascot: { name: 'ヴァン太', description: '八戸の象徴的キャラクター。' },
    access: { station: '本八戸駅', walkMinutes: 15, note: 'プライフーズスタジアム' },
    awayTravel: { fromTokyo: { hours: '約 3.5 時間', yen: 17000, transport: '東北新幹線で八戸駅', note: '八戸駅から本八戸駅へ' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/vh/',
  }),
  iwaki: m({
    descriptionLong:
      '「日本のフィジカルスタンダードを変える」を掲げて急成長。圧倒的な走力で殴り合う、特異なクラブ。クラブ運営はドームと密接に連携し、選手の身体能力強化を徹底する科学的アプローチが特徴。ハワイアンズスタジアムいわきはサッカー専用スタジアムで、福島県いわき市の街と一体になった応援文化を育てる。',
    official: { hp: 'https://www.iwakifc.jp/', x: 'https://x.com/iwakifc_pr', instagram: 'https://www.instagram.com/iwakifc/', shop: 'https://shop.iwakifc.jp/' },
    mascot: { name: 'ハーマー', description: 'いわきの海を象徴する赤いキャラクター。' },
    access: { station: 'いわき駅', walkMinutes: null, note: 'シャトルバスでハワイアンズスタジアムいわきへ' },
    awayTravel: { fromTokyo: { hours: '約 2.5 時間', yen: 9000, transport: 'JR 常磐線特急', note: '上野からひたち号で約 2 時間' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/iw/',
  }),
  toyama: m({
    descriptionLong:
      '立山と日本海に挟まれた青。地道なクラブ運営で長く J の舞台に立ち続ける。富山県総合運動公園陸上競技場を本拠地に、立山連峰の絶景を背景に試合が行われる。クラブカラーは青。富山の地元企業との連携で地域に根ざしたクラブ運営を展開している。',
    official: { hp: 'https://www.kataller.co.jp/', x: 'https://x.com/kataller_toyama', instagram: 'https://www.instagram.com/kataller_toyama/', shop: null },
    mascot: { name: 'ライカくん', description: '富山の自然を象徴する青いキャラクター。' },
    access: { station: '富山駅', walkMinutes: null, note: 'シャトルバスで富山県総合運動公園陸上競技場へ' },
    awayTravel: { fromTokyo: { hours: '約 2.5 時間', yen: 13000, transport: '北陸新幹線', note: '東京駅から富山駅' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/kt/',
  }),
  imabari: m({
    descriptionLong:
      '岡田武史氏が率いる「岡田メソッド」のクラブ。理論的な育成と組織サッカーで注目を集める。FC 今治高校サッカー部「FC 今治高校学園」を擁し、選手育成から地域貢献まで一貫した教育・スポーツ事業を展開する。アシックス里山スタジアムは新スタジアムで、瀬戸内海を望むロケーション。',
    official: { hp: 'https://www.fcimabari.com/', x: 'https://x.com/fcimabari_pr', instagram: 'https://www.instagram.com/fcimabari/', shop: 'https://shop.fcimabari.com/' },
    mascot: { name: 'Q1グランパパ', description: '今治タオルをモチーフにしたキャラクター。' },
    access: { station: '今治駅', walkMinutes: null, note: 'シャトルバスでアシックス里山スタジアムへ' },
    awayTravel: { fromTokyo: { hours: '約 4 時間 (飛行機)', yen: 35000, transport: '飛行機 + バス', note: '羽田 → 松山空港から今治へ' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/fi/',
  }),
  tegevajaro: m({
    descriptionLong:
      '南九州の青。地域とともに地道に階段を上る挑戦者。宮崎県総合運動公園陸上競技場を本拠地に、温暖な気候を生かしたサッカーを展開する。「テゲバジャーロ」は宮崎の方言「テゲ (とても)」「バジャーロ (素晴らしい)」を組み合わせた愛らしい命名。地方クラブの新興勢力。',
    official: { hp: 'https://www.tegevajaromiyazaki.com/', x: 'https://x.com/tegevajaroMZK', instagram: 'https://www.instagram.com/tegevajaro_miyazaki/', shop: null },
    mascot: { name: 'テゲバンビ', description: '宮崎の象徴的キャラクター。' },
    access: { station: '宮崎駅', walkMinutes: null, note: 'シャトルバスで宮崎県総合運動公園陸上競技場へ' },
    awayTravel: { fromTokyo: { hours: '約 2 時間 (飛行機)', yen: 30000, transport: '飛行機', note: '羽田 → 宮崎空港' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/tm/',
  }),
  'tochigi-city': m({
    descriptionLong:
      '栃木 SC に続いて誕生した北関東の青。地域と新しい挑戦の歴史を紡ぐ、栃木県栃木市を本拠地とする市民クラブ。CITY フットボールパークは新スタジアムで、栃木の蔵の街文化と結びついた独自の魅力を持つ。北関東サッカー文化の発展に貢献する重要なクラブ。',
    official: { hp: 'https://www.tochigi-city.com/', x: 'https://x.com/TOCHIGI_CITY_FC', instagram: 'https://www.instagram.com/tochigicityfc/', shop: null },
    mascot: { name: 'シティくん', description: '栃木の蔵をモチーフにしたキャラクター。' },
    access: { station: '栃木駅', walkMinutes: null, note: 'シャトルバスで CITY フットボールパークへ' },
    awayTravel: { fromTokyo: { hours: '約 1.5 時間', yen: 1500, transport: '東武日光線', note: '浅草駅から特急' } },
    ticketUrl: 'https://www.jleague-ticket.jp/club/tc/',
  }),
}
