import React, { useState } from 'react';
import { NPC, StageTheme } from '../../types';
import { NPCCard } from './NPCCard';
import { SettingsTab } from './SettingsTab';
import {
  Users,
  UserPlus,
  VolumeX,
  Sliders,
  HelpCircle,
  ChevronLeft,
  Eye,
  EyeOff,
  Flame
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  npcs: NPC[];
  theme: StageTheme;
  enableVignette: boolean;
  enableFilmGrain: boolean;
  enableScanlines: boolean;
  activeSpeakerId: string | null;
  backgroundUrl: string;
  isTransparentBg: boolean;
  onSetTheme: (theme: StageTheme) => void;
  onSetEnableVignette: (val: boolean) => void;
  onSetEnableFilmGrain: (val: boolean) => void;
  onSetEnableScanlines: (val: boolean) => void;
  onToggleSpeaker: (id: string) => void;
  onToggleStage: (id: string) => void;
  onDeleteNPC: (id: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (npc: NPC) => void;
  onSilenceAll: () => void;
  onSetBackgroundUrl: (url: string) => void;
  onSetIsTransparentBg: (val: boolean) => void;
  onResetToDefaults: () => void;
  onOpenGuide: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  npcs,
  theme,
  enableVignette,
  enableFilmGrain,
  enableScanlines,
  activeSpeakerId,
  backgroundUrl,
  isTransparentBg,
  onSetTheme,
  onSetEnableVignette,
  onSetEnableFilmGrain,
  onSetEnableScanlines,
  onToggleSpeaker,
  onToggleStage,
  onDeleteNPC,
  onOpenCreateModal,
  onOpenEditModal,
  onSilenceAll,
  onSetBackgroundUrl,
  onSetIsTransparentBg,
  onResetToDefaults,
  onOpenGuide
}) => {
  const [activeTab, setActiveTab] = useState<'npcs' | 'settings'>('npcs');
  const [filter, setFilter] = useState<'all' | 'stage' | 'bench'>('all');

  const stageCount = npcs.filter(n => n.isOnStage).length;
  const benchCount = npcs.length - stageCount;

  const filteredNpcs = npcs.filter(npc => {
    if (filter === 'stage') return npc.isOnStage;
    if (filter === 'bench') return !npc.isOnStage;
    return true;
  });

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 w-full max-w-sm sm:max-w-md bg-zinc-950/95 backdrop-blur-xl border-r-2 border-red-600/70 shadow-[10px_0px_30px_rgba(0,0,0,0.8)] flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header do Painel */}
      <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-black/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-600 flex items-center justify-center rotate-3">
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h1 className="text-sm font-mono font-black text-white leading-none tracking-wider uppercase">
              OVERLAY DE PERSONAGENS
            </h1>
            <span className="text-[10px] font-mono text-red-400 font-bold tracking-widest uppercase">
              {theme === 'ordem' ? 'ORDEM PARANORMAL' : theme === 'cthulhu' ? 'CALL OF CTHULHU' : 'PERSONA CUT-IN'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenGuide}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            title="Guia Stream Deck e OBS"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            title="Recolher Painel (Atalho: H)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Ações Globais de Controle Rápido */}
      <div className="p-3 bg-black/40 border-b border-zinc-800 flex items-center gap-2 font-mono">
        <button
          onClick={onSilenceAll}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
            activeSpeakerId !== null
              ? 'bg-red-950/60 border-red-600 text-red-200 hover:bg-red-900/60 animate-pulse shadow-[2px_2px_0px_#000]'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
          }`}
          title="Silenciar todos os NPCs (Atalho: Esc ou Espaço)"
        >
          <VolumeX className="w-4 h-4" />
          <span>Silenciar Todos</span>
          <kbd className="px-1.5 py-0.5 rounded bg-black text-[10px] text-zinc-400 border border-zinc-800">
            Esc
          </kbd>
        </button>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_#000] active:scale-95"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo</span>
        </button>
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-zinc-800 px-3 pt-2 bg-black/20 font-mono">
        <button
          onClick={() => setActiveTab('npcs')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'npcs'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Personagens ({npcs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-red-500 text-red-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Atmosfera & FX</span>
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {activeTab === 'npcs' ? (
          <>
            {/* Filtros da Lista */}
            <div className="flex items-center gap-1.5 p-1 bg-black rounded-lg border border-zinc-800 text-[11px] font-mono">
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 py-1 px-2 rounded-md font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Todos ({npcs.length})
              </button>
              <button
                onClick={() => setFilter('stage')}
                className={`flex-1 py-1 px-2 rounded-md font-bold transition-all flex items-center justify-center gap-1 ${
                  filter === 'stage'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Em Cena ({stageCount})</span>
              </button>
              <button
                onClick={() => setFilter('bench')}
                className={`flex-1 py-1 px-2 rounded-md font-bold transition-all flex items-center justify-center gap-1 ${
                  filter === 'bench'
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <EyeOff className="w-3 h-3" />
                <span>Banco ({benchCount})</span>
              </button>
            </div>

            {/* Lista de Cards de NPCs */}
            {filteredNpcs.length > 0 ? (
              <div className="space-y-2.5">
                {filteredNpcs.map(npc => (
                  <NPCCard
                    key={npc.id}
                    npc={npc}
                    theme={theme}
                    isActive={activeSpeakerId === npc.id}
                    onToggleSpeaker={onToggleSpeaker}
                    onToggleStage={onToggleStage}
                    onEdit={onOpenEditModal}
                    onDelete={onDeleteNPC}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-black/40 rounded-2xl border border-dashed border-zinc-800 font-mono">
                <p className="text-xs text-zinc-400 mb-3">Nenhum personagem nesta visualização.</p>
                <button
                  onClick={onOpenCreateModal}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded-lg transition-all"
                >
                  Cadastrar Personagem
                </button>
              </div>
            )}
          </>
        ) : (
          <SettingsTab
            theme={theme}
            enableVignette={enableVignette}
            enableFilmGrain={enableFilmGrain}
            enableScanlines={enableScanlines}
            backgroundUrl={backgroundUrl}
            isTransparentBg={isTransparentBg}
            onSetTheme={onSetTheme}
            onSetEnableVignette={onSetEnableVignette}
            onSetEnableFilmGrain={onSetEnableFilmGrain}
            onSetEnableScanlines={onSetEnableScanlines}
            onSetBackgroundUrl={onSetBackgroundUrl}
            onSetIsTransparentBg={onSetIsTransparentBg}
            onResetToDefaults={onResetToDefaults}
          />
        )}
      </div>

      {/* Rodapé da Barra Lateral */}
      <div className="px-4 py-2.5 bg-black border-t border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
        <span>Ocultar controles:</span>
        <kbd className="px-2 py-0.5 rounded bg-zinc-900 text-red-400 font-bold border border-zinc-800">
          Tecla H
        </kbd>
      </div>
    </aside>
  );
};
