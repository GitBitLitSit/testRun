"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"
import i18n, { getStoredLanguage, setStoredLanguage, type SupportedLanguage } from "@/lib/i18n"
import LanguageSelector from "./LanguageSelector"

export function Navigation() {
  const { t } = useTranslation()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userType, setUserType] = useState<"customer" | "owner" | null>(null)
  const [language, setLanguage] = useState<SupportedLanguage>("it")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const memberData = localStorage.getItem("currentMember")

    if (token) {
      setIsLoggedIn(true)
      setUserType("owner")
    } else if (memberData) {
      setIsLoggedIn(true)
      setUserType("customer")
    } else {
      setIsLoggedIn(false)
      setUserType(null)
    }
  }, [pathname])

  useEffect(() => {
    const stored = getStoredLanguage()
    const initial = (stored || (i18n.language as any) || "it") as SupportedLanguage
    setLanguage(initial)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("currentMember")
    setIsLoggedIn(false)
    setUserType(null)
    router.push("/")
  }

  const handleLanguageChange = (next: SupportedLanguage) => {
    setLanguage(next)
    setStoredLanguage(next)
  }

  const getNavItems = () => {
    const baseItems = [
      { href: "/", label: t("nav.home") },
      { href: "/opening-times", label: t("nav.openingTimes") },
      { href: "/contact", label: t("nav.contact") },
    ]

    if (!isLoggedIn) {
      return [...baseItems, { href: "/login", label: t("nav.login") }]
    }

    if (userType === "customer") {
      return [...baseItems, { href: "/customer/profile", label: t("nav.myProfile") }]
    }

    if (userType === "owner") {
      return [...baseItems, { href: "/owner/dashboard", label: t("nav.dashboard") }]
    }

    return baseItems
  }

  const navItems = getNavItems()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="15 Palle Logo" width={50} height={50} className="h-12 w-auto" />
            <span className="text-xl font-bold text-primary">15 Palle</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}

            {isLoggedIn && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleLogout} 
                // UPDATED: Added red text and hover classes
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
            
            <LanguageSelector
              language={language}
              onLanguageChange={(newLang) => handleLanguageChange(newLang as SupportedLanguage)}
            />
            
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">{t("nav.toggleMenu")}</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{t("nav.language")}</span>
                <LanguageSelector
                  language={language}
                  onLanguageChange={(newLang) => handleLanguageChange(newLang as SupportedLanguage)}
                />
              </div>

              {isLoggedIn && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  // UPDATED: Added red text and hover classes for mobile too
                  className="gap-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  {t("nav.logout")}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}