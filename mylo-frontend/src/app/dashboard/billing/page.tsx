"use client";

import { ArrowLeftIcon, Check, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { createCheckoutSession } from "~/actions/stripe";
import { Button } from "~/components/ui/button";
import { ShineBorder } from "~/components/ui/shine-border";

const features = [
  "Unlimited video processing",
  "AI viral moment detection",
  "Smart face tracking & cropping",
  "Animated captions",
  "Lifetime updates",
  "Priority support",
  "No monthly fees ever",
];

export default function BillingPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col space-y-8 px-4 py-12">
      <div className="relative flex items-center justify-center gap-4">
        <Button
          className="absolute top-0 left-0 border-gray-300 hover:border-[#ffc247] hover:text-[#ffc247]"
          variant="outline"
          size="icon"
          asChild
        >
          <Link href="/dashboard">
            <ArrowLeftIcon className="size-4" />
          </Link>
        </Button>
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Upgrade to{" "}
            <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
              Lifetime
            </span>
          </h1>
          <p className="text-gray-600">
            One payment, unlimited clips forever. No subscriptions.
          </p>
        </div>
      </div>

      {/* Lifetime Plan Card */}
      <div className="relative pt-4">
        {/* BEST VALUE Badge */}
        <div className="absolute -top-0 left-1/2 z-30 -translate-x-1/2">
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#ffc247] to-[#00ffe5] px-5 py-1.5 text-sm font-bold text-gray-900 shadow-md">
            <Sparkles className="h-3.5 w-3.5" />
            BEST VALUE
          </span>
        </div>

        <ShineBorder
          borderRadius={20}
          borderWidth={3}
          duration={6}
          color={["#ffc247", "#00ffe5"]}
          className="mt-4 shadow-xl"
        >
          <div className="relative w-full p-8 pt-6">
            <h3 className="mb-2 text-2xl font-bold text-gray-900">
              Lifetime Access
            </h3>
            <p className="font-subtext mb-6 text-gray-600">
              One payment, unlimited{" "}
              <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
                viral clips
              </span>
            </p>
            <div className="mb-2">
              <span className="bg-gradient-to-r from-[#ffc247] to-[#e5a830] bg-clip-text text-5xl font-bold tracking-tight text-transparent">
                $449
              </span>
              <span className="ml-2 text-gray-600">one-time</span>
            </div>
            <p className="font-subtext mb-6 text-sm text-gray-500">
              <span className="text-gray-400 line-through">$636/year</span> with
              subscriptions
            </p>

            <ul className="mb-8 space-y-3">
              {features.map((feature, i) => (
                <li key={i} className="group flex items-center gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00ffe5] to-[#00c4b4] transition-transform duration-300 group-hover:scale-110">
                    <Check className="h-3 w-3 text-gray-900" />
                  </div>
                  <span className="font-subtext text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <form action={() => createCheckoutSession("lifetime")}>
              <Button
                type="submit"
                className="w-full border-0 bg-gradient-to-r from-[#ffc247] to-[#00ffe5] py-6 text-lg font-semibold text-gray-900 hover:opacity-90"
              >
                Get Lifetime Access
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </div>
        </ShineBorder>
      </div>

      {/* What's included */}
      <div className="rounded-xl border border-[#ffc247]/20 bg-gradient-to-br from-[#ffc247]/5 to-[#00ffe5]/5 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          What&apos;s included
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#ffc247]">•</span>
            Process unlimited videos of any length
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ffc247]">•</span>
            AI automatically finds the most viral moments
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ffc247]">•</span>
            Smart face tracking keeps subjects centered
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ffc247]">•</span>
            Beautiful animated captions in multiple styles
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#ffc247]">•</span>
            All future updates and features included
          </li>
        </ul>
      </div>
    </div>
  );
}
