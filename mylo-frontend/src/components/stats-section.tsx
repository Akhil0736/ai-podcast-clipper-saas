"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GradientButton } from "~/components/ui/gradient-button";
import { AnimatedCounter } from "~/components/ui/animated-counter";
import { ScrollAnimation, StaggerContainer, StaggerItem } from "~/components/ui/scroll-animation";

export function StatsSection() {
  return (
    <section className="border-t border-gray-200 bg-gray-50 px-4 py-12 lg:py-20">
      <div className="container mx-auto max-w-6xl">
        <ScrollAnimation className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by{" "}
            <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
              Creators
            </span>
          </h2>
        </ScrollAnimation>
        
        <StaggerContainer className="grid gap-6 text-center md:grid-cols-3" staggerDelay={0.15}>
          <StaggerItem>
            <div className="group cursor-default">
              <div className="mb-2 text-5xl font-bold tracking-tight text-[#ffc247] transition-transform duration-300 group-hover:scale-110">
                <AnimatedCounter value={5} suffix="min" duration={1500} />
              </div>
              <p className="font-subtext text-gray-600">Average processing time</p>
            </div>
          </StaggerItem>
          
          <StaggerItem>
            <div className="group cursor-default">
              <div className="mb-2 text-5xl font-bold tracking-tight text-[#ffc247] transition-transform duration-300 group-hover:scale-110">
                <AnimatedCounter value={10} suffix="x" duration={1500} />
              </div>
              <p className="font-subtext text-gray-600">Faster than manual editing</p>
            </div>
          </StaggerItem>
          
          <StaggerItem>
            <div className="group cursor-default">
              <div className="mb-2 text-5xl font-bold tracking-tight text-[#ffc247] transition-transform duration-300 group-hover:scale-110">
                <AnimatedCounter value={500} suffix="+" duration={2000} />
              </div>
              <p className="font-subtext text-gray-600">Happy creators</p>
            </div>
          </StaggerItem>
        </StaggerContainer>
        
        {/* CTA after stats */}
        <ScrollAnimation delay={0.4} className="mt-10 text-center">
          <GradientButton asChild>
            <Link href="/signup">
              Start Creating{" "}
              <span className="font-lobster">Viral Clips</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </GradientButton>
        </ScrollAnimation>
      </div>
    </section>
  );
}
