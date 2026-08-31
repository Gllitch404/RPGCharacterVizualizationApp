import React from 'react';
import { PanelLeftOpen } from 'lucide-react';

interface QuickControlsProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const QuickControls: React.FC<QuickControlsProps> = ({
  isSidebarOpen,
  onToggleSidebar
}) => {
  return (
    <div className="fixed top-4 left-4 z-40 flex items-center pointer-events-auto font-mono">
      {!isSidebarOpen && (
        <button
          onClick={onToggleSidebar}
          className="group flex items-center gap-2 px-3.5 py-2 bg-zinc-950/90 hover:bg-zinc-900 text-white hover:text-red-400 backdrop-blur-md border-2 border-zinc-700 shadow-[4px_4px_0px_#000] transition-all active:scale-95 text-xs font-bold uppercase rounded-lg"
          title="Abrir Painel de Controle (Atalho: H)"
        >
          <PanelLeftOpen className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
          <span>CONTROLES</span>
          <kbd className="px-1.5 py-0.5 bg-black text-[10px] text-zinc-400 border border-zinc-800 rounded">
            H
          </kbd>
        </button>
      )}
    </div>
  );
};
