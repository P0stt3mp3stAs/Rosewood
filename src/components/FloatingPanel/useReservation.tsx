// src/components/FloatingPanel/useReservation.ts
import { useState } from 'react';
import { TOTAL_SEATS } from './constants';
import type { AvailabilityStatus } from './AvailabilityButton';

export const useReservation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('idle');
  const [reservedCount, setReservedCount] = useState(0);

  const checkAvailability = async (date: string, fromTime: string, toTime: string) => {
    if (!date || !fromTime || !toTime || fromTime === toTime) {
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

      const reservedSeatsCount = data.reservedSeats.length;
      setReservedCount(reservedSeatsCount);
      
      // Determine status
      if (reservedSeatsCount === 0) {
        setAvailabilityStatus('available');
      } else if (reservedSeatsCount >= TOTAL_SEATS) {
        setAvailabilityStatus('fully-reserved');
      } else {
        setAvailabilityStatus('partially-reserved');
      }

      // Dispatch event to Three.js
      window.dispatchEvent(
        new CustomEvent("update-reservations", {
          detail: data.reservedSeats,
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

  const resetStatus = () => {
    setAvailabilityStatus('idle');
  };

  return {
    isLoading,
    availabilityStatus,
    reservedCount,
    checkAvailability,
    resetStatus,
  };
};