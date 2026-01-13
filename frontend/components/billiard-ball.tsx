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
        "group relative rounded-2xl border border-border bg-card p-6 transition-colors",
        "hover:bg-card/80",
        delay,
        className,
      )}
    >
      {/* Content */}
      <div className="relative">
        <div className="flex items-start gap-4">
          <div
            aria-hidden="true"
            className="relative mt-1 h-12 w-12 flex-none rounded-full shadow-sm ring-1 ring-black/10"
            style={{
              background: isStripe
                ? `linear-gradient(to bottom, #ffffff 0%, #ffffff 28%, ${ballConfig.solidColor} 28%, ${ballConfig.solidColor} 72%, #ffffff 72%, #ffffff 100%)`
                : `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 45%), ${ballConfig.solidColor}`,
            }}
          >
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.25),transparent_50%)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-6 w-6 rounded-full bg-white/90 text-[12px] font-bold text-gray-900 ring-1 ring-black/10 flex items-center justify-center">
                {number}
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-foreground tracking-tight">{title}</h3>
            <p className="mt-2 text-sm md:text-base text-muted-foreground leading-relaxed">{children}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
