// src/components/FloatingPanel.tsx

'use client';

import { useState } from "react";

export default function FloatingPanel() {
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  // Hours between 13:00 (1pm) and 02:00 (2am next day)
  // 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 00, 01, 02
  const allHours = ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00", "01", "02"];
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  // Filter "to" hours based on "from" time
  const getToHours = () => {
    if (!fromTime) return allHours;
    
    const [fromHour, fromMinute] = fromTime.split(":").map(Number);
    
    // If from hour is 13-22, to hour must be greater (including 23, 00, 01, 02)
    if (fromHour >= 13 && fromHour <= 22) {
      return allHours.filter(h => {
        const hour = Number(h);
        // Allow hours greater than fromHour, or early morning hours (00, 01, 02)
        return hour > fromHour || hour <= 2;
      });
    }
    
    // If from hour is 23, 00, 01, only allow later early morning hours
    if (fromHour === 23) {
      return ["00", "01", "02"];
    }
    if (fromHour === 0) {
      return ["01", "02"];
    }
    if (fromHour === 1) {
      return ["02"];
    }
    
    return allHours;
  };

  const checkAvailability = async () => {
    if (!date || !fromTime || !toTime) return;

    try {
      const res = await fetch(`/api/reservations?date=${date}&from=${fromTime}&to=${toTime}`);
      const data = await res.json();

      // dispatch event to Three.js
      window.dispatchEvent(
        new CustomEvent("update-reservations", {
          detail: data.reservedSeats,
        })
      );
    } catch (err) {
      console.error("Failed to fetch reservations", err);
    }
  };

  return (
    <div className="fixed right-4 top-1/3 -translate-y-1/2 z-50 scale-75">
      <div className="relative rounded-3xl bg-white/10 backdrop-blur-3xl shadow-[16px_-16px_30px_rgba(0,0,0,0.5)] border border-white/20 w-64 p-5 flex flex-col gap-5">
        {/* Date */}
        <div className="flex flex-col gap-2">
          <label className="text-white/60 text-xs uppercase tracking-widest">Date</label>
          <input
            type="date"
            id="reservation-date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="appearance-none bg-white/5 text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-white/15 backdrop-blur focus:border-white/40 focus:bg-white/10 transition"
          />
        </div>

        {/* Time */}
        <div className="grid grid-cols-2 gap-4">
          {/* From */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs uppercase tracking-widest">From</label>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 backdrop-blur border border-white/15">
              <select
                id="time-from-hour"
                value={fromTime.split(":")[0] || "00"}
                onChange={(e) =>
                  setFromTime(`${e.target.value}:${fromTime.split(":")[1] || "00"}`)
                }
                className="appearance-none bg-transparent text-white text-sm outline-none"
              >
                {allHours.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-white">:</span>
              <select
                id="time-from-minute"
                value={fromTime.split(":")[1] || "00"}
                onChange={(e) =>
                  setFromTime(`${fromTime.split(":")[0] || "00"}:${e.target.value}`)
                }
                className="appearance-none bg-transparent text-white text-sm outline-none"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          {/* To */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs uppercase tracking-widest">To</label>
            <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 backdrop-blur border border-white/15">
              <select
                id="time-to-hour"
                value={toTime.split(":")[0] || "00"}
                onChange={(e) =>
                  setToTime(`${e.target.value}:${toTime.split(":")[1] || "00"}`)
                }
                className="appearance-none bg-transparent text-white text-sm outline-none"
              >
                {getToHours().map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <span className="text-white">:</span>
              <select
                id="time-to-minute"
                value={toTime.split(":")[1] || "00"}
                onChange={(e) =>
                  setToTime(`${toTime.split(":")[0] || "00"}:${e.target.value}`)
                }
                className="appearance-none bg-transparent text-white text-sm outline-none"
              >
                {minutes.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={checkAvailability}
          className="mt-4 rounded-2xl bg-white text-black py-3 text-sm font-semibold tracking-wide hover:scale-[1.03] active:scale-[0.97] transition"
        >
          Check Availability
        </button>
      </div>
    </div>
  );
}