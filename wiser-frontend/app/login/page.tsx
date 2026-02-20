"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WiserLogo } from "@/components/WiserLogo";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STANDARD EMAIL LOGIN ---
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      // Save token and update global state
      localStorage.setItem("wiser_token", data.token);
      login({
        name: data.name,
        email: data.email,
        aadharCardNumber: data.aadharCardNumber,
        ecoScore: data.ecoScore,
      });

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- GOOGLE LOGIN (Coming Next) ---
  const handleGoogleLogin = () => {
    console.log("We are wiring this up next!");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-white dark:bg-gray-950 pb-20">
      <div className="w-full max-w-md bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        
        <div className="mb-8">
          <WiserLogo />
          <h2 className="mt-4 text-2xl font-bold text-center text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
            Log in to continue your sustainable journey.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-3 rounded-xl transition-all active:scale-[0.98] mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <span className="absolute bg-gray-50 dark:bg-gray-900 px-3 text-sm text-gray-500">or log in with email</span>
          <div className="w-full h-px bg-gray-200 dark:bg-gray-800"></div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="alex@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full text-white font-semibold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] ${
              isLoading ? "bg-green-400 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            }`}
          >
            {isLoading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Don't have an account?{" "}
          <Link href="/signUp" className="text-green-600 dark:text-green-400 font-semibold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}