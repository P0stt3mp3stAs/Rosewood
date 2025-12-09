"use client"

interface Props {
  label: string
  onClick?: () => void
  className?: string
}

export default function LiquidGlassButton({ label, onClick, className = "" }: Props) {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-10 py-3 rounded-full
        overflow-hidden
        select-none cursor-pointer

        bg-white/10              /* very light tint */
        backdrop-blur-lg          /* real frosted glass */
        backdrop-brightness-125   /* slightly brighter behind */

        border border-white/20
        shadow-[0_8px_25px_rgba(0,0,0,0.45)]

        transition-all duration-300
        hover:scale-[1.025]
        active:scale-95
        ${className}
      `}
    >
      {/* DEPTH */}
      <span className="
        absolute inset-0 rounded-2xl
        shadow-[inset_0_-6px_12px_rgba(0,0,0,0.25)]
        pointer-events-none
      " />

      {/* REFLECTION */}
      <span className="
        absolute inset-0 rounded-2xl pointer-events-none
        bg-gradient-to-b from-white/30 to-transparent
        mix-blend-screen
      " />

      {/* CURVED LIGHT STREAK */}
      <span className="
        absolute inset-0 rounded-2xl pointer-events-none
        bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.3),transparent_60%)]
        blur-[10px]
      " />

      {/* EDGE GLOW */}
      <span className="
        absolute inset-0 rounded-2xl pointer-events-none
        ring-1 ring-white/15
      " />

      {/* TEXT */}
      <span className="relative text-white font-medium tracking-wide drop-shadow-md">
        {label}
      </span>
    </button>
  )
}
