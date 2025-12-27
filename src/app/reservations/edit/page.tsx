"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

interface MenuItem {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
}

interface MenuResponse {
  success: boolean;
  items: MenuItem[];
  grouped: Record<string, MenuItem[]>;
  categories: string[];
}

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
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
      setLoadingMenu(true);
      const response = await fetch('/api/menu');
      const data = await response.json();
      setMenuData(data);
    } catch {
      setError('Failed to load menu items');
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  setLoading(true);

  try {
    const res = await fetch(`/api/edit-reservation/${id}?passcode=${passcode}`);
    const data = await res.json();

    if (!res.ok) {
      // ✅ NEW: Check if reservation is cancelled
      if (res.status === 410) {
        // Show cancelled reservation page
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
    setSuccess("");
    setLoading(true);

    try {
      const updates: UpdateData = { name, email, phone, menu_items: [] };
      if (newPasscode && newPasscode !== reservation?.passcode) updates.passcode = newPasscode;

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
      setSuccess("✅ Reservation updated successfully!");
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

  const generatePDF = () => {
    if (!updatedReservation || !menuData) {
      setError("Cannot generate PDF: Missing reservation or menu data");
      return;
    }

    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Updated Reservation Confirmation', 105, 20, { align: 'center' });
      
      doc.setDrawColor(220, 38, 38);
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Reservation Details', 20, 35);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      let yPos = 45;
      
      const details = [
        ['Reservation ID:', String(updatedReservation.id)],
        ['Table Number:', `#${updatedReservation.seat_id}`],
        ['Date:', formatDate(updatedReservation.date)],
        ['Time:', `${formatTime(updatedReservation.time_from)} - ${formatTime(updatedReservation.time_to)}`],
        ['Status:', 'Updated'],
        ['Last Updated:', new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })]
      ];
      
      details.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(String(label), 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 70, yPos);
        yPos += 7;
      });
      
      yPos += 5;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Customer Information', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      const customerInfo = [
        ['Name:', String(updatedReservation.name)],
        ['Email:', String(updatedReservation.email)],
        ['Phone:', String(updatedReservation.phone)]
      ];
      
      customerInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(String(label), 20, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(String(value), 70, yPos);
        yPos += 7;
      });
      
      yPos += 5;
      doc.setFillColor(254, 226, 226);
      doc.rect(18, yPos - 6, 174, 12, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('Reservation Passcode:', 20, yPos);
      doc.setFontSize(16);
      doc.setTextColor(220, 38, 38);
      doc.text(String(updatedReservation.passcode), 80, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 15;
      
      if (updatedReservation.menu_items && updatedReservation.menu_items.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Pre-Ordered Items', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        
        const itemCounts: Record<number, number> = {};
        updatedReservation.menu_items.forEach(itemId => {
          itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
        });
        
        let subtotal = 0;
        
        Object.entries(itemCounts).forEach(([itemId, quantity]) => {
          const item = menuData.items.find(i => i.id === Number(itemId));
          if (item) {
            const itemTotal = item.price * quantity;
            subtotal += itemTotal;
            
            doc.setFont('helvetica', 'normal');
            doc.text(`${quantity}x ${item.name}`, 25, yPos);
            doc.text(`$${itemTotal.toFixed(2)}`, 170, yPos, { align: 'right' });
            yPos += 6;
          }
        });
        
        yPos += 3;
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, 190, yPos);
        yPos += 7;
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Total:', 25, yPos);
        doc.setTextColor(220, 38, 38);
        doc.text(`$${subtotal.toFixed(2)}`, 170, yPos, { align: 'right' });
        doc.setTextColor(0, 0, 0);
      } else {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.text('No items pre-ordered', 20, yPos);
      }
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const footerY = 280;
      doc.text('Thank you for updating your reservation!', 105, footerY, { align: 'center' });
      doc.text('Please arrive 10 minutes before your reservation time.', 105, footerY + 5, { align: 'center' });
      doc.text('Changes must be made at least 2 hours in advance.', 105, footerY + 10, { align: 'center' });
      
      doc.save(`Updated-Reservation-${updatedReservation.id}.pdf`);
    } catch (error) {
      setError('Failed to generate PDF');
      console.error('PDF generation error:', error);
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

  const getItemQuantity = (itemId: number): number => cart[itemId] || 0;
  const getTotalItems = () => Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const calculateTotal = () => {
    if (!menuData) return 0;
    return Object.entries(cart).reduce((sum, [itemId, quantity]) => {
      const item = menuData.items.find(i => i.id === Number(itemId));
      return sum + (item?.price || 0) * quantity;
    }, 0);
  };

  const formatCategoryName = (category: string) => 
    category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) setPasscode(value);
  };

  const handleNewPasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) setNewPasscode(value);
  };

  if (step === "cancelled") {
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
                <p className="font-black text-white">{reservation?.id}</p>
              </div>
              <div>
                <p className="text-xs text-white mb-1">Status</p>
                <p className="font-black text-white">Cancelled</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-white mb-1">Date & Time</p>
                <p className="font-bold text-white">
                  {formatDate(reservation?.date || '')} at {formatTime(reservation?.time_from || '')}
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

  if (step === "search") {
    return (
      <div className="min-h-screen bg-white text-black p-4 md:p-8 relative">
        <div 
          className="fixed inset-0 pointer-events-none opacity-30 z-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/wood.svg)',
            backgroundSize: '200%'
          }}
        />
        <div className="max-w-md mx-auto relative z-10">
          <Link
            href="/"
            className="inline-flex items-center text-[#630620] hover:text-[#F87070] mb-6 font-semibold"
          >
            ← Back to Restaurant
          </Link>

          <div className="bg-[#D17272]/20 rounded-4xl p-6 md:p-8 border-5 border-[#630620]/70">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black mb-2">
                Find Your Reservation
              </h1>
              <p className="text-gray-600">
                Enter your reservation details to make changes
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#CF8989] rounded-xl text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Reservation ID</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-[#CF8989] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="Enter reservation ID"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">4-digit Passcode</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={passcode}
                      onChange={handlePasscodeChange}
                      className="w-full pl-10 pr-4 py-3 bg-[#CF8989] rounded-full text-center text-2xl tracking-widest font-black focus:ring-2 focus:ring-rose-500 outline-none"
                      placeholder="••••"
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 ml-3 leading-tight">
                    Enter the 4-digit code you received when making the reservation
                  </p>
                </div>
              </div>

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
                  <div className="flex items-center justify-center gap-2">
                    <span>Find Reservation</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#CF8989]">
              <p className="text-sm text-gray-500 text-center">
                Don't have your passcode?{" "}
                <button className="text-[#CF8989] hover:text-[#F87070] underline font-medium">
                  Contact support
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
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
          <h1 className="text-3xl text-white font-black mb-4">Reservation Updated!</h1>
          <p className="text-black mb-6">Your reservation has been successfully updated</p>
          
          <div className="my-6 p-4 bg-[#D17272] rounded-3xl">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-xs text-white mb-1">Reservation ID</p>
                <p className="font-black text-white">{updatedReservation?.id}</p>
              </div>
              <div>
                <p className="text-xs text-white mb-1">Table</p>
                <p className="font-black text-white">#{updatedReservation?.seat_id}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-white mb-1">Date & Time</p>
                <p className="font-bold text-white">
                  {formatDate(updatedReservation?.date || '')} at {formatTime(updatedReservation?.time_from || '')}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-white mb-1">Passcode</p>
                <p className="font-black text-white text-2xl tracking-widest">{updatedReservation?.passcode}</p>
              </div>
            </div>
          </div>

          {getTotalItems() > 0 && (
            <div className="bg-white/20 rounded-3xl p-4 mb-6">
              <h3 className="font-black text-white mb-3">Order Summary</h3>
              <div className="space-y-2">
                {Object.entries(cart).map(([itemId, quantity]) => {
                  const item = menuData?.items.find(i => i.id === Number(itemId));
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
              onClick={generatePDF}
              className="w-full bg-[#6AC354] hover:bg-[#62A052] text-white px-6 py-3 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-3"
            >
              <span>📄</span>
              Download Updated Confirmation PDF
            </button>

            <button
              onClick={() => setStep("edit")}
              className="w-full bg-white hover:bg-gray-100 text-[#630620] px-6 py-3 rounded-2xl font-semibold transition-colors"
            >
              Make More Changes
            </button>

            <Link
              href="/"
              className="block w-full bg-[#D64E4E] hover:bg-[#D17272] text-white px-6 py-3 rounded-2xl font-semibold transition-colors"
            >
              Return to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-white/30">
            <p className="text-sm text-white/80 text-center">
              Need help? Contact us at{" "}
              <a
                href={`mailto:ghaliwali@gmail.com?subject=${encodeURIComponent('Help with Reservation #' + updatedReservation?.id)}`}
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

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 relative">
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 z-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/wood.svg)',
          backgroundSize: '200%'
        }}
      />
      
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
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
                  <span className="font-bold">{reservation?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-bold">{formatDate(reservation?.date || '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time:</span>
                  <span className="font-bold">{formatTime(reservation?.time_from || '')}</span>
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
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
                className="flex-1 px-4 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-2xl transition-all disabled:opacity-50"
              >
                Keep Reservation
              </button>
              <button
                onClick={handleCancelReservation}
                disabled={cancelling}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
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
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        <button
          onClick={() => setStep("search")}
          className="inline-flex items-center text-[#630620] hover:text-[#F87070] mb-6 font-semibold"
        >
          ← Back to Search
        </button>

        <div className="bg-[#D17272]/20 rounded-4xl p-6 md:p-8 border-5 border-[#630620]/70">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black mb-1">
                Edit Reservation
              </h1>
              <p className="text-gray-600">Update your reservation details</p>
            </div>
            <div className="px-4 py-2 bg-white/50 rounded-2xl">
              <span className="text-sm font-bold text-[#630620]">Reservation #{reservation?.id}</span>
            </div>
          </div>

          {reservation && (
            <div className="mb-8 p-5 bg-[#CF8989] rounded-3xl text-center max-w-md mx-auto">
              <h2 className="font-black text-xl mb-3">
                Reservation Details
              </h2>

              <div className="space-y-1 text-sm font-bold">
                <p>
                  <span className="font-thin">Date:</span>{" "}
                  {formatDate(reservation.date)}
                </p>
                <p>
                  <span className="font-thin">Time:</span>{" "}
                  {formatTime(reservation.time_from)} – {formatTime(reservation.time_to)}
                </p>
                <p>
                  <span className="font-thin">Table:</span> #{reservation.seat_id}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#CF8989] rounded-xl text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black">
                  Personal Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#CF8989] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-[#CF8989] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-[#CF8989] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">New Passcode (optional)</label>
                  <input
                    type="text"
                    value={newPasscode}
                    onChange={handleNewPasscodeChange}
                    className="w-full px-4 py-3 bg-[#CF8989] rounded-full text-center text-xl tracking-widest font-black focus:ring-2 focus:ring-rose-500 outline-none"
                    placeholder="Leave empty to keep current"
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-3 leading-tight">
                    Change your 4-digit reservation passcode
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black">
                    Pre-order Menu Items
                  </h2>
                </div>
                {getTotalItems() > 0 && (
                  <span className="px-3 py-1 bg-[#CF8989] text-white text-sm font-bold rounded-full">
                    {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {loadingMenu ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CF8989] mx-auto"></div>
                  <p className="text-gray-500 mt-4 text-sm">Loading menu...</p>
                </div>
              ) : menuData ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {menuData.categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          selectedCategory === category
                            ? "bg-[#CF8989] text-white"
                            : "bg-rose-100 text-[#CF8989] hover:bg-rose-200"
                        }`}
                      >
                        {formatCategoryName(category)}
                      </button>
                    ))}
                  </div>

                  {selectedCategory && menuData.grouped[selectedCategory] && (
                    <div className="bg-[#CF8989]/20 rounded-3xl p-4">
                      <h3 className="font-bold text-lg mb-4">{formatCategoryName(selectedCategory)}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuData.grouped[selectedCategory].map((item) => {
                          const quantity = getItemQuantity(item.id);
                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-2xl border transition-all ${
                                quantity > 0
                                  ? 'bg-white border-[#CF8989]'
                                  : 'bg-white/50 border-rose-200 hover:border-rose-300'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold">{item.name}</h4>
                                    <span className="text-[#CF8989] font-bold">${item.price.toFixed(2)}</span>
                                  </div>
                                  <p className="text-sm text-gray-500 mb-3">{item.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => decrementItem(item.id)}
                                    disabled={quantity === 0}
                                    className={`w-8 h-8 rounded-full font-bold transition-all ${
                                      quantity === 0
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-rose-100 text-[#CF8989] hover:bg-rose-200'
                                    }`}
                                  >−</button>
                                  
                                  <span className="w-8 text-center font-bold text-lg">{quantity}</span>
                                  
                                  <button
                                    type="button"
                                    onClick={() => incrementItem(item.id)}
                                    className="w-8 h-8 rounded-full bg-[#CF8989] hover:bg-[#F87070] flex items-center justify-center text-white font-bold transition-all"
                                  >+</button>
                                </div>
                                
                                {quantity > 0 && (
                                  <span className="text-[#CF8989] font-bold">${(item.price * quantity).toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {getTotalItems() > 0 && (
                    <div className="bg-white rounded-3xl p-6 border border-rose-200">
                      <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                      <div className="space-y-4">
                        {Object.entries(cart).map(([itemId, quantity]) => {
                          const item = menuData.items.find(i => i.id === Number(itemId));
                          return item ? (
                            <div key={itemId} className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{quantity}x {item.name}</span>
                                <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                              </div>
                              <span className="text-[#CF8989] font-bold">${(item.price * quantity).toFixed(2)}</span>
                            </div>
                          ) : null;
                        })}
                        
                        <div className="pt-4 mt-4 border-t border-gray-300">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="font-bold text-lg">Total</span>
                              <p className="text-sm text-gray-500">{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}</p>
                            </div>
                            <span className="text-2xl font-black text-[#CF8989]">${calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-gray-400 text-4xl">🍽️</span>
                  <p className="text-gray-500 mt-4">Menu temporarily unavailable</p>
                </div>
              )}
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
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>✓</span>
                    <span>Update Reservation</span>
                  </div>
                )}
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

          <div className="mt-8 pt-6 border-t border-[#CF8989]">
            <p className="text-sm text-gray-500 text-center">
              Need help? reach us at{" "}
              <a
                href={`mailto:ghaliwali@gmail.com?subject=${encodeURIComponent('Help with Reservation #' + id)}`}
                className="text-[#CF8989] hover:text-[#F87070] font-medium underline hover:no-underline"
              >
                ghaliwali@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}