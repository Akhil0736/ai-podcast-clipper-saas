"use client";

import DisplayCards from "~/components/ui/display-cards";
import { Sparkles, Video, Type, Smartphone } from "lucide-react";
import { ScrollAnimation, StaggerContainer, StaggerItem } from "~/components/ui/scroll-animation";

const featureCards = [
  {
    icon: <Sparkles className="size-4 text-gray-900" />,
    title: "AI Detection",
    description: "Finds viral moments automatically",
    date: "Powered by Gemini",
    iconClassName: "text-[#ffc247]",
    titleClassName: "text-[#ffc247] font-semibold",
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-gray-200 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Video className="size-4 text-gray-900" />,
    title: "Face Tracking",
    description: "Keeps speakers perfectly centered",
    date: "Active speaker detection",
    iconClassName: "text-[#ffc247]",
    titleClassName: "text-[#ffc247] font-semibold",
    className:
      "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-gray-200 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Type className="size-4 text-gray-900" />,
    title: "Captions",
    description: "Word-by-word animated subtitles",
    date: "Perfect timing",
    iconClassName: "text-[#ffc247]",
    titleClassName: "text-[#ffc247] font-semibold",
    className:
      "[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-gray-200 before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-white/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
  },
  {
    icon: <Smartphone className="size-4 text-gray-900" />,
    title: "9:16 Format",
    description: "Ready for TikTok, Reels & Shorts",
    date: "Platform optimized",
    iconClassName: "text-[#ffc247]",
    titleClassName: "text-[#ffc247] font-semibold",
    className:
      "[grid-area:stack] translate-x-36 translate-y-[7.5rem] hover:translate-y-[5rem]",
  },
];

// Feature list item with hover effects
function FeatureItem({ 
  icon: Icon, 
  title, 
  description,
  highlight = false 
}: { 
  icon: typeof Sparkles; 
  title: string; 
  description: string;
  highlight?: boolean;
}) {
  return (
    <li className="group flex items-start gap-3 p-3 -mx-3 rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-[#ffc247]/5 hover:to-[#00ffe5]/5 cursor-default">
      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc247] to-[#00ffe5] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        <Icon className="h-3 w-3 text-gray-900" />
      </div>
      <div>
        <p className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-[#ffc247]">
          {highlight && (
            <span className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent font-bold">AI </span>
          )}
          {title}
        </p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </li>
  );
}

export function Features() {
  return (
    <section id="features" className="relative border-t border-gray-200 bg-white px-4 py-20 lg:py-32 overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left side - Text content */}
          <div>
            <ScrollAnimation>
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#ffc247]">
                Features
              </p>
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Everything You Need to{" "}
                <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
                  Go Viral
                </span>
              </h2>
              <p className="font-subtext mb-8 text-lg text-gray-600 leading-relaxed">
                Our{" "}
                <span className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent font-semibold">
                  AI
                </span>{" "}
                handles the heavy lifting so you can focus on creating great content.
              </p>
            </ScrollAnimation>
            
            <StaggerContainer>
              <ul className="space-y-2">
                <StaggerItem>
                  <FeatureItem 
                    icon={Sparkles}
                    title="Viral Moment Detection"
                    description="Gemini AI identifies the most engaging moments"
                    highlight
                  />
                </StaggerItem>
                <StaggerItem>
                  <FeatureItem 
                    icon={Video}
                    title="Smart Face Tracking"
                    description="Active speaker detection keeps you centered"
                  />
                </StaggerItem>
                <StaggerItem>
                  <FeatureItem 
                    icon={Type}
                    title="Animated Captions"
                    description="Word-by-word subtitles with perfect timing"
                  />
                </StaggerItem>
                <StaggerItem>
                  <FeatureItem 
                    icon={Smartphone}
                    title="Platform Optimized"
                    description="Perfect 9:16 format for all platforms"
                  />
                </StaggerItem>
              </ul>
            </StaggerContainer>
          </div>

          {/* Right side - Display cards */}
          <ScrollAnimation direction="right" delay={0.2}>
            <div className="flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
              <DisplayCards cards={featureCards} />
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
}
