// src/components/reservation/ReservationLayout.tsx
import React from 'react';
import Link from 'next/link';

interface ReservationLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
}

export function ReservationLayout({ 
  children, 
  showBackButton = true,
  backHref = "/",
  backText = "Back to Restaurant"
}: ReservationLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 relative">
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 z-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/wood.svg)',
          backgroundSize: '200%'
        }}
      />
      <div className="max-w-4xl mx-auto relative z-10">
        {showBackButton && (
          <Link
            href={backHref}
            className="inline-flex items-center text-[#630620] hover:text-[#F87070] mb-6 font-semibold"
          >
            ← {backText}
          </Link>
        )}
        {children}
      </div>
    </div>
  );
}