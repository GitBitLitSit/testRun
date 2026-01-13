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
        "group relative w-full max-w-sm mx-auto opacity-0 animate-slide-up",
        "aspect-square rounded-full overflow-hidden",
        "border border-border bg-card shadow-xl shadow-black/20",
        "transition-transform duration-300 hover:-translate-y-1",
        delay,
        className,
      )}
    >
      {/* Animated ball surface */}
      <div className={cn("relative h-full w-full animate-float motion-reduce:animate-none", delay)}>
        {/* Base color / stripe */}
        <div
          className="absolute inset-0"
          style={{
            background: isStripe
              ? `linear-gradient(to bottom, #f8fafc 0%, #f8fafc 26%, ${ballConfig.solidColor} 26%, ${ballConfig.solidColor} 74%, #f8fafc 74%, #f8fafc 100%)`
              : ballConfig.solidColor,
          }}
        />

        {/* Lighting + gloss */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.55),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_65%,transparent_35%,rgba(0,0,0,0.55)_100%)]" />

        {/* Subtle color ring highlight */}
        <div
          className="absolute inset-0 rounded-full ring-1"
          style={{
            boxShadow: `inset 0 0 0 1px ${ballConfig.solidColor}22, 0 12px 38px rgba(0,0,0,0.35)`,
          }}
        />

        {/* Number circle */}
        <div className="absolute left-1/2 top-7 -translate-x-1/2">
          <div className="h-14 w-14 rounded-full bg-white/95 ring-1 ring-black/10 shadow-lg shadow-black/20 flex items-center justify-center">
            <span className="text-2xl font-black text-gray-900">{number}</span>
          </div>
        </div>

        {/* Text overlay (keeps readability) */}
        <div className="relative z-10 h-full w-full flex items-center justify-center p-7 md:p-8">
          <div className="w-full rounded-2xl bg-black/35 backdrop-blur-sm ring-1 ring-white/10 px-5 py-5 md:px-6 md:py-6 text-center">
            <h3 className="text-lg md:text-xl font-black tracking-tight text-white">{title}</h3>
            <p className="mt-2 text-sm md:text-base leading-relaxed text-white/85">{children}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
