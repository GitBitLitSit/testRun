"use client"

import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { useTranslation } from "@/node_modules/react-i18next"

export function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold text-primary">15 Palle</h3>
            <p className="text-sm text-muted-foreground">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("footer.contact")}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Via Bruno Buozzi, 12, 39100 Bolzano BZ</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">392 810 0919</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">info@15palle.it</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("footer.openingHours")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-primary" />
                <div className="text-muted-foreground">
                  <p>Mon-Sat: 2:30 PM - 1:00 AM</p>
                  <p>Sunday: 2:30 PM - 12:00 AM</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">{t("footer.quickLinks")}</h3>
            <div className="space-y-2 text-sm">
              <a href="/" className="block text-muted-foreground transition-colors hover:text-primary">
                {t("footer.home")}
              </a>
              <a href="/opening-times" className="block text-muted-foreground transition-colors hover:text-primary">
                {t("footer.openingTimes")}
              </a>
              <a href="/contact" className="block text-muted-foreground transition-colors hover:text-primary">
                {t("footer.contactLink")}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} 15 Palle. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  )
}
