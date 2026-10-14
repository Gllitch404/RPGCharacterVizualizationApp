import { Track } from '../types/soundboard';

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'track-preset-1',
    title: 'Combate Decisivo (Ação & Adrenalina)',
    category: 'combate',
    sourceType: 'youtube',
    sourceUrl: 'https://www.youtube.com/watch?v=1D3x67w_4q8', // Epic Battle Theme
    volume: 0.85,
    loop: true,
    thumbnailUrl: 'https://img.youtube.com/vi/1D3x67w_4q8/mqdefault.jpg'
  },
  {
    id: 'track-preset-2',
    title: 'Investigação Noturna (Suspense & Tensão)',
    category: 'suspense',
    sourceType: 'youtube',
    sourceUrl: 'https://www.youtube.com/watch?v=cMATAwUuXk8', // Dark Ambient Investigation
    volume: 0.8,
    loop: true,
    thumbnailUrl: 'https://img.youtube.com/vi/cMATAwUuXk8/mqdefault.jpg'
  },
  {
    id: 'track-preset-3',
    title: 'Taberna & Descanso dos Heróis',
    category: 'taberna',
    sourceType: 'youtube',
    sourceUrl: 'https://www.youtube.com/watch?v=pSflU_1-Rz4', // Medieval Tavern Ambiance
    volume: 0.75,
    loop: true,
    thumbnailUrl: 'https://img.youtube.com/vi/pSflU_1-Rz4/mqdefault.jpg'
  },
  {
    id: 'track-preset-4',
    title: 'Efeito: Choque Paranormal / Sanidade',
    category: 'sfx',
    sourceType: 'url',
    sourceUrl: 'https://actions.google.com/sounds/v1/horror/creature_snarl.ogg',
    volume: 0.9,
    loop: false
  },
  {
    id: 'track-preset-5',
    title: 'Efeito: Trovão & Relâmpago',
    category: 'sfx',
    sourceType: 'url',
    sourceUrl: 'https://actions.google.com/sounds/v1/weather/thunder_crack.ogg',
    volume: 0.85,
    loop: false
  },
  {
    id: 'track-preset-6',
    title: 'Efeito: Golpe Crítico / Lâmina',
    category: 'sfx',
    sourceType: 'url',
    sourceUrl: 'https://actions.google.com/sounds/v1/fights/sword_clash.ogg',
    volume: 0.9,
    loop: false
  }
];
