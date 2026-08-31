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
  const dominantColor = useImageColor(npc.avatarUrl, npc.accentColor || '#e11d48');

  // Limite horizontal para quando há apenas 1 personagem em cena
  const singleCharMaxWidth = totalStageCount === 1 ? '520px' : undefined;

  const activeSpriteFilter = [
    'grayscale(0%)',
    `drop-shadow(0 0 28px ${dominantColor}cc)`,
    `drop-shadow(0 0 55px ${dominantColor}55)`,
    'drop-shadow(6px 6px 0px rgba(0,0,0,0.9))',
    'brightness(1.08)',
  ].join(' ');

  return (
    <div
      onClick={() => onToggle(npc.id)}
      role="button"
      tabIndex={0}
      aria-label={`${npc.name} - Atalho: ${npc.shortcutKey}`}
      className={`group relative h-screen flex-1 min-w-0 cursor-pointer select-none ${
        isActive ? 'z-30' : 'z-10 hover:z-20'
      }`}
      style={{ maxWidth: singleCharMaxWidth }}
    >
      {/* ── FUNDO DO POLÍGONO ──────────────────────────────────────────────
          Sempre recortado. Muda de sutil → vibrante/opaco quando ativo.
      ─────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: 'polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)',
          // Ativo: 100% opaco com cor forte. Inativo: leve tint semi-transparente
          background: isActive
            ? `linear-gradient(to bottom, ${dominantColor} 0%, ${dominantColor}cc 30%, rgba(9,9,11,0.97) 100%)`
            : `linear-gradient(to bottom, ${dominantColor}30 0%, ${dominantColor}15 55%, transparent 100%)`,
          transition: 'background 350ms ease',
        }}
      >
        {/* Linhas diagonais de velocidade quando ativo */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isActive ? 1 : 0,
            background: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.06) 20px, rgba(255,255,255,0.06) 40px)'
          }}
        />
      </div>

      {/* ── IMAGEM ÚNICA DO PERSONAGEM ─────────────────────────────────────
          Uma única <img> que:
          - Ocupa sempre os mesmos bounds (inset: 0)
          - Quando inativo: clipped ao polígono via clip-path no wrapper, object-cover, P&B
          - Quando ativo: clip removido (sem animação de clip), escala sobe suavemente,
            filtro muda para colorido — NENHUMA mudança de tamanho/posição do wrapper
          O clip-path muda INSTANTANEAMENTE (0ms) para evitar o efeito de encolher/crescer.
      ─────────────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 flex items-end justify-center pointer-events-none"
        style={{
          clipPath: isActive ? 'none' : 'polygon(12% 0%, 100% 0%, 88% 100%, 0% 100%)',
          // clip-path sem animação — troca instantânea evita o glitch de "encolher"
          transition: 'none',
          overflow: 'visible',
          zIndex: isActive ? 20 : 10,
        }}
      >
        <img
          src={npc.avatarUrl}
          alt={npc.name}
          className="w-full h-full select-none"
          style={{
            objectFit: 'cover',
            objectPosition: 'top center',
            // Escala sutil: 1.0 (inativo) → 1.10 (ativo). Origem no topo para manter cabeça estática.
            transform: isActive ? 'scale(1.10)' : 'scale(1.0)',
            transformOrigin: 'top center',
            // Filtro anima suavemente: P&B escuro → colorido com glow
            filter: isActive
              ? activeSpriteFilter
              : 'grayscale(100%) brightness(0.7)',
            opacity: isActive ? 1 : 0.5,
            // Transição APENAS de filter/opacity/transform — sem mudança de layout
            transition: 'filter 280ms ease, opacity 280ms ease, transform 320ms ease',
          }}
          loading="eager"
        />
      </div>
    </div>
  );
};
