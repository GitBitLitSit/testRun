"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar, Maximize2, Minimize2, Download, Wallet } from "lucide-react"
import { QRCodeSVG } from "qrcode.react" // Wir bleiben bei SVG für scharfe Anzeige
import type { Member } from "@/lib/types"
import { useTranslation } from "react-i18next"

export default function CustomerProfilePage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [member, setMember] = useState<Member | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const memberData = localStorage.getItem("currentMember")
    if (memberData) {
      setMember(JSON.parse(memberData))
    } else {
      router.replace("/login")
    }
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem("currentMember")
    router.push("/")
  }

  // Funktion zum Herunterladen des QR-Codes als PNG
  const handleDownloadQR = () => {
    const svg = document.getElementById("member-qr-code")
    if (!svg) return

    // 1. SVG Daten serialisieren
    const serializer = new XMLSerializer()
    const source = serializer.serializeToString(svg)
    const encodedData = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source)

    // 2. In Canvas zeichnen und als PNG speichern
    const img = new Image()
    img.src = encodedData
    img.onload = () => {
      const canvas = document.createElement("canvas")
      // Größer machen für bessere Qualität beim Download
      canvas.width = 800 
      canvas.height = 800
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Weißen Hintergrund setzen (sonst ist es transparent)
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // QR Code zeichnen
      ctx.drawImage(img, 0, 0, 800, 800)

      // Download Link triggern
      const a = document.createElement("a")
      a.download = `my-club-qr-${member?.firstName}.png`
      a.href = canvas.toDataURL("image/png")
      a.click()
    }
  }

  const handleGoogleWallet = () => {
    // Hier würde später der API Aufruf kommen, der den JWT Link vom Backend holt
    alert("Google Wallet Integration requires Backend API Setup (Google Wallet API)")
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
              <Card>
                <CardHeader>
                  <CardTitle>{t("profile.personalInfo")}</CardTitle>
                  <CardDescription>{t("profile.accountDetails")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{t("profile.firstName")}</p>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{member.firstName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{t("profile.lastName")}</p>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{member.lastName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{t("profile.email")}</p>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="break-all">{member.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{t("profile.memberSince")}</p>
                    <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(member.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">{t("profile.status")}</p>
                    {member.blocked ? (
                      <Badge variant="destructive">{t("profile.accountBlocked")}</Badge>
                    ) : member.emailValid ? (
                      <Badge className="bg-green-600 hover:bg-green-700">{t("profile.activeMember")}</Badge>
                    ) : (
                      <Badge variant="secondary">{t("profile.pendingVerification")}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* QR Code */}
              <Card className={isFullscreen ? "fixed inset-0 z-50 rounded-none flex flex-col" : "flex flex-col"}>
                <CardHeader>
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
                
                <CardContent className={`flex-1 flex flex-col items-center justify-center ${isFullscreen ? "p-10" : ""}`}>
                  <div className={`space-y-6 text-center w-full ${isFullscreen ? "max-w-2xl" : ""}`}>
                    
                    {isFullscreen && (
                        <div className="space-y-2 mb-8">
                        <p className="text-4xl font-bold">
                            {member.firstName} {member.lastName}
                        </p>
                        <p className="text-2xl text-muted-foreground">
                            {member.email}
                        </p>
                        </div>
                    )}

                    <div className="flex justify-center" ref={qrRef}>
                      <div className="rounded-xl border bg-white p-6 shadow-sm">
                        {/* ID wichtig für den Download Selektor */}
                        <QRCodeSVG 
                            id="member-qr-code"
                            value={member.qrUuid} 
                            size={isFullscreen ? 350 : 200} 
                            level="H" 
                            includeMargin={true}
                        />
                      </div>
                    </div>

                    {!isFullscreen && (
                        <div className="grid gap-3 w-full max-w-xs mx-auto">
                            <Button className="w-full" variant="outline" onClick={handleDownloadQR}>
                                <Download className="mr-2 h-4 w-4" />
                                {t("profile.saveAsImage")}
                            </Button>
                            
                            <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={handleGoogleWallet}>
                                <Wallet className="mr-2 h-4 w-4" />
                                {t("profile.addToGoogleWallet")}
                            </Button>
                        </div>
                    )}

                    <div>
                      {member.blocked ? (
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          ⚠ {t("profile.accountBlocked")}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600 hover:bg-green-700 text-lg px-4 py-2">
                          ✓ {t("profile.activeMember")}
                        </Badge>
                      )}
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