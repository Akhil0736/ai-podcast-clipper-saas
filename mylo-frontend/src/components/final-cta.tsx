"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GradientButton } from "~/components/ui/gradient-button";
import { ScrollAnimation } from "~/components/ui/scroll-animation";

export function FinalCTA() {
  return (
    <section className="border-t border-gray-200 bg-white px-4 py-12 lg:py-20">
      <div className="container mx-auto max-w-4xl text-center">
        <ScrollAnimation>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Ready to Create{" "}
            <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
              Viral Clips?
            </span>
          </h2>
          <p className="font-subtext mb-8 text-lg text-gray-600 leading-relaxed">
            Join 500+ creators already using Mylo to grow their audience.
          </p>
        </ScrollAnimation>
        
        <ScrollAnimation delay={0.2}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <GradientButton asChild>
              <Link href="/signup">
                Get Lifetime Access - $449
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </GradientButton>
          </div>
          <p className="font-subtext mt-4 text-sm text-gray-500">
            14-day money-back guarantee
          </p>
        </ScrollAnimation>
      </div>
    </section>
  );
}
