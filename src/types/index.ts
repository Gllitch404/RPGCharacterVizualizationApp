export type StageTheme = 'clean' | 'ordem' | 'cthulhu';

export interface NPC {
  id: string;
  name: string;
  tag?: string;            // Ex: "ANEMO", "CRYO", "PYRO", "AGENTE", "OCULTISTA"
  avatarUrl: string;       // URL da imagem ou Base64
  iconUrl?: string;        // Ícone ou arte de carta específico para a iniciativa/HUD (opcional)
  isFullCardArt?: boolean; // Se a imagem já é uma carta vertical completa
  shortcutKey: string;     // Ex: "1", "2", "3", "q", "w", "Num1"
  isOnStage: boolean;      // Visível no palco ou no banco de reservas
  title?: string;          // Detalhe / Ocupação extra
  accentColor?: string;    // Cor primária do polígono (Ex: "#dc2626", "#0284c7", "#ea580c")
}

export type InitiativeParticipantType = 'npc' | 'enemy' | 'ally' | 'custom';

export interface InitiativeItem {
  id: string;
  name: string;
  type: InitiativeParticipantType;
  npcId?: string;           // Se vinculado a um NPC cadastrado
  avatarUrl?: string;       // Imagem do participante
  iconUrl?: string;         // Ícone específico para a carta
  isFullCardArt?: boolean;  // Se deve usar arte completa ou molde com avatar
  borderColor: string;      // Cor da moldura/borda para distinção visual (ex: '#ef4444', '#3b82f6', etc.)
  initiativeValue?: number; // Valor numérico para rolagem/ordenação de iniciativa
  tag?: string;             // Tag descritiva (ex: 'INIMIGO', 'ALIADO', 'LÍDER')
}

export interface InitiativeState {
  items: InitiativeItem[];
  activeTurnIndex: number;   // Índice de quem é a vez (carta destacada reta e aumentada)
  isVisibleOnStage: boolean; // Mostrar / esconder no palco
  round: number;             // Contador de rodadas
}

export interface StageConfig {
  backgroundUrl: string;
  theme: StageTheme;
  enableVignette: boolean;     // Escurecimento suave nas bordas da tela
  enableFilmGrain: boolean;    // Granulação / ruído analógico
  enableScanlines: boolean;    // Linhas de monitor CRT
  enableBlur?: boolean;        // Efeito de desfoque / borrão de imagem (overlay)
  blurIntensity?: number;      // Intensidade do desfoque em pixels (ex: 8px)
  blurTarget?: 'background' | 'all'; // Alvo do desfoque: apenas fundo ou cena inteira
  activeSpeakerId: string | null;
  npcs: NPC[];
  isTransparentBg?: boolean;
  hideStageControls?: boolean;
  initiative?: InitiativeState;
}

export interface ScenePreset {
  id: string;
  name: string;
  npcIds: string[]; // IDs dos NPCs que estarão no palco nesta cena
  createdAt: number;
}
