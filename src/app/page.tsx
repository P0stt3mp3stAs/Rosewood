// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import initRestorant3D from "@/components/3D/restorant";
import FloatingPanel from "@/components/FloatingPanel";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    initRestorant3D({
      onEnter: () => setEntered(true),
      onExit: () => setEntered(false),
    });
  }, []);

  // Handler for the search button click
  const handleSearchClick = () => {
    router.push("/reservations/edit");
  };

  return (
    <div>
      <section className="fixed inset-0 w-screen h-screen overflow-hidden touch-none">
        <canvas
          className={`restorant-3D w-full h-full transition-all duration-700
            ${!entered ? "blur-xl brightness-50" : ""}
          `}
        />

        {/* Landing UI */}
        {!entered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
            <img src="/logo.png" className="w-32 mb-6 opacity-90" alt="logo" />
            <h1 className="text-3xl font-bold mb-3">RoseWood</h1>
            <p className="text-lg opacity-80">
              Welcome — scroll or swipe to choose your seat
            </p>
          </div>
        )}

        {/* Floating panel */}
        {entered && <FloatingPanel />}

        {/* Fixed Search Button - Always visible */}
        <button
          onClick={handleSearchClick}
          className="fixed top-4 left-4 z-50 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label="Search reservations"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </section>
    </div>
  );
}