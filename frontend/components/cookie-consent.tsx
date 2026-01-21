"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DEFAULT_PREFERENCES,
  readStoredConsent,
  saveStoredConsent,
  type CookieConsentPreferences,
} from "@/lib/cookie-consent"

export function CookieConsent() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(DEFAULT_PREFERENCES)

  useEffect(() => {
    const stored = readStoredConsent()
    if (stored) {
      setPreferences(stored.preferences)
      setIsOpen(false)
    } else {
      setIsOpen(true)
    }
  }, [])

  const acceptAll = () => {
    const next = { necessary: true, analytics: true, marketing: true }
    saveStoredConsent(next)
    setPreferences(next)
    setIsOpen(false)
    setExpanded(false)
  }

  const rejectAll = () => {
    const next = { necessary: true, analytics: false, marketing: false }
    saveStoredConsent(next)
    setPreferences(next)
    setIsOpen(false)
    setExpanded(false)
  }

  const savePreferences = () => {
    saveStoredConsent(preferences)
    setIsOpen(false)
    setExpanded(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur animate-slide-up">
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">{t("cookie.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("cookie.description")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExpanded((prev) => !prev)}
                aria-expanded={expanded}
                aria-controls="cookie-preferences"
              >
                {expanded ? t("cookie.hidePreferences") : t("cookie.managePreferences")}
              </Button>
              <Button type="button" variant="secondary" onClick={rejectAll}>
                {t("cookie.rejectAll")}
              </Button>
              <Button type="button" onClick={acceptAll}>
                {t("cookie.acceptAll")}
              </Button>
            </div>
          </div>

          {expanded ? (
            <div id="cookie-preferences" className="border-t border-border/60 pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <label htmlFor="cookie-necessary" className="text-sm font-medium text-foreground">
                        {t("cookie.necessaryTitle")}
                      </label>
                      <p className="mt-1 text-xs text-muted-foreground">{t("cookie.necessaryDesc")}</p>
                    </div>
                    <Switch id="cookie-necessary" checked disabled aria-label={t("cookie.necessaryTitle")} />
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <label htmlFor="cookie-analytics" className="text-sm font-medium text-foreground">
                        {t("cookie.analyticsTitle")}
                      </label>
                      <p className="mt-1 text-xs text-muted-foreground">{t("cookie.analyticsDesc")}</p>
                    </div>
                    <Switch
                      id="cookie-analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, analytics: checked }))
                      }
                      aria-label={t("cookie.analyticsTitle")}
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <label htmlFor="cookie-marketing" className="text-sm font-medium text-foreground">
                        {t("cookie.marketingTitle")}
                      </label>
                      <p className="mt-1 text-xs text-muted-foreground">{t("cookie.marketingDesc")}</p>
                    </div>
                    <Switch
                      id="cookie-marketing"
                      checked={preferences.marketing}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({ ...prev, marketing: checked }))
                      }
                      aria-label={t("cookie.marketingTitle")}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">{t("cookie.changeHint")}</p>
                <Button type="button" onClick={savePreferences}>
                  {t("cookie.savePreferences")}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">{t("cookie.changeHint")}</p>
          )}
        </div>
      </div>
    </div>
  )
}
