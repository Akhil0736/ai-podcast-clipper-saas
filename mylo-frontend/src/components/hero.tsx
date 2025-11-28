"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { GradientButton } from "~/components/ui/gradient-button";
import { renderCanvas } from "~/components/ui/canvas";
import { VideoUploadBox } from "~/components/ui/video-upload-box";
import { TextColor } from "~/components/ui/text-color";
import { Zap, ArrowRight, Star, ChevronDown } from "lucide-react";

export function Hero() {
  useEffect(() => {
    renderCanvas();
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 pt-16">
      <div className="container relative z-10 mx-auto max-w-5xl text-center">
        {/* Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#ffc247] to-[#00ffe5]">
            <Zap className="h-3 w-3 text-gray-900" />
          </div>
          <span className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent font-semibold">AI</span>-Powered Video Clipper
        </div>

        {/* Animated Main headline */}
        <TextColor />

        {/* Subheadline */}
        <p className="font-subtext mx-auto mb-10 max-w-2xl text-lg text-gray-600 leading-relaxed sm:text-xl">
          Upload your video. Our <span className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent font-semibold">AI</span> finds the best moments, crops to your face,
          and adds animated captions. Get scroll-stopping{" "}
          <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
            viral clips
          </span>{" "}
          in minutes.
        </p>

        {/* Video Upload Box */}
        <div className="mb-10 flex justify-center">
          <VideoUploadBox />
        </div>

        {/* CTA buttons */}
        <div className="mb-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <GradientButton asChild>
            <Link href="/signup">
              Get Lifetime Access - $449
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </GradientButton>
        </div>

        {/* Social proof */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <div className="flex -space-x-3">
            {[
              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces",
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces"
            ].map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={`Creator ${i + 1}`}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full border-2 border-white object-cover shadow-sm"
              />
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="font-subtext text-sm text-gray-600">
              <span className="font-semibold text-gray-900">500+</span> creators
              already using Mylo
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-gray-400" />
      </div>

      {/* Canvas for animated lines */}
      <canvas
        className="pointer-events-none absolute inset-0 mx-auto"
        id="canvas"
      />
    </section>
  );
}
