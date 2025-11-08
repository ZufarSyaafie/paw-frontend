export function AuthDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-gradient-to-r from-white/0 to-white/20"></div>
      <span className="text-xs text-white/60 uppercase tracking-wider font-semibold">Or Continue With</span>
      <div className="flex-1 h-px bg-gradient-to-l from-white/0 to-white/20"></div>
    </div>
  )
}