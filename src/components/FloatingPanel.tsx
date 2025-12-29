// src/components/FloatingPanel/index.tsx
'use client';

import { useState, useEffect } from "react";
import { getTodayDate, allHours } from '@/components/FloatingPanel/constants';
import { getToHours, parseTime } from '@/components/FloatingPanel/timeUtils';
import { useReservation } from '@/components/FloatingPanel/useReservation';
import { useTimeState } from '@/components/FloatingPanel/useTimeState';
import ToggleButton from '@/components/FloatingPanel/ToggleButton';
import DateInput from '@/components/FloatingPanel/DateInput';
import TimeSelector from '@/components/FloatingPanel/TimeSelector';
import AvailabilityButton from '@/components/FloatingPanel/AvailabilityButton';

export default function FloatingPanel() {
  const [date, setDate] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const {
    fromTime,
    toTime,
    handleFromTimeChange,
    handleToTimeChange,
  } = useTimeState();

  const {
    isLoading,
    availabilityStatus,
    reservedCount,
    checkAvailability,
    resetStatus,
  } = useReservation();

  // Reset status when inputs change
  useEffect(() => {
    resetStatus();
  }, [date, fromTime, toTime]);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const handleCheckAvailability = () => {
    checkAvailability(date, fromTime, toTime);
  };

  const fromTimeParts = parseTime(fromTime, "13", "00");
  const toTimeParts = parseTime(toTime, "15", "00");

  return (
    <>
      <ToggleButton isVisible={isVisible} onClick={toggleVisibility} />

      <div
        className={`fixed top-1/3 -translate-y-1/2 z-50 transition-all duration-300 ease-in-out scale-75 ${
          isVisible ? '-right-6' : 'right-[-30rem]'
        }`}
      >
        <div className="relative rounded-3xl bg-white/10 backdrop-blur-3xl shadow-[16px_-16px_30px_rgba(0,0,0,0.5)] border border-white/20 w-64 p-5 flex flex-col gap-5">
          <DateInput 
            value={date} 
            onChange={setDate} 
            minDate={getTodayDate()} 
          />

          <div className="grid grid-cols-2 gap-4">
            <TimeSelector
              label="From"
              id="time-from"
              hours={allHours}
              selectedHour={fromTimeParts.hour}
              selectedMinute={fromTimeParts.minute}
              onHourChange={(h) => handleFromTimeChange(h, fromTimeParts.minute)}
              onMinuteChange={(m) => handleFromTimeChange(fromTimeParts.hour, m)}
            />

            <TimeSelector
              label="To"
              id="time-to"
              hours={getToHours(fromTime)}
              selectedHour={toTimeParts.hour}
              selectedMinute={toTimeParts.minute}
              onHourChange={(h) => handleToTimeChange(h, toTimeParts.minute)}
              onMinuteChange={(m) => handleToTimeChange(toTimeParts.hour, m)}
            />
          </div>

          <AvailabilityButton
            status={availabilityStatus}
            isLoading={isLoading}
            reservedCount={reservedCount}
            onClick={handleCheckAvailability}
          />
        </div>
      </div>
    </>
  );
}