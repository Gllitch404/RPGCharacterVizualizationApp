import React from 'react';
import { StageTheme } from '../../types';

interface ScreenFXProps {
  theme: StageTheme;
  enableVignette: boolean;
  enableFilmGrain: boolean;
  enableScanlines: boolean;
  enableBlur?: boolean;
  blurIntensity?: number;
  blurTarget?: 'background' | 'all';
}

export const ScreenFX: React.FC<ScreenFXProps> = ({
  theme,
  enableVignette,
  enableFilmGrain,
  enableScanlines,
  enableBlur = false,
  blurIntensity = 8,
  blurTarget = 'background'
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* 0. Camada de Desfoque / Borrão de Imagem no Fundo (Bokeh / Profundidade de Campo) */}
      {enableBlur && blurTarget === 'background' && (
        <div
          className="absolute inset-0 transition-all duration-500 pointer-events-none"
          style={{
            backdropFilter: `blur(${blurIntensity}px)`,
            WebkitBackdropFilter: `blur(${blurIntensity}px)`,
          }}
        />
      )}

      {/* 1. Camada de Vinheta Escura de Bordas */}
      {enableVignette && (
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            theme === 'ordem'
              ? 'bg-[radial-gradient(circle,transparent_35%,rgba(0,0,0,0.92)_100%)]'
              : theme === 'cthulhu'
              ? 'bg-[radial-gradient(circle,transparent_40%,rgba(6,30,22,0.85)_100%)]'
              : 'bg-[radial-gradient(circle,transparent_55%,rgba(0,0,0,0.75)_100%)]'
          }`}
        />
      )}

      {/* 2. Camada de Scanlines CRT (Estilo Monitor Analógico de Ordem Paranormal) */}
      {enableScanlines && (
        <div className="absolute inset-0 crt-scanlines opacity-40 mix-blend-overlay" />
      )}

      {/* 3. Camada de Film Grain / Ruído Analógico */}
      {enableFilmGrain && (
        <div
          className={`absolute inset-0 film-grain mix-blend-overlay ${
            theme === 'cthulhu' ? 'opacity-80' : 'opacity-45'
          }`}
        />
      )}

      {/* Efeito sutil de aberração cromática nas bordas para o tema Ordem */}
      {theme === 'ordem' && enableScanlines && (
        <div className="absolute inset-0 border-[3px] border-red-600/10 pointer-events-none" />
      )}
    </div>
  );
};

