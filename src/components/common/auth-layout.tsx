export function AuthLayout({
  children,
  hideFooter = false,
}: {
  children: React.ReactNode
  hideFooter?: boolean
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-800/40 to-blue-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {children}
        </div>
        {!hideFooter && (
          <p className="text-center text-sm text-white/60 mt-8">
            © 2025 Perpustakaan Naratama. All rights reserved.
          </p>
        )}
      </div>
    </div>
  )
}