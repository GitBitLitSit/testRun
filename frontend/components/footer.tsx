"use client"

import Image from "next/image"
import { MapPin, Phone, Clock } from "lucide-react"
import { useTranslation } from "react-i18next"

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 items-start">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo.png"
                alt="15 Palle"
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="text-xl font-bold text-foreground">
                15 <span className="text-primary">Palle</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">{t("footer.contact")}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Via Bruno Buozzi, 12, 39100 Bolzano BZ</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">392 810 0919</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">
              {t("footer.openingHours")}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-primary flex-shrink-0" />
                <div className="text-muted-foreground">
                  <p>Mon-Sat: 2:30 PM - 1:00 AM</p>
                  <p>Sunday: 2:30 PM - 12:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links - Simplified */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">
              {t("footer.quickLinks")}
            </h3>
            <div className="space-y-2 text-sm">
              <a href="/" className="block text-muted-foreground transition-colors hover:text-primary">
                {t("footer.home")}
              </a>
              <a href="/login" className="block text-muted-foreground transition-colors hover:text-primary">
                {t("nav.login")}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} 15 Palle. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
