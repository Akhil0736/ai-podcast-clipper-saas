"use client";

import React from "react";
import { Timeline } from "~/components/ui/timeline";
import { Upload, Wand2, Download, Sparkles, Video, Type } from "lucide-react";

export function HowItWorks() {
  const data = [
    {
      title: "Step 1",
      content: (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc247] to-[#00ffe5] text-gray-900 shadow-sm">
              <Upload className="h-6 w-6" />
            </div>
            <h4 className="text-2xl font-bold tracking-tight text-gray-900">Upload Your Video</h4>
          </div>
          <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
            Drop any video file — podcasts, interviews, vlogs, streams, or long-form content. 
            We support MP4, MOV, AVI, and MKV up to 500MB.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
              <p className="text-[#ffc247] font-semibold text-sm">Supported Formats</p>
              <p className="text-gray-600 text-xs mt-1">MP4, MOV, AVI, MKV</p>
            </div>
            <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
              <p className="text-[#ffc247] font-semibold text-sm">Max File Size</p>
              <p className="text-gray-600 text-xs mt-1">Up to 500MB</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 2",
      content: (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc247] to-[#00ffe5] text-gray-900 shadow-sm">
              <Wand2 className="h-6 w-6" />
            </div>
            <h4 className="text-2xl font-bold tracking-tight text-gray-900"><span className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent font-semibold">AI</span> Does the Magic</h4>
          </div>
          <p className="font-subtext text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
            Our{" "}
            <span className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent font-semibold">
              AI
            </span>{" "}
            analyzes your content to find the most engaging moments. 
            It automatically tracks faces, crops to 9:16, and adds animated captions.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
              <Sparkles className="h-5 w-5 text-[#ffc247]" />
              <div>
                <p className="text-gray-900 font-semibold text-sm">Viral Moment Detection</p>
                <p className="text-gray-500 text-xs">Finds the best clips automatically</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
              <Video className="h-5 w-5 text-[#ffc247]" />
              <div>
                <p className="text-gray-900 font-semibold text-sm">Smart Face Tracking</p>
                <p className="text-gray-500 text-xs">Keeps speakers perfectly centered</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
              <Type className="h-5 w-5 text-[#ffc247]" />
              <div>
                <p className="text-gray-900 font-semibold text-sm">Animated Captions</p>
                <p className="text-gray-500 text-xs">Word-by-word with perfect timing</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Step 3",
      content: (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc247] to-[#00ffe5] text-gray-900 shadow-sm">
              <Download className="h-6 w-6" />
            </div>
            <h4 className="text-2xl font-bold tracking-tight text-gray-900">Download & Post</h4>
          </div>
          <p className="text-gray-600 text-sm md:text-base mb-6 leading-relaxed">
            Get multiple ready-to-post clips in perfect 9:16 vertical format. 
            Upload directly to TikTok, Instagram Reels, or YouTube Shorts.
          </p>
          <div className="mb-6 space-y-2">
            {[
              "Multiple clips from one video",
              "Perfect 9:16 vertical format",
              "Ready for TikTok, Reels & Shorts",
              "High-quality MP4 export",
              "No watermarks"
            ].map((item, i) => (
              <div key={i} className="flex gap-2 items-center text-gray-700 text-sm">
                <span className="text-[#00ffe5]">✓</span>
                {item}
              </div>
            ))}
          </div>
          <div className="rounded-xl bg-gradient-to-r from-[#ffc247] to-[#00ffe5] p-4 text-gray-900 shadow-sm">
            <p className="font-semibold">Average processing time</p>
            <p className="text-2xl font-bold">3-5 minutes</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative border-t border-gray-200 bg-gray-50 px-4 py-20 lg:py-32">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#ffc247]">
            How It Works
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Three Steps to{" "}
            <span className="font-lobster bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent">
              Viral Clips
            </span>
          </h2>
          <p className="font-subtext mx-auto max-w-2xl text-lg text-gray-600 leading-relaxed">
            No editing skills required. Just upload and let{" "}
            <span className="bg-gradient-to-r from-[#ffc247] to-[#00ffe5] bg-clip-text text-transparent font-semibold">
              AI
            </span>{" "}
            do the heavy lifting.
          </p>
        </div>
        <Timeline data={data} />
      </div>
    </section>
  );
}
