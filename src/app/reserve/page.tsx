// src/app/reserve/page.tsx

'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';

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

function ReservePageContent() {
  const router = useRouter();
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
  
  const [menuData, setMenuData] = useState<MenuResponse | null>(null);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<number, number>>({});
  
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json() as MenuResponse;
        setMenuData(data);
      } catch (err) {
        console.error('Failed to load menu:', err);
      } finally {
        setLoadingMenu(false);
      }
    };
    
    fetchMenu();
  }, []);
  
  useEffect(() => {
    if (success && reservationData && menuData && !emailSent) {
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
  }, [success, reservationData, menuData, emailSent]);
  
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
  
  const getItemQuantity = (itemId: number): number => {
    return cart[itemId] || 0;
  };
  
  const formatCategoryName = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const handlePasscodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setPasscode(value);
    }
  };
  
  const formatDate = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };
  
  const calculateTotal = () => {
    if (!menuData) return 0;
    return Object.entries(cart).reduce((sum, [itemId, quantity]) => {
      const item = menuData.items.find(i => i.id === Number(itemId));
      return sum + (item?.price || 0) * quantity;
    }, 0);
  };
  
  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };
  
  const generatePDF = useCallback(() => {
    if (!reservationData || !menuData) return;
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Reservation Confirmation', 105, 20, { align: 'center' });
    
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
      ['Reservation ID:', String(reservationData.id)],
      ['Table Number:', `#${reservationData.seat_id}`],
      ['Date:', formatDate(reservationData.date)],
      ['Time:', `${formatTime(reservationData.time_from)} - ${formatTime(reservationData.time_to)}`],
      ['Status:', reservationData.is_active ? 'Active' : 'Inactive']
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
      ['Name:', String(reservationData.name)],
      ['Email:', String(reservationData.email)],
      ['Phone:', String(reservationData.phone)]
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
    doc.text(String(reservationData.passcode), 80, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 15;
    
    if (reservationData.menu_items && reservationData.menu_items.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Pre-Ordered Items', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      
      const itemCounts: Record<number, number> = {};
      reservationData.menu_items.forEach(itemId => {
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
    doc.text('Thank you for your reservation!', 105, footerY, { align: 'center' });
    doc.text('Please arrive 10 minutes before your reservation time.', 105, footerY + 5, { align: 'center' });
    doc.text('Cancellations must be made at least 2 hours in advance.', 105, footerY + 10, { align: 'center' });
    
    doc.save(`Reservation-${reservationData.id}.pdf`);
  }, [reservationData, menuData]);
  
  const generateAndSendEmail = useCallback(async () => {
    if (!reservationData || !menuData) {
      alert('Cannot send email: Missing reservation or menu data');
      return;
    }
    
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Reservation Confirmation', 105, 20, { align: 'center' });
      
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
        ['Reservation ID:', String(reservationData.id)],
        ['Table Number:', `#${reservationData.seat_id}`],
        ['Date:', formatDate(reservationData.date)],
        ['Time:', `${formatTime(reservationData.time_from)} - ${formatTime(reservationData.time_to)}`],
        ['Status:', reservationData.is_active ? 'Active' : 'Inactive']
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
        ['Name:', String(reservationData.name)],
        ['Email:', String(reservationData.email)],
        ['Phone:', String(reservationData.phone)]
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
      doc.text(String(reservationData.passcode), 80, yPos);
      doc.setTextColor(0, 0, 0);
      yPos += 15;
      
      if (reservationData.menu_items && reservationData.menu_items.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Pre-Ordered Items', 20, yPos);
        yPos += 10;
        
        doc.setFontSize(10);
        
        const itemCounts: Record<number, number> = {};
        reservationData.menu_items.forEach(itemId => {
          itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
        });
        
        Object.entries(itemCounts).forEach(([itemId, quantity]) => {
          const item = menuData.items.find(i => i.id === Number(itemId));
          if (item) {
            doc.setFont('helvetica', 'normal');
            doc.text(`${quantity}x ${item.name}`, 25, yPos);
            doc.text(`$${(item.price * quantity).toFixed(2)}`, 170, yPos, { align: 'right' });
            yPos += 6;
          }
        });
      } else {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.text('No items pre-ordered', 20, yPos);
      }
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const footerY = 280;
      doc.text('Thank you for your reservation!', 105, footerY, { align: 'center' });
      doc.text('Please arrive 10 minutes before your reservation time.', 105, footerY + 5, { align: 'center' });
      doc.text('Cancellations must be made at least 2 hours in advance.', 105, footerY + 10, { align: 'center' });
      
      const pdfBase64 = doc.output('dataurlstring').split(',')[1];
      
      const emailPayload = {
        reservation: reservationData,
        pdfBase64,
      };
      
      const emailResponse = await fetch('/api/reservations/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      });
      
      const emailData = await emailResponse.json();
      
      if (!emailResponse.ok) {
        alert(`Email failed: ${emailData.error || 'Unknown error'}`);
      } else {
        alert('✅ PDF sent to your email!');
      }
      
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [reservationData, menuData]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (passcode.length !== 4) {
      setError('Passcode must be exactly 4 digits');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const menuItems = Object.entries(cart).flatMap(([itemId, quantity]) => 
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
          menu_items: menuItems
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
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-md mx-auto bg-gray-800 p-8 rounded-lg text-center">
          <div className="text-green-400 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">Reservation Confirmed!</h1>
          <p className="mb-2">Your table has been successfully reserved.</p>
          
          <div className="my-6 p-4 bg-gray-700 rounded-lg border-2 border-rose-500">
            <p className="text-sm text-gray-300 mb-2">Your Reservation Passcode:</p>
            <p className="text-3xl font-bold text-rose-400 tracking-widest">{reservationData.passcode}</p>
            <p className="text-xs text-gray-400 mt-2">
              Please save this passcode. You'll need it to manage your reservation.
            </p>
          </div>
          
          <p className="text-sm text-gray-300 mb-4">
            📧 A PDF confirmation has been sent to your email.
          </p>
          
          <button
            onClick={generatePDF}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded mb-4 font-semibold transition-colors"
          >
            📄 Download Reservation PDF
          </button>
          
          <button
            onClick={generateAndSendEmail}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded mb-4 font-semibold transition-colors"
          >
            📧 Send PDF to Email Again
          </button>
          
          <Link 
            href="/" 
            className="block w-full bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded font-semibold transition-colors"
          >
            Return to Restaurant
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-[#630620] hover:text-[#F87070] mb-6 font-semibold"
        >
          ← Back to Restaurant
        </Link>

        <div className="bg-[#D17272]/20 rounded-4xl p-6 md:p-8 border-5 border-[#630620]/70">
          <h1 className="text-2xl font-black mb-6">
            Reserve Table #{seatId}
          </h1>

          {/* Reservation Details */}
          <div className="mb-8 p-5 bg-[#D17272] rounded-3xl text-center max-w-md mx-auto">
            <h2 className="font-black text-xl mb-3">
              Reservation Details
            </h2>

            <div className="space-y-1 text-sm font-bold">
              <p>
                <span className="font-thin">Date:</span>{" "}
                {formatDate(date)}
              </p>
              <p>
                <span className="font-thin">Time:</span>{" "}
                {formatTime(from)} – {formatTime(to)}
              </p>
              <p>
                <span className="font-thin">Table:</span> #{seatId}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-[#D17272]">
            {/* User Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-[#D17272] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-[#D17272] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-[#D17272] rounded-full font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="(000) 000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  4-Digit Passcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={passcode}
                  onChange={handlePasscodeChange}
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  required
                  className="w-full px-4 py-2 bg-[#D17272] rounded-full text-center text-2xl tracking-widest font-black focus:ring-2 focus:ring-rose-500 outline-none"
                  placeholder="••••"
                />
                <p className="text-[9px] text-gray-400 mt-1 ml-3 leading-tight">
                  You'll need this passcode to manage your reservation
                </p>
              </div>
            </div>

            {/* Pre-order Section */}
            <div className="pt-2 border-t border-[#D17272]">
              <h2 className="text-xl font-black mb-2">
                Pre-order Menu (Optional)
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Select items now or order later at the table.
              </p>

              {loadingMenu ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D17272] mx-auto" />
                  <p className="text-gray-500 mt-3 text-sm">
                    Loading menu…
                  </p>
                </div>
              ) : menuData ? (
                <div className="space-y-6">
                  {/* Categories */}
                  <div className="flex flex-wrap gap-2">
                    {menuData.categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === category
                              ? null
                              : category
                          )
                        }
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                          selectedCategory === category
                            ? "bg-[#D17272] text-white"
                            : "bg-rose-100 text-[#D17272] hover:bg-rose-200"
                        }`}
                      >
                        {formatCategoryName(category)}
                      </button>
                    ))}
                  </div>

                  {selectedCategory &&
                    menuData.grouped[selectedCategory] && (
                      <div className="bg-[#D17272]/20 rounded-3xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {menuData.grouped[selectedCategory].map((item) => {
                          const quantity = getItemQuantity(item.id);
                          return (
                            <div
                              key={item.id}
                              className="bg-white rounded-2xl p-3 border border-rose-200 flex flex-col justify-between"
                            >
                              <div>
                                <h4 className="font-semibold text-sm">{item.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                                <p className="text-[#D17272] font-bold text-sm mt-1">
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <button
                                  type="button"
                                  onClick={() => decrementItem(item.id)}
                                  disabled={quantity === 0}
                                  className="w-7 h-7 rounded-full bg-rose-100 text-[#D17272] font-bold text-sm disabled:opacity-40"
                                >
                                  −
                                </button>
                                <span className="w-5 text-center font-bold text-sm">{quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => incrementItem(item.id)}
                                  className="w-7 h-7 rounded-full bg-[#D17272] text-white font-bold text-sm"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                  {/* Summary */}
                  {getTotalItems() > 0 && (
                    <div className="bg-white rounded-3xl p-5 border border-rose-200">
                      <h3 className="font-black mb-3">
                        Your Order ({getTotalItems()})
                      </h3>

                      {Object.entries(cart).map(([id, qty]) => {
                        const item = menuData.items.find(
                          (i) => i.id === Number(id)
                        );
                        return (
                          item && (
                            <div
                              key={id}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {qty}× {item.name}
                              </span>
                              <span className="font-semibold text-[#D17272]">
                                ${(item.price * qty).toFixed(2)}
                              </span>
                            </div>
                          )
                        );
                      })}

                      <div className="pt-3 mt-3 border-t flex justify-between font-black">
                        <span>Total</span>
                        <span className="text-[#D17272]">
                          ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Unable to load menu.
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-[#D17272] p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#D17272] hover:bg-[#F87070] disabled:opacity-60 text-white font-black py-3 rounded-full transition"
            >
              {isSubmitting ? "Processing…" : "Confirm Reservation"}
            </button>
          </form>

          <p className="mt-6 text-[11px] text-gray-400 text-center">
            Cancellations must be made at least 2 hours in advance.
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