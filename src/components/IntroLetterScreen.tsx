import React from 'react';
import { INTRO_LETTER } from '../lore/loreText';

interface IntroLetterScreenProps {
  onStart: () => void;
}

export const IntroLetterScreen: React.FC<IntroLetterScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-dvh w-full bg-black">
      <div className="mx-auto max-w-6xl p-3 md:p-6">
        <div className="flex items-center justify-center min-h-[calc(100dvh-3rem)]">
          <div className="w-full max-w-3xl">
            <div className="bg-gray-950 rounded-xl border-2 border-yellow-600 p-6 md:p-8">
              <div className="text-center mb-6">
                <div className="mb-4">
                  <h1 className="text-3xl md:text-5xl font-black text-yellow-400 glow-text mb-2" style={{ textShadow: '4px 4px 0 #ff3333' }}>
                    CASINO
                  </h1>
                  <h2 className="text-3xl md:text-5xl font-black text-red-500 mb-4" style={{ textShadow: '4px 4px 0 #ffff00' }}>
                    BOYAL
                  </h2>
                  <p className="text-yellow-300 text-xs md:text-sm tracking-widest">~ PIXEL ART ROGUELIKE ROULETTE ~</p>
                </div>
                <p className="text-sm text-yellow-400 font-mono">
                  [ Carta para Bill ]
                </p>
              </div>

              <div className="bg-gray-900 rounded border border-gray-700 p-4 mb-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
                <pre className="text-gray-300 font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
{INTRO_LETTER}
                </pre>
              </div>

              <button
                onClick={onStart}
                className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg md:text-xl rounded-lg border-4 border-red-900 shadow-lg transition-all active:scale-95 font-mono"
              >
                ENTRAR AL CASINO
              </button>

              <p className="text-xs text-gray-600 font-mono text-center mt-4">
                [ Pulsa ESC para saltar intro ]
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(234, 179, 8, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(234, 179, 8, 0.6);
        }
      `}</style>
    </div>
  );
};
