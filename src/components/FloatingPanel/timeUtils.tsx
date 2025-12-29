// src/components/FloatingPanel/timeUtils.tsx
import { allHours } from './constants';

export const getToHours = (fromTime: string): string[] => {
  if (!fromTime) return allHours;
  
  const [fromHour] = fromTime.split(":").map(Number);
  
  // If from hour is 13-22, to hour must be greater (including 23, 00, 01, 02)
  if (fromHour >= 13 && fromHour <= 22) {
    return allHours.filter(h => {
      const hour = Number(h);
      return hour > fromHour || hour <= 2;
    });
  }
  
  // If from hour is 23, 00, 01, only allow later early morning hours
  if (fromHour === 23) return ["00", "01", "02"];
  if (fromHour === 0) return ["01", "02"];
  if (fromHour === 1) return ["02"];
  
  return allHours;
};

export const buildTimeString = (hour: string, minute: string): string => {
  return `${hour}:${minute}`;
};

export const parseTime = (time: string, defaultHour: string = "13", defaultMinute: string = "00") => {
  if (!time) return { hour: defaultHour, minute: defaultMinute };
  const [hour, minute] = time.split(":");
  return { hour: hour || defaultHour, minute: minute || defaultMinute };
};