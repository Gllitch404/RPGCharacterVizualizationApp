import React, { useEffect, useState } from 'react';
import { Maximize, Minimize, PanelLeftOpen, ExternalLink, Sliders } from 'lucide-react';

interface QuickControlsProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenControlsPage?: () => void;
}

export const QuickControls: React.FC<QuickControlsProps> = ({
  isSidebarOpen,
  onToggleSidebar,
  onOpenControlsPage
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    handleFullscreenChange();

    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await document.documentElement.requestFullscreen();
  };

  const handleOpenControls = () => {
    if (onOpenControlsPage) {
      onOpenControlsPage();
    } else {
      window.open('/controls', '_blank');
    }
  };

  return (
    <div className="fixed top-4 left-4 z-40 flex items-center pointer-events-auto font-mono flex-wrap gap-2">
      {!isSidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className="group flex items-center gap-2 px-3.5 py-2 bg-zinc-950/90 hover:bg-zinc-900 text-white hover:text-red-400 backdrop-blur-md border-2 border-zinc-700 shadow-[4px_4px_0px_#000] transition-all active:scale-95 text-xs font-bold uppercase rounded-lg"
          title="Abrir Painel Lateral (Atalho: H)"
        >
          <PanelLeftOpen className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          <span>GAVETA</span>
          <kbd className="px-1.5 py-0.5 bg-black text-[10px] text-zinc-400 border border-zinc-800 rounded">
            H
          </kbd>
        </button>
      )}

      {/* Botão para abrir a página dedicada de controles em nova aba/janela */}
      <button
        onClick={handleOpenControls}
        className="group flex items-center gap-2 px-3.5 py-2 bg-zinc-950/90 hover:bg-zinc-900 text-white hover:text-red-400 backdrop-blur-md border-2 border-zinc-700 shadow-[4px_4px_0px_#000] transition-all active:scale-95 text-xs font-bold uppercase rounded-lg"
        title="Abrir a Página Completa de Controles do Mestre em nova aba/janela"
      >
        <Sliders className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
        <span>PÁGINA DE CONTROLES</span>
        <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-red-400 transition-colors" />
      </button>

      <button
        onClick={() => void toggleFullscreen()}
        className="group flex items-center gap-2 px-3.5 py-2 bg-zinc-950/90 hover:bg-zinc-900 text-white hover:text-red-400 backdrop-blur-md border-2 border-zinc-700 shadow-[4px_4px_0px_#000] transition-all active:scale-95 text-xs font-bold uppercase rounded-lg"
        title={isFullscreen ? 'Sair da Tela Cheia (Atalho: Esc)' : 'Entrar em Tela Cheia'}
        aria-label={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
      >
        {isFullscreen ? (
          <Minimize className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
        ) : (
          <Maximize className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
        )}
        <span>{isFullscreen ? 'SAIR' : 'TELA CHEIA'}</span>
      </button>
    </div>
  );
};
