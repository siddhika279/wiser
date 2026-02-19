import Link from "next/link";
import { WiserLogo } from "@/components/WiserLogo";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
      
      <WiserLogo />
      
      <h1 className="mt-8 text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Welcome to Wiser
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-sm">
        Your Smart, Sustainable, AI-powered Travel Companion.
      </p>

      {/* This is the new button connecting to your signup page */}
      <div className="mt-10 flex flex-col w-full max-w-xs space-y-4">
        <Link 
          href="/signUp" 
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all active:scale-95 flex justify-center"
        >
          Get Started
        </Link>
        
        <Link 
          href="/login" 
          className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-xl transition-all active:scale-95 flex justify-center"
        >
          Log In
        </Link>
      </div>

    </main>
  );
}