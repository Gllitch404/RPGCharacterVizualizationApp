import React, { createContext, useContext } from 'react';
import { useSoundboard } from '../hooks/useSoundboard';

type SoundboardContextType = ReturnType<typeof useSoundboard>;

const SoundboardContext = createContext<SoundboardContextType | null>(null);

export const SoundboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const soundboard = useSoundboard();

  return (
    <SoundboardContext.Provider value={soundboard}>
      {children}

      {/* 
        Elementos de Áudio e Players YouTube mantidos vivos permanentemente fora da tela.
        Nunca use display: none aqui para que o navegador não congele ou pause o áudio em segundo plano!
      */}
      <div
        className="fixed -left-[9999px] -top-[9999px] w-px h-px overflow-hidden pointer-events-none opacity-0"
        aria-hidden="true"
      >
        <div id="yt-soundboard-player-a" />
        <div id="yt-soundboard-player-b" />
      </div>
    </SoundboardContext.Provider>
  );
};

export const useSoundboardContext = () => {
  const context = useContext(SoundboardContext);
  if (!context) {
    throw new Error('useSoundboardContext must be used within a SoundboardProvider');
  }
  return context;
};
