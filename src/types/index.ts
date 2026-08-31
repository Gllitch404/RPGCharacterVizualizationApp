export type StageTheme = 'clean' | 'ordem' | 'cthulhu';

export interface NPC {
  id: string;
  name: string;
  tag?: string;            // Ex: "ANEMO", "CRYO", "PYRO", "AGENTE", "OCULTISTA"
  avatarUrl: string;       // URL da imagem ou Base64
  shortcutKey: string;     // Ex: "1", "2", "3", "q", "w", "Num1"
  isOnStage: boolean;      // Visível no palco ou no banco de reservas
  title?: string;          // Detalhe / Ocupação extra
  accentColor?: string;    // Cor primária do polígono (Ex: "#dc2626", "#0284c7", "#ea580c")
}

export interface StageConfig {
  backgroundUrl: string;
  theme: StageTheme;
  enableVignette: boolean;     // Escurecimento suave nas bordas da tela
  enableFilmGrain: boolean;    // Granulação / ruído analógico
  enableScanlines: boolean;    // Linhas de monitor CRT
  activeSpeakerId: string | null;
  npcs: NPC[];
  isTransparentBg?: boolean;
}
