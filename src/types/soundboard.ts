export type TrackSource = 'youtube' | 'file' | 'url';

export type TrackCategory = 'combate' | 'suspense' | 'ambiencia' | 'taberna' | 'sfx' | 'geral';

export interface Track {
  id: string;
  title: string;
  category: TrackCategory;
  sourceType: TrackSource;
  sourceUrl: string; // YouTube URL ou Video ID, URL de áudio direta, ou blob URL temporária
  fileDataId?: string; // ID da chave no IndexedDB para áudios locais persistidos
  fileName?: string;
  volume: number; // 0.0 a 1.0 (padrão 1.0)
  loop: boolean; // repetição seamless (padrão true)
  thumbnailUrl?: string;
}

export interface SoundboardConfig {
  masterVolume: number; // 0.0 a 1.0
  crossfadeDuration: number; // em segundos (0 a 5, padrão 2.0)
}
