"use client";

import { TestimonialsColumn } from "~/components/ui/testimonials-columns";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "Amazing experience for all content creators to 5x their work speed. Before using Mylo I had to use a text to speech service, another software to edit and tune the subtitles, another one to apply animations. Mylo intelligently does all these tasks and curates the content at the same time. Can you believe it?",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Fouad K.",
    role: "Content Creator",
  },
  {
    text: "I love it. So powerful, I recently found it through a YouTube video, very simple to use and performant. I love it.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Healsha M.",
    role: "YouTuber",
  },
  {
    text: "Love it! The AI picks out the best moments from my streams automatically. Saves me hours every week.",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    name: "Fred A.",
    role: "Twitch Streamer",
  },
  {
    text: "Strongly recommended. Great tool. Works perfect. Strongly recommended for anyone doing video content.",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    name: "Jacob B.",
    role: "Marketing Director",
  },
  {
    text: "Very nice product. Clean interface, fast processing, and the results are consistently good.",
    image: "https://randomuser.me/api/portraits/men/22.jpg",
    name: "Raysingh M.",
    role: "Video Editor",
  },
  {
    text: "Highly recommend using this tool to save time editing and quickly repurpose your content! Mylo makes it super easy for brands and creators to instantly convert long-form videos into Reels, TikToks and Shorts.",
    image: "https://randomuser.me/api/portraits/women/28.jpg",
    name: "Elise H.",
    role: "Social Media Manager",
  },
  {
    text: "Honestly impressed. I used Mylo on my 2h long business video podcast and it generated high quality shorts I was able to post on my socials directly. Honestly impressed.",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    name: "Dearbhail B.",
    role: "Podcast Host",
  },
  {
    text: "Game changer for video editing. It's a game changer for video editing, it's user-friendly and saves a lot of time. Highly recommend!",
    image: "https://randomuser.me/api/portraits/women/63.jpg",
    name: "Anastasiia G.",
    role: "Content Strategist",
  },
  {
    text: "Impressive stuff. It is able to extract the best parts of my home podcast, impressive stuff. The face tracking keeps everyone in frame perfectly.",
    image: "https://randomuser.me/api/portraits/women/35.jpg",
    name: "Louise H.",
    role: "Podcaster",
  },
  {
    text: "Quite useful in content times. The AI understands what makes a clip engaging and picks those moments automatically.",
    image: "https://randomuser.me/api/portraits/men/78.jpg",
    name: "Yang B.",
    role: "Digital Creator",
  },
  {
    text: "I can confidently say that your product is the best on the market. We tested and analyzed all similar platforms, including Opus Clip, Vizard, and many others — around ten different platforms. I can confidently say that Mylo is the best in terms of quality, editing, overall service, and approach.",
    image: "https://randomuser.me/api/portraits/men/55.jpg",
    name: "Alan D.",
    role: "Agency Owner",
  },
  {
    text: "Easy to use. I like Mylo for making it easy to turn videos into shorts for my YouTube channel. The editor is intuitive and easy to use.",
    image: "https://randomuser.me/api/portraits/men/41.jpg",
    name: "Benjamin K.",
    role: "YouTube Educator",
  },
];

const firstColumn = testimonials.slice(0, 4);
const secondColumn = testimonials.slice(4, 8);
const thirdColumn = testimonials.slice(8, 12);

export function Testimonials() {
  return (
    <section className="bg-white py-20 lg:py-32 relative border-t border-gray-200">
      <div className="container mx-auto max-w-6xl z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto mb-16"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-[#ffc247]">
            Testimonials
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-4 text-gray-900 text-center">
            Loved by Creators
          </h2>
          <p className="text-center mt-4 text-gray-600 text-lg leading-relaxed">
            See what creators are saying about Mylo.
          </p>
        </motion.div>
        <div className="flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={18} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={22}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={20}
          />
        </div>
      </div>
    </section>
  );
}
