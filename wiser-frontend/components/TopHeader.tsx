"use client";

import Link from "next/link";
import Image from "next/image"; // Import the Image component
import { useAuthStore } from "@/store/useAuthStore";
import { User, LogIn } from "lucide-react";

// Make sure you have saved your logo image in the public folder, e.g., /public/wiser-logo.png
const WISER_LOGO_PATH = "/logo-dark.png"; // Replace with your actual filename if different

export function TopHeader() {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* 1. New Logo & Brand Name */}
        <Link href="/" className="flex items-center gap-3 active:scale-95 transition-transform">
          <Image 
            src={WISER_LOGO_PATH}
            alt="Wiser Logo"
            width={40} // Adjust width as needed
            height={40} // Adjust height as needed
            className="object-contain"
            priority // Loads the logo immediately
          />
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white hidden sm:block">
          </span>
        </Link>

        {/* 2. Dynamic Auth Button */}
        <div>
          {isAuthenticated ? (
            <Link 
              href="/profile" 
              className="w-10 h-10 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 active:scale-95"
            >
              <User size={18} />
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all"
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Log in</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}