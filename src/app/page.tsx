// src/app/page.tsx

"use client";
import { useEffect } from "react";
import initRestorant3D from "@/components/3D/restorant";

export default function Home() {
  useEffect(() => {
    initRestorant3D();
  }, []);

  return (
    <div>
      <section className="page relative w-full h-screen">
        <canvas className="restorant-3D" />

        {/* CAMERA SWITCH BUTTONS */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 z-50">
          <button
            id="prevCam"
            className="px-5 py-3 text-2xl rounded-xl bg-white/70 backdrop-blur-md shadow-md hover:bg-white transition"
          >
            ←
          </button>

          <button
            id="nextCam"
            className="px-5 py-3 text-2xl rounded-xl bg-white/70 backdrop-blur-md shadow-md hover:bg-white transition"
          >
            →
          </button>
        </div>
      </section>
    </div>
  );
}
