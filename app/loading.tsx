export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface">
      <div className="relative flex flex-col items-center">
        {/* Animated logo or mark: minimalist circle pulse */}
        <div className="w-16 h-16 border border-primary/20 rounded-full flex items-center justify-center animate-[spin_3s_linear_infinite]">
          <div className="w-1 h-1 bg-primary rounded-full" />
        </div>
        
        {/* Editorial loading text */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <span 
            className="text-[10px] tracking-[0.5em] text-on-surface/40 uppercase"
            style={{ fontFamily: 'var(--font-label)' }}
          >
            Joyería en vidrio
          </span>
          <div className="w-24 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      </div>
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-tertiary/5 blur-[100px] rounded-full pointer-events-none" />
    </div>
  )
}
