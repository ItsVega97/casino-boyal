import React from 'react';

interface GameMenuProps {
  highScore: number;
  onStart: () => void;
  onOpenHistory: () => void;
  onOpenWiki: () => void;
  onOpenAchievements: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ highScore, onStart, onOpenHistory, onOpenWiki, onOpenAchievements }) => {
  return (
    <div className="min-h-dvh w-full bg-black flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full py-8">
        <div className="text-center mb-8 md:mb-12 float-animation">
          <h1 className="text-3xl md:text-5xl font-black text-yellow-400 glow-text mb-2" style={{ textShadow: '4px 4px 0 #ff3333' }}>
            CASINO
          </h1>
          <h2 className="text-3xl md:text-5xl font-black text-red-500 mb-4" style={{ textShadow: '4px 4px 0 #ffff00' }}>
            BOYAL
          </h2>
          <p className="text-yellow-300 text-xs md:text-sm tracking-widest">~ PIXEL ART ROGUELIKE ROULETTE ~</p>
        </div>

        <div className="bg-gray-950 border-4 border-yellow-600 p-4 md:p-8 mb-6 md:mb-8 shadow-2xl">
          <div className="mb-6 md:mb-8">
            <h3 className="text-yellow-400 font-bold text-base md:text-lg mb-3 md:mb-4">[ MISIÓN ]</h3>
            <p className="text-yellow-100 mb-2 md:mb-3 text-xs md:text-sm leading-relaxed">Bill, debes dinero a la mafia albanesa.</p>
            <p className="text-yellow-100 mb-2 md:mb-3 text-xs md:text-sm leading-relaxed">Casino Boyal es tu última salida. Cada ronda exige un objetivo y tienes pocas tiradas.</p>
            <p className="text-yellow-100 text-xs md:text-sm leading-relaxed">Gana, compra trampas y aguanta. Si fallas, la deuda se cobra.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-gray-900 p-3 md:p-4 border-2 border-cyan-500">
              <h4 className="text-cyan-400 font-bold mb-2 text-xs md:text-sm">[ TIPOS DE APUESTA ]</h4>
              <ul className="text-xs text-cyan-200 space-y-1 font-mono">
                <li>• Rojo / Negro (1:1)</li>
                <li>• Par / Impar (1:1)</li>
                <li>• Columnas (2:1)</li>
                <li>• Número exacto (35:1)</li>
              </ul>
            </div>
            <div className="bg-gray-900 p-3 md:p-4 border-2 border-green-500">
              <h4 className="text-green-400 font-bold mb-2 text-xs md:text-sm">[ RECOMPENSAS ]</h4>
              <ul className="text-xs text-green-200 space-y-1 font-mono">
                <li>• Superar ronda = Tickets</li>
                <li>• Compra trampas en la tienda</li>
                <li>• Cada ronda sube la presión</li>
                <li>• Aguanta lo máximo posible</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-900 border-2 border-yellow-500 p-3 md:p-4 text-center">
            <p className="text-yellow-400 text-xs font-mono mb-1">[ MEJOR RACHA DE RONDAS ]</p>
            <p className="text-2xl md:text-3xl font-black text-yellow-300" style={{ textShadow: '2px 2px 0 #ff3333' }}>{highScore}</p>
          </div>
        </div>

        <button
          onPointerDown={onStart}
          className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-lg md:text-xl py-4 md:py-5 transition-all duration-200 transform active:scale-95 shadow-2xl border-4 border-red-900"
          style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.8)' }}
        >
          &gt;&gt; COMENZAR PARTIDA &lt;&lt;
        </button>

        <div className="mt-6 md:mt-8 grid grid-cols-3 gap-2 md:gap-4 text-center text-xs font-mono">
          <button
            onClick={onOpenHistory}
            className="border-2 border-yellow-600 p-2 md:p-3 bg-gray-900 hover:bg-gray-800 transition-all active:scale-95 cursor-pointer"
          >
            <p className="font-bold mb-1 text-yellow-300">[HISTORIAL]</p>
            <p className="text-yellow-100 text-[10px] md:text-xs">Partidas</p>
          </button>
          <button
            onClick={onOpenWiki}
            className="border-2 border-yellow-600 p-2 md:p-3 bg-gray-900 hover:bg-gray-800 transition-all active:scale-95 cursor-pointer"
          >
            <p className="font-bold mb-1 text-yellow-300">[WIKI]</p>
            <p className="text-yellow-100 text-[10px] md:text-xs">Mejoras</p>
          </button>
          <button
            onClick={onOpenAchievements}
            className="border-2 border-yellow-600 p-2 md:p-3 bg-gray-900 hover:bg-gray-800 transition-all active:scale-95 cursor-pointer"
          >
            <p className="font-bold mb-1 text-yellow-300">[LOGROS]</p>
            <p className="text-yellow-100 text-[10px] md:text-xs">Desafíos</p>
          </button>
        </div>
      </div>
    </div>
  );
};
