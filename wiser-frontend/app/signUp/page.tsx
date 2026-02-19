"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { WiserLogo } from "@/components/WiserLogo";
import { useAuthStore } from "@/store/useAuthStore"; // This will update our global logged-in state

export default function SignupPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    aadharCardNumber: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- THIS IS THE BRIDGE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Clear any old errors

    try {
      // 1. Send the POST request to your backend
      const response = await fetch("http://localhost:5000/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Convert our state into a JSON string
      });

      // 2. Parse the backend's response
      const data = await response.json();

      // 3. Check if the backend threw an error (like "User already exists")
      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      }

      // 4. Success! Save the token to local storage so they stay logged in
      localStorage.setItem("wiser_token", data.token);

      // 5. Update our global Zustand state
      login({
        name: data.name,
        email: data.email,
        aadharCardNumber: data.aadharCardNumber,
        ecoScore: data.ecoScore
      });

      // 6. Redirect the user to the Home page
      router.push("/");

    } catch (err: any) {
      setError(err.message); // Show the error on the screen
    } finally {
      setIsLoading(false); // Stop the loading spinner
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 bg-white dark:bg-gray-950 pb-20">
      <div className="w-full max-w-md bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">

        <div className="mb-8">
          <WiserLogo />
          <h2 className="mt-4 text-2xl font-bold text-center text-gray-900 dark:text-white">
            Join Wiser
          </h2>
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
            Start commuting smarter and greener.
          </p>
        </div>

        {/* Display Error Messages Here */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Alex Johnson"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Aadhar Card Number
            </label>
            <input
              type="text"
              name="aadharCardNumber"
              required
              maxLength={12}
              pattern="\d{12}"
              title="Aadhar card must be exactly 12 digits"
              value={formData.aadharCardNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="123456789012"
            />
          </div>

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
            className={`w-full text-white font-semibold py-3 rounded-xl shadow-md transition-all active:scale-[0.98] ${isLoading ? "bg-green-400 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              }`}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 dark:text-green-400 font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}