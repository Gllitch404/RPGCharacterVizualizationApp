import { useState, useEffect, useCallback, useRef } from 'react';
import { NPC, StageConfig, StageTheme, InitiativeState, InitiativeItem } from '../types';
import { INITIAL_NPCS, DEFAULT_BACKGROUND_URL, THEME_BACKGROUNDS } from '../constants/initialData';
import { loadCampaignFromDisk, CampaignSaveData } from '../utils/campaignStorage';

const STORAGE_KEYS = {
  NPCS: 'rpg_overlay_npcs_v5',
  BACKGROUND: 'rpg_overlay_bg_v5',
  THEME: 'rpg_overlay_theme_v5',
  VIGNETTE: 'rpg_overlay_vignette_v5',
  GRAIN: 'rpg_overlay_grain_v5',
  SCANLINES: 'rpg_overlay_scanlines_v5',
  BLUR: 'rpg_overlay_blur_v5',
  BLUR_INTENSITY: 'rpg_overlay_blur_intensity_v5',
  BLUR_TARGET: 'rpg_overlay_blur_target_v5',
  TRANSPARENT: 'rpg_overlay_transparent_v5',
  ACTIVE_SPEAKER: 'rpg_overlay_speaker_v5',
  HIDE_STAGE_CONTROLS: 'rpg_overlay_hide_controls_v5',
  INITIATIVE: 'rpg_initiative_state_v1'
};

const SYNC_CHANNEL_NAME = 'rpg_overlay_sync_v5';

