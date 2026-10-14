import { NPC, StageTheme, ScenePreset, InitiativeState } from '../types';
import { Track, SoundboardConfig } from '../types/soundboard';

export interface CampaignSaveData {
  version: number;
  savedAt: number;
  npcs: NPC[];
  backgroundUrl: string;
  theme: StageTheme;
  enableVignette: boolean;
  enableFilmGrain: boolean;
  enableScanlines: boolean;
  enableBlur?: boolean;
  blurIntensity?: number;
  blurTarget?: 'background' | 'all';
  isTransparentBg: boolean;
  hideStageControls: boolean;
  scenePresets?: ScenePreset[];
  tracks?: Track[];
  soundboardConfig?: SoundboardConfig;
  initiative?: InitiativeState;
}

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
  HIDE_STAGE_CONTROLS: 'rpg_overlay_hide_controls_v5',
  SCENE_PRESETS: 'rpg_scene_presets_v1',
  TRACKS: 'rpg_soundboard_tracks_v1',
  CONFIG: 'rpg_soundboard_config_v1',
  INITIATIVE: 'rpg_initiative_state_v1',
  LAST_DISK_SAVE: 'rpg_last_disk_save_timestamp'
};

/**
 * Salva todo o estado da campanha no arquivo local `campaign_state.json` via servidor Vite.
 * Também sincroniza com o localStorage como camada adicional de redundância.
 */
export async function saveCampaignToDisk(data: Omit<CampaignSaveData, 'version' | 'savedAt'>): Promise<{ success: boolean; savedAt: number; error?: string }> {
  const payload: CampaignSaveData = {
    ...data,
    version: 1,
    savedAt: Date.now()
  };

  // 1. Salvar no localStorage com tratamento seguro de QuotaExceeded
  try {
    localStorage.setItem(STORAGE_KEYS.NPCS, JSON.stringify(payload.npcs));
    localStorage.setItem(STORAGE_KEYS.BACKGROUND, payload.backgroundUrl);
    localStorage.setItem(STORAGE_KEYS.THEME, payload.theme);
    localStorage.setItem(STORAGE_KEYS.VIGNETTE, String(payload.enableVignette));
    localStorage.setItem(STORAGE_KEYS.GRAIN, String(payload.enableFilmGrain));
    localStorage.setItem(STORAGE_KEYS.SCANLINES, String(payload.enableScanlines));
    if (payload.enableBlur !== undefined) localStorage.setItem(STORAGE_KEYS.BLUR, String(payload.enableBlur));
    if (payload.blurIntensity !== undefined) localStorage.setItem(STORAGE_KEYS.BLUR_INTENSITY, String(payload.blurIntensity));
    if (payload.blurTarget !== undefined) localStorage.setItem(STORAGE_KEYS.BLUR_TARGET, payload.blurTarget);
    localStorage.setItem(STORAGE_KEYS.TRANSPARENT, String(payload.isTransparentBg));
    localStorage.setItem(STORAGE_KEYS.HIDE_STAGE_CONTROLS, String(payload.hideStageControls));
    localStorage.setItem(STORAGE_KEYS.SCENE_PRESETS, JSON.stringify(payload.scenePresets));
    localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(payload.tracks));
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(payload.soundboardConfig));
    localStorage.setItem(STORAGE_KEYS.LAST_DISK_SAVE, String(payload.savedAt));
  } catch (e) {
    console.warn('Aviso: Limite de cota do localStorage excedido. O arquivo em disco campaign_state.json garantirá a persistência total.', e);
  }

  // 2. Salvar fisicamente no arquivo local via endpoint do Vite
  try {
    const res = await fetch('/api/save-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload, null, 2)
    });

    if (!res.ok) {
      throw new Error(`Servidor respondeu com código ${res.status}`);
    }

    await res.json();
    return { success: true, savedAt: payload.savedAt };
  } catch (err: any) {
    console.error('Falha ao gravar campaign_state.json no disco:', err);
    return { success: false, savedAt: payload.savedAt, error: err.message };
  }
}

/**
 * Lê o estado salvo no arquivo local `campaign_state.json`.
 */
export async function loadCampaignFromDisk(): Promise<CampaignSaveData | null> {
  try {
    const res = await fetch('/api/load-state', { cache: 'no-cache' });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (data && data.exists === false) return null;
    if (data && Array.isArray(data.npcs)) {
      return data as CampaignSaveData;
    }
  } catch (e) {
    console.warn('Arquivo campaign_state.json ainda não existe ou não pôde ser lido:', e);
  }
  return null;
}

/**
 * Exporta o estado completo da campanha como um arquivo .json baixado no navegador.
 */
export function exportCampaignToFile(data: CampaignSaveData, campaignName = 'campanha_rpg') {
  const fileName = `${campaignName}_${new Date().toISOString().slice(0, 10)}.json`;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Importa um arquivo JSON de backup selecionado pelo usuário.
 */
export function importCampaignFromFile(file: File): Promise<CampaignSaveData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as CampaignSaveData;
        if (!parsed || !Array.isArray(parsed.npcs)) {
          throw new Error('Arquivo de backup inválido: lista de personagens ausente.');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
    reader.readAsText(file);
  });
}
