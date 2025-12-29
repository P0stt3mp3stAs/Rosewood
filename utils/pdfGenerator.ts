// src/utils/pdfGenerator.ts
import jsPDF from 'jspdf';
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

export const formatDate = (dateStr: string) => 
  new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

export const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

export function generateReservationPDF(
  reservation: ReservationData, 
  menuItems: MenuItem[],
  isUpdate: boolean = false
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const title = isUpdate ? 'Updated Reservation Confirmation' : 'Reservation Confirmation';
  doc.text(title, 105, 20, { align: 'center' });
  
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25);
  
  // Reservation Details Section
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Reservation Details', 20, 35);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  let yPos = 45;
  
  const details = [
    ['Reservation ID:', String(reservation.id)],
    ['Table Number:', `#${reservation.seat_id}`],
    ['Date:', formatDate(reservation.date)],
    ['Time:', `${formatTime(reservation.time_from)} - ${formatTime(reservation.time_to)}`],
    ['Status:', isUpdate ? 'Updated' : (reservation.is_active ? 'Active' : 'Inactive')]
  ];
  
  if (isUpdate) {
    details.push(['Last Updated:', new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })]);
  }
  
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(String(label), 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 70, yPos);
    yPos += 7;
  });
  
  // Customer Information Section
  yPos += 5;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  const customerInfo = [
    ['Name:', String(reservation.name)],
    ['Email:', String(reservation.email)],
    ['Phone:', String(reservation.phone)]
  ];
  
  customerInfo.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(String(label), 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 70, yPos);
    yPos += 7;
  });
  
  // Passcode Section
  yPos += 5;
  doc.setFillColor(254, 226, 226);
  doc.rect(18, yPos - 6, 174, 12, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Reservation Passcode:', 20, yPos);
  doc.setFontSize(16);
  doc.setTextColor(220, 38, 38);
  doc.text(String(reservation.passcode), 80, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 15;
  
  // Menu Items Section
  if (reservation.menu_items && reservation.menu_items.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Pre-Ordered Items', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    
    const itemCounts: Record<number, number> = {};
    reservation.menu_items.forEach(itemId => {
      itemCounts[itemId] = (itemCounts[itemId] || 0) + 1;
    });
    
    let subtotal = 0;
    
    Object.entries(itemCounts).forEach(([itemId, quantity]) => {
      const item = menuItems.find(i => i.id === Number(itemId));
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
  
  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const footerY = 280;
  const footerText = isUpdate 
    ? 'Thank you for updating your reservation!'
    : 'Thank you for your reservation!';
  doc.text(footerText, 105, footerY, { align: 'center' });
  doc.text('Please arrive 10 minutes before your reservation time.', 105, footerY + 5, { align: 'center' });
  const cancellationText = isUpdate
    ? 'Changes must be made at least 2 hours in advance.'
    : 'Cancellations must be made at least 2 hours in advance.';
  doc.text(cancellationText, 105, footerY + 10, { align: 'center' });
  
  return doc;
}

export function downloadReservationPDF(
  reservation: ReservationData,
  menuItems: MenuItem[],
  isUpdate: boolean = false
) {
  const doc = generateReservationPDF(reservation, menuItems, isUpdate);
  const filename = isUpdate 
    ? `Updated-Reservation-${reservation.id}.pdf`
    : `Reservation-${reservation.id}.pdf`;
  doc.save(filename);
}

export function getPDFBase64(
  reservation: ReservationData,
  menuItems: MenuItem[]
) {
  const doc = generateReservationPDF(reservation, menuItems);
  return doc.output('dataurlstring').split(',')[1];
}