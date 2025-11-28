"use client";

import Link from "next/link";
import { Check, X, ArrowRight, Sparkles } from "lucide-react";
import { GradientButton } from "~/components/ui/gradient-button";
import { ShineBorder } from "~/components/ui/shine-border";
import { ScrollAnimation, StaggerContainer, StaggerItem } from "~/components/ui/scroll-animation";

const features = [
  "Unlimited video processing",
  "AI viral moment detection",
  "Smart face tracking & cropping",
  "Animated captions",
  "Lifetime updates",
  "Priority support",
  "No monthly fees ever"
];

// Comparison table data
const comparisonFeatures = [
  { feature: "AI Viral Moment Detection", opus: true, submagic: true, mylo: true },
  { feature: "Smart Face Tracking", opus: true, submagic: true, mylo: true },
  { feature: "Auto 9:16 Cropping", opus: true, submagic: true, mylo: true },
  { feature: "Animated Captions", opus: true, submagic: true, mylo: true },
  { feature: "Multi-language Support", opus: true, submagic: true, mylo: true },
  { feature: "HD Export (1080p)", opus: true, submagic: true, mylo: true },
  { feature: "No Watermarks", opus: true, submagic: true, mylo: true },
  { feature: "Unlimited Videos", opus: false, submagic: false, mylo: true },
  { feature: "Lifetime Access", opus: false, submagic: false, mylo: true },
  { feature: "No Monthly Fees", opus: false, submagic: false, mylo: true },
  { feature: "Priority Support", opus: true, submagic: true, mylo: true },
  { feature: "All Future Updates", opus: false, submagic: false, mylo: true },
];

function CheckIcon({ highlight = false }: { highlight?: boolean }) {
  return (
    <div className={`flex h-5 w-5 items-center justify-center rounded-full mx-auto ${highlight ? "bg-gradient-to-br from-[#ffc247] to-[#00ffe5]" : "bg-[#00ffe5]/20"}`}>
      <Check className={`h-3 w-3 ${highlight ? "text-gray-900" : "text-[#00ffe5]"}`} />
    </div>
  );
}

function XIcon() {
  return (
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-200 mx-auto">
      <X className="h-3 w-3 text-gray-400" />
    </div>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-gray-200 bg-white px-4 py-12 lg:py-20">
      <div className="container mx-auto max-w-6xl">
        <ScrollAnimation className="mb-12 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#ffc247]">
            Pricing
          </p>
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            One Price,{" "}
            <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
              Unlimited
            </span>{" "}
            Clips
          </h2>
          <p className="font-subtext mx-auto max-w-2xl text-lg text-gray-600 leading-relaxed">
            Pay once, use forever. No subscriptions, no hidden fees.
          </p>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="mx-auto max-w-lg relative pt-4">
            {/* BEST VALUE Badge */}
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 z-30">
              <span className="rounded-full bg-gradient-to-r from-[#ffc247] to-[#00ffe5] px-5 py-1.5 text-sm font-bold text-gray-900 shadow-md">
                BEST VALUE
              </span>
            </div>
            
            {/* Lifetime Plan with Shine Border */}
            <ShineBorder
              borderRadius={20}
              borderWidth={3}
              duration={6}
              color={["#ffc247", "#00ffe5"]}
              className="shadow-xl mt-4"
            >
              <div className="relative w-full p-8 pt-6">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  Lifetime Access
                </h3>
                <p className="font-subtext mb-6 text-gray-600">One payment, unlimited{" "}
                  <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
                    viral clips
                  </span>
                </p>
                <div className="mb-2">
                  <span className="text-5xl font-bold tracking-tight bg-gradient-to-r from-[#ffc247] to-[#e5a830] bg-clip-text text-transparent">$449</span>
                  <span className="ml-2 text-gray-600">one-time</span>
                </div>
                <p className="font-subtext mb-6 text-sm text-gray-500">
                  <span className="text-gray-400 line-through">$636/year</span> with subscriptions
                </p>
                
                <StaggerContainer>
                  <ul className="mb-8 space-y-3">
                    {features.map((feature, i) => (
                      <StaggerItem key={i}>
                        <li className="flex items-center gap-3 group">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#00ffe5] to-[#00c4b4] flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                            <Check className="h-3 w-3 text-gray-900" />
                          </div>
                          <span className="font-subtext text-gray-700">{feature}</span>
                        </li>
                      </StaggerItem>
                    ))}
                  </ul>
                </StaggerContainer>
                
                <GradientButton asChild className="w-full">
                  <Link href="/signup">
                    Get Lifetime Access
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </GradientButton>
              </div>
            </ShineBorder>
          </div>
        </ScrollAnimation>

        {/* Comparison Table */}
        <ScrollAnimation delay={0.3} className="mt-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl mb-3">
              How We Compare
            </h3>
            <p className="font-subtext text-gray-600">
              Same features, fraction of the price
            </p>
          </div>
          
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-lg">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="text-sm font-semibold text-gray-900">OpusClip Pro</div>
                    <div className="text-xs text-gray-500">$29/mo × 60 = $1,740</div>
                    <div className="text-xs text-gray-400">5-year cost</div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="text-sm font-semibold text-gray-900">SubMagic Pro</div>
                    <div className="text-xs text-gray-500">$39/mo × 60 = $2,340</div>
                    <div className="text-xs text-gray-400">5-year cost</div>
                  </th>
                  <th className="px-6 py-4 text-center bg-gradient-to-br from-[#ffc247]/10 to-[#00ffe5]/10 rounded-tr-xl">
                    <div className="text-sm font-bold bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
                      Mylo
                    </div>
                    <div className="text-lg font-bold bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
                      $449
                    </div>
                    <div className="text-xs text-gray-600">lifetime</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, i) => (
                  <tr 
                    key={row.feature} 
                    className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  >
                    <td className="px-6 py-3 text-sm text-gray-700">{row.feature}</td>
                    <td className="px-6 py-3 text-center">
                      {row.opus ? <CheckIcon /> : <XIcon />}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {row.submagic ? <CheckIcon /> : <XIcon />}
                    </td>
                    <td className="px-6 py-3 text-center bg-gradient-to-br from-[#ffc247]/5 to-[#00ffe5]/5">
                      {row.mylo ? <CheckIcon highlight /> : <XIcon />}
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-6 py-4 text-sm text-gray-900">5-Year Total Cost</td>
                  <td className="px-6 py-4 text-center text-red-500">$1,740</td>
                  <td className="px-6 py-4 text-center text-red-500">$2,340</td>
                  <td className="px-6 py-4 text-center bg-gradient-to-br from-[#ffc247]/20 to-[#00ffe5]/20">
                    <span className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent font-bold">
                      $449
                    </span>
                  </td>
                </tr>
                {/* Savings row */}
                <tr className="bg-gradient-to-br from-[#ffc247]/10 to-[#00ffe5]/10">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">Your Savings</td>
                  <td className="px-6 py-4 text-center font-bold bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
                    Save $1,291
                  </td>
                  <td className="px-6 py-4 text-center font-bold bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
                    Save $1,891
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ffc247] to-[#00ffe5] px-3 py-1 text-xs font-bold text-gray-900">
                      <Sparkles className="h-3 w-3" />
                      BEST VALUE
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
