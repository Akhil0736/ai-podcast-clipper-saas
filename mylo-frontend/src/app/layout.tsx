import "~/styles/globals.css";

import { type Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans, Lobster } from "next/font/google";

export const metadata: Metadata = {
  title: "Mylo - AI Video Clipper",
  description:
    "Turn raw videos into viral clips with AI. Upload → Process → Download in minutes.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const lobster = Lobster({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lobster",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jakarta.variable} ${lobster.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
