// src/components/reservation/ReservationCard.tsx
interface ReservationCardProps {
  children: React.ReactNode;
  className?: string;
}

export function ReservationCard({ children, className = "" }: ReservationCardProps) {
  return (
    <div className={`bg-[#D17272]/20 rounded-4xl p-6 md:p-8 border-5 border-[#630620]/70 ${className}`}>
      {children}
    </div>
  );
}