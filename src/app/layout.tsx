import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SessionProvider from "@/components/SessionProvider";
import { CartProvider } from "@/contexts/CartContext";
import FloatingCart from "@/components/FloatingCart";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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
  description: "Spirit Athletics provides competitive cheerleading programs for athletes of all levels, from non-competitive to Elite All-Star teams.",
  keywords: "cheerleading, competitive cheer, all-star cheer, youth athletics, Spirit Athletics, Hesperia cheerleading",
  authors: [{ name: "Spirit Athletics" }],
  openGraph: {
    title: "Spirit Athletics - Competitive Cheerleading Programs",
    description: "Competitive cheerleading programs for athletes of all levels",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <CartProvider>
            <NavBar />
            <main>{children}</main>
            <Footer />
            <FloatingCart />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
} 