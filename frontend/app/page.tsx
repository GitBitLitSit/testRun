"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BilliardBall } from "@/components/billiard-ball"
import { Button } from "@/components/ui/button"
import { Clock, ChevronDown, ArrowRight, MapPin, Navigation2, Phone, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = [
    { src: "/professional-billiard-table-in-modern-club.jpg", alt: "Professional billiard table" },
    { src: "/billiard-club-bar-area-with-drinks.jpg", alt: "Bar area" },
    { src: "/people-playing-billiards-in-club.jpg", alt: "Players enjoying" },
    { src: "/billiard-club-lounge-seating-area.jpg", alt: "Lounge area" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length])

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background image carousel */}
          <div className="absolute inset-0">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              >
                <img src={image.src || "/placeholder.svg"} alt={image.alt} className="h-full w-full object-cover" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
          </div>

          {/* Hero content */}
          <div className="relative z-10 container mx-auto px-4 pt-20 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 flex justify-center">
                <Image
                  src="/logo.png"
                  alt="15 Palle"
                  width={200}
                  height={200}
                  className="h-32 w-32 md:h-40 md:w-40 animate-pulse-glow rounded-full object-cover"
                />
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                <span className="text-foreground">Where Every</span>
                <br />
                <span className="text-primary">Shot Counts</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                Professional tables. Cold drinks. Great company.
                <br className="hidden md:block" />
                Bolzano&apos;s premier billiard club since day one.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full"
                >
                  <Link href="/login" className="gap-2">
                    Member Login
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm mb-24">
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-foreground">Open until 1 AM</span>
                </div>
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-foreground">Bolzano</span>
                </div>
                <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="text-foreground">392 810 0919</span>
                </div>
              </div>
            </div>

            <button
              onClick={scrollToFeatures}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className="h-8 w-8" />
            </button>
          </div>

          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? "w-8 bg-primary"
                    : "w-2 bg-muted-foreground/50 hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Features Section - Clean cards design */}
        <section id="features" className="py-24 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-[#0a0d12] to-background" />
          <div className="absolute inset-0 [background:radial-gradient(1200px_circle_at_20%_10%,rgba(47,105,159,0.22),transparent_55%),radial-gradient(900px_circle_at_80%_50%,rgba(64,194,108,0.14),transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:64px_64px]" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 md:mb-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/70 backdrop-blur">
                <Sparkles className="h-4 w-4 text-secondary" />
                <span>Bolzano&apos;s premier billiard club</span>
              </div>
              <h2 className="mt-6 text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                Why <span className="text-primary">15 Palle</span>?
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
                A polished space built for serious play and easy nights out — with pro equipment, warm atmosphere, and late
                hours.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur px-5 py-4">
                  <p className="text-sm text-white/60">Open late</p>
                  <p className="mt-1 text-xl font-semibold text-white">Until 1:00 AM</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur px-5 py-4">
                  <p className="text-sm text-white/60">Location</p>
                  <p className="mt-1 text-xl font-semibold text-white">Bolzano center</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur px-5 py-4">
                  <p className="text-sm text-white/60">Atmosphere</p>
                  <p className="mt-1 text-xl font-semibold text-white">Friendly + focused</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                <BilliardBall number={9} title="Pro tables" delay="animation-delay-200">
                  Championship-grade tables maintained to perfection — consistent roll, clean rails, and great lighting.
                </BilliardBall>

                <BilliardBall number={11} title="Great vibes" delay="animation-delay-400">
                  A welcoming room where beginners and regulars play side by side — relaxed, respectful, and social.
                </BilliardBall>

                <BilliardBall number={6} title="Late nights" delay="animation-delay-600">
                  Open until 1 AM — perfect for after-work sets, weekend hangouts, and tournament nights.
                </BilliardBall>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-16 md:py-24 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                The <span className="text-primary">Experience</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-6xl mx-auto">
              <div className="col-span-2 row-span-2 relative aspect-square overflow-hidden rounded-2xl group">
                <img
                  src="/professional-billiard-table-in-modern-club.jpg"
                  alt="Professional table"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                  <span className="text-foreground font-semibold text-lg">Championship Tables</span>
                </div>
              </div>

              <div className="relative aspect-square overflow-hidden rounded-2xl group">
                <img
                  src="/billiard-club-bar-area-with-drinks.jpg"
                  alt="Bar area"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-foreground font-medium">The Bar</span>
                </div>
              </div>

              <div className="relative aspect-square overflow-hidden rounded-2xl group">
                <img
                  src="/people-playing-billiards-in-club.jpg"
                  alt="Players"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-foreground font-medium">Game Time</span>
                </div>
              </div>

              <div className="relative aspect-square overflow-hidden rounded-2xl group">
                <img
                  src="/billiard-club-lounge-seating-area.jpg"
                  alt="Lounge"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-foreground font-medium">Lounge</span>
                </div>
              </div>

              <div className="relative aspect-square overflow-hidden rounded-2xl group">
                <img
                  src="/billiard-balls-on-table-close-up.jpg"
                  alt="Equipment"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-foreground font-medium">Premium Gear</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 md:py-24 relative overflow-hidden">
          <div className="absolute inset-0 [background:radial-gradient(900px_circle_at_10%_20%,rgba(47,105,159,0.14),transparent_60%),radial-gradient(900px_circle_at_90%_80%,rgba(245,215,66,0.08),transparent_60%)]" />
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto relative">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
                <div className="rounded-3xl border border-border bg-card/70 backdrop-blur p-8 md:p-10 shadow-2xl shadow-black/10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/40 px-4 py-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Easy to reach • Parking nearby</span>
                  </div>

                  <h2 className="mt-6 text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    Find <span className="text-primary">Us</span>
                  </h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Located in the heart of Bolzano — drop by for a quick game or stay for the night.
                  </p>

                  <div className="mt-8 grid gap-4">
                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-primary/15 ring-1 ring-primary/20 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Address</p>
                          <p className="text-muted-foreground text-sm">Via Bruno Buozzi, 12, 39100 Bolzano BZ</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-secondary/15 ring-1 ring-secondary/20 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Phone</p>
                          <a className="text-muted-foreground text-sm hover:text-foreground transition-colors" href="tel:+393928100919">
                            +39 392 810 0919
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-accent/15 ring-1 ring-accent/20 flex items-center justify-center flex-shrink-0">
                          <Clock className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Hours</p>
                          <p className="text-muted-foreground text-sm">Mon-Sat: 2:30 PM - 1:00 AM</p>
                          <p className="text-muted-foreground text-sm">Sunday: 2:30 PM - 12:00 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Button asChild className="rounded-full">
                      <Link
                        href="https://www.google.com/maps?q=Via%20Bruno%20Buozzi%2C%2012%2C%2039100%20Bolzano%20BZ"
                        target="_blank"
                        rel="noreferrer"
                        className="gap-2"
                      >
                        Get directions
                        <Navigation2 className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full">
                      <a href="tel:+393928100919" className="gap-2">
                        Call us
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="relative rounded-3xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/10">
                  <div className="absolute inset-0">
                    <iframe
                      title="15 Palle location"
                      className="h-full w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src="https://www.google.com/maps?q=Via%20Bruno%20Buozzi%2C%2012%2C%2039100%20Bolzano%20BZ&output=embed"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent pointer-events-none" />

                  <div className="relative h-full min-h-[420px] flex items-end p-6">
                    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-background/50 backdrop-blur px-4 py-3">
                      <div className="h-12 w-12 overflow-hidden rounded-xl">
                        <Image
                          src="/billiard-club-interior-atmosphere.jpg"
                          alt="Club atmosphere"
                          width={96}
                          height={96}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm text-white/70">15 Palle</p>
                        <p className="text-base font-semibold text-white">Via Bruno Buozzi, 12</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
