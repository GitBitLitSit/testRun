"use client"

import { useEffect, useState } from "react"
import { Analytics } from "@vercel/analytics/next"
import { readStoredConsent, subscribeToConsentUpdates } from "@/lib/cookie-consent"

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

  if (!enabled) return null
  return <Analytics />
}
