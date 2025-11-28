"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";

interface Logo {
  id: string;
  description: string;
  image: string;
  className?: string;
}

interface LogosCarouselProps {
  heading?: string;
  logos?: Logo[];
}

const defaultLogos: Logo[] = [
  {
    id: "logo-1",
    description: "TikTok",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/200px-TikTok_logo.svg.png",
    className: "h-8 w-auto",
  },
  {
    id: "logo-2",
    description: "Instagram",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png",
    className: "h-8 w-auto",
  },
  {
    id: "logo-3",
    description: "YouTube",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/YouTube_Logo_2017.svg/200px-YouTube_Logo_2017.svg.png",
    className: "h-6 w-auto",
  },
  {
    id: "logo-4",
    description: "Spotify",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/168px-Spotify_logo_without_text.svg.png",
    className: "h-8 w-auto",
  },
  {
    id: "logo-5",
    description: "Twitter",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/220px-Logo_of_Twitter.svg.png",
    className: "h-7 w-auto",
  },
  {
    id: "logo-6",
    description: "LinkedIn",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/240px-LinkedIn_logo_initials.png",
    className: "h-8 w-auto",
  },
];

export function LogosCarousel({
  heading = "Optimized for all platforms",
  logos = defaultLogos,
}: LogosCarouselProps) {
  return (
    <section className="border-t border-gray-100 bg-white py-12">
      <div className="container mx-auto flex flex-col items-center text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
          {heading}
        </p>
      </div>
      <div className="pt-8">
        <div className="relative mx-auto flex items-center justify-center lg:max-w-5xl">
          <Carousel
            opts={{ loop: true }}
            plugins={[AutoScroll({ playOnInit: true, speed: 1 })]}
          >
            <CarouselContent className="ml-0">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="flex basis-1/3 justify-center pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <div className="mx-10 flex shrink-0 items-center justify-center opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                    <img
                      src={logo.image}
                      alt={logo.description}
                      className={logo.className}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent"></div>
        </div>
      </div>
    </section>
  );
}
