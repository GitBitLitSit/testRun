export type CookieConsentPreferences = {
  necessary: true
  analytics: boolean
  marketing: boolean
}

export type CookieConsentState = {
  version: number
  timestamp: string
  preferences: CookieConsentPreferences
}

export const CONSENT_VERSION = 1
export const CONSENT_STORAGE_KEY = "cookie-consent"
export const CONSENT_COOKIE_NAME = "cookie_consent"
export const CONSENT_EVENT = "cookie-consent-updated"

export const DEFAULT_PREFERENCES: CookieConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
}

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function parseConsent(raw: string | null): CookieConsentState | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState> | null
    if (!parsed || typeof parsed !== "object") return null
    if (typeof parsed.version !== "number" || parsed.version !== CONSENT_VERSION) return null
    const preferences = parsed.preferences as Partial<CookieConsentPreferences> | undefined
    return {
      version: CONSENT_VERSION,
      timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: Boolean(preferences?.analytics),
        marketing: Boolean(preferences?.marketing),
      },
    }
  } catch {
    return null
  }
}

function readCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escaped}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

export function readStoredConsent(): CookieConsentState | null {
  if (typeof window === "undefined") return null
  let consent: CookieConsentState | null = null
  try {
    consent = parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY))
  } catch {
    consent = null
  }
  if (!consent) {
    const cookieValue = readCookieValue(CONSENT_COOKIE_NAME)
    consent = parseConsent(cookieValue)
    if (consent) {
      try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent))
      } catch {
        // Ignore storage failures.
      }
    }
  }
  return consent
}

export function saveStoredConsent(preferences: CookieConsentPreferences): CookieConsentState | null {
  if (typeof window === "undefined") return null
  const consent: CookieConsentState = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    preferences: {
      necessary: true,
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
    },
  }
  const encoded = encodeURIComponent(JSON.stringify(consent))
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent))
  } catch {
    // Ignore storage failures.
  }
  if (typeof document !== "undefined") {
    const secure = window.location?.protocol === "https:" ? "; secure" : ""
    document.cookie = `${CONSENT_COOKIE_NAME}=${encoded}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax${secure}`
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }))
  return consent
}

export function subscribeToConsentUpdates(
  handler: (consent: CookieConsentState | null) => void,
) {
  if (typeof window === "undefined") return () => {}
  const handleCustom = (event: Event) => {
    const custom = event as CustomEvent<CookieConsentState>
    handler(custom.detail ?? null)
  }
  const handleStorage = (event: StorageEvent) => {
    if (event.key && event.key !== CONSENT_STORAGE_KEY) return
    handler(readStoredConsent())
  }
  window.addEventListener(CONSENT_EVENT, handleCustom)
  window.addEventListener("storage", handleStorage)
  return () => {
    window.removeEventListener(CONSENT_EVENT, handleCustom)
    window.removeEventListener("storage", handleStorage)
  }
}
