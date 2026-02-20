"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Leaf, ArrowRightLeft } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Ride", href: "/", icon: Map },
    { name: "Eco", href: "/eco", icon: Leaf },
    { name: "Compare", href: "/compare", icon: ArrowRightLeft },
  ];

  // Don't show the bottom nav on the login or signup pages to keep them clean
  if (pathname === '/login' || pathname === '/signup') return null;

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 pb-safe">
      <div className="max-w-md mx-auto px-6 h-20 flex items-center justify-between">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link 
              key={link.name} 
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors active:scale-95 ${
                isActive 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "mb-1" : ""} />
              <span className={`text-[10px] font-medium ${isActive ? "opacity-100" : "opacity-0 h-0"}`}>
                {link.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}