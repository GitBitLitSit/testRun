"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, Info } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function OpeningTimesPage() {
  const { t } = useTranslation()
  const schedule = [
    { day: t("openingTimes.days.monday"), hours: "2:30 PM - 1:00 AM", special: false },
    { day: t("openingTimes.days.tuesday"), hours: "2:30 PM - 1:00 AM", special: false },
    { day: t("openingTimes.days.wednesday"), hours: "2:30 PM - 1:00 AM", special: false },
    { day: t("openingTimes.days.thursday"), hours: "2:30 PM - 1:00 AM", special: false },
    { day: t("openingTimes.days.friday"), hours: "2:30 PM - 1:00 AM", special: false },
    { day: t("openingTimes.days.saturday"), hours: "2:30 PM - 1:00 AM", special: false },
    { day: t("openingTimes.days.sunday"), hours: "2:30 PM - 12:00 AM", special: true },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <Clock className="mx-auto mb-4 h-16 w-16" />
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">{t("openingTimes.title")}</h1>
              <p className="text-lg leading-relaxed text-primary-foreground/90">
                {t("openingTimes.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Schedule Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Calendar className="h-6 w-6 text-primary" />
                    {t("openingTimes.weeklySchedule")}
                  </CardTitle>
                  <CardDescription>{t("openingTimes.weeklyScheduleDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {schedule.map((item) => (
                      <div
                        key={item.day}
                        className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                          item.special ? "border-secondary/30 bg-secondary/5" : "border-border"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${item.special ? "bg-secondary" : "bg-primary"}`} />
                          <span className="text-lg font-medium">{item.day}</span>
                        </div>
                        <span className="text-lg font-semibold text-primary">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <Card className="border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Info className="h-5 w-5 text-primary" />
                    {t("openingTimes.specialEvents")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                    {t("openingTimes.specialEventsText")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-accent" />
                    {t("openingTimes.lastEntry")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                    {t("openingTimes.lastEntryText")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Holiday Notice */}
              <Card className="mt-8 border-secondary/30 bg-secondary/5">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Info className="mt-1 h-6 w-6 flex-shrink-0 text-secondary" />
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">{t("openingTimes.holidayHours")}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {t("openingTimes.holidayHoursText")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
