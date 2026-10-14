import React from 'react';
import { InitiativeItem } from '../../types';
import { Skull, Shield, Swords, Sparkles } from 'lucide-react';

interface InitiativeCardProps {
  item: InitiativeItem;
  isActive: boolean;
  index: number;
  offsetFromActive?: number;
  onClick?: () => void;
}

export const InitiativeCard: React.FC<InitiativeCardProps> = ({
  item,
  isActive,
  index,
  offsetFromActive = 0,
  onClick
}) => {
  const { name, type, avatarUrl, iconUrl, isFullCardArt, borderColor, tag, initiativeValue } = item;
  const displayImage = iconUrl || avatarUrl;

  // Classes dinâmicas baseadas na posição do turno ativo
  let stateClasses = '';
  if (offsetFromActive === 0) {
    // Carta Ativa: Reta (0deg), aumentada, projetada para fora, 100% visível e iluminada
    stateClasses = 'rotate-0 scale-110 translate-x-4 z-30 opacity-100 shadow-2xl';
  } else if (offsetFromActive === -1) {
    // Turno anterior: subindo e saindo da tela
    stateClasses = 'rotate-[-10deg] scale-85 -translate-x-1 z-10 opacity-30';
  } else if (offsetFromActive < -1) {
    // Turnos passados: totalmente fora da tela acima
    stateClasses = 'rotate-[-12deg] scale-75 -translate-x-3 z-0 opacity-0 pointer-events-none';
  } else if (offsetFromActive === 1) {
    // Próximo turno
    stateClasses = 'rotate-[-6deg] scale-95 z-25 opacity-90 hover:opacity-100 hover:scale-100 hover:rotate-[-2deg] hover:translate-x-1.5';
  } else if (offsetFromActive === 2) {
    stateClasses = 'rotate-[-6deg] scale-90 z-20 opacity-70 hover:opacity-95 hover:scale-95 hover:rotate-[-2deg]';
  } else if (offsetFromActive === 3) {
    stateClasses = 'rotate-[-6deg] scale-85 z-15 opacity-50 hover:opacity-85 hover:scale-90';
  } else if (offsetFromActive === 4) {
    stateClasses = 'rotate-[-6deg] scale-80 z-10 opacity-25 hover:opacity-60';
  } else {
    // Muito distante na fila: invisível para não descer muito na tela
    stateClasses = 'rotate-[-6deg] scale-75 z-0 opacity-0 pointer-events-none';
  }

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      title={`${name} (Iniciativa: ${initiativeValue ?? index + 1}) - Clique para ativar o turno`}
      className={`relative shrink-0 select-none cursor-pointer group transition-all duration-500 ease-out ${stateClasses}`}
      style={{
        transformOrigin: 'left center'
      }}
    >
      {/* Marcador Superior de Turno Ativo */}
      {isActive && (
        <div
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40 px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 shadow-lg border animate-bounce"
          style={{
            backgroundColor: '#000',
            borderColor: borderColor || '#eab308',
            color: borderColor || '#eab308'
          }}
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>TURNO</span>
        </div>
      )}

      {/* Corpo da Carta (Proporção ~2:3) */}
      <div
        className="w-[66px] h-[98px] sm:w-[74px] sm:h-[108px] rounded-xl overflow-hidden relative flex flex-col transition-all shadow-[3px_4px_12px_rgba(0,0,0,0.8)]"
        style={{
          border: `2.5px solid ${borderColor || '#ef4444'}`,
          boxShadow: isActive
            ? `0 0 18px ${borderColor || '#eab308'}aa, 0 4px 14px rgba(0,0,0,0.9)`
            : '0 3px 10px rgba(0,0,0,0.7)'
        }}
      >
        {/* ── 1. CARTA DE INIMIGO PADRÃO (Preta com detalhes vermelhos) ── */}
        {type === 'enemy' ? (
          <div className="w-full h-full bg-zinc-950 flex flex-col justify-between p-1.5 relative">
            {/* Vinheta sombria de fundo */}
            <div className="absolute inset-0 bg-radial from-red-950/20 via-transparent to-black pointer-events-none" />

            {/* Cabeçalho */}
            <div className="flex items-center justify-between text-[8px] font-mono font-black tracking-widest text-red-500 z-10">
              <span className="truncate">{tag || 'INIMIGO'}</span>
              {initiativeValue !== undefined && (
                <span className="bg-red-950/80 px-1 py-0.2 rounded text-[8px] text-red-300 border border-red-800/60">
                  {initiativeValue}
                </span>
              )}
            </div>

            {/* Ilustração Central: Caveira com detalhes vermelhos */}
            <div className="my-auto flex flex-col items-center justify-center relative z-10">
              <div
                className="w-10 h-10 rounded-full bg-black/90 border border-red-700/60 flex items-center justify-center shadow-inner"
                style={{
                  boxShadow: `inset 0 0 8px ${borderColor || '#ef4444'}44`
                }}
              >
                <Skull
                  className="w-6 h-6 text-red-500 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]"
                />
              </div>
            </div>

            {/* Rodapé: Faixa de Nome */}
            <div className="z-10 bg-black/90 border-t border-red-900/60 -mx-1.5 -mb-1.5 py-1 px-1 text-center">
              <span className="block text-[9px] font-mono font-black text-zinc-100 uppercase truncate leading-tight">
                {name}
              </span>
            </div>
          </div>
        ) : type === 'ally' ? (
          /* ── 2. CARTA DE ALIADO PADRÃO (Branca com detalhes azuis) ── */
          <div className="w-full h-full bg-slate-50 flex flex-col justify-between p-1.5 relative text-zinc-900">
            {/* Vinheta azul suave */}
            <div className="absolute inset-0 bg-radial from-blue-100/40 via-transparent to-slate-200/50 pointer-events-none" />

            {/* Cabeçalho */}
            <div className="flex items-center justify-between text-[8px] font-mono font-black tracking-widest text-blue-700 z-10">
              <span className="truncate">{tag || 'ALIADO'}</span>
              {initiativeValue !== undefined && (
                <span className="bg-blue-100 px-1 py-0.2 rounded text-[8px] text-blue-800 border border-blue-300">
                  {initiativeValue}
                </span>
              )}
            </div>

            {/* Ilustração Central: Escudo com detalhes azuis */}
            <div className="my-auto flex flex-col items-center justify-center relative z-10">
              <div
                className="w-10 h-10 rounded-full bg-white border border-blue-400/80 flex items-center justify-center shadow"
                style={{
                  boxShadow: `0 0 8px ${borderColor || '#3b82f6'}33`
                }}
              >
                <Shield
                  className="w-6 h-6 text-blue-600 filter drop-shadow-[0_0_4px_rgba(37,99,235,0.6)]"
                />
              </div>
            </div>

            {/* Rodapé: Faixa de Nome */}
            <div className="z-10 bg-blue-900 text-white -mx-1.5 -mb-1.5 py-1 px-1 text-center border-t border-blue-700">
              <span className="block text-[9px] font-mono font-black uppercase truncate leading-tight">
                {name}
              </span>
            </div>
          </div>
        ) : isFullCardArt && displayImage ? (
          /* ── 3. PERSONAGEM / ARTE COMPLETA DE CARTA (TCG / Card vertical) ── */
          <div className="w-full h-full relative bg-zinc-950 flex flex-col justify-between">
            <img
              src={displayImage}
              alt={name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradiente superior para ler iniciativa/tag */}
            <div className="relative z-10 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-1 flex items-center justify-between text-[8px] font-mono font-bold text-white">
              <span className="truncate drop-shadow">{tag || 'NPC'}</span>
              {initiativeValue !== undefined && (
                <span className="bg-black/70 px-1 rounded text-[8px] border border-zinc-700">
                  {initiativeValue}
                </span>
              )}
            </div>

            {/* Gradiente inferior com nome */}
            <div className="relative z-10 bg-gradient-to-t from-black via-black/90 to-transparent p-1 pt-3 text-center">
              <span className="block text-[9px] font-mono font-black text-white uppercase truncate drop-shadow">
                {name}
              </span>
            </div>
          </div>
        ) : (
          /* ── 4. PERSONAGEM / MOLDE PADRÃO DE CARTA COM AVATAR QUADRADO ── */
          <div className="w-full h-full bg-zinc-900 flex flex-col justify-between p-1.5 relative">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between text-[8px] font-mono font-bold text-zinc-300 z-10">
              <span className="truncate max-w-[45px] text-zinc-400">{tag || 'NPC'}</span>
              {initiativeValue !== undefined && (
                <span className="bg-black/60 px-1 py-0.2 rounded text-[8px] text-zinc-200 border border-zinc-700">
                  {initiativeValue}
                </span>
              )}
            </div>

            {/* Centro: Molde com Avatar */}
            <div className="my-auto flex flex-col items-center justify-center relative z-10">
              <div
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-black border overflow-hidden flex items-center justify-center shrink-0 shadow-md"
                style={{ borderColor: borderColor || '#52525b' }}
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Swords className="w-5 h-5 text-zinc-500" />
                )}
              </div>
            </div>

            {/* Rodapé: Nome */}
            <div className="z-10 bg-black/95 border-t border-zinc-800 -mx-1.5 -mb-1.5 py-1 px-1 text-center">
              <span className="block text-[9px] font-mono font-black text-zinc-100 uppercase truncate leading-tight">
                {name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
