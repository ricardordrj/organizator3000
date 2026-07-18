export function AmbientGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute -top-24 -left-24 size-72 rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--primary), transparent 70%)' }}
      />
      <div
        className="absolute top-1/3 -right-32 size-96 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--ring), transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 left-1/4 size-80 rounded-full opacity-[0.15] blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--ember), transparent 70%)' }}
      />
    </div>
  )
}
