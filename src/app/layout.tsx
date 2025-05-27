import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spirit Athletics - Competitive Cheerleading Programs",
  description: "Formerly High Desert Cheer, Spirit Athletics provides competitive cheerleading programs for athletes of all levels, from non-competitive to Elite All-Star teams.",
  keywords: "cheerleading, competitive cheer, all-star cheer, youth athletics, Spirit Athletics, High Desert Cheer",
  authors: [{ name: "Spirit Athletics" }],
  openGraph: {
    title: "Spirit Athletics - Competitive Cheerleading Programs",
    description: "Competitive cheerleading programs for athletes of all levels",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavBar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
} 