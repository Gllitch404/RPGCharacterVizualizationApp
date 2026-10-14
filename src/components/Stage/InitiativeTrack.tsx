import React from 'react';
import { InitiativeState } from '../../types';
import { InitiativeCard } from './InitiativeCard';
import { Swords } from 'lucide-react';

interface InitiativeTrackProps {
  initiative: InitiativeState;
  onSelectTurn?: (index: number) => void;
  onNextTurn?: () => void;
  onPrevTurn?: () => void;
  onToggleVisibility?: () => void;
}

export const InitiativeTrack: React.FC<InitiativeTrackProps> = ({
  initiative,
  onSelectTurn
}) => {
  const { items, activeTurnIndex, isVisibleOnStage, round } = initiative;

  // Se estiver sem participantes, não renderiza no palco
  if (items.length === 0) {
    return null;
  }

  const activeParticipant = items[activeTurnIndex];
  const CARD_STEP = 60; // Deslocamento vertical exato entre cada carta na pilha

  return (
    <div
      className={`absolute top-3 left-3 sm:top-4 sm:left-6 z-40 flex flex-col items-start select-none transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisibleOnStage
          ? 'translate-y-0 translate-x-0 opacity-100 pointer-events-auto'
          : '-translate-y-[130%] -translate-x-12 opacity-0 pointer-events-none'
      }`}
      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.85))' }}
    >
      {/* ── 1. INDICADOR DISCRETO DE RODADA & TURNO ATIVO (SEM BOTÕES) ── */}
      <div className="flex items-center gap-2 bg-black/85 backdrop-blur-md border border-zinc-800/80 rounded-xl px-2.5 py-1 text-white shadow-xl mb-2">
        <div className="flex items-center gap-1.5 font-mono text-[11px] font-black tracking-wider text-red-500">
          <Swords className="w-3.5 h-3.5" />
          <span>RODADA {round || 1}</span>
        </div>

        {activeParticipant && (
          <>
            <div className="h-3 w-px bg-zinc-700 mx-0.5" />
            <div className="flex items-center gap-1 text-[11px] font-mono truncate max-w-[130px] sm:max-w-[190px]">
              <span className="text-zinc-500 text-[10px] hidden sm:inline">VEZ:</span>
              <span
                className="font-bold truncate"
                style={{ color: activeParticipant.borderColor || '#fff' }}
              >
                {activeParticipant.name}
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── 2. CARROSSEL VERTICAL DESLIZANTE DE CARTAS (ZERO SCROLLBARS / 100% FLUIDO) ── */}
      <div className="relative pt-1 pl-1 pr-10 overflow-visible">
        <div
          className="flex flex-col items-start transition-transform duration-500 ease-out"
          style={{
            transform: `translateY(-${activeTurnIndex * CARD_STEP}px)`
          }}
        >
          {items.map((item, idx) => {
            const offsetFromActive = idx - activeTurnIndex;
            return (
              <div
                key={item.id}
                className={`transition-all duration-500 ease-out ${idx > 0 ? '-mt-11 sm:-mt-12' : ''}`}
              >
                <InitiativeCard
                  item={item}
                  index={idx}
                  isActive={idx === activeTurnIndex}
                  offsetFromActive={offsetFromActive}
                  onClick={() => onSelectTurn && onSelectTurn(idx)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
