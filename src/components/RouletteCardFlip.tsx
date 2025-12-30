import React, { ReactNode, useState } from 'react';
import { BarChart3, Disc3 } from 'lucide-react';

interface RouletteCardFlipProps {
  frontContent: ReactNode;
  backContent: ReactNode;
}

export const RouletteCardFlip: React.FC<RouletteCardFlipProps> = ({
  frontContent,
  backContent,
}) => {
  const [view, setView] = useState<'wheel' | 'probs'>('wheel');

  const toggleView = () => {
    setView(view === 'wheel' ? 'probs' : 'wheel');
  };

  return (
    <div className="flip-scene w-full">
      <div
        className={`flip-card ${view === 'probs' ? 'flipped' : ''}`}
      >
        <div className="flip-face flip-face-front">
          <div className="bg-gradient-to-b from-gray-950 to-black rounded-xl border-4 border-yellow-600 shadow-2xl overflow-hidden relative w-full min-h-[560px] md:min-h-[620px]">
            <button
              onClick={toggleView}
              className="absolute top-3 right-3 z-20 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded border-2 border-cyan-900 shadow-lg transition-all active:scale-95 font-mono flex items-center gap-1.5"
              aria-label="Ver probabilidades"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">PROBS</span>
            </button>
            <div className="absolute inset-0 flex items-center justify-center w-full h-full">
              {frontContent}
            </div>
          </div>
        </div>

        <div className="flip-face flip-face-back">
          <div className="bg-gradient-to-b from-gray-950 to-black rounded-xl border-4 border-yellow-600 shadow-2xl overflow-hidden relative w-full min-h-[560px] md:min-h-[620px]">
            <button
              onClick={toggleView}
              className="absolute top-3 right-3 z-20 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-black text-xs font-bold rounded border-2 border-yellow-900 shadow-lg transition-all active:scale-95 font-mono flex items-center gap-1.5"
              aria-label="Ver ruleta"
            >
              <Disc3 className="w-4 h-4" />
              <span className="hidden sm:inline">RULETA</span>
            </button>
            <div className="absolute inset-0 overflow-y-auto p-4 pt-14">
              {backContent}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .flip-scene {
          perspective: 1200px;
        }

        .flip-card {
          position: relative;
          transform-style: preserve-3d;
          transition: transform 600ms ease;
          width: 100%;
        }

        .flip-card.flipped {
          transform: rotateY(180deg);
        }

        .flip-face {
          backface-visibility: hidden;
          width: 100%;
        }

        .flip-face-front {
          position: relative;
        }

        .flip-face-back {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          transform: rotateY(180deg);
        }

        @media (prefers-reduced-motion: reduce) {
          .flip-card {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};
