// src/components/FloatingPanel/constants.tsx

export const TOTAL_SEATS = 17;

export const allHours = [
  "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00", "01", "02"
];

export const minutes = Array.from({ length: 60 }, (_, i) => 
  String(i).padStart(2, "0")
);

export const getTodayDate = () => new Date().toISOString().split('T')[0];