export function useNPCState() {
  const [npcs, setNpcs] = useState<NPC[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NPCS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar NPCs do localStorage:', e);
    }
    return INITIAL_NPCS;
  });

  const [theme, setThemeState] = useState<StageTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'ordem' || saved === 'cthulhu' || saved === 'clean') {
        return saved;
      }
    } catch (e) {}
    return 'ordem';
  });

  const [enableVignette, setEnableVignetteState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VIGNETTE);
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const [enableFilmGrain, setEnableFilmGrainState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GRAIN);
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const [enableScanlines, setEnableScanlinesState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SCANLINES);
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const [enableBlur, setEnableBlurState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLUR);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const [blurIntensity, setBlurIntensityState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLUR_INTENSITY);
      return saved !== null ? Number(saved) : 8;
    } catch (e) {
      return 8;
    }
  });

  const [blurTarget, setBlurTargetState] = useState<'background' | 'all'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BLUR_TARGET);
      return saved === 'all' ? 'all' : 'background';
    } catch (e) {
      return 'background';
    }
  });

  const [backgroundUrl, setBackgroundUrlState] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BACKGROUND);
      return saved !== null ? saved : DEFAULT_BACKGROUND_URL;
    } catch (e) {
      return DEFAULT_BACKGROUND_URL;
    }
  });

  const [isTransparentBg, setIsTransparentBgState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSPARENT);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const [hideStageControls, setHideStageControlsState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HIDE_STAGE_CONTROLS);
      return saved === 'true';
    } catch (e) {
      return false;
    }
  });

  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SPEAKER);
      return saved || null;
    } catch (e) {
      return null;
    }
  });

  const [initiative, setInitiativeState] = useState<InitiativeState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INITIATIVE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items)) {
          return parsed;
        }
      }
    } catch (e) {}
    return {
      items: [],
      activeTurnIndex: 0,
      isVisibleOnStage: true,
      round: 1
    };
  });

  // Canal de sincronização inter-janelas (BroadcastChannel)
  const channelRef = useRef<BroadcastChannel | null>(null);

  const broadcast = useCallback((msg: { type: string; payload?: any }) => {
    try {
      if (channelRef.current) {
        channelRef.current.postMessage(msg);
      } else if (typeof BroadcastChannel !== 'undefined') {
        const tempChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        tempChannel.postMessage(msg);
        tempChannel.close();
      }
    } catch (e) {
      console.warn('Falha no broadcast inter-janelas:', e);
    }
  }, []);

  // Listener para BroadcastChannel e storage events
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const ch = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channelRef.current = ch;

      ch.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'SET_SPEAKER') {
          setActiveSpeakerId(payload);
        } else if (type === 'SET_NPCS') {
          setNpcs(payload);
        } else if (type === 'SET_THEME') {
          setThemeState(payload.theme);
          setBackgroundUrlState(payload.backgroundUrl);
        } else if (type === 'SET_SETTING') {
          if (payload.key === 'vignette') setEnableVignetteState(payload.value);
          if (payload.key === 'grain') setEnableFilmGrainState(payload.value);
          if (payload.key === 'scanlines') setEnableScanlinesState(payload.value);
          if (payload.key === 'blur') setEnableBlurState(payload.value);
          if (payload.key === 'blurIntensity') setBlurIntensityState(payload.value);
          if (payload.key === 'blurTarget') setBlurTargetState(payload.value);
          if (payload.key === 'background') setBackgroundUrlState(payload.value);
          if (payload.key === 'transparent') setIsTransparentBgState(payload.value);
          if (payload.key === 'hideStageControls') setHideStageControlsState(payload.value);
        } else if (type === 'SET_INITIATIVE' && payload) {
          setInitiativeState(payload);
        } else if (type === 'RESET') {
          setNpcs(INITIAL_NPCS);
          setThemeState('ordem');
          setBackgroundUrlState(THEME_BACKGROUNDS.ordem);
          setEnableVignetteState(true);
          setEnableFilmGrainState(true);
          setEnableScanlinesState(true);
          setEnableBlurState(false);
          setBlurIntensityState(8);
          setBlurTargetState('background');
          setIsTransparentBgState(false);
          setHideStageControlsState(false);
          setActiveSpeakerId(null);
          setInitiativeState({
            items: [],
            activeTurnIndex: 0,
            isVisibleOnStage: true,
            round: 1
          });
        } else if (type === 'RESTORE_CAMPAIGN' && payload) {
          if (payload.npcs && Array.isArray(payload.npcs)) setNpcs(payload.npcs);
          if (payload.theme) setThemeState(payload.theme);
          if (payload.backgroundUrl) setBackgroundUrlState(payload.backgroundUrl);
          if (payload.enableVignette !== undefined) setEnableVignetteState(payload.enableVignette);
          if (payload.enableFilmGrain !== undefined) setEnableFilmGrainState(payload.enableFilmGrain);
          if (payload.enableScanlines !== undefined) setEnableScanlinesState(payload.enableScanlines);
          if (payload.enableBlur !== undefined) setEnableBlurState(payload.enableBlur);
          if (payload.blurIntensity !== undefined) setBlurIntensityState(payload.blurIntensity);
          if (payload.blurTarget !== undefined) setBlurTargetState(payload.blurTarget);
          if (payload.isTransparentBg !== undefined) setIsTransparentBgState(payload.isTransparentBg);
          if (payload.hideStageControls !== undefined) setHideStageControlsState(payload.hideStageControls);
          if (payload.initiative) setInitiativeState(payload.initiative);
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.ACTIVE_SPEAKER) {
        setActiveSpeakerId(e.newValue || null);
      } else if (e.key === STORAGE_KEYS.NPCS && e.newValue) {
        try {
          setNpcs(JSON.parse(e.newValue));
        } catch {}
      } else if (e.key === STORAGE_KEYS.THEME && e.newValue) {
        setThemeState(e.newValue as StageTheme);
      } else if (e.key === STORAGE_KEYS.BACKGROUND && e.newValue) {
        setBackgroundUrlState(e.newValue);
      } else if (e.key === STORAGE_KEYS.VIGNETTE) {
        setEnableVignetteState(e.newValue === 'true');
      } else if (e.key === STORAGE_KEYS.GRAIN) {
        setEnableFilmGrainState(e.newValue === 'true');
      } else if (e.key === STORAGE_KEYS.SCANLINES) {
        setEnableScanlinesState(e.newValue === 'true');
      } else if (e.key === STORAGE_KEYS.BLUR) {
        setEnableBlurState(e.newValue === 'true');
      } else if (e.key === STORAGE_KEYS.BLUR_INTENSITY && e.newValue) {
        setBlurIntensityState(Number(e.newValue));
      } else if (e.key === STORAGE_KEYS.BLUR_TARGET && e.newValue) {
        setBlurTargetState(e.newValue === 'all' ? 'all' : 'background');
      } else if (e.key === STORAGE_KEYS.TRANSPARENT) {
        setIsTransparentBgState(e.newValue === 'true');
      } else if (e.key === STORAGE_KEYS.HIDE_STAGE_CONTROLS) {
        setHideStageControlsState(e.newValue === 'true');
      } else if (e.key === STORAGE_KEYS.INITIATIVE && e.newValue) {
        try {
          setInitiativeState(JSON.parse(e.newValue));
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Sincronizar NPCs com localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NPCS, JSON.stringify(npcs));
    } catch (e) {
      console.error('Falha ao salvar NPCs:', e);
    }
  }, [npcs]);

  // Sincronizar activeSpeakerId com localStorage
  useEffect(() => {
    try {
      if (activeSpeakerId) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_SPEAKER, activeSpeakerId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SPEAKER);
      }
    } catch (e) {}
  }, [activeSpeakerId]);

  // Setters com persistência e broadcast
  const setTheme = useCallback((newTheme: StageTheme) => {
    setThemeState(newTheme);
    const bgUrl = THEME_BACKGROUNDS[newTheme];
    setBackgroundUrlState(bgUrl);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      localStorage.setItem(STORAGE_KEYS.BACKGROUND, bgUrl);
    } catch (e) {}
    broadcast({ type: 'SET_THEME', payload: { theme: newTheme, backgroundUrl: bgUrl } });
  }, [broadcast]);

  const setEnableVignette = useCallback((val: boolean) => {
    setEnableVignetteState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.VIGNETTE, String(val));
    } catch (e) {}
    broadcast({ type: 'SET_SETTING', payload: { key: 'vignette', value: val } });
  }, [broadcast]);

  const setEnableFilmGrain = useCallback((val: boolean) => {
    setEnableFilmGrainState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.GRAIN, String(val));
    } catch (e) {}
    broadcast({ type: 'SET_SETTING', payload: { key: 'grain', value: val } });
  }, [broadcast]);

  const setEnableScanlines = useCallback((val: boolean) => {
    setEnableScanlinesState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.SCANLINES, String(val));
    } catch (e) {}
    broadcast({ type: 'SET_SETTING', payload: { key: 'scanlines', value: val } });
  }, [broadcast]);

  const setEnableBlur = useCallback((val: boolean) => {
    setEnableBlurState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.BLUR, String(val));
    } catch (e) {}
    broadcast({ type: 'SET_SETTING', payload: { key: 'blur', value: val } });
  }, [broadcast]);

  const setBlurIntensity = useCallback((val: number) => {
    setBlurIntensityState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.BLUR_INTENSITY, String(val));
    } catch (e) {}
    broadcast({ type: 'SET_SETTING', payload: { key: 'blurIntensity', value: val } });
  }, [broadcast]);

  const setBlurTarget = useCallback((val: 'background' | 'all') => {
    setBlurTargetState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.BLUR_TARGET, val);
    } catch (e) {}
    broadcast({ type: 'SET_SETTING', payload: { key: 'blurTarget', value: val } });
  }, [broadcast]);

  const setBackgroundUrl = useCallback((url: string) => {
    setBackgroundUrlState(url);
    try {
      localStorage.setItem(STORAGE_KEYS.BACKGROUND, url);
    } catch (e) {}
    broadcast({ type: 'SET_SETTING', payload: { key: 'background', value: url } });
  }, [broadcast]);

  const setIsTransparentBg = useCallback((transparent: boolean) => {
    setIsTransparentBgState(transparent);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSPARENT, String(transparent));
    } catch (e) {}
    broadcast({ type: 'SET_SETTING', payload: { key: 'transparent', value: transparent } });
  }, [broadcast]);

  const setHideStageControls = useCallback((val: boolean) => {
    setHideStageControlsState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.HIDE_STAGE_CONTROLS, String(val));
    } catch (e) {}
    broadcast({ type: 'SET_SETTING', payload: { key: 'hideStageControls', value: val } });
  }, [broadcast]);

  // Operações de CRUD
  const addNPC = useCallback((npcData: Omit<NPC, 'id'>) => {
    const newNPC: NPC = {
      ...npcData,
      id: `npc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    setNpcs(prev => {
      const next = [...prev, newNPC];
      broadcast({ type: 'SET_NPCS', payload: next });
      return next;
    });
    return newNPC.id;
  }, [broadcast]);

  const updateNPC = useCallback((id: string, data: Partial<Omit<NPC, 'id'>>) => {
    setNpcs(prev => {
      const next = prev.map(npc => (npc.id === id ? { ...npc, ...data } : npc));
      broadcast({ type: 'SET_NPCS', payload: next });
      return next;
    });
  }, [broadcast]);

  const deleteNPC = useCallback((id: string) => {
    setNpcs(prev => {
      const next = prev.filter(npc => npc.id !== id);
      broadcast({ type: 'SET_NPCS', payload: next });
      return next;
    });
    setActiveSpeakerId(prev => {
      if (prev === id) {
        broadcast({ type: 'SET_SPEAKER', payload: null });
        return null;
      }
      return prev;
    });
  }, [broadcast]);

  const toggleOnStage = useCallback((id: string) => {
    setNpcs(prev => {
      const next = prev.map(npc => {
        if (npc.id === id) {
          const nextState = !npc.isOnStage;
          if (!nextState && activeSpeakerId === id) {
            setActiveSpeakerId(null);
            broadcast({ type: 'SET_SPEAKER', payload: null });
          }
          return { ...npc, isOnStage: nextState };
        }
        return npc;
      });
      broadcast({ type: 'SET_NPCS', payload: next });
      return next;
    });
  }, [activeSpeakerId, broadcast]);

  const toggleSpeaker = useCallback((id: string) => {
    setActiveSpeakerId(prev => {
      const next = prev === id ? null : id;
      broadcast({ type: 'SET_SPEAKER', payload: next });
      return next;
    });
  }, [broadcast]);

  const silenceAll = useCallback(() => {
    setActiveSpeakerId(null);
    broadcast({ type: 'SET_SPEAKER', payload: null });
  }, [broadcast]);

  const setStageNPCs = useCallback((stageIds: string[]) => {
    setNpcs(prev => {
      const next = prev.map(npc => ({
        ...npc,
        isOnStage: stageIds.includes(npc.id)
      }));
      broadcast({ type: 'SET_NPCS', payload: next });
      return next;
    });
    setActiveSpeakerId(prev => {
      if (prev && !stageIds.includes(prev)) {
        broadcast({ type: 'SET_SPEAKER', payload: null });
        return null;
      }
      return prev;
    });
  }, [broadcast]);

  const clearStage = useCallback(() => {
    setNpcs(prev => {
      const next = prev.map(npc => ({ ...npc, isOnStage: false }));
      broadcast({ type: 'SET_NPCS', payload: next });
      return next;
    });
    setActiveSpeakerId(null);
    broadcast({ type: 'SET_SPEAKER', payload: null });
  }, [broadcast]);

  const putAllOnStage = useCallback(() => {
    setNpcs(prev => {
      const next = prev.map(npc => ({ ...npc, isOnStage: true }));
      broadcast({ type: 'SET_NPCS', payload: next });
      return next;
    });
  }, [broadcast]);

  const resetToDefaults = useCallback(() => {
    setNpcs(INITIAL_NPCS);
    setThemeState('ordem');
    setBackgroundUrlState(THEME_BACKGROUNDS.ordem);
    setEnableVignetteState(true);
    setEnableFilmGrainState(true);
    setEnableScanlinesState(true);
    setIsTransparentBgState(false);
    setActiveSpeakerId(null);
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    broadcast({ type: 'RESET' });
  }, [broadcast]);

  // ── INICIATIVA & COMBATE ──────────────────────────────────────────
  const updateInitiative = useCallback((updater: InitiativeState | ((prev: InitiativeState) => InitiativeState)) => {
    setInitiativeState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEYS.INITIATIVE, JSON.stringify(next));
      } catch (e) {}
      broadcast({ type: 'SET_INITIATIVE', payload: next });
      return next;
    });
  }, [broadcast]);

  const nextTurn = useCallback(() => {
    updateInitiative(prev => {
      if (prev.items.length === 0) return prev;
      const nextIndex = prev.activeTurnIndex + 1;
      if (nextIndex >= prev.items.length) {
        return {
          ...prev,
          activeTurnIndex: 0,
          round: prev.round + 1
        };
      }
      return {
        ...prev,
        activeTurnIndex: nextIndex
      };
    });
  }, [updateInitiative]);

  const prevTurn = useCallback(() => {
    updateInitiative(prev => {
      if (prev.items.length === 0) return prev;
      const prevIndex = prev.activeTurnIndex - 1;
      if (prevIndex < 0) {
        return {
          ...prev,
          activeTurnIndex: Math.max(0, prev.items.length - 1),
          round: Math.max(1, prev.round - 1)
        };
      }
      return {
        ...prev,
        activeTurnIndex: prevIndex
      };
    });
  }, [updateInitiative]);

  const setActiveTurnIndex = useCallback((index: number) => {
    updateInitiative(prev => ({
      ...prev,
      activeTurnIndex: Math.max(0, Math.min(index, prev.items.length - 1))
    }));
  }, [updateInitiative]);

  const toggleInitiativeVisibility = useCallback(() => {
    updateInitiative(prev => ({
      ...prev,
      isVisibleOnStage: !prev.isVisibleOnStage
    }));
  }, [updateInitiative]);

  const setInitiativeVisibility = useCallback((visible: boolean) => {
    updateInitiative(prev => ({
      ...prev,
      isVisibleOnStage: visible
    }));
  }, [updateInitiative]);

  const addInitiativeItem = useCallback((itemData: Omit<InitiativeItem, 'id'>) => {
    const newItem: InitiativeItem = {
      ...itemData,
      id: `init-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
    };
    updateInitiative(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  }, [updateInitiative]);

  const removeInitiativeItem = useCallback((id: string) => {
    updateInitiative(prev => {
      const newItems = prev.items.filter(item => item.id !== id);
      const newIndex = prev.activeTurnIndex >= newItems.length
        ? Math.max(0, newItems.length - 1)
        : prev.activeTurnIndex;
      return {
        ...prev,
        items: newItems,
        activeTurnIndex: newIndex
      };
    });
  }, [updateInitiative]);

  const updateInitiativeItem = useCallback((id: string, patch: Partial<InitiativeItem>) => {
    updateInitiative(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, ...patch } : item)
    }));
  }, [updateInitiative]);

  const reorderInitiative = useCallback((items: InitiativeItem[]) => {
    updateInitiative(prev => ({
      ...prev,
      items
    }));
  }, [updateInitiative]);

  const sortInitiativeByValue = useCallback((descending = true) => {
    updateInitiative(prev => {
      const sorted = [...prev.items].sort((a, b) => {
        const valA = a.initiativeValue ?? -999;
        const valB = b.initiativeValue ?? -999;
        return descending ? valB - valA : valA - valB;
      });
      return {
        ...prev,
        items: sorted,
        activeTurnIndex: 0
      };
    });
  }, [updateInitiative]);

  const clearInitiative = useCallback(() => {
    updateInitiative(prev => ({
      ...prev,
      items: [],
      activeTurnIndex: 0,
      round: 1
    }));
  }, [updateInitiative]);

  const addNPCsToInitiative = useCallback((targetNpcs: NPC[]) => {
    const newItems: InitiativeItem[] = targetNpcs.map(npc => ({
      id: `init-npc-${npc.id}-${Date.now()}`,
      name: npc.name,
      type: 'npc',
      npcId: npc.id,
      avatarUrl: npc.avatarUrl,
      iconUrl: npc.iconUrl,
      isFullCardArt: npc.isFullCardArt,
      borderColor: npc.accentColor || '#3b82f6',
      tag: npc.tag || 'PERSONAGEM'
    }));
    updateInitiative(prev => ({
      ...prev,
      items: [...prev.items, ...newItems]
    }));
  }, [updateInitiative]);

  const restoreCampaign = useCallback((data: Partial<CampaignSaveData>) => {
    if (data.npcs && Array.isArray(data.npcs)) setNpcs(data.npcs);
    if (data.theme) setThemeState(data.theme);
    if (data.backgroundUrl) setBackgroundUrlState(data.backgroundUrl);
    if (data.enableVignette !== undefined) setEnableVignetteState(data.enableVignette);
    if (data.enableFilmGrain !== undefined) setEnableFilmGrainState(data.enableFilmGrain);
    if (data.enableScanlines !== undefined) setEnableScanlinesState(data.enableScanlines);
    if (data.isTransparentBg !== undefined) setIsTransparentBgState(data.isTransparentBg);
    if (data.hideStageControls !== undefined) setHideStageControlsState(data.hideStageControls);
    if (data.initiative) setInitiativeState(data.initiative);
    broadcast({ type: 'RESTORE_CAMPAIGN', payload: data });
  }, [broadcast]);

  // Carregar dados salvos em disco (campaign_state.json) ao inicializar
  useEffect(() => {
    loadCampaignFromDisk().then(diskData => {
      if (diskData && Array.isArray(diskData.npcs) && diskData.npcs.length > 0) {
        restoreCampaign(diskData);
      }
    });
  }, [restoreCampaign]);

  const stageConfig: StageConfig = {
    backgroundUrl,
    theme,
    enableVignette,
    enableFilmGrain,
    enableScanlines,
    enableBlur,
    blurIntensity,
    blurTarget,
    activeSpeakerId,
    npcs,
    isTransparentBg,
    hideStageControls,
    initiative
  };

  return {
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
    initiative,
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
    setActiveSpeakerId,
    toggleSpeaker,
    silenceAll,
    resetToDefaults,
    restoreCampaign,
    nextTurn,
    prevTurn,
    setActiveTurnIndex,
    toggleInitiativeVisibility,
    setInitiativeVisibility,
    addInitiativeItem,
    removeInitiativeItem,
    updateInitiativeItem,
    reorderInitiative,
    sortInitiativeByValue,
    clearInitiative,
    addNPCsToInitiative,
    updateInitiative
  };
}
