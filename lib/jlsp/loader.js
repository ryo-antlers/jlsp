import sql from '../db.js'
import { applyVectorOverrides, filterDiagnoseScope } from './clubs.js'

/**
 * server-only: DB から JLSP の上書きデータをまとめて読み込む。
 * DB アクセス失敗時は空オブジェクトを返してフォールバック (基準値のみで動く)。
 *
 * 戻り値:
 *   {
 *     allClubs:           // override 適用済の全60クラブ
 *     clubs:              // J1+J2 = 40クラブ (診断対象)
 *     vectorOverrides:    // { clubId: { axisId: value } }
 *     questionOverrides:  // { clubId: { questionId: value } }
 *   }
 */
export async function loadJlspState() {
  const [vectorRows, questionRows] = await Promise.all([
    sql`SELECT club_id, axis_id, value FROM jlsp_vector_overrides`.catch(() => []),
    sql`SELECT club_id, question_id, value FROM jlsp_question_overrides`.catch(() => []),
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

  const allClubs = applyVectorOverrides(vectorOverrides)
  const clubs = filterDiagnoseScope(allClubs)

  return { allClubs, clubs, vectorOverrides, questionOverrides }
}
