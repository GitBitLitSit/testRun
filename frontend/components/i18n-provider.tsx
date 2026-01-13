"use client"

import type React from "react"
import { useEffect } from "react"
import { I18nextProvider } from "react-i18next"
import i18n, { getStoredLanguage, normalizeLanguage, setStoredLanguage } from "@/lib/i18n"

export function I18nProvider({
  initialLanguage,
  children,
}: {
  initialLanguage?: string
  children: React.ReactNode
}) {
  useEffect(() => {
    const stored = getStoredLanguage()
    const nextLang = stored ?? normalizeLanguage(initialLanguage)
    setStoredLanguage(nextLang)
  }, [initialLanguage])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}

