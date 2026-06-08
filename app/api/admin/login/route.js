import { cookies } from 'next/headers'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PASSWORD = process.env.ADMIN_PASSWORD ?? 'jac'

/**
 * パスワード認証。一致したら 'admin-auth=ok' Cookie をセット (30 日)。
 * middleware.js が /admin/* と /api/admin/* に対し Cookie を要求する。
 */
export async function POST(req) {
  const body = await req.json().catch(() => null)
  if (!body || typeof body.password !== 'string') {
    return Response.json({ error: 'password required' }, { status: 400 })
  }
  if (body.password !== PASSWORD) {
    return Response.json({ error: 'wrong password' }, { status: 401 })
  }
  const c = await cookies()
  c.set('admin-auth', 'ok', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 日
  })
  return Response.json({ ok: true })
}
