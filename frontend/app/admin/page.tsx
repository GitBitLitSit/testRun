"use client"

import type React from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginAdmin } from "@/lib/api"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn, Lock, User } from "lucide-react"
import { useTranslation } from "react-i18next"

export default function AdminLoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ownerUsername, setOwnerUsername] = useState("")
  const [ownerPassword, setOwnerPassword] = useState("")

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
                <CardDescription>{t("login.owner")}</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
