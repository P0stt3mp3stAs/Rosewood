// src/components/FloatingPanel/TimeSelector.tsx
'use client';

import { minutes } from './constants';

interface TimeSelectorProps {
  label: string;
  id: string;
  hours: string[];
  selectedHour: string;
  selectedMinute: string;
  onHourChange: (hour: string) => void;
  onMinuteChange: (minute: string) => void;
}

export default function TimeSelector({
  label,
  id,
  hours,
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
}: TimeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-white/60 text-xs uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2 backdrop-blur border border-white/15">
        <select
          id={`${id}-hour`}
          value={selectedHour}
          onChange={(e) => onHourChange(e.target.value)}
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
          id={`${id}-minute`}
          value={selectedMinute}
          onChange={(e) => onMinuteChange(e.target.value)}
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
  );
}