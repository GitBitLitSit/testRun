"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import {
  Baby,
  Clock,
  Cookie,
  Database,
  FileText,
  ListChecks,
  Lock,
  Mail,
  RefreshCw,
  Share2,
  Shield,
  UserCheck,
} from "lucide-react"
import { useTranslation } from "react-i18next"

const sectionClassName = "rounded-2xl border border-white/10 bg-card/70 backdrop-blur p-6 shadow-xl"
const sectionTitleClassName = "flex items-center gap-3 text-lg font-semibold text-white"
const lastUpdatedDate = "2/1/2026"

export default function PrivacyPolicyPage() {
  const { t } = useTranslation()
  const personalItems = t("privacyPolicy.sections.infoCollect.personalItems", { returnObjects: true }) as string[]
  const usageItems = t("privacyPolicy.sections.infoCollect.usageItems", { returnObjects: true }) as string[]
  const useInfoItems = t("privacyPolicy.sections.useInfo.items", { returnObjects: true }) as string[]
  const sharingItems = t("privacyPolicy.sections.sharing.items", { returnObjects: true }) as string[]
  const rightsItems = t("privacyPolicy.sections.rights.items", { returnObjects: true }) as string[]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1 pt-24 pb-16">
        <section className="relative overflow-hidden py-10">
          <div className="absolute inset-0 -z-10 [background:radial-gradient(900px_circle_at_15%_20%,rgba(47,105,159,0.12),transparent_60%),radial-gradient(900px_circle_at_90%_10%,rgba(245,215,66,0.08),transparent_60%)]" />
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/30">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white">{t("privacyPolicy.title")}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("privacyPolicy.lastUpdated", { date: lastUpdatedDate })}
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <FileText className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.introduction.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.introduction.body")}
              </p>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Database className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.infoCollect.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.infoCollect.body")}
              </p>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t("privacyPolicy.sections.infoCollect.personalTitle")}
                  </h3>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    {personalItems.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t("privacyPolicy.sections.infoCollect.usageTitle")}
                  </h3>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    {usageItems.map((item, index) => (
                      <li key={`${item}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <ListChecks className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.useInfo.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.useInfo.body")}
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {useInfoItems.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Share2 className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.sharing.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.sharing.body")}
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.sharing.disclosure")}
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {sharingItems.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Cookie className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.cookies.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.cookies.body")}
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.cookies.controls")}
              </p>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t("privacyPolicy.sections.cookies.necessaryTitle")}
                  </h3>
                  <p className="mt-2">{t("privacyPolicy.sections.cookies.necessaryBody")}</p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    {t("privacyPolicy.sections.cookies.analyticsTitle")}
                  </h3>
                  <p className="mt-2">{t("privacyPolicy.sections.cookies.analyticsBody")}</p>
                </div>
              </div>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Lock className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.security.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.security.body")}
              </p>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-semibold text-foreground">
                  {t("privacyPolicy.sections.security.awsTitle")}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {t("privacyPolicy.sections.security.awsBody")}
                </p>
              </div>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <UserCheck className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.rights.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.rights.body")}
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {rightsItems.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Clock className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.retention.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.retention.body")}
              </p>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Baby className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.children.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.children.body")}
              </p>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <RefreshCw className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.changes.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.changes.body")}
              </p>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Mail className="h-5 w-5 text-primary" />
                <h2>{t("privacyPolicy.sections.contact.title")}</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {t("privacyPolicy.sections.contact.body")}
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">
                    {t("privacyPolicy.sections.contact.addressLabel")}
                  </span>{" "}
                  {t("privacyPolicy.sections.contact.addressValue")}
                </p>
                <p>
                  <span className="font-semibold text-foreground">
                    {t("privacyPolicy.sections.contact.emailLabel")}
                  </span>{" "}
                  <a className="text-primary hover:text-primary/80" href="mailto:info@15palle.com">
                    {t("privacyPolicy.sections.contact.emailValue")}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
