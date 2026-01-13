"use client"

import { useEffect, useRef, useState } from "react"
import type { CheckInEvent } from "@/lib/types"

export function useRealtimeCheckIns(onCheckIn: (event: CheckInEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_API_URL

    if (!wsUrl) {
      console.error("[v0] WebSocket URL is not configured")
      setError("WebSocket URL is not configured")
      return
    }

    console.log("[v0] Connecting to WebSocket:", wsUrl)

    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      console.log("[v0] WebSocket connected")
      setIsConnected(true)
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as CheckInEvent
        console.log("[v0] Received check-in event:", data)

        if (data.type === "NEW_CHECKIN") {
          onCheckIn(data)
        }
      } catch (err) {
        console.error("[v0] Failed to parse WebSocket message:", err)
      }
    }

    ws.onerror = (error) => {
      console.error("[v0] WebSocket error:", error)
      setError("WebSocket connection error")
    }

    ws.onclose = () => {
      console.log("[v0] WebSocket disconnected")
      setIsConnected(false)
    }

    return () => {
      console.log("[v0] Closing WebSocket connection")
      ws.close()
    }
  }, [onCheckIn])

  return { isConnected, error }
}
