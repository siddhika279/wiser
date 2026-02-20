"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useJsApiLoader, GoogleMap, Autocomplete, DirectionsRenderer } from "@react-google-maps/api";
import { MapPin, Navigation, Calendar, Clock, Car, Search, Users } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const libraries: ("places")[] = ["places"];

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  // State Management
  const [source, setSource] = useState<google.maps.places.PlaceResult | null>(null);
  const [destination, setDestination] = useState<google.maps.places.PlaceResult | null>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  
  const [role, setRole] = useState<"none" | "provide" | "find">("none");
  const [seats, setSeats] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [availableRides, setAvailableRides] = useState<any[]>([]);

  // 🗺️ Calculate Route & Draw Line on Map
  const calculateRoute = async () => {
    if (!source?.formatted_address || !destination?.formatted_address) return;
    const service = new google.maps.DirectionsService();
    const result = await service.route({
      origin: source.formatted_address,
      destination: destination.formatted_address,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setDirections(result);
    setDistance(result.routes[0].legs[0].distance?.text || "");
    setDuration(result.routes[0].legs[0].duration?.text || "");
  };

  // 🔍 GUEST ACTION: Smart Search Rides (500m overlap logic)
  const handleSearchRides = async () => {
    setIsLoading(true);
    setAvailableRides([]);
    try {
      const token = localStorage.getItem("wiser_token") || ""; 
      
      // 1. Extract exact GPS coordinates from the Google Places objects
      const sLat = source?.geometry?.location?.lat();
      const sLng = source?.geometry?.location?.lng();
      const dLat = destination?.geometry?.location?.lat();
      const dLng = destination?.geometry?.location?.lng();

      if (!sLat || !sLng || !dLat || !dLng) {
        alert("Please select valid locations from the dropdown suggestions.");
        setIsLoading(false);
        return;
      }

      // 2. Send the exact coordinates to the backend for Haversine math
      const response = await fetch(
        `http://localhost:5000/api/rides/search?date=${date}&sourceLat=${sLat}&sourceLng=${sLng}&destLat=${dLat}&destLng=${dLng}`, 
        {
          headers: { "Authorization": `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableRides(data);
        if (data.length === 0) alert("No rides passing near your route found for this date. Try another day!");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚘 PROTECTED ACTION: Publish a Ride with GPS Breadcrumbs
  const handlePublishRide = async () => {
    if (!isAuthenticated) {
      alert("Please log in to publish your ride.");
      router.push("/login");
      return; 
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("wiser_token");
      
      // 1. Extract the secret GPS breadcrumbs (polyline) from the map
      const routePath = directions?.routes[0]?.overview_path?.map((point) => ({
        lat: point.lat(),
        lng: point.lng()
      })) || [];

      // 2. Send everything to the database
      const response = await fetch("http://localhost:5000/api/rides", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          source: source?.formatted_address,
          destination: destination?.formatted_address,
          date, 
          time, 
          seatsAvailable: seats, 
          rideType: role,
          routePath // <-- This makes your app smart!
        }),
      });

      if (response.ok) {
        alert("Ride published successfully! 🎉 It is now visible to nearby seekers.");
        setRole("none"); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎟️ PROTECTED ACTION: Request a Ride (Wait for Approval)
  const handleRequestRide = async (rideId: string) => {
    if (!isAuthenticated) {
      alert("Please log in to request this seat.");
      router.push("/login");
      return; 
    }

    try {
      const token = localStorage.getItem("wiser_token");
      // Notice we are sending to the new Request endpoint (we will build this backend next!)
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}/request`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const data = await response.json();

      if (response.ok) {
        alert("🎉 Request Sent! Waiting for the driver to approve.");
        // We do NOT refresh the list immediately because the seat isn't claimed until approved.
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-24 font-sans">
      
      {/* 🟢 STEP 1: LOCATION INPUT SECTION */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-b-[2rem] shadow-sm border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Where to?</h1>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:ring-2 focus-within:ring-green-500">
            <Navigation size={20} className="text-green-500 flex-shrink-0" />
            <Autocomplete className="w-full" onLoad={(auto) => auto.addListener("place_changed", () => { setSource(auto.getPlace()); if (destination) calculateRoute(); })}>
              <input type="text" placeholder="Current Location or Search..." className="bg-transparent w-full outline-none text-gray-900 dark:text-white" />
            </Autocomplete>
          </div>

          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 focus-within:ring-2 focus-within:ring-red-500">
            <MapPin size={20} className="text-red-500 flex-shrink-0" />
            <Autocomplete className="w-full" onLoad={(auto) => auto.addListener("place_changed", () => { setDestination(auto.getPlace()); calculateRoute(); })}>
              <input type="text" placeholder="Destination" className="bg-transparent w-full outline-none text-gray-900 dark:text-white" />
            </Autocomplete>
          </div>

          <div className="flex gap-4">
             <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Calendar size={18} className="text-gray-500" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent w-full outline-none text-gray-900 dark:text-white text-sm" />
             </div>
             <div className="flex-1 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <Clock size={18} className="text-gray-500" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-transparent w-full outline-none text-gray-900 dark:text-white text-sm" />
             </div>
          </div>
        </div>
      </div>

      {/* 🗺️ MAP PREVIEW */}
      <div className="px-6 mt-6 relative">
        <div className="h-48 w-full rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 bg-gray-200">
          <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: 26.9124, lng: 75.7873 }} zoom={12} options={{ disableDefaultUI: true, zoomControl: false }}>
            {directions && <DirectionsRenderer directions={directions} options={{ polylineOptions: { strokeColor: '#10B981', strokeWeight: 4 } }} />}
          </GoogleMap>
        </div>
        {distance && duration && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-semibold flex gap-4">
            <span>🚗 {distance}</span><span>⏱️ {duration}</span>
          </div>
        )}
      </div>

      {/* 🚘 RIDE OPTION SELECTION */}
      <div className="px-6 mt-8">
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setRole("provide")} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all ${role === "provide" ? "border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md" : "border-transparent bg-white dark:bg-gray-900 shadow-sm"}`}>
            <Car size={28} className={role === "provide" ? "text-green-500 mb-2" : "text-green-600/50 mb-2"} />
            <span className="font-bold">Provide Ride</span>
          </button>
          <button onClick={() => setRole("find")} className={`flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all ${role === "find" ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md" : "border-transparent bg-white dark:bg-gray-900 shadow-sm"}`}>
            <Search size={28} className={role === "find" ? "text-blue-500 mb-2" : "text-blue-600/50 mb-2"} />
            <span className="font-bold">Find Carpool</span>
          </button>
        </div>

        {role === "provide" && (
          <div className="mt-6 p-5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3"><Users className="text-green-500" size={24} /><span className="font-medium">Available Seats</span></div>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-1 border">
              <button onClick={() => setSeats(Math.max(1, seats - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-sm font-bold">-</button>
              <span className="font-bold w-4 text-center">{seats}</span>
              <button onClick={() => setSeats(Math.min(6, seats + 1))} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-700 shadow-sm font-bold">+</button>
            </div>
          </div>
        )}

        {role !== "none" && (
          <button 
            onClick={role === "provide" ? handlePublishRide : handleSearchRides}
            disabled={!source || !destination || !date || !time || isLoading}
            className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all active:scale-[0.98] ${!source || !destination || !date || !time ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed" : role === "provide" ? "bg-gradient-to-r from-green-500 to-green-600" : "bg-gradient-to-r from-blue-500 to-blue-600"}`}
          >
            {isLoading ? "Loading..." : (!source || !destination || !date || !time ? "Complete all fields" : role === "provide" ? "Publish Ride" : "Search Carpools")}
          </button>
        )}
      </div>

      {/* 🚗 CARPOOL RESULTS SECTION */}
      {availableRides.length > 0 && (
        <div className="px-6 mt-8 pb-10">
          <h2 className="text-xl font-bold mb-4">Smart Matches</h2>
          <div className="space-y-4">
            {availableRides.map((ride) => (
              <div key={ride._id} className="bg-white dark:bg-gray-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center font-bold text-lg">{ride.creator?.name?.charAt(0) || "D"}</div>
                    <div>
                      <h3 className="font-bold">{ride.creator?.name || "Verified Driver"}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-medium">
                          {ride.creator?.gender || "Verified"}
                        </span>
                        <span className="text-xs text-green-600 font-medium">Eco Score: {ride.creator?.ecoScore || 10} 🍃</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{ride.seatsAvailable} seats left</div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-gray-800/50 mt-4">
                  <div className="flex items-center gap-2 font-bold"><Clock size={16} className="text-gray-400" />{new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <button onClick={() => handleRequestRide(ride._id)} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl font-bold text-sm active:scale-95 transition-all">
                    Send Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}