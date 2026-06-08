'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()
  const search = useSearchParams()
  const next = search.get('next') ?? '/admin/club-meta'

  function submit(e) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw }),
        })
        if (!res.ok) {
          setError('パスワードが違います')
          return
        }
        router.push(next)
        router.refresh()
      } catch (e) {
        setError(e.message ?? String(e))
      }
    })
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="password"
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="パスワード"
        autoFocus
        className="w-full px-3 py-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm"
      />
      {error && <p className="text-rose-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={pending || !pw}
        className="w-full px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-sm font-bold transition-colors"
      >
        {pending ? '認証中…' : 'ログイン'}
      </button>
    </form>
  )
}
