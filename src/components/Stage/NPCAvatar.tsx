import React from 'react';
import { NPC, StageTheme } from '../../types';
import { useImageColor } from '../../hooks/useImageColor';

interface NPCAvatarProps {
  npc: NPC;
  theme: StageTheme;
  isActive: boolean;
  hasOtherSpeaker: boolean;
  onToggle: (id: string) => void;
  totalStageCount: number;
}

export const NPCAvatar: React.FC<NPCAvatarProps> = ({
  npc,
  isActive,
  onToggle,
  totalStageCount,
}) => {
  const dominantColor = useImageColor(npc.avatarUrl, npc.accentColor || '#ea580c');

  // Limite horizontal quando há apenas 1 personagem em cena
  const singleCharMaxWidth = totalStageCount === 1 ? '480px' : undefined;

  const activeSpriteFilter = [
    'grayscale(0%)',
    `drop-shadow(0 0 30px ${dominantColor}cc)`,
    `drop-shadow(0 0 60px ${dominantColor}55)`,
    'drop-shadow(6px 6px 0px rgba(0,0,0,0.85))',
    'brightness(1.10)',
  ].join(' ');

  return (
    <div
      onClick={() => onToggle(npc.id)}
      role="button"
      tabIndex={0}
      aria-label={`${npc.name} - Atalho: ${npc.shortcutKey}`}
      className={`group relative h-screen flex-1 min-w-0 cursor-pointer select-none flex items-center justify-center ${
        isActive ? 'z-30' : 'z-10 hover:z-20'
      }`}
      style={{ maxWidth: singleCharMaxWidth }}
    >
      {/* ── 1. POLÍGONO DE FUNDO ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: 'polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)',
          // Ativo: 100% OPACO e vibrante exatamente como na referência. Inativo: leve sugestão translúcida
          background: isActive
            ? `linear-gradient(to bottom, ${dominantColor} 0%, ${dominantColor}f0 40%, ${dominantColor}dd 100%)`
            : `linear-gradient(to bottom, ${dominantColor}35 0%, ${dominantColor}18 50%, transparent 100%)`,
          boxShadow: isActive ? `0 0 40px ${dominantColor}99` : 'none',
          transition: 'background 200ms ease, box-shadow 200ms ease',
        }}
      >
        {/* Linhas diagonais de ação no estilo Persona quando ativo */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200"
          style={{
            opacity: isActive ? 1 : 0,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 18px, rgba(255,255,255,0.08) 18px, rgba(255,255,255,0.08) 36px)',
          }}
        />
      </div>

      {/* ── 2. IMAGEM PREENCHENDO 100% DO POLÍGONO (OBJECT-COVER) ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          // Inativo: o corte acompanha exatamente o polígono
          // Ativo: corte removido para vazar além dos limites (efeito break-out)
          clipPath: isActive ? 'none' : 'polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)',
          zIndex: isActive ? 20 : 10,
        }}
      >
        <img
          src={npc.avatarUrl}
          alt={npc.name}
          className="w-full h-full select-none pointer-events-none"
          style={{
            objectFit: 'cover',
            objectPosition: 'center 30%',
            // Preenche todo o polígono e salta para fora ao ativar
            transform: isActive ? 'scale(1.14)' : 'scale(1.0)',
            transformOrigin: 'center 40%',
            filter: isActive ? activeSpriteFilter : 'grayscale(100%) brightness(0.7) contrast(1.05)',
            opacity: isActive ? 1 : 0.45,
            transition: 'filter 250ms ease, opacity 250ms ease, transform 250ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          loading="eager"
        />
      </div>
    </div>
  );
};
