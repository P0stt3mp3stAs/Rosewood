// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import initRestorant3D from "@/components/3D/restorant";
import FloatingPanel from "@/components/FloatingPanel";
import MiniMap from "@/components/MiniMap";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initRestorant3D({
      onEnter: () => setEntered(true),
      onExit: () => setEntered(false),
    });
  }, []);

  const handleSearchClick = () => {
    router.push("/reservations/edit");
  };

  return (
    <div>
      <section className="fixed inset-0 w-screen h-screen overflow-hidden touch-none">
        {/* 3D Canvas with overlay */}
        <div className="absolute inset-0">
          <canvas
            className={`restorant-3D w-full h-full transition-all duration-1000
              ${!entered ? "blur-2xl brightness-[0.3]" : ""}
            `}
          />
        </div>

        {/* Landing UI */}
        {!entered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 z-20">
            <div className="relative">
              {/* Animated glow effect */}
              <div className="absolute inset-0 blur-3xl bg-rose-500/30 animate-pulse" />
              
              <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl">
                <div className="flex flex-col items-center">
                  {/* Logo with glow */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 blur-2xl bg-rose-400/40" />
                    <img 
                      src="/logo.png" 
                      className="relative w-24 h-24 drop-shadow-2xl" 
                      alt="logo" 
                    />
                  </div>
                  
                  {/* Restaurant Name */}
                  <h1 className="text-5xl md:text-6xl font-serif font-bold mb-3 bg-gradient-to-r from-rose-300 via-rose-200 to-rose-300 bg-clip-text text-transparent">
                    RoseWood
                  </h1>
                  
                  <div className="h-px w-32 bg-gradient-to-r from-transparent via-rose-300 to-transparent mb-6" />
                  
                  <p className="text-lg text-gray-300 mb-4 max-w-md text-center leading-relaxed">
                    Experience fine dining in an immersive 3D environment
                  </p>

                  {/* Scroll Indicator */}
                  <div className="mt-8 flex flex-col items-center animate-bounce">
                    <p className="text-sm text-gray-400 mb-2">to reserve your seat Scroll or swipe</p>
                    <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entered State - Top Navigation Bar */}
        {entered && (
          <div className="absolute top-0 left-0 right-0 z-30">
            <div className="backdrop-blur-xl bg-black/30 border-b border-white/10">
              <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo & Name */}
                <div className="flex items-center gap-3">
                  <img src="/logo.png" className="w-10 h-10" alt="logo" />
                  <span className="text-white font-serif text-xl font-bold hidden sm:block">RoseWood</span>
                </div>

                {/* Search Button */}
                <button
                  onClick={handleSearchClick}
                  className="group relative px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline text-sm font-medium">Find Reservation</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating panel */}
        {entered && <FloatingPanel />}

        {/* MINIMAP HERE */}
        {entered && <MiniMap />}
      </section>
    </div>
  );
}