// src/components/reservation/CancelModal.tsx
import { formatDate, formatTime } from '../../../utils/pdfGenerator';

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

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservation: ReservationData | null;
  error?: string;
  isLoading: boolean;
}

export function CancelModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  reservation, 
  error, 
  isLoading 
}: CancelModalProps) {
  if (!isOpen || !reservation) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-300 rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black mb-2">Cancel Reservation?</h3>
          <p className="text-gray-600">
            Are you sure you want to cancel this reservation? This action cannot be undone.
          </p>
        </div>

        <div className="bg-gray-100 rounded-2xl p-4 mb-6">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Reservation ID:</span>
              <span className="font-bold">{reservation.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-bold">{formatDate(reservation.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-bold">{formatTime(reservation.time_from)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-2xl transition-all disabled:opacity-50"
          >
            Keep Reservation
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Cancelling...
              </>
            ) : (
              'Yes, Cancel'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}