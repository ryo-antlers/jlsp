import LoginForm from './login-form'

export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <p className="text-[10px] font-mono tracking-[0.3em] text-zinc-500 mb-1 text-center">
          JLSP ADMIN
        </p>
        <h1 className="text-xl font-black tracking-tight mb-6 text-center">
          ログイン
        </h1>
        <LoginForm />
      </div>
    </div>
  )
}
