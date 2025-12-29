// src/components/FloatingPanel/AvailabilityButton.tsx
'use client';

export type AvailabilityStatus = 'idle' | 'available' | 'partially-reserved' | 'fully-reserved';

interface AvailabilityButtonProps {
  status: AvailabilityStatus;
  isLoading: boolean;
  reservedCount: number;
  onClick: () => void;
}

export default function AvailabilityButton({
  status,
  isLoading,
  reservedCount,
  onClick,
}: AvailabilityButtonProps) {
  const getButtonText = () => {
    if (isLoading) return 'Checking...';
    
    switch (status) {
      case 'idle':
        return 'Check Availability';
      case 'available':
        return (
          <>
            All Seats Available ✓
            <br />
            <span className="text-sm font-medium">Click the BELL to reserve</span>
          </>
        );
      case 'partially-reserved':
        return (
          <>
            {reservedCount} Seat{reservedCount !== 1 ? 's' : ''} Reserved
            <br />
            <span className="text-sm font-medium">Click the BELL to reserve</span>
          </>
        );
      case 'fully-reserved':
        return 'All seats are reserved. Try another time or date.';
      default:
        return 'Check Availability';
    }
  };

  const getButtonClasses = () => {
    const baseClasses = "mt-4 rounded-2xl py-3 text-sm font-semibold tracking-wide hover:scale-[1.03] active:scale-[0.97] transition disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (status) {
      case 'idle':
        return `${baseClasses} bg-white text-black`;
      case 'available':
        return `${baseClasses} bg-green-500 text-white`;
      case 'partially-reserved':
        return `${baseClasses} bg-green-500 text-white`;
      case 'fully-reserved':
        return `${baseClasses} bg-red-500 text-white`;
      default:
        return `${baseClasses} bg-white text-black`;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading || status === 'fully-reserved'}
      className={getButtonClasses()}
    >
      {getButtonText()}
    </button>
  );
}