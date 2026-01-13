"use client"

import type React from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { loginAdmin, requestVerificationCode, verifyAndRecover } from "@/lib/api"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn, Mail, ShieldCheck, Lock, User } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Customer login states
  const [customerEmail, setCustomerEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"email" | "code">("email")
  const [displayedCode, setDisplayedCode] = useState<string | null>(null)

  // Owner login states
  const [ownerUsername, setOwnerUsername] = useState("")
  const [ownerPassword, setOwnerPassword] = useState("")

  const handleTabChange = () => {
    setError(null)
    setIsLoading(false)
  }

  const handleCustomerEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!customerEmail || !customerEmail.includes("@")) {
      setError(t("login.validationEmail"))
      setIsLoading(false)
      return
    }

    try {
      const result = await requestVerificationCode(customerEmail)
      console.log("[v0] Verification code requested:", result)

      // If backend returns code for display mode
      if (result.verificationCode) {
        setDisplayedCode(result.verificationCode)
      }

      setStep("code")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.failedSend"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomerCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (verificationCode.length !== 6) {
      setError(t("login.validationCode"))
      setIsLoading(false)
      return
    }

    try {
      const result = await verifyAndRecover({
        email: customerEmail,
        verificationCode,
        deliveryMethod: "display",
      })

      console.log("[v0] Verification successful:", result)

      // Store member data in localStorage
      if (result.member) {
        localStorage.setItem("currentMember", JSON.stringify(result.member))
      }

      router.push("/customer/profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.invalidCode"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginAdmin({
        username: ownerUsername,
        password: ownerPassword,
      })

      console.log("[v0] Admin login successful:", result)

      // Store JWT token
      if (result.token) {
        localStorage.setItem("token", result.token)
      }

      router.push("/owner/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.invalidCredentials"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep("email")
    setVerificationCode("")
    setDisplayedCode(null)
    setError(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-1 bg-gradient-to-b from-primary/5 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <LogIn className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h1 className="mb-2 text-3xl font-bold text-balance">{t("login.welcomeTitle")}</h1>
              <p className="text-muted-foreground">{t("login.welcomeSubtitle")}</p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>{t("login.loginTitle")}</CardTitle>
                <CardDescription>{t("login.chooseAccountType")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="customer" className="w-full" onValueChange={handleTabChange}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="customer">{t("login.customer")}</TabsTrigger>
                    <TabsTrigger value="owner">{t("login.owner")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="customer" className="space-y-4">
                    {step === "email" ? (
                      <form onSubmit={handleCustomerEmailSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="customer-email">{t("login.emailAddress")}</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="customer-email"
                              type="email"
                              placeholder="your.email@example.com"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              required
                              className="h-11 pl-10"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">{t("login.emailHint")}</p>
                        </div>

                        {error && (
                          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                            <p className="text-sm text-destructive">{error}</p>
                          </div>
                        )}

                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                          {isLoading ? t("login.sending") : t("login.sendCode")}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleCustomerCodeSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="verification-code">{t("login.verificationCode")}</Label>
                          <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="verification-code"
                              type="text"
                              placeholder="000000"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                              required
                              maxLength={6}
                              className="h-11 pl-10 text-center text-lg tracking-widest"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {t("login.codeSentTo")} <strong>{customerEmail}</strong>
                          </p>
                        </div>

                        {displayedCode && (
                          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <p className="text-sm font-medium text-primary mb-1">Your verification code:</p>
                            <p className="text-2xl font-bold text-center tracking-widest text-primary">
                              {displayedCode}
                            </p>
                            <p className="text-xs text-muted-foreground text-center mt-2">
                              (Display mode - code shown here)
                            </p>
                          </div>
                        )}

                        {error && (
                          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                            <p className="text-sm text-destructive">{error}</p>
                          </div>
                        )}

                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                          {isLoading ? t("login.verifying") : t("login.viewQrCode")}
                        </Button>

                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full"
                          onClick={handleBackToEmail}
                          disabled={isLoading}
                        >
                          {t("login.useDifferentEmail")}
                        </Button>
                      </form>
                    )}
                  </TabsContent>

                  <TabsContent value="owner" className="space-y-4">
                    <form onSubmit={handleOwnerLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="owner-username">{t("login.username")}</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="owner-username"
                            type="text"
                            placeholder="admin"
                            value={ownerUsername}
                            onChange={(e) => setOwnerUsername(e.target.value)}
                            required
                            className="h-11 pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="owner-password">{t("login.password")}</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="owner-password"
                            type="password"
                            placeholder="Enter your password"
                            value={ownerPassword}
                            onChange={(e) => setOwnerPassword(e.target.value)}
                            required
                            className="h-11 pl-10"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}

                      <Button type="submit" className="w-full h-11" disabled={isLoading}>
                        {isLoading ? t("login.signingIn") : t("login.signInOwner")}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
