// src/components/reservation/CancelledScreen.tsx
import Link from 'next/link';
import type { MenuItem } from '@/components/menu/types';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

interface ReservationData {
  id: string;
  seat_id: string;
  date: string;
  time_from: string;
  time_to: string;
  name: string;
  email: string;
  phone: string;
  passcode: string;
  is_active: boolean;
  menu_items: number[];
}

interface SuccessScreenProps {
  reservation: ReservationData;
  cart: Record<number, number>;
  menuItems: MenuItem[];
  onDownloadPDF: () => void;
  onResendEmail?: () => void;
  isUpdate?: boolean;
  onMakeMoreChanges?: () => void;
}

interface CancelledScreenProps {
  reservation: ReservationData;
}

export function CancelledScreen({ reservation }: CancelledScreenProps) {
  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 relative flex items-center justify-center">
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 z-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/wood.svg)',
          backgroundSize: '200%'
        }}
      />
      <div className="max-w-md mx-auto bg-[#630620]/70 p-8 rounded-3xl text-center relative z-10">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-[#D64E4E] text-4xl">✕</span>
        </div>
        <h1 className="text-3xl text-white font-black mb-4">Reservation Cancelled</h1>
        <p className="text-black mb-6">Your reservation has been successfully cancelled</p>
        
        <div className="my-6 p-4 bg-[#D17272] rounded-3xl">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-xs text-white mb-1">Reservation ID</p>
              <p className="font-black text-white">{reservation.id}</p>
            </div>
            <div>
              <p className="text-xs text-white mb-1">Status</p>
              <p className="font-black text-white">Cancelled</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-white mb-1">Date & Time</p>
              <p className="font-bold text-white">
                {formatDate(reservation.date)} at {formatTime(reservation.time_from)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/20 rounded-3xl p-4 mb-6">
          <div className="flex gap-3">
            <div>
              <p className="text-white font-semibold">Cancellation Confirmed</p>
              <p className="text-white/80 text-sm mt-1">
                Your table has been released and is now available for other guests.
              </p>
            </div>
          </div>
        </div>

        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}
          className="block w-full bg-[#D64E4E] hover:bg-[#D17272] text-white px-6 py-3 rounded-2xl font-semibold transition-colors cursor-pointer"
        >
          Try Another
        </Link>
      </div>
    </div>
  );
}