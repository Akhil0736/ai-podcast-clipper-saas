import Link from "next/link";
import { FaqSection } from "~/components/ui/faq-section";
import { Hero } from "~/components/hero";
import { VideoShowcase } from "~/components/video-showcase";
import { LogosCarousel } from "~/components/logos-carousel";
import { HowItWorks } from "~/components/how-it-works";
import { Features } from "~/components/features";
import { Testimonials } from "~/components/testimonials";
import { StatsSection } from "~/components/stats-section";
import { PricingSection } from "~/components/pricing-section";
import { FinalCTA } from "~/components/final-cta";
import { LandingNav } from "~/components/landing-nav";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-gray-900">
      {/* Navigation with Section Links */}
      <LandingNav />

      {/* Hero Section */}
      <Hero />

      {/* Video Showcase Section */}
      <VideoShowcase />

      {/* Logos Carousel */}
      <LogosCarousel />

      {/* How It Works */}
      <HowItWorks />

      {/* Features Section */}
      <Features />

      {/* Stats Section with Animated Counters */}
      <StatsSection />

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing Section with Scroll Animations */}
      <PricingSection />

      {/* FAQ Section */}
      <FaqSection
        title="Common Questions"
        description="Everything you need to know about Mylo"
        className="border-t border-gray-200 bg-gray-50"
        items={[
          {
            question: "What video formats do you support?",
            answer: "We support all major video formats including MP4, MOV, AVI, and MKV. Maximum file size is 500MB."
          },
          {
            question: "How long does processing take?",
            answer: "Most videos are processed in 3-5 minutes. Longer videos may take up to 10 minutes."
          },
          {
            question: "Can I customize the captions?",
            answer: "Currently we use a professional preset style. Custom fonts and colors are coming soon."
          },
          {
            question: "What's included in lifetime access?",
            answer: "Unlimited video processing, all current features, and all future updates. No monthly fees, ever."
          },
          {
            question: "Do you offer refunds?",
            answer: "Yes! If you're not satisfied within 14 days, we'll refund your purchase. No questions asked."
          }
        ]}
        contactInfo={{
          title: "Still have questions?",
          description: "We're here to help you create viral clips",
          buttonText: "Contact Support"
        }}
      />

      {/* Final CTA with Scroll Animations */}
      <FinalCTA />

      {/* Footer - Reduced spacing */}
      <footer className="border-t border-gray-200 bg-gray-50 px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <Link href="/" className="text-3xl font-lobster tracking-tight text-gray-900">
                mylo
              </Link>
              <p className="font-subtext mt-1 text-sm text-gray-500">
                AI-powered video clipper for creators
              </p>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/login" className="transition hover:text-gray-900">
                Login
              </Link>
              <Link href="/signup" className="transition hover:text-gray-900">
                Sign Up
              </Link>
              <Link href="/dashboard" className="transition hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Mylo. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
