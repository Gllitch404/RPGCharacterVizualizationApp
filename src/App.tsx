import { useState, useCallback } from 'react';
import { useNPCState } from './hooks/useNPCState';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Stage } from './components/Stage/Stage';
import { Sidebar } from './components/Sidebar/Sidebar';
import { QuickControls } from './components/UI/QuickControls';
import { NPCFormModal } from './components/Sidebar/NPCFormModal';
import { StreamDeckModal } from './components/UI/StreamDeckModal';
import { NPC } from './types';

export function App() {
  const {
    stageConfig,
    npcs,
    theme,
    enableVignette,
    enableFilmGrain,
    enableScanlines,
    backgroundUrl,
    isTransparentBg,
    activeSpeakerId,
    setTheme,
    setEnableVignette,
    setEnableFilmGrain,
    setEnableScanlines,
    setBackgroundUrl,
    setIsTransparentBg,
    addNPC,
    updateNPC,
    deleteNPC,
    toggleOnStage,
    toggleSpeaker,
    silenceAll,
    resetToDefaults
  } = useNPCState();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingNPC, setEditingNPC] = useState<NPC | null>(null);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  // Hook global de atalhos de teclado (0ms de latência)
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-zinc-100 select-none">
      {/* 1. Palco Principal de Visualização dos NPCs com Cut-In Angular */}
      <Stage
        stageConfig={stageConfig}
        toggleSpeaker={toggleSpeaker}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />

      {/* 2. Botão Flutuante de Controles */}
      <QuickControls
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(true)}
      />

      {/* 3. Painel Lateral de Gerenciamento (Gaveta Recolhível) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        npcs={npcs}
        theme={theme}
        enableVignette={enableVignette}
        enableFilmGrain={enableFilmGrain}
        enableScanlines={enableScanlines}
        activeSpeakerId={activeSpeakerId}
        backgroundUrl={backgroundUrl}
        isTransparentBg={isTransparentBg}
        onSetTheme={setTheme}
        onSetEnableVignette={setEnableVignette}
        onSetEnableFilmGrain={setEnableFilmGrain}
        onSetEnableScanlines={setEnableScanlines}
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
