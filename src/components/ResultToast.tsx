import React, { useEffect } from 'react';

interface ResultToastProps {
  open: boolean;
  winningNumber: number | null;
  onClose: () => void;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const ResultToast: React.FC<ResultToastProps> = ({ open, winningNumber, onClose }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open || winningNumber === null) return null;

  const isRed = RED_NUMBERS.includes(winningNumber);
  const isGreen = winningNumber === 0;
  const colorClass = isGreen ? 'text-green-400' : isRed ? 'text-red-400' : 'text-gray-300';
  const colorLabel = isGreen ? 'VERDE' : isRed ? 'ROJO' : 'NEGRO';
  const bgColor = isGreen ? 'bg-green-600/20' : isRed ? 'bg-red-600/20' : 'bg-gray-600/20';
  const borderColor = isGreen ? 'border-green-500' : isRed ? 'border-red-500' : 'border-gray-400';

  return (
    <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
      <div
        className={`${bgColor} ${borderColor} border-4 rounded-xl px-8 py-6 shadow-2xl transition-all duration-300 ${
          open ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          animation: open ? 'pulse 0.5s ease-in-out' : undefined,
        }}
      >
        <p className="text-yellow-300 text-xl md:text-2xl font-bold font-mono mb-2 text-center">
          RESULTADO
        </p>
        <p className={`${colorClass} text-6xl md:text-8xl font-black font-mono text-center mb-2`}>
          {winningNumber}
        </p>
        <p className={`${colorClass} text-lg md:text-xl font-bold font-mono text-center`}>
          {colorLabel}
        </p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
};
