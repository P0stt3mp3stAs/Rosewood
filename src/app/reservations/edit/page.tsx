// src/app/reservations/edit/page.tsx

"use client";

import { useState, useEffect } from "react";
import { ReservationLayout } from '@/components/reservation/ReservationLayout';
import { ReservationCard } from '@/components/reservation/ReservationCard';
import { ReservationDetails } from '@/components/reservation/ReservationDetails';
import { PasscodeInput } from '@/components/reservation/PasscodeInput';
import { ContactForm } from '@/components/reservation/ContactForm';
import { AlertMessage } from '@/components/reservation/AlertMessage';
import { MenuSection } from '@/components/menu/MenuSection';
import { SuccessScreen } from '@/components/reservation/SuccessScreen';
import { CancelledScreen } from '@/components/reservation/CancelledScreen';
import { CancelModal } from '@/components/reservation/CancelModal';
import { downloadReservationPDF } from '../../../../utils/pdfGenerator';
import type { MenuItem } from '@/components/menu/types';

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

interface UpdateData {
  name: string;
  email: string;
  phone: string;
  passcode?: string;
  menu_items: number[];
}

export default function EditReservationPage() {
  const [step, setStep] = useState<"search" | "edit" | "success" | "cancelled">("search");
  const [id, setId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<Record<number, number>>({});
  const [updatedReservation, setUpdatedReservation] = useState<ReservationData | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (reservation?.menu_items) {
      const initialCart: Record<number, number> = {};
      reservation.menu_items.forEach(itemId => {
        initialCart[itemId] = (initialCart[itemId] || 0) + 1;
      });
      setCart(initialCart);
    }
  }, [reservation]);

  const fetchMenu = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      setMenuItems(data.items || []);
    } catch {
      setError('Failed to load menu items');
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/edit-reservation/${id}?passcode=${passcode}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 410) {
          setReservation({
            id: data.reservation?.id || id,
            seat_id: data.reservation?.seat_id || "",
            date: data.reservation?.date || "",
            time_from: data.reservation?.time_from || "",
            time_to: data.reservation?.time_to || "",
            name: data.reservation?.name || "",
            email: data.reservation?.email || "",
            phone: data.reservation?.phone || "",
            passcode: data.reservation?.passcode || "",
            is_active: false,
            menu_items: data.reservation?.menu_items || []
          });
          setStep("cancelled");
          return;
        }
        throw new Error(data.error || data.message || "Failed to find reservation");
      }

      setReservation(data.reservation);
      setName(data.reservation.name);
      setEmail(data.reservation.email);
      setPhone(data.reservation.phone);
      setNewPasscode(data.reservation.passcode);
      setStep("edit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error searching");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const updates: UpdateData = { name, email, phone, menu_items: [] };
      if (newPasscode && newPasscode !== reservation?.passcode) {
        updates.passcode = newPasscode;
      }

      updates.menu_items = Object.entries(cart).flatMap(([itemId, quantity]) => 
        Array(quantity).fill(Number(itemId))
      );

      const res = await fetch(`/api/edit-reservation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, updates }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      setUpdatedReservation(data.reservation);
      setReservation(data.reservation);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    setCancelling(true);
    setError("");

    try {
      const res = await fetch(`/api/edit-reservation/${id}?passcode=${passcode}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cancellation failed");

      setReservation(data.reservation);
      setShowCancelModal(false);
      setStep("cancelled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancellation failed");
      setShowCancelModal(false);
    } finally {
      setCancelling(false);
    }
  };

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
        if (newCart[itemId] === 0) delete newCart[itemId];
      }
      return newCart;
    });
  };

  if (step === "cancelled" && reservation) {
    return <CancelledScreen reservation={reservation} />;
  }

  if (step === "search") {
    return (
      <ReservationLayout>
        <ReservationCard className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2">Find Your Reservation</h1>
            <p className="text-gray-600">Enter your reservation details to make changes</p>
          </div>

          {error && <AlertMessage type="error" message={error} />}

          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">Reservation ID</label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#CF8989] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                placeholder="Enter reservation ID"
                required
              />
            </div>

            <PasscodeInput
              value={passcode}
              onChange={setPasscode}
              helpText="Enter the 4-digit code you received when making the reservation"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CF8989] hover:bg-[#F87070] disabled:opacity-60 text-white font-black py-3 rounded-full transition"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                "Find Reservation"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#CF8989]">
            <p className="text-sm text-gray-500 text-center">
              Don't have your passcode?{" "}
              <a
                href="mailto:ghaliwali@gmail.com"
                className="text-[#CF8989] hover:text-[#F87070] underline font-medium"
              >
                Contact support
              </a>
            </p>
          </div>
        </ReservationCard>
      </ReservationLayout>
    );
  }

  if (step === "success" && updatedReservation) {
    return (
      <SuccessScreen
        reservation={updatedReservation}
        cart={cart}
        menuItems={menuItems}
        onDownloadPDF={() => downloadReservationPDF(updatedReservation, menuItems, true)}
        isUpdate={true}
        onMakeMoreChanges={() => setStep("edit")}
      />
    );
  }

  return (
    <ReservationLayout backHref="#" backText="Back to Search">
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelReservation}
        reservation={reservation}
        error={error}
        isLoading={cancelling}
      />

      <ReservationCard>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black mb-1">Edit Reservation</h1>
            <p className="text-gray-600">Update your reservation details</p>
          </div>
          <div className="px-4 py-2 bg-white/50 rounded-2xl">
            <span className="text-sm font-bold text-[#630620]">
              Reservation #{reservation?.id}
            </span>
          </div>
        </div>

        {reservation && (
          <ReservationDetails
            seatId={reservation.seat_id}
            date={reservation.date}
            timeFrom={reservation.time_from}
            timeTo={reservation.time_to}
          />
        )}

        {error && <AlertMessage type="error" message={error} />}

        <form onSubmit={handleUpdate} className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-xl font-black">Personal Information</h2>
            
            <ContactForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              phone={phone}
              setPhone={setPhone}
            />

            <PasscodeInput
              value={newPasscode}
              onChange={setNewPasscode}
              label="New Passcode (optional)"
              placeholder="Leave empty to keep current"
              helpText="Change your 4-digit reservation passcode"
              required={false}
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-black">Pre-order Menu Items</h2>
            <MenuSection
              cart={cart}
              onIncrementItem={incrementItem}
              onDecrementItem={decrementItem}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#CF8989]">
            <button
              type="button"
              onClick={() => setStep("search")}
              className="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-2xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#CF8989] hover:bg-[#F87070] disabled:opacity-60 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg"
            >
              {loading ? "Saving Changes..." : "✓ Update Reservation"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#CF8989]">
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            className="w-full px-6 py-3 bg-white hover:bg-gray-100 border border-red-300 hover:border-red-400 text-red-500 hover:text-red-600 font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <span>✕</span>
            Cancel This Reservation
          </button>
        </div>
      </ReservationCard>
    </ReservationLayout>
  );
}