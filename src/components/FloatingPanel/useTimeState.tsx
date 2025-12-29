// src/components/FloatingPanel/useTimeState.ts
import { useState, useEffect } from 'react';
import { getToHours, buildTimeString, parseTime } from './timeUtils';

export const useTimeState = () => {
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  // Initialize times
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

  // Auto-update TO time when FROM changes
  useEffect(() => {
    if (!fromTime) return;
    
    const validToHours = getToHours(fromTime);
    
    if (!toTime) {
      const newToTime = `${validToHours[0]}:00`;
      setToTime(newToTime);
      console.log('TO time auto-set to:', newToTime);
      return;
    }
    
    const { hour: currentToHour, minute: currentToMinute } = parseTime(toTime);
    
    if (!validToHours.includes(currentToHour)) {
      const newToTime = `${validToHours[0]}:${currentToMinute}`;
      setToTime(newToTime);
      console.log('TO time auto-adjusted to:', newToTime);
    }
  }, [fromTime]);

  const handleFromTimeChange = (hour: string, minute: string) => {
    const newFromTime = buildTimeString(hour, minute);
    setFromTime(newFromTime);
    console.log('FROM time changed to:', newFromTime);
  };

  const handleToTimeChange = (hour: string, minute: string) => {
    const newToTime = buildTimeString(hour, minute);
    setToTime(newToTime);
    console.log('TO time changed to:', newToTime);
  };

  return {
    fromTime,
    toTime,
    handleFromTimeChange,
    handleToTimeChange,
  };
};