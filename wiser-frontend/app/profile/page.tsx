"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { LogOut, Award, Leaf, Car, MapPin, Clock } from "lucide-react";

export default function ProfileDashboard() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const [myRides, setMyRides] = useState({ providedRides: [], requestedRides: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"provided" | "requested">("requested");

  useEffect(() => {
    // If they aren't logged in, boot them to the login page
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Fetch their rides
    const fetchRides = async () => {
      try {
        const token = localStorage.getItem("wiser_token");
        const response = await fetch("http://localhost:5000/api/rides/my-rides", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setMyRides(data);
        }
      } catch (error) {
        console.error("Failed to fetch rides", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRides();
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    localStorage.removeItem("wiser_token");
    logout();
    router.push("/");
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div></div>;
  if (!user) return null;

  const displayRides = activeTab === "provided" ? myRides.providedRides : myRides.requestedRides;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      
      {/* 1. Header & Logout */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
        <button onClick={handleLogout} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 transition-colors">
          <LogOut size={20} />
        </button>
      </div>

      {/* 2. Gamification Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-5 rounded-3xl text-white shadow-lg shadow-green-500/20 flex flex-col items-center justify-center text-center">
          <Award className="mb-2 text-green-100" size={28} />
          <p className="text-3xl font-bold">{user.ecoScore || 10}</p>
          <p className="text-xs text-green-100 font-medium">Eco Score</p>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center">
          <Leaf className="text-green-500 mb-2" size={28} />
          <p className="text-3xl font-bold text-gray-900 dark:text-white">12 kg</p>
          <p className="text-xs text-gray-500 font-medium">CO₂ Saved</p>
        </div>
      </div>

      {/* 3. Ride History Toggle */}
      <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-2xl mb-6">
        <button 
          onClick={() => setActiveTab("requested")}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "requested" ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white" : "text-gray-500"}`}
        >
          Rides Booked
        </button>
        <button 
          onClick={() => setActiveTab("provided")}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === "provided" ? "bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-white" : "text-gray-500"}`}
        >
          My Drives
        </button>
      </div>

      {/* 4. Ride List */}
      <div className="space-y-4 pb-10">
        {displayRides.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <Car size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No rides found here.</p>
          </div>
        ) : (
          displayRides.map((ride: any) => (
            <div key={ride._id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 mb-3">
                <div className={`px-3 py-1 text-xs font-bold rounded-full ${ride.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {ride.status.toUpperCase()}
                </div>
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(ride.departureTime).toLocaleDateString()}
                </span>
              </div>
              
              <div className="space-y-2 mb-4 relative pl-2">
                 <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-100 dark:bg-gray-800"></div>
                 <div className="flex gap-3 items-center relative z-10">
                    <div className="w-2 h-2 bg-green-500 rounded-full ring-4 ring-white dark:ring-gray-900"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{ride.source}</p>
                 </div>
                 <div className="flex gap-3 items-center relative z-10">
                    <div className="w-2 h-2 bg-red-500 rounded-full ring-4 ring-white dark:ring-gray-900"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{ride.destination}</p>
                 </div>
              </div>

              {activeTab === "requested" && ride.creator && (
                <div className="pt-3 border-t border-gray-50 dark:border-gray-800/50 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">Driver:</span> {ride.creator.name}
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}