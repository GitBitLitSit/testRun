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

const sectionClassName = "rounded-2xl border border-white/10 bg-card/70 backdrop-blur p-6 shadow-xl"
const sectionTitleClassName = "flex items-center gap-3 text-lg font-semibold text-white"

export default function PrivacyPolicyPage() {
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
              <h1 className="text-4xl md:text-5xl font-black text-white">Privacy Policy</h1>
              <p className="mt-2 text-sm text-muted-foreground">Last Updated: 2/1/2026</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-6">
            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <FileText className="h-5 w-5 text-primary" />
                <h2>Introduction</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                At 15 Palle, we are committed to protecting your privacy and personal information. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your information when you visit our website and
                use our services.
              </p>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Database className="h-5 w-5 text-primary" />
                <h2>Information We Collect</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We collect information that you provide directly to us and information that is automatically collected
                when you use our services.
              </p>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Personal Information</h3>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Membership information and QR codes</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Usage Data</h3>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent</li>
                    <li>Cookie and tracking data</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <ListChecks className="h-5 w-5 text-primary" />
                <h2>How We Use Your Information</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We use the collected information for various purposes:
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>To provide and maintain our services</li>
                <li>To communicate with you about your membership and our services</li>
                <li>To improve and optimize our website and services</li>
                <li>To protect against fraud and ensure security</li>
                <li>To comply with legal obligations</li>
              </ul>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Share2 className="h-5 w-5 text-primary" />
                <h2>Data Sharing and Disclosure</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We do not sell your personal information. We may share your information only in the following
                circumstances:
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We may share your personal information with trusted service providers who assist us in operating our
                website and conducting our business, subject to strict confidentiality agreements. We use AWS SES
                (Amazon Simple Email Service) for email delivery, which is compliant with AWS security and privacy
                standards.
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>With service providers who perform services on our behalf (including AWS SES for email delivery)</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Cookie className="h-5 w-5 text-primary" />
                <h2>Cookies and Tracking Technologies</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our website.
              </p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                You can control cookies through your browser settings. However, disabling cookies may limit your
                ability to use certain features of our website.
              </p>
              <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Necessary Cookies</h3>
                  <p className="mt-2">
                    These cookies are essential for the website to function properly and cannot be disabled.
                  </p>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Analytics Cookies</h3>
                  <p className="mt-2">
                    These cookies help us understand how visitors interact with our website by collecting and
                    reporting information anonymously.
                  </p>
                </div>
              </div>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Lock className="h-5 w-5 text-primary" />
                <h2>Data Security</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal
                information against unauthorized access, alteration, disclosure, or destruction. However, no method of
                transmission over the Internet is 100% secure.
              </p>
              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                <h3 className="text-base font-semibold text-foreground">AWS SES Compliance</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  We use Amazon Simple Email Service (AWS SES) to send verification emails and membership-related
                  communications. AWS SES is compliant with rigorous security and privacy standards, including SOC 1,
                  SOC 2, ISO 27001, and PCI DSS. Your email information is protected according to AWS security
                  standards.
                </p>
              </div>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <UserCheck className="h-5 w-5 text-primary" />
                <h2>Your Privacy Rights</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground space-y-1">
                <li>Right to access your personal data</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to request deletion of your data</li>
                <li>Right to object to processing of your data</li>
                <li>Right to data portability</li>
                <li>Right to withdraw consent at any time</li>
              </ul>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Clock className="h-5 w-5 text-primary" />
                <h2>Data Retention</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in
                this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Baby className="h-5 w-5 text-primary" />
                <h2>Children&apos;s Privacy</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly collect
                personal information from children. If you believe we have collected information from a child, please
                contact us immediately.
              </p>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <RefreshCw className="h-5 w-5 text-primary" />
                <h2>Changes to This Privacy Policy</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new
                Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
              </p>
            </div>

            <div className={sectionClassName}>
              <div className={sectionTitleClassName}>
                <Mail className="h-5 w-5 text-primary" />
                <h2>Contact Us</h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please
                contact us:
              </p>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-semibold text-foreground">Address:</span> Via Bruno Buozzi, 12, 39100 Bolzano BZ,
                  Italy
                </p>
                <p>
                  <span className="font-semibold text-foreground">Email:</span>{" "}
                  <a className="text-primary hover:text-primary/80" href="mailto:info@15palle.com">
                    info@15palle.com
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
