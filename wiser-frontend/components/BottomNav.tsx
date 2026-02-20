"use client"; // This tells Next.js this is an interactive client component

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Car, Leaf, User } from "lucide-react";

export const BottomNav = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Ride", href: "/", icon: Car },
    { name: "Eco", href: "/eco", icon: Leaf },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 pb-safe">
      <nav className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive
                  ? "text-green-500 dark:text-green-400"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};