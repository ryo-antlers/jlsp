/**
 * クラブごとの「主なOB選手」「現在は海外でプレーしている選手」リスト。
 *
 * jleakstats DB には海外でプレー中の選手データが無い (player_career_summary は
 * 国内Jリーグのみ) ため、ここで手動メンテする方針。
 *
 * 注意:
 * - 値は best-effort で投入。ryo さんによる校正前提
 * - 海外組は移籍が頻繁なので定期的なメンテが必要
 * - 引退・国内移籍した選手は overseas から外す
 * - notableAlumni は「過去にこのクラブを象徴した選手」(現所属無関係)
 * - 値が未登録のクラブは UI 側で section ごと非表示
 *
 * 形式:
 *   notableAlumni:   string[]                  — 選手名のみ
 *   overseasPlayers: { name, club, country }[] — 海外現役クラブ
 */

export const NOTABLE_ALUMNI = {
  // ===== J1 =====
  kashima: ['内田篤人', '大迫勇也', '柴崎岳', '小笠原満男', '中田浩二', '曽ヶ端準'],
  urawa: ['福田正博', '山田暢久', '阿部勇樹', '槙野智章', '興梠慎三', '鈴木啓太'],
  kawasaki: ['中村憲剛', '大久保嘉人', '三笘薫', '田中碧', '守田英正', '旗手怜央'],
  'f-marinos': ['中村俊輔', '松田直樹', '中澤佑二', '久保竜彦', '仲川輝人', '山瀬功治'],
  fctokyo: ['石川直宏', '米本拓司', '武藤嘉紀', '中島翔哉', '平山相太', '長友佑都'],
  verdy: ['ラモス瑠偉', '三浦知良', '北澤豪', '武田修宏', '山口素弘', '柱谷哲二'],
  reysol: ['北嶋秀朗', '大谷秀和', '工藤壮人', '酒井宏樹', '中谷進之介', '田中順也'],
  grampus: ['楢崎正剛', 'ストイコビッチ', '玉田圭司', '増川隆洋', '田口泰士', '永井謙佑'],
  gamba: ['遠藤保仁', '宮本恒靖', '二川孝広', '稲本潤一', '今野泰幸', '宇佐美貴史'],
  cerezo: ['香川真司', '乾貴士', '柿谷曜一朗', '山口蛍', '南野拓実', '西澤明訓'],
  kobe: ['大久保嘉人', 'イニエスタ', 'ポドルスキ', '田中順也', '三浦知良', 'ビジャ'],
  sanfrecce: ['佐藤寿人', '高萩洋次郎', '浅野拓磨', '森崎和幸', '森﨑浩司', '高木琢也'],
  avispa: ['城後寿', '城彰二', '久藤清一', '山下芳輝'],
  kyoto: ['大黒将志', '黒部光昭', '美濃部直彦', '朴智星'],
  machida: ['平戸太貴', '太田修介', '鄭大世', '中島裕希'],
  chiba: ['北嶋秀朗', '茶野隆行', '工藤浩平', '巻誠一郎', '阿部勇樹'],
  mito: ['鈴木隆行', '本間幸司'],
  shimizu: ['沢登正朗', '三浦淳寛', '安永聡太郎', '高原直泰', '三都主アレサンドロ'],
  okayama: ['関戸健二', '矢島慎也'],
  nagasaki: ['玉田圭司', '安藤淳'],

  // ===== J2 (大半は未投入。後で ryo さん校正) =====
  tosu: ['豊田陽平', '金崎夢生', '高橋義希'],
  shonan: ['古橋亨梧', '大野和成', '高山薫', '永木亮太'],
  iwata: ['中山雅史', '名波浩', '高原直泰', '川口能活', 'ドゥンガ'],
  sapporo: ['小野伸二', '都倉賢', 'チャナティップ', '田中俊也'],
  niigata: ['本間至恩', '酒井高徳', '矢野貴章', '田中達也'],
  yokohamafc: ['三浦知良', '前田大然', '高木善朗'],
  omiya: ['村上和弘', '渡部博文', '富山貴光'],
  sendai: ['梁勇基', '富田晋伍', '関口訓充'],
  yamagata: ['宮阪政樹', '本田拓也'],
  akita: ['田中智大'],
  kofu: ['ハーフナー・マイク', '森田浩史', '津田知宏'],
  tokushima: ['濵田水輝', '渡大生'],
  oita: ['西山貴永', 'カイオ', '高松大樹'],
  fujieda: [],
  hachinohe: [],
  iwaki: ['有馬幸太郎', '日高大'],
  toyama: ['苔口卓也', '苅部隆太郎'],
  imabari: ['駒野友一'],
  tegevajaro: [],
  'tochigi-city': [],
}

export const OVERSEAS_PLAYERS = {
  // ===== J1 =====
  kashima: [
    { name: '上田綺世', club: 'Feyenoord', country: 'オランダ' },
  ],
  urawa: [
    { name: '伊藤敦樹', club: 'Stade Brestois', country: 'フランス' },
  ],
  kawasaki: [
    { name: '三笘薫', club: 'Brighton', country: 'イングランド' },
    { name: '田中碧', club: 'Leeds United', country: 'イングランド' },
    { name: '守田英正', club: 'Sporting CP', country: 'ポルトガル' },
    { name: '旗手怜央', club: 'Celtic', country: 'スコットランド' },
  ],
  'f-marinos': [],
  fctokyo: [],
  verdy: [
    { name: '久保建英', club: 'Real Sociedad', country: 'スペイン' },
  ],
  reysol: [],
  grampus: [
    { name: '相馬勇紀', club: 'Casa Pia', country: 'ポルトガル' },
  ],
  gamba: [],
  cerezo: [
    { name: '南野拓実', club: 'AS Monaco', country: 'フランス' },
  ],
  kobe: [
    { name: '古橋亨梧', club: 'Birmingham City', country: 'イングランド' },
  ],
  sanfrecce: [
    { name: '浅野拓磨', club: 'VfL Bochum', country: 'ドイツ' },
    { name: '川辺駿', club: 'Standard Liège', country: 'ベルギー' },
  ],
  avispa: [],
  kyoto: [],
  machida: [],
  chiba: [],
  mito: [],
  shimizu: [
    { name: '鈴木唯人', club: 'Brøndby IF', country: 'デンマーク' },
  ],
  okayama: [],
  nagasaki: [],

  // ===== J2 =====
  tosu: [],
  shonan: [],
  iwata: [],
  sapporo: [],
  niigata: [],
  yokohamafc: [],
  omiya: [],
  sendai: [],
  yamagata: [],
  akita: [],
  kofu: [],
  tokushima: [],
  oita: [],
  fujieda: [],
  hachinohe: [],
  iwaki: [],
  toyama: [],
  imabari: [],
  tegevajaro: [],
  'tochigi-city': [],
}
