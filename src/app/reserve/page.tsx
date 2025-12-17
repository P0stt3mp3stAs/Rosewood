// src/app/reserve/page.tsx

'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
  };
}

function ReservePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get reservation details from URL
  const seatId = searchParams.get('seat_id');
  const date = searchParams.get('date');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Validate required parameters
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
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
          menu_items: [] // Empty array as requested
        }),
      });
      
      const data = await response.json() as ReservationResponse;
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create reservation');
      }
      
      setSuccess(true);
      
      // Redirect back to restaurant after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
      
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
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time for display (assuming HH:MM format)
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };
  
  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg text-center">
          <div className="text-green-400 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">Reservation Confirmed!</h1>
          <p className="mb-2">Your table has been successfully reserved.</p>
          <p className="mb-6 text-gray-400">You will be redirected back to the restaurant in a few seconds...</p>
          <Link href="/" className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded">
            Return to Restaurant
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <Link href="/" className="inline-flex items-center text-rose-400 hover:text-rose-300 mb-6">
          ← Back to Restaurant
        </Link>
        
        <div className="bg-gray-800 rounded-lg p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-2">Reserve Table {seatId}</h1>
          
          {/* Reservation Summary */}
          <div className="mb-6 p-4 bg-gray-700 rounded">
            <h2 className="font-semibold mb-2">Reservation Details</h2>
            <div className="space-y-1 text-sm text-gray-300">
              <p><span className="text-gray-400">Date:</span> {formatDate(date)}</p>
              <p><span className="text-gray-400">Time:</span> {formatTime(from)} - {formatTime(to)}</p>
              <p><span className="text-gray-400">Table:</span> #{seatId}</p>
            </div>
          </div>
          
          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="email@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="(000) 000-00-0000"
              />
            </div>
            
            {/* Menu Items (future feature) */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Menu selection will be available at the table. Our staff will assist you with orders.
              </p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-200">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded transition-colors"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </form>
          
          <p className="mt-6 text-xs text-gray-400 text-center">
            By confirming, you agree to our reservation policy. Cancellations must be made at least 2 hours in advance.
          </p>
        </div>
      </div>
    </div>
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