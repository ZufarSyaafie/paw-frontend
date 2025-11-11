export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-white mb-2">NARATAMA</h1>
      <p className="text-xs text-white/60 uppercase tracking-widest mb-6">Digital Library</p>
      <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>
      <p className="text-sm text-white/70">{subtitle}</p>
    </div>
  )
}