'use client';

import { useState, useEffect } from "react";

export default function FloatingPanel() {
  const [date, setDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'idle' | 'available' | 'partially-reserved' | 'fully-reserved'>('idle');
  const [reservedCount, setReservedCount] = useState(0);

  // Constants
  const TOTAL_SEATS = 17;
  
  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  // Hours between 13:00 (1pm) and 02:00 (2am next day)
  const allHours = ["13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00", "01", "02"];
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

  // SVG icons for the toggle button
  const ChevronRight = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );

  const ChevronLeft = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );

  // Filter "to" hours based on "from" time
  const getToHours = () => {
    if (!fromTime) return allHours;
    
    const [fromHour] = fromTime.split(":").map(Number);
    
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

  // Reset status when date or time changes
  useEffect(() => {
    setAvailabilityStatus('idle');
  }, [date, fromTime, toTime]);

  // Initialize times when component mounts
  useEffect(() => {
    if (!fromTime) {
      const initialFromTime = "13:00";
      const initialToTime = "15:00";
      setFromTime(initialFromTime);
      setToTime(initialToTime);
      console.log('Initial FROM time:', initialFromTime);
      console.log('Initial TO time:', initialToTime);
    }
  }, []);

  // Auto-update TO time when FROM changes and current TO becomes invalid
  useEffect(() => {
    if (!fromTime) return;
    
    const validToHours = getToHours();
    
    // If toTime is not set yet, set it to the first valid option
    if (!toTime) {
      const newToTime = `${validToHours[0]}:00`;
      setToTime(newToTime);
      console.log('TO time auto-set to:', newToTime);
      return;
    }
    
    const currentToHour = toTime.split(":")[0];
    const currentToMinute = toTime.split(":")[1] || "00";
    
    // If current TO hour is not in the valid list, update it to the first valid hour
    if (!validToHours.includes(currentToHour)) {
      const newToTime = `${validToHours[0]}:${currentToMinute}`;
      setToTime(newToTime);
      console.log('TO time auto-adjusted to:', newToTime);
    }
  }, [fromTime]);

  const handleFromTimeChange = (hourPart: string, minutePart: string, whichPart: 'hour' | 'minute') => {
    let newHour = hourPart;
    let newMinute = minutePart;
    
    if (whichPart === 'hour') {
      newHour = hourPart;
      newMinute = fromTime ? fromTime.split(":")[1] : "00";
    } else {
      newHour = fromTime ? fromTime.split(":")[0] : "13";
      newMinute = minutePart;
    }
    
    const newFromTime = `${newHour}:${newMinute}`;
    setFromTime(newFromTime);
    console.log('FROM time changed to:', newFromTime);
  };

  const handleToTimeChange = (hourPart: string, minutePart: string, whichPart: 'hour' | 'minute') => {
    let newHour = hourPart;
    let newMinute = minutePart;
    
    if (whichPart === 'hour') {
      newHour = hourPart;
      newMinute = toTime ? toTime.split(":")[1] : "00";
    } else {
      newHour = toTime ? toTime.split(":")[0] : "15";
      newMinute = minutePart;
    }
    
    const newToTime = `${newHour}:${newMinute}`;
    setToTime(newToTime);
    console.log('TO time changed to:', newToTime);
  };

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const checkAvailability = async () => {
    if (!date || !fromTime || !toTime) {
      return;
    }

    // Simple validation: just check that TO time is allowed based on FROM time
    // The getToHours() function already handles what's valid, so if both are set, we're good
    if (fromTime === toTime) {
      return;
    }

    setIsLoading(true);
    setAvailabilityStatus('idle');

    try {
      const res = await fetch(`/api/reservations?date=${date}&from=${fromTime}&to=${toTime}`);
      const data = await res.json();

      console.log('API Response:', data);
      console.log('Query params:', { date, fromTime, toTime });

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch reservations');
      }

      // Update state based on availability
      const reservedSeatsCount = data.reservedSeats.length;
      setReservedCount(reservedSeatsCount);
      
      // Determine status based on reserved count
      if (reservedSeatsCount === 0) {
        setAvailabilityStatus('available');
      } else if (reservedSeatsCount >= TOTAL_SEATS) {
        setAvailabilityStatus('fully-reserved');
      } else {
        setAvailabilityStatus('partially-reserved');
      }

      // Dispatch event to Three.js to update bell/reserved visibility
      window.dispatchEvent(
        new CustomEvent("update-reservations", {
          detail: data.reservedSeats, // Array of seat IDs that are reserved
        })
      );

      console.log('Reserved seats:', data.reservedSeats);

    } catch (err) {
      console.error("Failed to fetch reservations", err);
      setAvailabilityStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  // Get button text based on status
  const getButtonText = () => {
    if (isLoading) return 'Checking...';
    
    switch (availabilityStatus) {
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

  // Get button color classes based on status
  const getButtonClasses = () => {
    const baseClasses = "mt-4 rounded-2xl py-3 text-sm font-semibold tracking-wide hover:scale-[1.03] active:scale-[0.97] transition disabled:opacity-50 disabled:cursor-not-allowed";
    
    switch (availabilityStatus) {
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
    <>
      {/* Arrow button to toggle visibility - Always visible on the right */}
      <button
        onClick={toggleVisibility}
        className={`fixed top-1/5 z-50 bg-black/30 backdrop-blur-sm border-2 border-white/10 rounded-2xl transition-all duration-300 hover:bg-black/50 flex items-center ${
          isVisible ? 'right-[13rem]' : 'right-0'
        }`}
        aria-label={isVisible ? "Hide panel" : "Show panel"}
        title={isVisible ? "Hide panel" : "Show panel"}
      >
        <div className="pl-3">
          {/* Calendar icon for reservations */}
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="text-white"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </div>
        <div className="p-2 pr-3">
          <div className="w-5 h-5 text-white">
            {isVisible ? <ChevronRight /> : <ChevronLeft />}
          </div>
        </div>
      </button>

      {/* FloatingPanel container with slide animation */}
      <div
        className={`fixed top-1/3 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out scale-75 ${
          isVisible ? '-right-6' : 'right-[-30rem]'
        }`}
      >
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
                  value={fromTime ? fromTime.split(":")[0] : "13"}
                  onChange={(e) => handleFromTimeChange(e.target.value, fromTime ? fromTime.split(":")[1] : "00", 'hour')}
                  className="appearance-none bg-transparent text-white text-sm outline-none"
                >
                  {allHours.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-white">:</span>
                <select
                  id="time-from-minute"
                  value={fromTime ? fromTime.split(":")[1] : "00"}
                  onChange={(e) => handleFromTimeChange(fromTime ? fromTime.split(":")[0] : "13", e.target.value, 'minute')}
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
                  value={toTime ? toTime.split(":")[0] : "15"}
                  onChange={(e) => handleToTimeChange(e.target.value, toTime ? toTime.split(":")[1] : "00", 'hour')}
                  className="appearance-none bg-transparent text-white text-sm outline-none"
                >
                  {getToHours().map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span className="text-white">:</span>
                <select
                  id="time-to-minute"
                  value={toTime ? toTime.split(":")[1] : "00"}
                  onChange={(e) => handleToTimeChange(toTime ? toTime.split(":")[0] : "15", e.target.value, 'minute')}
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
            disabled={isLoading || availabilityStatus === 'fully-reserved'}
            className={getButtonClasses()}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </>
  );
}