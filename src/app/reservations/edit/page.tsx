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

      if (!res.ok) throw new Error(data.error || "Failed to find reservation");

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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 mb-8 transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Restaurant
          </Link>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-orange-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">Reservation Cancelled</h1>
              <p className="text-gray-400 mt-2">Your reservation has been successfully cancelled</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Reservation ID</p>
                    <p className="font-bold text-lg text-white">{reservation?.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="font-bold text-lg text-orange-400">Cancelled</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Original Date & Time</p>
                    <p className="font-medium text-white">
                      {formatDate(reservation?.date || '')} at {formatTime(reservation?.time_from || '')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-900/20 border border-orange-700/50 rounded-xl p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-orange-300 font-medium">Cancellation Confirmed</p>
                    <p className="text-orange-300/80 text-sm mt-1">
                      Your table has been released and is now available for other guests. You're welcome to make a new reservation at any time available.
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href="/"
                className="block w-full text-center bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02]"
              >
                Return to Home
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-500 text-center">
                Need to make a new reservation?{" "}
                <Link href="/" className="text-rose-400 hover:text-rose-300 underline">Book now</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "search") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 mb-8 transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Restaurant
          </Link>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-rose-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">Find Your Reservation</h1>
              <p className="text-gray-400 mt-2">Enter your reservation details to make changes</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
                <div className="flex items-center gap-2 text-red-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Reservation ID</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                    <input
                      type="text"
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                      placeholder="Enter reservation ID"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">4-digit Passcode</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <input
                      type="text"
                      value={passcode}
                      onChange={handlePasscodeChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-bold"
                      placeholder="••••"
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]{4}"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Enter the 4-digit code you received when making the reservation</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Find Reservation</span>
                  </div>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-500 text-center">
                Don't have your passcode?{" "}
                <button className="text-rose-400 hover:text-rose-300 underline">Contact support</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8">
        <div className="max-w-md mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 mb-8 transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back to Restaurant
          </Link>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Reservation Updated!</h1>
              <p className="text-gray-400 mt-2">Your reservation has been successfully updated</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Reservation ID</p>
                    <p className="font-bold text-lg text-white">{updatedReservation?.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Table</p>
                    <p className="font-bold text-lg text-white">#{updatedReservation?.seat_id}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Date & Time</p>
                    <p className="font-bold text-lg text-white">
                      {formatDate(updatedReservation?.date || '')} at {formatTime(updatedReservation?.time_from || '')}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-400">Passcode</p>
                    <p className="font-bold text-2xl text-rose-400 tracking-widest">{updatedReservation?.passcode}</p>
                  </div>
                </div>
              </div>

              {getTotalItems() > 0 && (
                <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
                  <h3 className="font-bold text-white mb-3">Order Summary</h3>
                  <div className="space-y-3">
                    {Object.entries(cart).map(([itemId, quantity]) => {
                      const item = menuData?.items.find(i => i.id === Number(itemId));
                      return item ? (
                        <div key={itemId} className="flex justify-between">
                          <span className="text-gray-300">{quantity}x {item.name}</span>
                          <span className="text-rose-400 font-bold">${(item.price * quantity).toFixed(2)}</span>
                        </div>
                      ) : null;
                    })}
                    <div className="pt-3 border-t border-gray-700">
                      <div className="flex justify-between">
                        <span className="text-white font-bold">Total</span>
                        <span className="text-xl font-bold text-rose-400">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={generatePDF}
                  className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Updated Confirmation PDF
                </button>

                <button
                  onClick={() => setStep("edit")}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-4 px-6 rounded-xl transition-all"
                >
                  Make More Changes
                </button>

                <Link
                  href="/"
                  className="block w-full text-center bg-gradient-to-r from-gray-900 to-black hover:from-gray-800 hover:to-gray-900 text-white font-bold py-4 px-6 rounded-xl transition-all border border-gray-700"
                >
                  Return to Home
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-500 text-center">
                Need help? Contact us at{" "}
                <a
                  href={`mailto:ghaliwali@gmail.com?subject=${encodeURIComponent('Help with Reservation #' + updatedReservation?.id)}`}
                  className="text-rose-400 hover:text-rose-300 font-medium underline hover:no-underline"
                >ghaliwali@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setStep("search")}
          className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 mb-8 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          Back to Search
        </button>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Cancel Reservation?</h3>
                <p className="text-gray-400">
                  Are you sure you want to cancel this reservation? This action cannot be undone.
                </p>
              </div>

              <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reservation ID:</span>
                    <span className="text-white font-semibold">{reservation?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white font-semibold">{formatDate(reservation?.date || '')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time:</span>
                    <span className="text-white font-semibold">{formatTime(reservation?.time_from || '')}</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={handleCancelReservation}
                  disabled={cancelling}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Cancelling...
                    </>
                  ) : (
                    'Yes, Cancel It'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">Edit Reservation</h1>
              <p className="text-gray-400 mt-1">Update your reservation details</p>
            </div>
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-900/50 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-300">Reservation #{reservation?.id}</span>
            </div>
          </div>

          {reservation && (
            <div className="mb-8 p-6 bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Date</p>
                  <p className="text-lg font-semibold text-white">{formatDate(reservation.date)}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Time</p>
                  <p className="text-lg font-semibold text-white">{formatTime(reservation.time_from)} - {formatTime(reservation.time_to)}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Table</p>
                  <p className="text-lg font-semibold text-white">Table #{reservation.seat_id}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl">
              <div className="flex items-center gap-2 text-red-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-700/50 rounded-xl">
              <div className="flex items-center gap-2 text-green-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{success}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-600/20 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-300">New Passcode (optional)</label>
                  <input
                    type="text"
                    value={newPasscode}
                    onChange={handleNewPasscodeChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all text-center text-xl tracking-widest font-bold"
                    placeholder="Leave empty to keep current"
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]{4}"
                  />
                  <p className="text-xs text-gray-500 mt-2">Change your 4-digit reservation passcode</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-600/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Pre-order Menu Items</h2>
                </div>
                {getTotalItems() > 0 && (
                  <span className="px-3 py-1 bg-rose-600 text-white text-sm font-semibold rounded-full">
                    {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              

              {loadingMenu ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
                  <p className="text-gray-400 mt-4 text-sm">Loading menu...</p>
                </div>
              ) : menuData ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {menuData.categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                          selectedCategory === category
                            ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg'
                            : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                        }`}
                      >
                        {formatCategoryName(category)}
                      </button>
                    ))}
                  </div>

                  {selectedCategory && menuData.grouped[selectedCategory] && (
                    <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6">
                      <h3 className="font-bold text-lg mb-4 text-white">{formatCategoryName(selectedCategory)}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuData.grouped[selectedCategory].map((item) => {
                          const quantity = getItemQuantity(item.id);
                          return (
                            <div
                              key={item.id}
                              className={`p-4 rounded-xl border transition-all ${
                                quantity > 0
                                  ? 'bg-gradient-to-r from-gray-900 to-black border-rose-500/50'
                                  : 'bg-gray-900/30 border-gray-700 hover:border-gray-600'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-white">{item.name}</h4>
                                    <span className="text-rose-400 font-bold">${item.price.toFixed(2)}</span>
                                  </div>
                                  <p className="text-sm text-gray-400 mb-3">{item.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => decrementItem(item.id)}
                                    disabled={quantity === 0}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold transition-all ${
                                      quantity === 0
                                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                                    }`}
                                  >−</button>
                                  
                                  <span className="w-8 text-center font-bold text-white text-lg">{quantity}</span>
                                  
                                  <button
                                    type="button"
                                    onClick={() => incrementItem(item.id)}
                                    className="w-8 h-8 rounded-lg bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 flex items-center justify-center text-white font-bold transition-all transform hover:scale-105"
                                  >+</button>
                                </div>
                                
                                {quantity > 0 && (
                                  <span className="text-rose-400 font-bold">${(item.price * quantity).toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {getTotalItems() > 0 && (
                    <div className="bg-gradient-to-r from-gray-900 to-black border border-gray-700 rounded-2xl p-6">
                      <h3 className="font-bold text-lg mb-4 text-white">Order Summary</h3>
                      <div className="space-y-3">
                        {Object.entries(cart).map(([itemId, quantity]) => {
                          const item = menuData.items.find(i => i.id === Number(itemId));
                          return item ? (
                            <div key={itemId} className="flex justify-between items-center py-2">
                              <div>
                                <span className="text-gray-300 font-medium">{quantity}x {item.name}</span>
                                <p className="text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                              </div>
                              <span className="text-rose-400 font-bold">${(item.price * quantity).toFixed(2)}</span>
                            </div>
                          ) : null;
                        })}
                        
                        <div className="pt-4 mt-4 border-t border-gray-700">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-white font-bold text-lg">Total</span>
                              <p className="text-sm text-gray-500">{getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''}</p>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">${calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400">Menu temporarily unavailable</p>
                </div>
              )}
            </div>

            {/* <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setStep("search")}
                className="flex-1 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-gray-300 font-semibold rounded-xl transition-all transform hover:scale-[1.02]"
              >Cancel</button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Update Reservation</span>
                  </div>
                )}
              </button>
            </div> */}
          {/* </form> */}

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setStep("search")}
                className="flex-1 px-6 py-4 bg-gray-900 hover:bg-gray-800 text-gray-300 font-semibold rounded-xl transition-all transform hover:scale-[1.02]"
              >Cancel</button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 disabled:opacity-50 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Changes...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Update Reservation</span>
                  </div>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="w-full px-6 py-3 bg-red-900/20 hover:bg-red-900/30 border border-red-700/50 hover:border-red-600 text-red-400 hover:text-red-300 font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel This Reservation
            </button>
            {/* <p className="text-sm text-gray-500 text-center mt-4">
              Need help? reach us at{" "}
              <a
                href={`mailto:ghaliwali@gmail.com?subject=${encodeURIComponent('Help with Reservation #' + id)}`}
                className="text-rose-400 hover:text-rose-300 font-medium underline hover:no-underline"
              >ghaliwali@gmail.com</a>
            </p> */}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-500 text-center">
              Need help? reach us at{" "}
              <a
                href={`mailto:ghaliwali@gmail.com?subject=${encodeURIComponent('Help with Reservation #' + id)}`}
                className="text-rose-400 hover:text-rose-300 font-medium underline hover:no-underline"
              >ghaliwali@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}