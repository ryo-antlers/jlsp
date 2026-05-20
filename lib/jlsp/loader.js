import sql from '../db.js'
import { applyVectorOverrides, filterDiagnoseScope, RAW_CLUBS } from './clubs.js'

/**
 * JLSP の clubId (例: "omiya") と jleakstats teams_master.name_ja の例外マッピング。
 * 改称や略記の差で一致しないクラブはここに追加する。
 */
const NAME_OVERRIDES = {
  omiya: 'ＲＢ大宮アルディージャ',
}

/**
 * server-only: DB から JLSP の上書きデータをまとめて読み込む。
 * vector/question overrides に加え、jleakstats teams_master から
 * color_primary を引っ張り、各クラブの公式カラーで RAW_CLUBS.color を上書きする。
 *
 * DB アクセス失敗時は空オブジェクトで安全にフォールバック (基準値のみで動く)。
 *
 * 戻り値:
 *   {
 *     allClubs:           // override 適用済の全60クラブ
 *     clubs:              // J1+J2 = 40クラブ (診断対象)
 *     vectorOverrides:    // { clubId: { axisId: value } }
 *     questionOverrides:  // { clubId: { questionId: value } }
 *     colorByClubId:      // { clubId: '#rrggbb' } jleakstats 公式色
 *     teamIdByClubId:     // { clubId: jleakstats teams_master.id }
 *   }
 */
export async function loadJlspState() {
  const [vectorRows, questionRows, teamRows] = await Promise.all([
    sql`SELECT club_id, axis_id, value FROM jlsp_vector_overrides`.catch(() => []),
    sql`SELECT club_id, question_id, value FROM jlsp_question_overrides`.catch(() => []),
    sql`SELECT id, name_ja, color_primary FROM teams_master`.catch(() => []),
  ])

  const vectorOverrides = {}
  for (const r of vectorRows) {
    if (!vectorOverrides[r.club_id]) vectorOverrides[r.club_id] = {}
    vectorOverrides[r.club_id][r.axis_id] = Number(r.value)
  }

  const questionOverrides = {}
  for (const r of questionRows) {
    if (!questionOverrides[r.club_id]) questionOverrides[r.club_id] = {}
    questionOverrides[r.club_id][r.question_id] = Number(r.value)
  }

  // teams_master.name_ja → { id, color_primary } のマップ
  const teamByName = new Map(teamRows.map((r) => [r.name_ja, r]))
  const colorByClubId = {}
  const teamIdByClubId = {}
  for (const c of RAW_CLUBS) {
    const lookupName = NAME_OVERRIDES[c.id] ?? c.name
    const team = teamByName.get(lookupName)
    if (team?.color_primary) {
      colorByClubId[c.id] = team.color_primary
    }
    if (team?.id != null) {
      teamIdByClubId[c.id] = Number(team.id)
    }
  }

  // vector + 色 を一括適用
  const allClubs = applyVectorOverrides(vectorOverrides).map((c) => {
    const color = colorByClubId[c.id]
    return color ? { ...c, color } : c
  })
  const clubs = filterDiagnoseScope(allClubs)

  return { allClubs, clubs, vectorOverrides, questionOverrides, colorByClubId, teamIdByClubId }
}
