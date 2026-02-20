"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, Award, Leaf } from "lucide-react";

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  // If nobody is logged in, show this message
  if (!isAuthenticated || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Not Logged In</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Please log in to view your profile.</p>
        <button
          onClick={() => router.push("/signUp")}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-xl transition-all"
        >
          Create an Account
        </button>
      </div>
    );
  }

  // Handle logging out
  const handleLogout = () => {
    localStorage.removeItem("wiser_token"); // Remove the security token
    logout(); // Clear the global state
    router.push("/"); // Send them back to the home page
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 pb-24">
      <div className="max-w-md mx-auto space-y-6 mt-4">
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        
        {/* User Identity Card */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
            <UserIcon size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* Gamification Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
            <Award className="text-yellow-500 mb-2" size={28} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{user.ecoScore || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Eco Score</p>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center">
            <Leaf className="text-green-500 mb-2" size={28} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">0 kg</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">CO₂ Saved</p>
          </div>
        </div>

        {/* Private Details */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Account Details</h3>
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">Aadhar Number</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {/* Only show the last 4 digits for privacy! */}
              •••• •••• {user.aadharCardNumber?.slice(-4) || "XXXX"}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Account Status</span>
            <span className="text-sm font-medium text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
              Verified User
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold py-3 rounded-xl transition-all mt-6"
        >
          <LogOut size={20} />
          Log Out
        </button>

      </div>
    </div>
  );
}