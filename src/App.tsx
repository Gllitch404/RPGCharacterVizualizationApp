import { useState, useCallback } from 'react';
import { useNPCState } from './hooks/useNPCState';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useRoute } from './hooks/useRoute';
import { Stage } from './components/Stage/Stage';
import { Sidebar } from './components/Sidebar/Sidebar';
import { QuickControls } from './components/UI/QuickControls';
import { NPCFormModal } from './components/Sidebar/NPCFormModal';
import { StreamDeckModal } from './components/UI/StreamDeckModal';
import { ControlsPage } from './pages/ControlsPage';
import { NPC } from './types';
import { useSoundboardContext } from './context/SoundboardContext';
import { saveCampaignToDisk } from './utils/campaignStorage';

export function App() {
  const { currentRoute, navigateTo } = useRoute();
  const soundboard = useSoundboardContext();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  const {
    stageConfig,
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
    addNPC,
    updateNPC,
    deleteNPC,
    toggleOnStage,
    toggleSpeaker,
    silenceAll,
    resetToDefaults,
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
    addNPCsToInitiative
  } = useNPCState();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNPC, setEditingNPC] = useState<NPC | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Hook global de atalhos de teclado no palco principal (0ms de latência)
  useKeyboardShortcuts({
    npcs,
    activeSpeakerId,
    toggleSpeaker,
    silenceAll,
    toggleSidebar,
    isFormOpen: isFormModalOpen || isGuideModalOpen
  });

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

  const handleSaveToDisk = useCallback(async () => {
    setSaveStatus('saving');
    const res = await saveCampaignToDisk({
      npcs,
      backgroundUrl,
      theme,
      enableVignette,
      enableFilmGrain,
      enableScanlines,
      isTransparentBg,
      hideStageControls,
      tracks: soundboard.tracks,
      soundboardConfig: soundboard.config,
      initiative
    });
    if (res.success) {
      setSaveStatus('saved');
      setLastSavedTime(res.savedAt);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 4000);
    }
  }, [
    npcs,
    backgroundUrl,
    theme,
    enableVignette,
    enableFilmGrain,
    enableScanlines,
    isTransparentBg,
    hideStageControls,
    soundboard.tracks,
    soundboard.config,
    initiative
  ]);

  // ── SE ESTIVER NA ROTA DEDICADA DE CONTROLES (/controls ou #/controls) ──
  if (currentRoute === 'controls') {
    return <ControlsPage onOpenStage={(newTab) => navigateTo('stage', newTab)} />;
  }

  // ── ROTA PRINCIPAL DO PALCO / OVERLAY (/) ──────────────────────────────
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-zinc-100 select-none">
      {/* 1. Palco Principal de Visualização dos NPCs com Cut-In Angular */}
      <Stage
        stageConfig={stageConfig}
        toggleSpeaker={toggleSpeaker}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onSelectTurn={setActiveTurnIndex}
        onNextTurn={nextTurn}
        onPrevTurn={prevTurn}
      />

      {/* 2. Botão Flutuante de Controles (ocultado pelo Mestre se hideStageControls estiver ativo) */}
      {!hideStageControls && (
        <QuickControls
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onOpenControlsPage={() => navigateTo('controls', true)}
        />
      )}

      {/* 3. Painel Lateral de Gerenciamento (Gaveta Recolhível) */}
      <Sidebar
        isOpen={!hideStageControls && isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        npcs={npcs}
        theme={theme}
        enableVignette={enableVignette}
        enableFilmGrain={enableFilmGrain}
        enableScanlines={enableScanlines}
        enableBlur={enableBlur}
        blurIntensity={blurIntensity}
        blurTarget={blurTarget}
        activeSpeakerId={activeSpeakerId}
        backgroundUrl={backgroundUrl}
        isTransparentBg={isTransparentBg}
        onSetTheme={setTheme}
        onSetEnableVignette={setEnableVignette}
        onSetEnableFilmGrain={setEnableFilmGrain}
        onSetEnableScanlines={setEnableScanlines}
        onSetEnableBlur={setEnableBlur}
        onSetBlurIntensity={setBlurIntensity}
        onSetBlurTarget={setBlurTarget}
        onToggleSpeaker={toggleSpeaker}
        onToggleStage={toggleOnStage}
        onDeleteNPC={deleteNPC}
        onOpenCreateModal={handleOpenCreateModal}
        onOpenEditModal={handleOpenEditModal}
        onSilenceAll={silenceAll}
        onSetBackgroundUrl={setBackgroundUrl}
        onSetIsTransparentBg={setIsTransparentBg}
        onResetToDefaults={resetToDefaults}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onSaveCampaign={handleSaveToDisk}
        saveStatus={saveStatus}
        lastSavedTime={lastSavedTime}
        initiative={initiative}
        onNextTurn={nextTurn}
        onPrevTurn={prevTurn}
        onSetActiveTurnIndex={setActiveTurnIndex}
        onToggleInitiativeVisibility={toggleInitiativeVisibility}
        onAddInitiativeItem={addInitiativeItem}
        onRemoveInitiativeItem={removeInitiativeItem}
        onUpdateInitiativeItem={updateInitiativeItem}
        onReorderInitiative={reorderInitiative}
        onSortInitiativeByValue={sortInitiativeByValue}
        onClearInitiative={clearInitiative}
        onAddNPCsToInitiative={addNPCsToInitiative}
      />

      {/* 4. Modal de Cadastro / Edição de NPC */}
      <NPCFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveNPC}
        editingNPC={editingNPC}
      />

      {/* 5. Modal de Guia Stream Deck & OBS */}
      <StreamDeckModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}

export default App;
