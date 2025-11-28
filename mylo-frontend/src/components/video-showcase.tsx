"use client";

import { useRef, useEffect } from "react";

export function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt to play video on mount
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay was prevented, that's okay
      });
    }
  }, []);

  return (
    <section className="border-t border-gray-200 bg-[#f0f5f0] py-12 lg:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Stats Header */}
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            3.4M clips made by{" "}
            <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">500+</span>
            <br />
            <span className="font-lobster bg-gradient-to-r from-[#00ffe5] to-[#ffc247] bg-clip-text text-transparent">creators</span>
          </h2>
          <p className="font-subtext mx-auto max-w-2xl text-gray-600 leading-relaxed">
            Grow your audience like the top creators by sharing short-form content daily. Mylo will
            help you create engaging{" "}
            <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
              viral clips
            </span>{" "}
            from your long videos in just a few clicks.
          </p>
        </div>
      </div>

      {/* Full-width horizontal video strip with fade edges */}
      <div className="relative w-full">
        {/* Left fade overlay */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-32 bg-gradient-to-r from-[#f0f5f0] to-transparent" />

        {/* Right fade overlay */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-32 bg-gradient-to-l from-[#f0f5f0] to-transparent" />

        {/* Video strip container */}
        <div className="flex justify-center px-4">
          <video
            ref={videoRef}
            className="h-[320px] w-auto max-w-none rounded-2xl object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/videos/exa.mov" type="video/quicktime" />
            <source src="/videos/exa.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
