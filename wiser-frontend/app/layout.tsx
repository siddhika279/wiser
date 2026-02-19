import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav"; // <-- Import it here

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
        
        {/* We wrap children in a div with bottom padding so content isn't hidden behind the nav bar */}
        <div className="pb-20 min-h-screen">
          {children}
        </div>
        
        {/* Place the navigation bar at the bottom */}
        <BottomNav />
        
      </body>
    </html>
  );
}