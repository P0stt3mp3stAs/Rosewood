// src/components/reservation/SuccessScreen.tsx
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

export function SuccessScreen({ 
  reservation, 
  cart, 
  menuItems, 
  onDownloadPDF,
  onResendEmail,
  isUpdate = false,
  onMakeMoreChanges
}: SuccessScreenProps) {
  const getTotalItems = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const calculateTotal = () => {
    return Object.entries(cart).reduce((sum, [itemId, quantity]) => {
      const item = menuItems.find(i => i.id === Number(itemId));
      return sum + (item?.price || 0) * quantity;
    }, 0);
  };

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
          <span className="text-[#6AC354] text-4xl">✓</span>
        </div>
        
        <h1 className="text-3xl text-white font-black mb-4">
          {isUpdate ? 'Reservation Updated!' : 'Reservation Confirmed!'}
        </h1>
        <p className="text-black mb-6">
          Your reservation has been successfully {isUpdate ? 'updated' : 'reserved'}
        </p>
        
        <div className="my-6 p-4 bg-[#D17272] rounded-3xl">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-xs text-white mb-1">Reservation ID</p>
              <p className="font-black text-white">{reservation.id}</p>
            </div>
            <div>
              <p className="text-xs text-white mb-1">Table</p>
              <p className="font-black text-white">#{reservation.seat_id}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-white mb-1">Date & Time</p>
              <p className="font-bold text-white">
                {formatDate(reservation.date)} at {formatTime(reservation.time_from)}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-white mb-1">Passcode</p>
              <p className="font-black text-white text-2xl tracking-widest">{reservation.passcode}</p>
            </div>
          </div>
        </div>

        {getTotalItems() > 0 && (
          <div className="bg-white/20 rounded-3xl p-4 mb-6">
            <h3 className="font-black text-white mb-3">Order Summary</h3>
            <div className="space-y-2">
              {Object.entries(cart).map(([itemId, quantity]) => {
                const item = menuItems.find(i => i.id === Number(itemId));
                return item ? (
                  <div key={itemId} className="flex justify-between text-sm">
                    <span className="text-white">{quantity}x {item.name}</span>
                    <span className="font-bold text-white">${(item.price * quantity).toFixed(2)}</span>
                  </div>
                ) : null;
              })}
              <div className="pt-2 mt-2 border-t border-white/30">
                <div className="flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-xl font-black text-white">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={onDownloadPDF}
            className="w-full bg-[#6AC354] hover:bg-[#62A052] text-white px-6 py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-3"
          >
            <span>📄</span>
            Download {isUpdate ? 'Updated ' : ''}Confirmation PDF
          </button>

          {onResendEmail && !isUpdate && (
            <button
              onClick={onResendEmail}
              className="w-full bg-[#3961A3] hover:bg-[#244A89] text-white px-6 py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-3"
            >
              <span>📧</span>
              Send PDF to Email Again
            </button>
          )}

          {isUpdate && onMakeMoreChanges && (
            <button
              onClick={onMakeMoreChanges}
              className="w-full bg-white hover:bg-gray-100 text-[#630620] px-6 py-3 rounded-2xl font-semibold transition-colors"
            >
              Make More Changes
            </button>
          )}

          <Link
            href="/"
            className="block w-full bg-[#D64E4E] hover:bg-[#D17272] text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
          >
            {isUpdate ? 'Return to Home' : 'Return to Restaurant'}
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/30">
          <p className="text-sm text-white/80 text-center">
            Need help? Contact us at{" "}
            <a
              href={`mailto:ghaliwali@gmail.com?subject=${encodeURIComponent('Help with Reservation #' + reservation.id)}`}
              className="text-white hover:text-gray-200 font-medium underline hover:no-underline"
            >
              ghaliwali@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}