import data from './overrides.json' with { type: 'json' }

/**
 * クラブ別 質問オーバーライド。
 * 構造: { [clubId]: { [questionId]: number(-3..+3) } }
 *
 * Phase A-4 で jlsp_question_overrides テーブルへ移行予定。
 * それまではこの JSON を編集して反映する。
 */
export const OVERRIDES = data
