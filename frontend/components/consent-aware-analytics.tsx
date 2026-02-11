"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import { readStoredConsent, subscribeToConsentUpdates } from "@/lib/cookie-consent"

const canLoadVercelAnalytics =
  Boolean(process.env.NEXT_PUBLIC_VERCEL_ENV) ||
  process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true"

export function ConsentAwareAnalytics() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const stored = readStoredConsent()
    setEnabled(Boolean(stored?.preferences.analytics))

    const unsubscribe = subscribeToConsentUpdates((consent) => {
      setEnabled(Boolean(consent?.preferences.analytics))
    })
    return unsubscribe
  }, [])

  if (!enabled || !canLoadVercelAnalytics) return null
  return <Analytics />
}
