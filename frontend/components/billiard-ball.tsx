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
        "group relative overflow-hidden rounded-3xl p-8 opacity-0 animate-slide-up",
        "border border-white/10 bg-white/[0.04] backdrop-blur",
        "shadow-2xl shadow-black/20 transition-all duration-500",
        "hover:-translate-y-1 hover:bg-white/[0.06]",
        delay,
        className,
      )}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `radial-gradient(circle at 30% 30%, ${ballConfig.solidColor}33, transparent 60%)` }}
      />

      {/* Ball (decorative, integrated) */}
      <div className="pointer-events-none absolute -right-10 -top-10 md:-right-12 md:-top-12">
        <div className="relative">
          <div
            className={cn(
              "w-44 h-44 md:w-52 md:h-52 rounded-full flex items-center justify-center relative",
              "transform transition-transform duration-500 group-hover:scale-[1.03]",
            )}
            style={{
              boxShadow:
                "0 18px 36px rgba(0,0,0,0.45), inset 0 -18px 34px rgba(0,0,0,0.35), inset 0 18px 32px rgba(255,255,255,0.10)",
              background: isStripe
                ? `linear-gradient(to bottom, #ffffff 0%, #ffffff 26%, ${ballConfig.solidColor} 26%, ${ballConfig.solidColor} 74%, #ffffff 74%, #ffffff 100%)`
                : `radial-gradient(circle at 30% 30%, #ffffff20, transparent 38%), ${ballConfig.solidColor}`,
            }}
          >
            {/* Gloss sweep */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.10),transparent_50%)]" />

            {/* Number circle */}
            <div
              className="relative z-10 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center border border-gray-200"
              style={{
                boxShadow: "0 8px 22px rgba(0,0,0,0.25), inset 0 2px 6px rgba(255,255,255,0.95)",
              }}
            >
              <span className="text-2xl md:text-3xl font-bold text-gray-900">{number}</span>
            </div>

            {/* Micro highlights */}
            <div className="absolute top-6 left-8 w-10 h-10 rounded-full bg-white/25 blur-md" />
            <div className="absolute top-10 left-12 w-3 h-3 rounded-full bg-white/80" />
          </div>

          {/* Ring highlight */}
          <div
            className="absolute inset-0 rounded-full ring-1 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ boxShadow: `0 0 0 1px ${ballConfig.solidColor}33, 0 0 30px ${ballConfig.solidColor}22` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-sm pr-16 md:pr-24">
        <h3 className="mt-2 text-xl md:text-2xl font-bold text-white tracking-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="mt-4 text-white/60 text-sm md:text-base leading-relaxed">{children}</p>
      </div>
    </div>
  )
}
