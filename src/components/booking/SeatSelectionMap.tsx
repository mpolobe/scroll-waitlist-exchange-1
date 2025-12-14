import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface SeatSelectionMapProps {
  totalSeats: number;
  selectedSeats: string[];
  onSeatToggle: (seat: string) => void;
  onConfirm: () => void;
}

export function SeatSelectionMap({ totalSeats, selectedSeats, onSeatToggle, onConfirm }: SeatSelectionMapProps) {
  const rows = 10;
  const cols = 4;
  const bookedSeats = ['1A', '1B', '2C', '3A', '5D', '7B'];

  const getSeatNumber = (row: number, col: number) => {
    const letter = ['A', 'B', 'C', 'D'][col];
    return `${row + 1}${letter}`;
  };

  const isSeatBooked = (seat: string) => bookedSeats.includes(seat);
  const isSeatSelected = (seat: string) => selectedSeats.includes(seat);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Select Your Seats</h3>
      <div className="mb-6">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-8 h-8 bg-green-500 rounded"></div><span>Available</span></div>
          <div className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-500 rounded"></div><span>Selected</span></div>
          <div className="flex items-center gap-2"><div className="w-8 h-8 bg-gray-300 rounded"></div><span>Booked</span></div>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 mb-6">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex gap-2">
            {Array.from({ length: cols }).map((_, col) => {
              const seat = getSeatNumber(row, col);
              const booked = isSeatBooked(seat);
              const selected = isSeatSelected(seat);
              return (
                <button key={seat} onClick={() => !booked && onSeatToggle(seat)} disabled={booked}
                  className={`w-10 h-10 rounded text-xs font-semibold ${booked ? 'bg-gray-300 cursor-not-allowed' : selected ? 'bg-blue-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                  {seat}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <Button onClick={onConfirm} disabled={selectedSeats.length === 0} className="w-full bg-gradient-to-r from-blue-600 to-orange-500">
        Confirm Seats ({selectedSeats.length})
      </Button>
    </Card>
  );
}
