"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar, Maximize2, Minimize2, Printer, Download } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import type { Member } from "@/lib/types"

export default function CustomerProfilePage() {
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement | null>(null)

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

    const fileBase =
      `${member.firstName}-${member.lastName}-qr-code`.trim().replace(/\s+/g, "-").toLowerCase() ||
      "member-qr-code"
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${fileBase}.svg`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">Your membership information</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Profile Information */}
              <Card className="relative overflow-hidden border-muted/40 bg-gradient-to-br from-background via-background to-primary/5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                <CardHeader className="relative z-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle>Personal Information</CardTitle>
                    {member.blocked ? (
                      <Badge variant="destructive" className="text-sm px-3 py-1 font-semibold shadow-sm">
                        Account Blocked
                      </Badge>
                    ) : member.emailValid ? (
                      <Badge className="bg-green-600 text-sm px-3 py-1 font-semibold shadow-sm ring-1 ring-green-500/30">
                        Active Member
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-sm px-3 py-1 font-semibold shadow-sm">
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                  <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="relative z-10 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">First Name</p>
                    <div className="flex items-center gap-2 rounded-xl border border-muted/60 bg-background/60 px-3 py-2 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-primary/40 hover:bg-background/80">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{member.firstName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Last Name</p>
                    <div className="flex items-center gap-2 rounded-xl border border-muted/60 bg-background/60 px-3 py-2 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-primary/40 hover:bg-background/80">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{member.lastName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <div className="flex items-center gap-2 rounded-xl border border-muted/60 bg-background/60 px-3 py-2 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-primary/40 hover:bg-background/80">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="break-all">{member.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Member Since</p>
                    <div className="flex items-center gap-2 rounded-xl border border-muted/60 bg-background/60 px-3 py-2 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-primary/40 hover:bg-background/80">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(member.createdAt).toLocaleDateString()}</span>
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
                      <CardTitle>Your QR Code</CardTitle>
                      <CardDescription>Present this to scan at the club</CardDescription>
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
                    className={`relative mx-auto w-full max-w-md rounded-2xl border border-muted/50 bg-gradient-to-br from-primary/10 via-background to-background p-6 text-center shadow-sm ${
                      isFullscreen ? "scale-150" : ""
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                    <div className="relative space-y-6">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Membership Pass
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

                      <div className="rounded-xl border border-muted/40 bg-background/70 p-3 shadow-sm">
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            onClick={handlePrintQrCode}
                            size="icon"
                            variant="outline"
                            className="border-muted/60 bg-background/80 text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10"
                            aria-label="Print QR code"
                            title="Print QR code"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleDownloadQrCode}
                            className="border-muted/60 bg-background/80 text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/10"
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
