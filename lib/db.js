import { neon } from '@neondatabase/serverless'

// 遅延初期化: build 時 (module 評価時) に neon() を呼ばないことで、
// DATABASE_URL 未設定の環境 (Vercel プレビューのビルド等) でも import が成功する。
// 実クエリ実行時に初めて接続文字列を要求する。
let _sql
function sql(...args) {
  if (!_sql) _sql = neon(process.env.DATABASE_URL)
  return _sql(...args)
}

export default sql
