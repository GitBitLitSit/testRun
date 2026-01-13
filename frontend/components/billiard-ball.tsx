"use client"

import type React from "react"

import { cn } from "@/lib/utils"

interface BilliardBallProps {
  number: number
  children: React.ReactNode
  title: string
  className?: string
  delay?: string
}

const ballColors: Record<number, { solidColor: string; isStripe: boolean }> = {
  1: { solidColor: "#f5d742", isStripe: false },
  2: { solidColor: "#2f4fd0", isStripe: false },
  3: { solidColor: "#e84040", isStripe: false },
  4: { solidColor: "#6b2d91", isStripe: false },
  5: { solidColor: "#e8762f", isStripe: false },
  6: { solidColor: "#3d8b5f", isStripe: false },
  7: { solidColor: "#8b2a35", isStripe: false },
  8: { solidColor: "#1a1a1a", isStripe: false },
  9: { solidColor: "#f5d742", isStripe: true },
  10: { solidColor: "#2f4fd0", isStripe: true },
  11: { solidColor: "#e84040", isStripe: true },
  12: { solidColor: "#6b2d91", isStripe: true },
  13: { solidColor: "#e8762f", isStripe: true },
  14: { solidColor: "#3d8b5f", isStripe: true },
  15: { solidColor: "#8b2a35", isStripe: true },
}

export function BilliardBall({ number, children, title, className, delay }: BilliardBallProps) {
  const ballConfig = ballColors[number] || ballColors[1]
  const isStripe = ballConfig.isStripe

  return (
    <div
      className={cn(
        "group relative flex flex-col items-center opacity-0 animate-slide-up",
        "bg-gradient-to-b from-[#1a1f2e] to-[#0f1218] rounded-3xl p-8 pb-10",
        "border border-white/10 hover:border-primary/30 transition-all duration-500",
        "shadow-xl hover:shadow-2xl hover:shadow-primary/10",
        delay,
        className,
      )}
    >
      {/* Ball */}
      <div className="relative mb-6">
        <div
          className={cn(
            "w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center relative",
            "transform transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2",
          )}
          style={{
            boxShadow: `0 15px 30px rgba(0,0,0,0.4), inset 0 -15px 30px rgba(0,0,0,0.3), inset 0 15px 30px rgba(255,255,255,0.12)`,
            background: isStripe
              ? `linear-gradient(to bottom, white 0%, white 25%, ${ballConfig.solidColor} 25%, ${ballConfig.solidColor} 75%, white 75%, white 100%)`
              : ballConfig.solidColor,
          }}
        >
          {/* Number circle */}
          <div
            className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center shadow-lg border border-gray-200"
            style={{ boxShadow: "0 4px 15px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.9)" }}
          >
            <span className="text-2xl md:text-3xl font-bold text-gray-900">{number}</span>
          </div>

          {/* Main shine - subtle */}
          <div className="absolute top-4 left-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/35 blur-md z-20" />
          <div className="absolute top-6 left-8 w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/60 z-20" />
          <div className="absolute top-8 left-10 w-2 h-2 md:w-3 md:h-3 rounded-full bg-white z-20" />

          {/* Secondary shine - very subtle */}
          <div className="absolute bottom-6 right-6 w-6 h-6 md:w-8 md:h-8 rounded-full bg-white/10 blur-sm z-20" />
        </div>
      </div>

      {/* Content */}
      <div className="text-center max-w-xs px-2">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-white/60 text-sm md:text-base leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
