"use client";
import { useEffect, useState } from "react";
import initRestorant3D from "@/components/3D/restorant";
import FloatingPanel from "@/components/FloatingPanel";

export default function Home() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    initRestorant3D({
      onEnter: () => setEntered(true),
      onExit: () => setEntered(false),
    });
  }, []);

  return (
    <div>
      <section className="fixed inset-0 w-screen h-screen overflow-hidden touch-none">
        {/* Canvas */}
        <canvas
          className={`restorant-3D w-full h-full transition-all duration-700
            ${!entered ? "blur-xl brightness-50" : ""}
          `}
        />

        {/* Landing UI (ONLY index 0) */}
        {!entered && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6">
            <img src="/logo.png" className="w-32 mb-6 opacity-90" alt="logo" />
            <h1 className="text-3xl font-bold mb-3">RoseWood</h1>
            <p className="text-lg opacity-80">
              Welcome — scroll to choose your seat
            </p>
          </div>
        )}

        {/* Floating panel (ALL positions except index 0) */}
        {entered && <FloatingPanel />}
      </section>
    </div>
  );
}
