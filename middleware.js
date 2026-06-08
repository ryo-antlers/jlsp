import { NextResponse } from 'next/server'

/**
 * /admin/* と /api/admin/* に簡易パスワード認証をかける。
 * cookie 'admin-auth=ok' で認証済み判定、無い時は /admin/login に飛ばす
 * (API は 401 を返す)。
 *
 * パスワード自体の検証は /api/admin/login route が行う。
 */
export function middleware(req) {
  const { pathname } = req.nextUrl

  // login 関連は素通り
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  const auth = req.cookies.get('admin-auth')?.value
  if (auth === 'ok') return NextResponse.next()

  // API は 401 (JSON で返す)
  if (pathname.startsWith('/api/')) {
    return new NextResponse(
      JSON.stringify({ error: 'unauthorized' }),
      { status: 401, headers: { 'content-type': 'application/json' } },
    )
  }

  // ページは login へ redirect (元の URL を ?next= で持つ)
  const url = req.nextUrl.clone()
  url.pathname = '/admin/login'
  url.search = `?next=${encodeURIComponent(pathname)}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
