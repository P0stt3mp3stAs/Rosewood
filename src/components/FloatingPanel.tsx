// src/components/FloatingPanel.tsx
'use client';

import { useState } from "react";
import { motion } from "framer-motion";

export default function FloatingPanel() {
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  return (
    <div className="fixed right-4 top-1/3 -translate-y-1/2 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20, rotateY: -30, rotateX: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="
          relative
          rounded-3xl
          bg-white/10
          backdrop-blur-3xl
          shadow-[16px_-16px_30px_rgba(0,0,0,50)]
          border border-white/20

          w-64
          sm:w-72
          lg:w-80

          scale-[0.9]
          sm:scale-100
          lg:scale-[1.05]
          xl:scale-[1.1]
        "
        style={{
          transform:
            "perspective(1200px) rotateY(25deg) rotateX(-10deg)",
        }}
      >
        {/* Glow */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-red-500/30 to-yellow-400/20 blur-xl" />

        <div className="relative p-5 flex flex-col gap-5">
          {/* Date */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs uppercase tracking-widest">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="appearance-none bg-white/5 text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-white/15 backdrop-blur focus:border-white/40 focus:bg-white/10 transition"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            {/* From */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs uppercase tracking-widest">
                From
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 backdrop-blur border border-white/15">
                <select
                  value={fromTime.split(":")[0] || "00"}
                  onChange={(e) =>
                    setFromTime(
                      `${e.target.value}:${fromTime.split(":")[1] || "00"}`
                    )
                  }
                  className="appearance-none bg-transparent text-white text-sm outline-none"
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className="text-white">:</span>
                <select
                  value={fromTime.split(":")[1] || "00"}
                  onChange={(e) =>
                    setFromTime(
                      `${fromTime.split(":")[0] || "00"}:${e.target.value}`
                    )
                  }
                  className="appearance-none bg-transparent text-white text-sm outline-none"
                >
                  {minutes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* To */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs uppercase tracking-widest">
                To
              </label>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 backdrop-blur border border-white/15">
                <select
                  value={toTime.split(":")[0] || "00"}
                  onChange={(e) =>
                    setToTime(
                      `${e.target.value}:${toTime.split(":")[1] || "00"}`
                    )
                  }
                  className="appearance-none bg-transparent text-white text-sm outline-none"
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <span className="text-white">:</span>
                <select
                  value={toTime.split(":")[1] || "00"}
                  onChange={(e) =>
                    setToTime(
                      `${toTime.split(":")[0] || "00"}:${e.target.value}`
                    )
                  }
                  className="appearance-none bg-transparent text-white text-sm outline-none"
                >
                  {minutes.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Button */}
          <button className="mt-4 rounded-2xl bg-white text-black py-3 text-sm font-semibold tracking-wide hover:scale-[1.03] active:scale-[0.97] transition">
            Reserve
          </button>
        </div>
      </motion.div>
    </div>
  );
}
