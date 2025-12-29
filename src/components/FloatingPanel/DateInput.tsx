// src/components/FloatingPanel/DateInput.tsx
'use client';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  minDate: string;
}

export default function DateInput({ value, onChange, minDate }: DateInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-white/60 text-xs uppercase tracking-widest">
        Date
      </label>
      <input
        type="date"
        id="reservation-date"
        min={minDate}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white/5 text-white rounded-xl px-4 py-2.5 text-sm outline-none border border-white/15 backdrop-blur focus:border-white/40 focus:bg-white/10 transition"
      />
    </div>
  );
}