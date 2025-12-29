// src/app/reserve/page.tsx

'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ReservationLayout } from '@/components/reservation/ReservationLayout';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import { ReservationDetails } from '@/components/reservation/ReservationDetails';
import { PasscodeInput } from '@/components/reservation/PasscodeInput';
import { ContactForm } from '@/components/reservation/ContactForm';
import { AlertMessage } from '@/components/reservation/AlertMessage';
import { MenuSection } from '@/components/menu/MenuSection';
import { SuccessScreen } from '@/components/reservation/SuccessScreen';
import { downloadReservationPDF, getPDFBase64 } from '../../../utils/pdfGenerator';
import type { MenuItem } from '@/components/menu/types';

interface ReservationResponse {
  error?: string;
  message?: string;
  reservation?: {
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
  };
}

function ReservePageContent() {
  const searchParams = useSearchParams();
  
  const seatId = searchParams.get('seat_id');
  const date = searchParams.get('date');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationResponse['reservation'] | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuItems(data.items || []);
      } catch (err) {
        console.error('Failed to load menu:', err);
      }
    };
    
    fetchMenu();
  }, []);
  
  useEffect(() => {
    if (success && reservationData && menuItems.length > 0 && !emailSent) {
      const sendEmail = async () => {
        try {
          await generateAndSendEmail();
          setEmailSent(true);
        } catch (error) {
          console.error('Failed to send email:', error);
        }
      };
      
      sendEmail();
    }
  }, [success, reservationData, menuItems, emailSent]);
  
  if (!seatId || !date || !from || !to) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-4 text-red-400">Missing Information</h1>
          <p className="mb-4">Required reservation details are missing. Please go back and select a table with date and time.</p>
          <Link href="/" className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded">
            Back to Restaurant
          </Link>
        </div>
      </div>
    );
  }
  
  const incrementItem = (itemId: number) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };
  
  const decrementItem = (itemId: number) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] && newCart[itemId] > 0) {
        newCart[itemId] -= 1;
        if (newCart[itemId] === 0) {
          delete newCart[itemId];
        }
      }
      return newCart;
    });
  };
  
  const generateAndSendEmail = useCallback(async () => {
    if (!reservationData || menuItems.length === 0) return;
    
    try {
      const pdfBase64 = getPDFBase64(reservationData, menuItems);
      
      const emailPayload = {
        reservation: reservationData,
        pdfBase64,
      };
      
      await fetch('/api/reservations/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });
    } catch (error) {
      console.error('Email send error:', error);
    }
  }, [reservationData, menuItems]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (passcode.length !== 4) {
      setError('Passcode must be exactly 4 digits');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const menuItemsArray = Object.entries(cart).flatMap(([itemId, quantity]) => 
        Array(quantity).fill(Number(itemId))
      );
      
      const response = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          seat_id: seatId,
          date,
          time_from: from,
          time_to: to,
          name,
          email,
          phone,
          passcode,
          menu_items: menuItemsArray
        }),
      });
      
      const data = await response.json() as ReservationResponse;
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create reservation');
      }
      
      setReservationData(data.reservation || null);
      setSuccess(true);
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong');
      } else {
        setError('Something went wrong');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (success && reservationData) {
    return (
      <SuccessScreen
        reservation={reservationData}
        cart={cart}
        menuItems={menuItems}
        onDownloadPDF={() => downloadReservationPDF(reservationData, menuItems)}
        onResendEmail={generateAndSendEmail}
      />
    );
  }
  
  return (
    <ReservationLayout>
      <ReservationCard>
        <h1 className="text-2xl font-black mb-6">
          Reserve Table #{seatId}
        </h1>

        <ReservationDetails
          seatId={seatId}
          date={date}
          timeFrom={from}
          timeTo={to}
        />

        <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-[#CF8989]">
          <ContactForm
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
          />

          <PasscodeInput
            value={passcode}
            onChange={setPasscode}
            helpText="You'll need this passcode to manage your reservation"
          />

          <div className="pt-2 border-t border-[#CF8989]">
            <h2 className="text-xl font-black mb-2">
              Pre-order Menu (Optional)
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Select items now or order later at the table.
            </p>

            <MenuSection
              cart={cart}
              onIncrementItem={incrementItem}
              onDecrementItem={decrementItem}
            />
          </div>

          {error && <AlertMessage type="error" message={error} />}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#CF8989] hover:bg-[#F87070] disabled:opacity-60 text-white font-black py-3 rounded-full transition"
          >
            {isSubmitting ? "Processing…" : "Confirm Reservation"}
          </button>
        </form>

        <p className="mt-6 text-[11px] text-gray-400 text-center">
          Cancellations must be made at least 2 hours in advance.
        </p>
      </ReservationCard>
    </ReservationLayout>
  );
}

export default function ReservePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading reservation form...</p>
        </div>
      </div>
    }>
      <ReservePageContent />
    </Suspense>
  );
}