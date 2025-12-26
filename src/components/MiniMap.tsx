import { useState, useEffect } from 'react';

export default function MiniMap() {
  const [reservedSeats, setReservedSeats] = useState<number[]>([]);
  const [currentPosition, setCurrentPosition] = useState(-1);

  // Define the positions for each seat marker on the SVG (percentage-based)
  const seatPositions = [
    { id: 0, x: 15, y: 6.7 },      // Table 0
    { id: 1, x: 38, y: 13.3 },     // Table 1
    { id: 2, x: 58, y: 6.7 },      // Table 2
    { id: 3, x: 84, y: 12.8 },     // Table 3
    { id: 4, x: 68, y: 25 },       // Table 4
    { id: 5, x: 45, y: 25 },       // Table 5
    { id: 6, x: 9, y: 42 },        // Table 6
    { id: 7, x: 9, y: 56 },        // Table 7
    { id: 8, x: 9, y: 78 },        // Table 8
    { id: 9, x: 9, y: 92 },        // Table 9
    { id: 10, x: 65, y: 84.5 },    // Seat 10
    { id: 11, x: 50, y: 80 },      // Seat 11
    { id: 12, x: 50, y: 71.7 },    // Seat 12
    { id: 13, x: 50, y: 63.3 },    // Seat 13
    { id: 14, x: 50, y: 55 },      // Seat 14
    { id: 15, x: 50, y: 46.7 },    // Seat 15
    { id: 16, x: 62, y: 39.8 },    // Seat 16
  ];

  useEffect(() => {
    // Listen for reservation updates from FloatingPanel
    const handleReservationUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<number[]>;
      const reservedSeatIds = customEvent.detail || [];
      
      console.log('MiniMap received reservation update:', reservedSeatIds);
      setReservedSeats(reservedSeatIds);
    };

    // Listen for camera position changes from restorant.tsx
    const handleCameraMove = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      setCurrentPosition(customEvent.detail);
    };

    window.addEventListener('update-reservations', handleReservationUpdate);
    window.addEventListener('camera-position-changed', handleCameraMove);

    return () => {
      window.removeEventListener('update-reservations', handleReservationUpdate);
      window.removeEventListener('camera-position-changed', handleCameraMove);
    };
  }, []);

  const handleSeatClick = (seatId: number) => {
    // SVG seat id + 1 = camera position (seat 0 → pos 1, seat 1 → pos 2, etc.)
    const cameraPosition = seatId + 1;
    window.dispatchEvent(
      new CustomEvent('goto-camera-position', {
        detail: cameraPosition
      })
    );
  };

  const getSeatColor = (seatId: number) => {
    // Priority: Current position > Reserved > Available
    if (currentPosition === seatId) {
      return '#FFC107'; // Yellow for current position
    }
    // Check if this seat is reserved
    return reservedSeats.includes(seatId) ? '#FF0000' : '#00FF00';
  };

  const getSeatLabel = (seatId: number) => {
    if (currentPosition === seatId) {
      return 'Current';
    }
    return reservedSeats.includes(seatId) ? 'Reserved' : 'Available';
  };

  return (
    <div className="fixed left-4 top-4 z-50 w-48 lg:w-64">
      <div className="relative bg-black/30 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
        {/* Legend */}
        <div className="flex justify-between mb-2 text-[10px] text-white/70">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>Current</span>
          </div>
        </div>

        {/* SVG Map Container */}
        <div className="relative w-full aspect-[4908/8903] bg-[#1E1E1E] rounded-lg overflow-hidden">
          {/* Background SVG */}
          <img 
            src="/miniMap.svg" 
            alt="Restaurant Map" 
            className="w-full h-full object-contain"
          />

          {/* Overlay seat markers */}
          {seatPositions.map((seat) => (
            <button
              key={seat.id}
              onClick={() => handleSeatClick(seat.id)}
              style={{
                position: 'absolute',
                left: `${seat.x}%`,
                top: `${seat.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="group relative"
              title={`Seat ${seat.id} - ${getSeatLabel(seat.id)}`}
            >
              {/* Outer glow ring for current position */}
              {currentPosition === seat.id && (
                <div 
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    backgroundColor: getSeatColor(seat.id),
                    width: '20px',
                    height: '20px',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: 0.5,
                  }}
                />
              )}
              
              {/* Main seat indicator */}
              <div
                className="relative w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 border-white/30 transition-all duration-200 hover:scale-125 hover:border-white cursor-pointer shadow-lg"
                style={{
                  backgroundColor: getSeatColor(seat.id),
                  boxShadow: currentPosition === seat.id 
                    ? `0 0 12px ${getSeatColor(seat.id)}` 
                    : `0 0 6px ${getSeatColor(seat.id)}`,
                }}
              >
                {/* Seat info label on hover */}
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap pointer-events-none">
                  Seat {seat.id} - {getSeatLabel(seat.id)}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Status text */}
        {reservedSeats.length > 0 && (
          <div className="mt-2 text-center text-[10px] text-white/60">
            {reservedSeats.length} seat{reservedSeats.length !== 1 ? 's' : ''} reserved
          </div>
        )}
      </div>
    </div>
  );
}