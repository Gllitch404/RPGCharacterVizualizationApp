import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNPCState } from '../hooks/useNPCState';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { NPC, ScenePreset } from '../types';
import { NPCFormModal } from '../components/Sidebar/NPCFormModal';
import { StreamDeckModal } from '../components/UI/StreamDeckModal';
import { SettingsTab } from '../components/Sidebar/SettingsTab';
import { SoundboardTab } from '../components/Soundboard/SoundboardTab';
import { InitiativeTab } from '../components/Initiative/InitiativeTab';
import { useSoundboardContext } from '../context/SoundboardContext';
import {
  saveCampaignToDisk,
  exportCampaignToFile,
  importCampaignFromFile,
  CampaignSaveData
} from '../utils/campaignStorage';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Plus,
  Tv,
  ExternalLink,
  HelpCircle,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  Sliders,
  Users,
  Search,
  Radio,
  Copy,
  Check,
  Flame,
  Monitor,
  Music,
  Clapperboard,
  BookmarkPlus,
  Layers,
  X,
  Save,
  Download,
  Upload,
  Swords
} from 'lucide-react';

interface ControlsPageProps {
  onOpenStage?: (newTab?: boolean) => void;
}

export const ControlsPage: React.FC<ControlsPageProps> = ({ onOpenStage }) => {
  const soundboard = useSoundboardContext();
  const {
    npcs,
    theme,
    enableVignette,
    enableFilmGrain,
    enableScanlines,
    enableBlur,
    blurIntensity,
    blurTarget,
    backgroundUrl,
    isTransparentBg,
    hideStageControls,
    activeSpeakerId,
    setTheme,
    setEnableVignette,
    setEnableFilmGrain,
    setEnableScanlines,
    setEnableBlur,
    setBlurIntensity,
    setBlurTarget,
    setBackgroundUrl,
    setIsTransparentBg,
    setHideStageControls,
    addNPC,
    updateNPC,
    deleteNPC,
    toggleOnStage,
    setStageNPCs,
    clearStage,
    putAllOnStage,
    toggleSpeaker,
    silenceAll,
    resetToDefaults,
    restoreCampaign,
    initiative,
    nextTurn,
    prevTurn,
    setActiveTurnIndex,
    toggleInitiativeVisibility,
    addInitiativeItem,
    removeInitiativeItem,
    updateInitiativeItem,
    reorderInitiative,
    sortInitiativeByValue,
    clearInitiative,
    addNPCsToInitiative,
    updateInitiative
  } = useNPCState();

  const [activeTab, setActiveTab] = useState<'roster' | 'initiative' | 'soundboard' | 'settings'>('roster');
  const [filter, setFilter] = useState<'all' | 'stage' | 'bench'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNPC, setEditingNPC] = useState<NPC | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [copiedObsUrl, setCopiedObsUrl] = useState(false);

  // Presets de Encontros / Cenas Rápidas
  const STORAGE_PRESETS_KEY = 'rpg_scene_presets_v1';
  const [scenePresets, setScenePresets] = useState<ScenePreset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRESETS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'preset-default',
        name: 'Elenco Atual',
        npcIds: npcs.filter(n => n.isOnStage).map(n => n.id),
        createdAt: Date.now()
      }
    ];
  });

  const [isSavingPreset, setIsSavingPreset] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PRESETS_KEY, JSON.stringify(scenePresets));
    } catch (e) {}
  }, [scenePresets]);

  const handleApplyPreset = (preset: ScenePreset) => {
    setStageNPCs(preset.npcIds);
    setActivePresetId(preset.id);
  };

  const handleSaveCurrentPreset = () => {
    if (!newPresetName.trim()) return;
    const currentOnStageIds = npcs.filter(n => n.isOnStage).map(n => n.id);
    const newPreset: ScenePreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      npcIds: currentOnStageIds,
      createdAt: Date.now()
    };
    setScenePresets(prev => [...prev, newPreset]);
    setActivePresetId(newPreset.id);
    setNewPresetName('');
    setIsSavingPreset(false);
  };

  const handleDeletePreset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setScenePresets(prev => prev.filter(p => p.id !== id));
    if (activePresetId === id) setActivePresetId(null);
  };

  // Persistência em Disco & Gerenciamento de Campanha (campaign_state.json)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const getCampaignSnapshot = useCallback((): Omit<CampaignSaveData, 'version' | 'savedAt'> => {
    return {
      npcs,
      backgroundUrl,
      theme,
      enableVignette,
      enableFilmGrain,
      enableScanlines,
      enableBlur,
      blurIntensity,
      blurTarget,
      isTransparentBg,
      hideStageControls,
      scenePresets,
      tracks: soundboard.tracks,
      soundboardConfig: soundboard.config,
      initiative
    };
  }, [
    npcs,
    backgroundUrl,
    theme,
    enableVignette,
    enableFilmGrain,
    enableScanlines,
    enableBlur,
    blurIntensity,
    blurTarget,
    isTransparentBg,
    hideStageControls,
    scenePresets,
    soundboard.tracks,
    soundboard.config,
    initiative
  ]);

  const handleSaveToDisk = useCallback(async () => {
    setSaveStatus('saving');
    const snapshot = getCampaignSnapshot();
    const res = await saveCampaignToDisk(snapshot);
    if (res.success) {
      setSaveStatus('saved');
      setLastSavedTime(res.savedAt);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  }, [getCampaignSnapshot]);

  const handleExportBackup = useCallback(() => {
    const snapshot = getCampaignSnapshot();
    exportCampaignToFile({
      ...snapshot,
      version: 1,
      savedAt: Date.now()
    });
  }, [getCampaignSnapshot]);

  const handleImportFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importCampaignFromFile(file);
      restoreCampaign(data);
      if (data.tracks) {
        soundboard.restoreTracks(data.tracks, data.soundboardConfig);
      }
      if (data.scenePresets) {
        setScenePresets(data.scenePresets);
      }
      if (data.initiative) {
        updateInitiative(data.initiative);
      }
      await saveCampaignToDisk(data);
      setSaveStatus('saved');
      setLastSavedTime(Date.now());
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      alert(`Erro ao importar backup: ${err.message}`);
    } finally {
      if (importFileRef.current) importFileRef.current.value = '';
    }
  }, [restoreCampaign, soundboard]);

  // Auto-save inteligente em disco (campaign_state.json) com debounce de 2.5s após alterações
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMountRef = useRef<boolean>(true);

  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      const snapshot = getCampaignSnapshot();
      saveCampaignToDisk(snapshot).then(res => {
        if (res.success) setLastSavedTime(res.savedAt);
      });
    }, 2500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [getCampaignSnapshot]);

  // Ativação de atalhos de teclado (0ms) na página de controles
  useKeyboardShortcuts({
    npcs,
    activeSpeakerId,
    toggleSpeaker,
    silenceAll,
    toggleSidebar: () => {},
    isFormOpen: isFormModalOpen || isGuideModalOpen
  });

  const activeNPC = useMemo(
    () => npcs.find(n => n.id === activeSpeakerId),
    [npcs, activeSpeakerId]
  );

  const stageCount = useMemo(() => npcs.filter(n => n.isOnStage).length, [npcs]);
  const benchCount = npcs.length - stageCount;

  const filteredNPCs = useMemo(() => {
    return npcs.filter(npc => {
      if (filter === 'stage' && !npc.isOnStage) return false;
      if (filter === 'bench' && npc.isOnStage) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = npc.name.toLowerCase().includes(query);
        const matchesTag = npc.tag?.toLowerCase().includes(query);
        const matchesTitle = npc.title?.toLowerCase().includes(query);
        return matchesName || matchesTag || matchesTitle;
      }
      return true;
    });
  }, [npcs, filter, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingNPC(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (npc: NPC) => {
    setEditingNPC(npc);
    setIsFormModalOpen(true);
  };

  const handleSaveNPC = (npcData: Omit<NPC, 'id'>, idToUpdate?: string) => {
    if (idToUpdate) {
      updateNPC(idToUpdate, npcData);
    } else {
      addNPC(npcData);
    }
  };

  const handleCopyObsUrl = () => {
    const stageUrl = `${window.location.origin}/`;
    navigator.clipboard.writeText(stageUrl);
    setCopiedObsUrl(true);
    setTimeout(() => setCopiedObsUrl(false), 2000);
  };

  const handleOpenStage = (inNewTab = true) => {
    if (onOpenStage) {
      onOpenStage(inNewTab);
    } else {
      window.open('/', inNewTab ? '_blank' : '_self');
    }
  };

  return (
    <div className="fixed inset-0 w-screen h-screen max-h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-mono select-none flex flex-col">
      {/* ── HEADER SUPERIOR ────────────────────────────────────────────── */}
      <header className="shrink-0 z-40 bg-black/90 backdrop-blur-xl border-b border-zinc-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Título & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500 flex items-center justify-center rotate-3 shadow-[2px_2px_0px_#000]">
            <Flame className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-white tracking-wider uppercase">
                PAINEL DE CONTROLE DO MESTRE
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SINCRONIZADO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 tracking-wide">
              Central de vozes & cena do RPG Stream Overlay
            </p>
          </div>
        </div>

        {/* Botões de Ação Global no Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botão Silenciar Todos */}
          <button
            onClick={silenceAll}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-rose-950/70 border border-zinc-700 hover:border-rose-600 text-zinc-300 hover:text-rose-300 text-xs font-bold uppercase transition-all shadow-[2px_2px_0px_#000] active:scale-95"
            title="Silenciar todos os personagens (Atalho: Tecla Esc ou Espaço)"
          >
            <VolumeX className="w-4 h-4 text-rose-500" />
            <span>SILENCIAR TODOS</span>
            <kbd className="px-1.5 py-0.5 bg-black text-[10px] text-zinc-400 border border-zinc-800 rounded">
              ESC
            </kbd>
          </button>

          {/* Botão Ocultar / Mostrar Botões no Palco */}
          <button
            onClick={() => setHideStageControls(!hideStageControls)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase transition-all shadow-[2px_2px_0px_#000] active:scale-95 border ${
              hideStageControls
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 hover:bg-amber-900/80 ring-1 ring-amber-500/50'
                : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title={
              hideStageControls
                ? 'Os botões de comando estão OCULTOS no Palco (Modo Limpo para OBS). Clique para exibir novamente.'
                : 'Oculta todos os botões de comando da tela principal do Palco (Modo Palco 100% Limpo para OBS).'
            }
          >
            {hideStageControls ? (
              <>
                <Eye className="w-4 h-4 text-amber-400" />
                <span>PALCO LIMPO (ATIVO)</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-zinc-400" />
                <span>OCULTAR BOTÕES NO PALCO</span>
              </>
            )}
          </button>

          {/* Input oculto para importação de backup */}
          <input
            type="file"
            ref={importFileRef}
            onChange={handleImportFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Persistência de Campanha em Disco (campaign_state.json) */}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-700/80 rounded-xl p-1 shadow-[2px_2px_0px_#000]">
            <button
              onClick={handleSaveToDisk}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                saveStatus === 'saved'
                  ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-500'
                  : saveStatus === 'error'
                  ? 'bg-red-900/80 text-red-300 border border-red-500'
                  : saveStatus === 'saving'
                  ? 'bg-zinc-800 text-zinc-400 cursor-wait'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white'
              }`}
              title="Salvar no disco (campaign_state.json) para persistir mesmo ao parar com Ctrl+C e reabrir pelo iniciar.bat"
            >
              <Save className={`w-3.5 h-3.5 ${saveStatus === 'saved' ? 'text-emerald-400' : saveStatus === 'saving' ? 'animate-spin text-zinc-400' : 'text-emerald-400'}`} />
              <span>
                {saveStatus === 'saving'
                  ? 'SALVANDO...'
                  : saveStatus === 'saved'
                  ? 'SALVO!'
                  : saveStatus === 'error'
                  ? 'ERRO'
                  : 'SALVAR'}
              </span>
            </button>

            <button
              onClick={handleExportBackup}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              title="Exportar arquivo de backup da campanha (.json)"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => importFileRef.current?.click()}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
              title="Importar arquivo de backup (.json)"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Abrir Palco em Nova Janela */}
          <button
            onClick={() => handleOpenStage(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-red-500 text-white text-xs font-bold uppercase transition-all shadow-[2px_2px_0px_#000] active:scale-95"
            title="Abrir o Palco/Overlay em uma nova janela ou aba"
          >
            <Tv className="w-4 h-4 text-red-500" />
            <span>VER PALCO</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Guia Stream Deck / OBS */}
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-all"
            title="Guia de Atalhos e OBS Studio"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Novo Personagem */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_#000] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>NOVO NPC</span>
          </button>
        </div>
      </header>

      {/* ── BARRA DE STATUS DO ORADOR ATIVO ────────────────────────────── */}
      <section className="shrink-0 bg-zinc-900/60 border-b border-zinc-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${activeNPC ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`} />
            <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider">
              ESTADO ATUAL:
            </span>
          </div>

          {activeNPC ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-lg overflow-hidden border shrink-0"
                style={{ borderColor: activeNPC.accentColor || '#e11d48' }}
              >
                <img
                  src={activeNPC.avatarUrl}
                  alt={activeNPC.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs font-black text-white truncate">
                  {activeNPC.name}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-black text-white uppercase tracking-wider animate-pulse"
                  style={{ backgroundColor: activeNPC.accentColor || '#e11d48' }}
                >
                  FALANDO AGORA
                </span>
                <span className="text-[11px] text-zinc-400">
                  (Atalho: Tecla <strong>{activeNPC.shortcutKey.toUpperCase()}</strong>)
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-zinc-500 italic">
              Nenhum personagem com voz ativa no momento (todos em silêncio)
            </span>
          )}
        </div>

        {activeNPC && (
          <button
            onClick={silenceAll}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-600/60 text-rose-300 text-[11px] font-bold uppercase transition-all"
          >
            MUTAR
          </button>
        )}
      </section>

      {/* ── MINI-PLAYER PERSISTENTE EM SEGUNDO PLANO ─────────────────────── */}
      {activeTab !== 'soundboard' && soundboard.isPlaying && soundboard.activeTrack && (
        <div className="shrink-0 bg-red-950/40 border-b border-red-900/60 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-1 font-mono">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 text-red-400">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <Music className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="text-[11px] font-bold text-red-300 uppercase tracking-wider shrink-0">
                TOCANDO EM SEGUNDO PLANO:
              </span>
              <span className="text-xs font-black text-white truncate">
                {soundboard.activeTrack.title}
              </span>
              <span className="text-[10px] text-red-400 uppercase font-bold shrink-0">
                ({soundboard.activeTrack.category})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Slider de Volume Rápido */}
            <div className="hidden md:flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundboard.config.masterVolume}
                onChange={e => soundboard.setMasterVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-black rounded appearance-none accent-red-500 cursor-pointer"
                title={`Volume Master: ${Math.round(soundboard.config.masterVolume * 100)}%`}
              />
            </div>

            <button
              onClick={() => soundboard.stopAll(1000)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-rose-950 border border-zinc-700 hover:border-rose-600 text-zinc-300 hover:text-rose-300 text-[10px] font-bold uppercase transition-all shadow-sm"
              title="Parar música em execução"
            >
              PARAR
            </button>

            <button
              onClick={() => setActiveTab('soundboard')}
              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase transition-all shadow-sm"
              title="Ir para a Soundboard"
            >
              VER SOUNDBOARD
            </button>
          </div>
        </div>
      )}

      {/* ── NAVEGAÇÃO DE ABAS DO PAINEL ─────────────────────────────────── */}
      <div className="shrink-0 px-4 sm:px-6 pt-4 pb-2 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between gap-4">
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'roster'
                ? 'bg-red-600 text-white shadow-[2px_2px_0px_#000]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>PERSONAGENS & DECK DE FALA</span>
            <span className="px-1.5 py-0.2 rounded-md bg-black/40 text-[10px]">
              {npcs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'settings'
                ? 'bg-red-600 text-white shadow-[2px_2px_0px_#000]'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>PALCO & AMBIÊNCIA</span>
          </button>

          <button
            onClick={() => setActiveTab('initiative')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'initiative'
                ? 'bg-red-600 text-white shadow-[2px_2px_0px_#000]'
                : initiative.items.length > 0
                ? 'bg-zinc-900 border border-red-500/50 text-red-300 hover:text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Swords className="w-4 h-4 text-red-400" />
            <span>INICIATIVA</span>
            {initiative.items.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-black/50 text-[10px] text-red-400 font-black">
                {initiative.items.length}
              </span>
            )}
            {initiative.isVisibleOnStage && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Visível no Palco" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('soundboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'soundboard'
                ? 'bg-red-600 text-white shadow-[2px_2px_0px_#000]'
                : soundboard.isPlaying
                ? 'bg-red-950/70 border border-red-600/60 text-red-300 hover:text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Music className={`w-4 h-4 ${soundboard.isPlaying ? 'text-red-400 animate-pulse' : ''}`} />
            <span>SOUNDBOARD & TRILHAS</span>
            {soundboard.isPlaying && (
              <span className="w-2 h-2 rounded-full bg-red-400 animate-ping ml-0.5" />
            )}
          </button>
        </nav>

        {/* Link Rápido para OBS */}
        <button
          onClick={handleCopyObsUrl}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold transition-all"
          title="Copiar URL para Fonte do Navegador no OBS"
        >
          {copiedObsUrl ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">URL COPIADA!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>COPIAR LINK P/ OBS</span>
            </>
          )}
        </button>
      </div>

      {/* ── CONTEÚDO PRINCIPAL (COM SCROLLBAR ATIVA E ACESSÍVEL) ───────────── */}
      <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-28">
        {/* Aba 1: Personagens & Deck de Fala */}
        <div className={activeTab === 'roster' ? 'space-y-6 max-w-7xl mx-auto' : 'hidden'}>
            {/* ── BARRA DE CENAS & PRESETS DE ENCONTRO ────────────────────────── */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 space-y-3 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400">
                    <Clapperboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>CENAS & PRESETS DE ENCONTRO</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/80 border border-emerald-600/50 text-emerald-400 font-bold">
                        {stageCount} NO PALCO
                      </span>
                    </h3>
                    <p className="text-[10px] text-zinc-400">
                      Alterne grupos de personagens no palco com 1 clique rápido
                    </p>
                  </div>
                </div>

                {/* Ações de Limpar Palco, Todos e Salvar Cena Atual */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={clearStage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-[11px] font-bold uppercase transition-all shadow-[1px_1px_0px_#000]"
                    title="Move todos os personagens para o banco de reservas (palco limpo)"
                  >
                    <span>LIMPAR PALCO</span>
                  </button>

                  <button
                    onClick={putAllOnStage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white text-[11px] font-bold uppercase transition-all shadow-[1px_1px_0px_#000]"
                    title="Coloca todos os personagens cadastrados no palco"
                  >
                    <span>TODOS NO PALCO</span>
                  </button>

                  {!isSavingPreset ? (
                    <button
                      onClick={() => setIsSavingPreset(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/60 text-red-300 hover:text-red-200 text-[11px] font-bold uppercase transition-all shadow-[1px_1px_0px_#000]"
                      title="Salva os personagens que estão no palco agora como uma nova cena"
                    >
                      <BookmarkPlus className="w-3.5 h-3.5 text-red-400" />
                      <span>SALVAR CENA ATUAL</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-black/90 p-1 rounded-xl border border-red-500/60 shadow-lg">
                      <input
                        type="text"
                        autoFocus
                        value={newPresetName}
                        onChange={e => setNewPresetName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveCurrentPreset();
                          if (e.key === 'Escape') setIsSavingPreset(false);
                        }}
                        placeholder="Nome da cena (ex: Taverna)..."
                        className="px-2.5 py-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-48 font-sans"
                      />
                      <button
                        onClick={handleSaveCurrentPreset}
                        className="p-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all"
                        title="Confirmar"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsSavingPreset(false)}
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all"
                        title="Cancelar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lista Horizontal de Presets Salvos */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                {scenePresets.map(preset => {
                  const isActive =
                    preset.id === activePresetId ||
                    (preset.npcIds.length === stageCount &&
                      preset.npcIds.every(id => npcs.find(n => n.id === id)?.isOnStage));

                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`group shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                        isActive
                          ? 'bg-red-600 text-white border-red-500 shadow-[2px_2px_0px_#000]'
                          : 'bg-black/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700'
                      }`}
                      title={`Ativar cena "${preset.name}" (${preset.npcIds.length} personagens)`}
                    >
                      <Layers className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-red-400'}`} />
                      <span className="truncate max-w-[150px] uppercase">{preset.name}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] ${isActive ? 'bg-black/40 text-white' : 'bg-zinc-900 text-zinc-400'}`}>
                        {preset.npcIds.length}
                      </span>
                      {scenePresets.length > 1 && (
                        <button
                          onClick={e => handleDeletePreset(preset.id, e)}
                          className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
                          title="Excluir este preset"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Barra de Filtros & Busca */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/60 p-3 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filter === 'all'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  TODOS ({npcs.length})
                </button>
                <button
                  onClick={() => setFilter('stage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filter === 'stage'
                      ? 'bg-emerald-950/80 border border-emerald-600/60 text-emerald-400 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  EM CENA ({stageCount})
                </button>
                <button
                  onClick={() => setFilter('bench')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filter === 'bench'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  NO BANCO ({benchCount})
                </button>
              </div>

              {/* Input de Busca */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar personagem por nome ou tag..."
                  className="w-full pl-9 pr-4 py-2 bg-black/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>

            {/* Grid de Cards de Controle Rápido (Soundboard / Control Deck) */}
            {filteredNPCs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredNPCs.map(npc => {
                  const isActive = activeSpeakerId === npc.id;
                  const accentColor = npc.accentColor || '#e11d48';

                  return (
                    <div
                      key={npc.id}
                      className={`relative rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between gap-4 overflow-hidden ${
                        isActive
                          ? 'bg-zinc-900 border-red-500 shadow-[0_0_25px_rgba(225,29,72,0.25)] ring-1 ring-red-500'
                          : npc.isOnStage
                          ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                          : 'bg-zinc-950 border-zinc-800/60 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {/* Borda decorativa superior colorida */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1"
                        style={{ backgroundColor: accentColor }}
                      />

                      {/* Topo do Card: Avatar, Nome e Tags */}
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div
                          onClick={() => toggleSpeaker(npc.id)}
                          role="button"
                          tabIndex={0}
                          className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 bg-black cursor-pointer group shadow-md"
                          style={{ borderColor: isActive ? accentColor : '#3f3f46' }}
                          title="Clique no avatar para alternar fala"
                        >
                          <img
                            src={npc.avatarUrl}
                            alt={npc.name}
                            className={`w-full h-full object-cover transition-all ${
                              isActive ? 'scale-110' : 'grayscale group-hover:grayscale-0'
                            }`}
                          />
                          <div
                            className={`absolute inset-0 flex items-center justify-center transition-opacity ${
                              isActive
                                ? 'bg-black/30 opacity-100'
                                : 'bg-black/50 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isActive ? (
                              <Mic className="w-6 h-6 text-white animate-pulse" />
                            ) : (
                              <MicOff className="w-5 h-5 text-zinc-300" />
                            )}
                          </div>
                        </div>

                        {/* Dados Textuais */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {npc.tag && (
                              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
                                {npc.tag}
                              </span>
                            )}
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${
                                isActive
                                  ? 'bg-red-600 text-white border-red-400'
                                  : 'bg-black text-zinc-400 border-zinc-800'
                              }`}
                              title={`Atalho: Tecla [ ${npc.shortcutKey.toUpperCase()} ]`}
                            >
                              KEY [{npc.shortcutKey.toUpperCase()}]
                            </span>
                          </div>

                          <h3
                            onClick={() => toggleSpeaker(npc.id)}
                            className={`font-black text-sm truncate mt-1 cursor-pointer hover:underline ${
                              isActive ? 'text-white' : 'text-zinc-200'
                            }`}
                          >
                            {npc.name}
                          </h3>

                          {npc.title ? (
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                              {npc.title}
                            </p>
                          ) : (
                            <p className="text-[10px] text-zinc-500 italic mt-0.5">
                              {npc.isOnStage ? 'Visível no Palco' : 'Reservado no Banco'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botão Principal de Ação de Voz (Grande & Ergonômico) */}
                      <button
                        onClick={() => toggleSpeaker(npc.id)}
                        className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_#000] active:scale-95 ${
                          isActive
                            ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Mic className="w-4 h-4" />
                            <span>FALANDO AGORA (MUTAR)</span>
                          </>
                        ) : (
                          <>
                            <MicOff className="w-4 h-4 text-zinc-400" />
                            <span>ATIVAR VOZ [{npc.shortcutKey.toUpperCase()}]</span>
                          </>
                        )}
                      </button>

                      {/* Rodapé do Card: Em Cena + Editar + Excluir */}
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
                        {/* Toggle Em Cena / Banco */}
                        <button
                          onClick={() => toggleOnStage(npc.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                            npc.isOnStage
                              ? 'bg-emerald-950/60 border border-emerald-600/60 text-emerald-400 hover:bg-emerald-900/60'
                              : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200'
                          }`}
                          title={
                            npc.isOnStage
                              ? 'Em Cena no palco (Clique para mandar p/ banco)'
                              : 'No Banco (Clique para pôr em cena no palco)'
                          }
                        >
                          {npc.isOnStage ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>EM CENA</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>NO BANCO</span>
                            </>
                          )}
                        </button>

                        {/* Botões Utilitários */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(npc)}
                            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 hover:text-white transition-all"
                            title="Editar personagem"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteNPC(npc.id)}
                            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-rose-950 border border-zinc-700 hover:border-rose-600 text-zinc-400 hover:text-rose-400 transition-all"
                            title="Excluir personagem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800">
                <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white uppercase">
                  NENHUM PERSONAGEM ENCONTRADO
                </h3>
                <p className="text-xs text-zinc-400 mt-1 mb-4">
                  Tente alterar os filtros ou cadastre um novo personagem para a cena.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-[2px_2px_0px_#000]"
                >
                  Cadastrar Personagem
                </button>
              </div>
            )}
        </div>

        {/* Aba 2: Configurações de Palco & OBS */}
        <div className={activeTab === 'settings' ? 'max-w-3xl mx-auto space-y-6 pb-24' : 'hidden'}>
          {/* Box Explicativo OBS */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <Monitor className="w-5 h-5 text-red-500" />
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                INTEGRAÇÃO COM OBS STUDIO (FONTE DO NAVEGADOR)
              </h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Você pode utilizar esta tela para controlar seus personagens em tempo real enquanto
              o OBS captura apenas o palco limpo!
            </p>
            <div className="p-3 bg-black/80 rounded-xl border border-zinc-800 flex items-center justify-between gap-3">
              <code className="text-xs text-red-400 font-bold truncate">
                {window.location.origin}/
              </code>
              <button
                onClick={handleCopyObsUrl}
                className="shrink-0 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-1.5"
              >
                {copiedObsUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedObsUrl ? 'COPIADO' : 'COPIAR URL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              💡 Dica: No OBS, adicione como <strong>Fonte do Navegador</strong> com resolução <strong>1920x1080</strong> e marque "Fundo Transparente" abaixo caso deseje sobrepor a tela do seu jogo ou mapa!
            </p>
          </div>

          {/* Configurações Gerais de Tema, FX e Background */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5">
            <SettingsTab
              theme={theme}
              enableVignette={enableVignette}
              enableFilmGrain={enableFilmGrain}
              enableScanlines={enableScanlines}
              enableBlur={enableBlur}
              blurIntensity={blurIntensity}
              blurTarget={blurTarget}
              backgroundUrl={backgroundUrl}
              isTransparentBg={isTransparentBg}
              hideStageControls={hideStageControls}
              onSetTheme={setTheme}
              onSetEnableVignette={setEnableVignette}
              onSetEnableFilmGrain={setEnableFilmGrain}
              onSetEnableScanlines={setEnableScanlines}
              onSetEnableBlur={setEnableBlur}
              onSetBlurIntensity={setBlurIntensity}
              onSetBlurTarget={setBlurTarget}
              onSetBackgroundUrl={setBackgroundUrl}
              onSetIsTransparentBg={setIsTransparentBg}
              onSetHideStageControls={setHideStageControls}
              onResetToDefaults={resetToDefaults}
              onSaveCampaign={handleSaveToDisk}
              saveStatus={saveStatus}
              lastSavedTime={lastSavedTime}
              onExportCampaign={handleExportBackup}
              onImportCampaign={() => importFileRef.current?.click()}
            />
          </div>
        </div>

        {/* Aba 3: Soundboard & Trilhas Sonoras (PERMANECE MONTADO PARA TOCAR EM SEGUNDO PLANO) */}
        <div className={activeTab === 'soundboard' ? '' : 'hidden'}>
          <SoundboardTab />
        </div>

        {/* Aba 4: Trilha de Iniciativa & Cartas */}
        <div className={activeTab === 'initiative' ? 'space-y-6 max-w-4xl' : 'hidden'}>
          <InitiativeTab
            initiative={initiative}
            npcs={npcs}
            onNextTurn={nextTurn}
            onPrevTurn={prevTurn}
            onSetActiveTurnIndex={setActiveTurnIndex}
            onToggleVisibility={toggleInitiativeVisibility}
            onAddInitiativeItem={addInitiativeItem}
            onRemoveInitiativeItem={removeInitiativeItem}
            onUpdateInitiativeItem={updateInitiativeItem}
            onReorderInitiative={reorderInitiative}
            onSortByValue={sortInitiativeByValue}
            onClearInitiative={clearInitiative}
            onAddNPCsToInitiative={addNPCsToInitiative}
          />
        </div>
      </main>

      {/* ── MODAIS ──────────────────────────────────────────────────────── */}
      <NPCFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveNPC}
        editingNPC={editingNPC}
      />

      <StreamDeckModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
};
