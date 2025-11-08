export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-cyan-400 mb-2">NARATAMA</h1>
      <p className="text-xs text-white/60 uppercase tracking-widest mb-6">Perpustakaan digital</p>
      <h2 className="text-3xl font-bold text-cyan-300 mb-2">{title}</h2>
      <p className="text-sm text-white/70">{subtitle}</p>
    </div>
  )
}