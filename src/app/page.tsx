"use client";
import { useEffect, useState } from "react";
import initRestorant3D from "@/components/3D/restorant";

export default function Home() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    // pass onEnter and onExit so the 3D init can notify React to show/hide the landing overlay
    initRestorant3D({
      onEnter: () => setEntered(true),
      onExit: () => setEntered(false),
    });
  }, []);

  return (
    <div>
      <section className="fixed inset-0 w-screen h-screen overflow-hidden touch-none">
        {/* Canvas with blur when not entered */}
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
            <p className="text-lg opacity-80">Welcome — scroll to choose you seat</p>
          </div>
        )}
      </section>
    </div>
  );
}
