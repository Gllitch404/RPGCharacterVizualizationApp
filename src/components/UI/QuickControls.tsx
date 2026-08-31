import React, { useState, useEffect } from 'react';
import { PanelLeftOpen, Maximize2, Minimize2 } from 'lucide-react';

interface QuickControlsProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const QuickControls: React.FC<QuickControlsProps> = ({
  isSidebarOpen,
  onToggleSidebar
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sincroniza o estado com as mudanças de tela cheia (ex: tecla Esc)
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Erro ao entrar em tela cheia:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Erro ao sair de tela cheia:', err);
      });
    }
  };

  const btnBase = 'flex items-center justify-center gap-2 px-3.5 py-2 bg-zinc-950/90 hover:bg-zinc-900 text-white backdrop-blur-md border-2 border-zinc-700 shadow-[4px_4px_0px_#000] transition-all active:scale-95 text-xs font-bold uppercase rounded-lg';

  return (
    <div className="fixed top-4 left-4 z-40 flex items-center gap-2 pointer-events-auto font-mono">
      {/* Botão de Controles — esconde quando sidebar está aberta */}
      {!isSidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className={`group ${btnBase} hover:text-red-400`}
          title="Abrir Painel de Controle (Atalho: H)"
        >
          <PanelLeftOpen className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          <span>CONTROLES</span>
          <kbd className="px-1.5 py-0.5 bg-black text-[10px] text-zinc-400 border border-zinc-800 rounded">H</kbd>
        </button>
      )}

      {/* Botão de Tela Cheia — sempre visível */}
      <button
        onClick={toggleFullscreen}
        className={`group ${btnBase} hover:text-amber-400`}
        title={isFullscreen ? 'Sair de Tela Cheia (F11)' : 'Entrar em Tela Cheia (F11)'}
      >
        {isFullscreen
          ? <Minimize2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          : <Maximize2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
        }
      </button>
    </div>
  );
};
