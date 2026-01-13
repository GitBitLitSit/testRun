"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BilliardBall } from "@/components/billiard-ball"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Clock, ChevronDown, ArrowRight } from "lucide-react"
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

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16 md:mb-20">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
                Why <span className="text-primary">15 Palle</span>?
              </h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto">
                More than just a billiard club - it&apos;s where memories are made.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              <BilliardBall number={9} title="Pro Tables" delay="animation-delay-200">
                Championship-grade tables maintained to perfection. Feel the difference with every shot you take.
              </BilliardBall>

              <BilliardBall number={11} title="Great Vibes" delay="animation-delay-400">
                Friendly atmosphere where beginners and pros play side by side. Everyone&apos;s welcome here.
              </BilliardBall>

              <BilliardBall number={6} title="Late Nights" delay="animation-delay-600">
                Open until 1 AM every night. Perfect for after-work sessions or weekend tournaments.
              </BilliardBall>
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
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-card rounded-3xl p-8 md:p-12 border border-border">
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
                      Find <span className="text-primary">Us</span>
                    </h2>
                    <p className="text-muted-foreground mb-8">Located in the heart of Bolzano. Drop by anytime.</p>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Address</p>
                          <p className="text-muted-foreground text-sm">Via Bruno Buozzi, 12, 39100 Bolzano BZ</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">Phone</p>
                          <p className="text-muted-foreground text-sm">392 810 0919</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
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

                  <div className="relative aspect-square rounded-2xl overflow-hidden">
                    <img
                      src="/billiard-club-interior-atmosphere.jpg"
                      alt="Club atmosphere"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
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
