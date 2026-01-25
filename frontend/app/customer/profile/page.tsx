"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"
import { User, Mail, Maximize2, Minimize2, Printer, Download } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import type { Member } from "@/lib/types"

export default function CustomerProfilePage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [member, setMember] = useState<Member | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement | null>(null)
  const membershipPassRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const memberData = localStorage.getItem("currentMember")
    if (memberData) {
      setMember(JSON.parse(memberData))
    } else {
      // Redirect to login if no member data found
      router.replace("/login")
    }
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem("currentMember")
    router.push("/")
  }

  const handlePrintQrCode = () => {
    if (!member) {
      return
    }

    const qrCodeElement = qrCodeRef.current?.querySelector("svg")
    if (!qrCodeElement) {
      return
    }

    const serializer = new XMLSerializer()
    let svgMarkup = serializer.serializeToString(qrCodeElement)

    if (!svgMarkup.includes("xmlns=")) {
      svgMarkup = svgMarkup.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')
    }

    const printWindow = window.open("", "qr-code-print", "width=600,height=600")
    if (!printWindow) {
      return
    }

    printWindow.document.open()
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Member QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 24px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              gap: 16px;
            }
            .meta {
              text-align: center;
            }
            .qr {
              border: 1px solid #e5e7eb;
              padding: 16px;
              border-radius: 12px;
              background: #ffffff;
            }
          </style>
        </head>
        <body>
          <div class="meta">
            <div style="font-size: 18px; font-weight: 700;">${member.firstName} ${member.lastName}</div>
            <div style="font-size: 14px; color: #6b7280;">${member.email}</div>
          </div>
          <div class="qr">${svgMarkup}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  const handleDownloadQrCode = () => {
    if (!member) {
      return
    }

    const qrCodeElement = qrCodeRef.current?.querySelector("svg")
    if (!qrCodeElement) {
      return
    }

    const serializer = new XMLSerializer()
    let svgMarkup = serializer.serializeToString(qrCodeElement)

    if (!svgMarkup.includes("xmlns=")) {
      svgMarkup = svgMarkup.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"')
    }

    const drawRoundedRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
    ) => {
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + width - radius, y)
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
      ctx.lineTo(x + width, y + height - radius)
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
      ctx.lineTo(x + radius, y + height)
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    }

    const fileBase = t("profile.membershipPassFileName", "15Palle-MembershipPass")
    const safeFileBase = fileBase.trim().replace(/\s+/g, "-") || "15Palle-MembershipPass"

    const passRect = membershipPassRef.current?.getBoundingClientRect()
    const passWidth = Math.max(320, Math.round(passRect?.width ?? 360))
    const passHeight = Math.max(420, Math.round(passRect?.height ?? 520))
    const scale = 3

    const canvas = document.createElement("canvas")
    canvas.width = Math.round(passWidth * scale)
    canvas.height = Math.round(passHeight * scale)
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }

    const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)
    const image = new Image()
    image.onload = () => {
      ctx.scale(scale, scale)

      const fontFamily = "Inter, Arial, sans-serif"
      const monoFamily =
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace"
      const passLabel = t("profile.membershipPass", "Membership Pass")
      const memberSinceLabel = t("profile.memberSince", "Member Since")
      const memberIdLabel = t("profile.memberId", "Member ID")
      const scanHint = t("profile.scanHint", "Scan at entry for fast check-in.")
      const fullName = `${member.firstName} ${member.lastName}`.trim()
      const memberSinceDate = new Date(member.createdAt).toLocaleDateString()
      const memberId = member.qrUuid.slice(0, 8).toUpperCase()

      const drawFitText = (
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        baseSize: number,
        minSize: number,
        weight = 600,
      ) => {
        let size = baseSize
        while (size > minSize) {
          ctx.font = `${weight} ${size}px ${fontFamily}`
          if (ctx.measureText(text).width <= maxWidth) {
            break
          }
          size -= 1
        }
        ctx.fillText(text, x, y)
      }

      const outerRadius = 24
      const outerGradient = ctx.createLinearGradient(0, 0, passWidth, passHeight)
      outerGradient.addColorStop(0, "#0f172a")
      outerGradient.addColorStop(1, "#020617")
      drawRoundedRect(ctx, 0, 0, passWidth, passHeight, outerRadius)
      ctx.fillStyle = outerGradient
      ctx.fill()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"
      ctx.lineWidth = 1
      ctx.stroke()

      const innerPadding = 18
      const innerX = innerPadding
      const innerY = innerPadding
      const innerW = passWidth - innerPadding * 2
      const innerH = passHeight - innerPadding * 2
      const innerRadius = 20
      const innerGradient = ctx.createLinearGradient(innerX, innerY, innerX + innerW, innerY + innerH)
      innerGradient.addColorStop(0, "rgba(30, 41, 59, 0.96)")
      innerGradient.addColorStop(1, "rgba(15, 23, 42, 0.96)")
      drawRoundedRect(ctx, innerX, innerY, innerW, innerH, innerRadius)
      ctx.fillStyle = innerGradient
      ctx.fill()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)"
      ctx.lineWidth = 1
      ctx.stroke()

      const centerX = passWidth / 2
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillStyle = "rgba(226, 232, 240, 0.7)"
      ctx.font = `600 10px ${fontFamily}`
      ctx.fillText(passLabel.toUpperCase(), centerX, innerY + 28)

      ctx.fillStyle = "#f8fafc"
      drawFitText(fullName, centerX, innerY + 56, innerW - 48, 22, 16, 700)

      ctx.fillStyle = "rgba(226, 232, 240, 0.78)"
      drawFitText(member.email, centerX, innerY + 78, innerW - 56, 13, 11, 500)

      const headerHeight = 96
      const footerHeight = Math.max(90, Math.round(innerH * 0.22))
      const maxQr = innerW * 0.62
      const available = innerH - headerHeight - footerHeight - 24
      const qrSize = Math.max(140, Math.min(maxQr, available))
      const qrX = centerX - qrSize / 2
      const qrY = innerY + headerHeight + Math.max(8, (available - qrSize) / 2)
      const qrPadding = 12

      drawRoundedRect(ctx, qrX - qrPadding, qrY - qrPadding, qrSize + qrPadding * 2, qrSize + qrPadding * 2, 16)
      ctx.fillStyle = "#ffffff"
      ctx.fill()
      ctx.strokeStyle = "rgba(15, 23, 42, 0.12)"
      ctx.stroke()

      ctx.save()
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(image, qrX, qrY, qrSize, qrSize)
      ctx.restore()

      const detailX = innerX + 16
      const detailW = innerW - 32
      const detailH = footerHeight
      const detailY = innerY + innerH - detailH - 14

      drawRoundedRect(ctx, detailX, detailY, detailW, detailH, 14)
      ctx.fillStyle = "rgba(15, 23, 42, 0.6)"
      ctx.fill()
      ctx.strokeStyle = "rgba(148, 163, 184, 0.25)"
      ctx.stroke()

      ctx.textAlign = "left"
      ctx.textBaseline = "alphabetic"
      ctx.fillStyle = "rgba(148, 163, 184, 0.9)"
      ctx.font = `600 9px ${fontFamily}`
      ctx.fillText(memberSinceLabel.toUpperCase(), detailX + 16, detailY + 22)
      ctx.textAlign = "right"
      ctx.fillText(memberIdLabel.toUpperCase(), detailX + detailW - 16, detailY + 22)

      ctx.textAlign = "left"
      ctx.fillStyle = "#e2e8f0"
      ctx.font = `600 12px ${fontFamily}`
      ctx.fillText(memberSinceDate, detailX + 16, detailY + 42)
      ctx.textAlign = "right"
      ctx.font = `600 12px ${monoFamily}`
      ctx.fillText(memberId, detailX + detailW - 16, detailY + 42)

      ctx.textAlign = "left"
      ctx.fillStyle = "rgba(226, 232, 240, 0.7)"
      ctx.font = `500 10px ${fontFamily}`
      ctx.fillText(scanHint, detailX + 16, detailY + detailH - 14)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            URL.revokeObjectURL(svgUrl)
            return
          }
          const downloadUrl = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = downloadUrl
          link.download = `${safeFileBase}.png`
          link.click()
          URL.revokeObjectURL(downloadUrl)
          URL.revokeObjectURL(svgUrl)
        },
        "image/png",
        1,
      )
    }
    image.onerror = () => {
      URL.revokeObjectURL(svgUrl)
    }
    image.src = svgUrl
  }

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">{t("profile.loading")}</p>
        </div>
      </div>
    )
  }

  const memberSinceDate = new Date(member.createdAt).toLocaleDateString()
  const memberIdShort = member.qrUuid.slice(0, 8).toUpperCase()
  const initials = `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`.toUpperCase()

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold">{t("profile.title")}</h1>
                <p className="text-muted-foreground">{t("profile.subtitle")}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Profile Information */}
              <Card className="relative overflow-hidden border-muted/40 bg-gradient-to-br from-background via-background to-primary/5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                <CardHeader className="relative z-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="space-y-2">
                      <CardTitle>{t("profile.personalInfo")}</CardTitle>
                      <CardDescription>{t("profile.accountDetails")}</CardDescription>
                    </div>
                    <div className="ml-auto flex w-full items-center justify-center sm:w-auto sm:justify-end">
                      {member.blocked ? (
                        <Badge variant="destructive" className="text-sm px-3 py-1 font-semibold shadow-sm">
                          {t("profile.accountBlocked")}
                        </Badge>
                      ) : member.emailValid ? (
                        <Badge className="bg-green-600 text-sm px-3 py-1 font-semibold shadow-sm ring-1 ring-green-500/30">
                          {t("profile.activeMember")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold shadow-sm">
                          {t("profile.pendingVerification")}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <div className="rounded-2xl border border-muted/50 bg-background/70 p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-lg font-semibold text-primary">
                        {initials}
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-semibold">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground break-all">{member.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-xl border border-muted/50 bg-background/60 shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{t("profile.firstName")}</span>
                      </div>
                      <span className="text-sm font-semibold">{member.firstName}</span>
                    </div>
                    <div className="h-px bg-muted/50" />
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{t("profile.lastName")}</span>
                      </div>
                      <span className="text-sm font-semibold">{member.lastName}</span>
                    </div>
                    <div className="h-px bg-muted/50" />
                    <div className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{t("profile.email")}</span>
                      </div>
                      <span className="text-sm font-semibold text-right break-all max-w-[60%]">{member.email}</span>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-muted/50 bg-background/60 px-4 py-3 shadow-sm">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {t("profile.memberSince")}
                      </p>
                      <p className="mt-2 text-sm font-semibold">{memberSinceDate}</p>
                    </div>
                    <div className="rounded-xl border border-muted/50 bg-background/60 px-4 py-3 shadow-sm">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">
                        {t("profile.memberId")}
                      </p>
                      <p className="mt-2 text-sm font-semibold font-mono tracking-[0.2em]">{memberIdShort}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              <Card
                className={`group relative overflow-hidden border-muted/40 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
                }`}
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{t("profile.yourQrCode")}</CardTitle>
                      <CardDescription>{t("profile.presentToScan")}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="shrink-0"
                    >
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent
                  className={`relative z-10 ${isFullscreen ? "flex flex-col items-center justify-center h-[calc(100vh-8rem)]" : ""}`}
                >
                  <div
                    ref={membershipPassRef}
                    className={`relative mx-auto w-full max-w-md rounded-2xl border border-muted/50 bg-gradient-to-br from-primary/10 via-background to-background p-6 text-center shadow-sm ${
                      isFullscreen ? "scale-150" : ""
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                    <div className="relative space-y-6">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          {t("profile.membershipPass")}
                        </p>
                        <p className={`font-bold ${isFullscreen ? "text-4xl" : "text-2xl"}`}>
                          {member.firstName} {member.lastName}
                        </p>
                        <p className={`text-muted-foreground ${isFullscreen ? "text-2xl" : "text-base"}`}>
                          {member.email}
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <div
                          ref={qrCodeRef}
                          className="rounded-lg border bg-white p-4 shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                        >
                          <QRCodeSVG value={member.qrUuid} size={isFullscreen ? 256 : 200} level="H" />
                        </div>
                      </div>

                      <div className="rounded-xl border border-muted/40 bg-background/70 p-4 text-left shadow-sm">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          <span>{t("profile.memberSince")}</span>
                          <span>{t("profile.memberId")}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-sm font-semibold">
                          <span>{memberSinceDate}</span>
                          <span className="font-mono tracking-[0.25em]">{memberIdShort}</span>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">{t("profile.scanHint")}</p>
                      </div>

                      <div className="rounded-full border border-muted/40 bg-background/80 px-4 py-2 shadow-sm">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={handlePrintQrCode}
                            size="icon"
                            variant="ghost"
                            className="size-10 rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/20"
                            aria-label="Print QR code"
                            title="Print QR code"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <div className="h-6 w-px bg-muted/60" />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleDownloadQrCode}
                            className="size-10 rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/20"
                            aria-label="Download QR code"
                            title="Download QR code"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
