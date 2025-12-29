// src/components/reservation/ReservationDetails.tsx
interface ReservationDetailsProps {
  seatId: string;
  date: string;
  timeFrom: string;
  timeTo: string;
}

export function ReservationDetails({ seatId, date, timeFrom, timeTo }: ReservationDetailsProps) {
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

  return (
    <div className="mb-8 p-5 bg-[#CF8989] rounded-3xl text-center max-w-md mx-auto">
      <h2 className="font-black text-xl mb-3">Reservation Details</h2>
      <div className="space-y-1 text-sm font-bold">
        <p>
          <span className="font-thin">Date:</span> {formatDate(date)}
        </p>
        <p>
          <span className="font-thin">Time:</span> {formatTime(timeFrom)} – {formatTime(timeTo)}
        </p>
        <p>
          <span className="font-thin">Table:</span> #{seatId}
        </p>
      </div>
    </div>
  );
}