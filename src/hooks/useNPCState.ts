import { useState, useEffect, useCallback } from 'react';
import { NPC, StageConfig, StageTheme } from '../types';
import { INITIAL_NPCS, DEFAULT_BACKGROUND_URL, THEME_BACKGROUNDS } from '../constants/initialData';

const STORAGE_KEYS = {
  NPCS: 'rpg_overlay_npcs_v5',
  BACKGROUND: 'rpg_overlay_bg_v5',
  THEME: 'rpg_overlay_theme_v5',
  VIGNETTE: 'rpg_overlay_vignette_v5',
  GRAIN: 'rpg_overlay_grain_v5',
  SCANLINES: 'rpg_overlay_scanlines_v5',
  TRANSPARENT: 'rpg_overlay_transparent_v5'
};

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

  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);

  // Sincronizar NPCs com localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NPCS, JSON.stringify(npcs));
    } catch (e) {
      console.error('Falha ao salvar NPCs:', e);
    }
  }, [npcs]);

  // Setters com persistência
  const setTheme = useCallback((newTheme: StageTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
      setBackgroundUrlState(THEME_BACKGROUNDS[newTheme]);
      localStorage.setItem(STORAGE_KEYS.BACKGROUND, THEME_BACKGROUNDS[newTheme]);
    } catch (e) {}
  }, []);

  const setEnableVignette = useCallback((val: boolean) => {
    setEnableVignetteState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.VIGNETTE, String(val));
    } catch (e) {}
  }, []);

  const setEnableFilmGrain = useCallback((val: boolean) => {
    setEnableFilmGrainState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.GRAIN, String(val));
    } catch (e) {}
  }, []);

  const setEnableScanlines = useCallback((val: boolean) => {
    setEnableScanlinesState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.SCANLINES, String(val));
    } catch (e) {}
  }, []);

  const setBackgroundUrl = useCallback((url: string) => {
    setBackgroundUrlState(url);
    try {
      localStorage.setItem(STORAGE_KEYS.BACKGROUND, url);
    } catch (e) {}
  }, []);

  const setIsTransparentBg = useCallback((transparent: boolean) => {
    setIsTransparentBgState(transparent);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSPARENT, String(transparent));
    } catch (e) {}
  }, []);

  // Operações de CRUD
  const addNPC = useCallback((npcData: Omit<NPC, 'id'>) => {
    const newNPC: NPC = {
      ...npcData,
      id: `npc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    };
    setNpcs(prev => [...prev, newNPC]);
    return newNPC.id;
  }, []);

  const updateNPC = useCallback((id: string, data: Partial<Omit<NPC, 'id'>>) => {
    setNpcs(prev => prev.map(npc => (npc.id === id ? { ...npc, ...data } : npc)));
  }, []);

  const deleteNPC = useCallback((id: string) => {
    setNpcs(prev => prev.filter(npc => npc.id !== id));
    setActiveSpeakerId(prev => (prev === id ? null : prev));
  }, []);

  const toggleOnStage = useCallback((id: string) => {
    setNpcs(prev =>
      prev.map(npc => {
        if (npc.id === id) {
          const nextState = !npc.isOnStage;
          if (!nextState && activeSpeakerId === id) {
            setActiveSpeakerId(null);
          }
          return { ...npc, isOnStage: nextState };
        }
        return npc;
      })
    );
  }, [activeSpeakerId]);

  const toggleSpeaker = useCallback((id: string) => {
    setActiveSpeakerId(prev => (prev === id ? null : id));
  }, []);

  const silenceAll = useCallback(() => {
    setActiveSpeakerId(null);
  }, []);

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
  }, []);

  const stageConfig: StageConfig = {
    backgroundUrl,
    theme,
    enableVignette,
    enableFilmGrain,
    enableScanlines,
    activeSpeakerId,
    npcs,
    isTransparentBg
  };

  return {
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
    setActiveSpeakerId,
    toggleSpeaker,
    silenceAll,
    resetToDefaults
  };
}
