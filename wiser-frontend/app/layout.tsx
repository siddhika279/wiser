import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { TopHeader } from "@/components/TopHeader"; // <-- Import the new top header!

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wiser | Smart Commute",
  description: "Smart, Sustainable, AI-powered Travel Companion",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100`}>
        
        {/* 1. The minimal top header (Logo + Login) */}
        <TopHeader />
        
        {/* 2. Main content area: pt-16 for the top header, pb-24 for the bottom nav */}
        <div className="pt-16 pb-24 min-h-screen">
          {children}
        </div>
        
        {/* 3. The mobile bottom nav (Ride, Eco, Compare) */}
        <BottomNav />
        
      </body>
    </html>
  );
}