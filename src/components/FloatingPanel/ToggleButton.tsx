// src/components/FloatingPanel/ToggleButton.tsx
'use client';

import { ChevronRight, ChevronLeft, CalendarIcon } from './Icons';

interface ToggleButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

export default function ToggleButton({ isVisible, onClick }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed top-1/5 z-50 bg-black/30 backdrop-blur-sm border-2 border-white/10 rounded-2xl transition-all duration-300 hover:bg-black/50 flex items-center ${
        isVisible ? 'right-[13rem]' : 'right-0'
      }`}
      aria-label={isVisible ? "Hide panel" : "Show panel"}
      title={isVisible ? "Hide panel" : "Show panel"}
    >
      <div className="pl-3">
        <CalendarIcon />
      </div>
      <div className="p-2 pr-3">
        <div className="w-5 h-5 text-white">
          {isVisible ? <ChevronRight /> : <ChevronLeft />}
        </div>
      </div>
    </button>
  );
}