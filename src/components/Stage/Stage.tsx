import React from 'react';
import { StageConfig } from '../../types';
import { NPCAvatar } from './NPCAvatar';
import { ScreenFX } from './ScreenFX';
import { Users } from 'lucide-react';

interface StageProps {
  stageConfig: StageConfig;
  toggleSpeaker: (id: string) => void;
  onOpenSidebar?: () => void;
}

export const Stage: React.FC<StageProps> = ({
  stageConfig,
  toggleSpeaker,
  onOpenSidebar
}) => {
  const {
    backgroundUrl,
    theme,
    enableVignette,
    enableFilmGrain,
    enableScanlines,
    activeSpeakerId,
    npcs,
    isTransparentBg
  } = stageConfig;

  // Filtrar apenas NPCs marcados como visíveis no palco
  const stageNPCs = npcs.filter(npc => npc.isOnStage);

  return (
    <main className="relative w-full h-screen overflow-hidden flex flex-col justify-end bg-black select-none">
      {/* 1. Background do Palco (Cenário ou Fundo Transparente para OBS) */}
      {!isTransparentBg ? (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-in-out"
          style={{
            backgroundImage: backgroundUrl ? `url("${backgroundUrl}")` : undefined,
            backgroundColor: '#09090b'
          }}
        >
          {/* Sombra de contraste para destacar os sprites recortados */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-transparent" />
      )}

      {/* 2. Camadas de Pós-Processamento da Tela (Vinheta, Scanlines CRT, Film Grain) */}
      <ScreenFX
        theme={theme}
        enableVignette={enableVignette}
        enableFilmGrain={enableFilmGrain}
        enableScanlines={enableScanlines}
      />

      {/* 3. Área dos Sprites de NPCs (Alinhados na base com estética Persona) */}
      <section
        aria-label="Palco dos Personagens"
        className="relative z-30 w-full h-full min-h-screen flex items-end justify-center px-0 sm:px-4 pb-0 overflow-hidden pointer-events-auto"
      >
        {stageNPCs.length > 0 ? (
          stageNPCs.map(npc => (
            <NPCAvatar
              key={npc.id}
              npc={npc}
              theme={theme}
              isActive={activeSpeakerId === npc.id}
              hasOtherSpeaker={activeSpeakerId !== null && activeSpeakerId !== npc.id}
              onToggle={toggleSpeaker}
              totalStageCount={stageNPCs.length}
            />
          ))
        ) : (
          <div
            className="my-auto flex flex-col items-center justify-center p-8 text-center bg-zinc-950/90 backdrop-blur-md border-2 border-red-600/60 max-w-md shadow-[8px_8px_0px_#000]"
            style={{ clipPath: 'polygon(4% 0%, 100% 0%, 96% 100%, 0% 100%)' }}
          >
            <div className="w-16 h-16 bg-red-600/10 border-2 border-red-600/40 flex items-center justify-center mb-4 rotate-3">
              <Users className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-mono font-black text-white uppercase tracking-wider mb-2">
              NENHUM AGENTE EM CENA
            </h2>
            <p className="text-xs text-zinc-400 mb-6 font-mono leading-relaxed">
              Abra o painel de controle e coloque os personagens <strong>[EM CENA]</strong>.
            </p>
            {onOpenSidebar && (
              <button
                onClick={onOpenSidebar}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs uppercase tracking-widest transition-all shadow-[4px_4px_0px_#000] active:scale-95"
              >
                ABRIR PAINEL DE CONTROLE
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
};
