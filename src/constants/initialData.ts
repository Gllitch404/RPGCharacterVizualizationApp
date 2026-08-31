import { NPC } from '../types';

export const PRESET_AVATARS = [
  {
    id: 'preset-kazuha',
    name: 'Kaedehara Kazuha',
    tag: 'ANEMO / ESPADACHIM',
    title: 'Samurai Errante de Inazuma',
    url: '/kazuha_047_gacha_splash.webp',
    accentColor: '#e11d48' // Vermelho/Laranja Outonal
  },
  {
    id: 'preset-wriothesley',
    name: 'Wriothesley',
    tag: 'CRYO / DUQUE',
    title: 'Administrador de Meropide',
    url: '/wriothesley_086_gacha_splash.webp',
    accentColor: '#0284c7' // Azul Cryo
  },
  {
    id: 'preset-bennett',
    name: 'Bennett',
    tag: 'PYRO / AVENTUREIRO',
    title: 'Líder do Esquadrão Benny',
    url: '/bennett_032_gacha_splash.webp',
    accentColor: '#ea580c' // Laranja Fogo Pyro
  },
  {
    id: 'preset-lohen',
    name: 'Lohen',
    tag: 'ESPECIALISTA TÁTICO',
    title: 'Operador de Campo Avançado',
    url: '/lohen_129_gacha_splash.webp',
    accentColor: '#8b5cf6' // Roxo Tático
  }
];

export const INITIAL_NPCS: NPC[] = [
  {
    id: 'npc-1',
    name: 'Kaedehara Kazuha',
    tag: 'ANEMO',
    title: 'Samurai Errante',
    avatarUrl: '/kazuha_047_gacha_splash.webp',
    shortcutKey: '1',
    isOnStage: true,
    accentColor: '#e11d48'
  },
  {
    id: 'npc-2',
    name: 'Wriothesley',
    tag: 'CRYO',
    title: 'Duque de Meropide',
    avatarUrl: '/wriothesley_086_gacha_splash.webp',
    shortcutKey: '2',
    isOnStage: true,
    accentColor: '#0284c7'
  },
  {
    id: 'npc-3',
    name: 'Bennett',
    tag: 'PYRO',
    title: 'Aventureiro Incansável',
    avatarUrl: '/bennett_032_gacha_splash.webp',
    shortcutKey: '3',
    isOnStage: true,
    accentColor: '#ea580c'
  },
  {
    id: 'npc-4',
    name: 'Lohen',
    tag: 'TÁTICO',
    title: 'Operador de Campo',
    avatarUrl: '/lohen_129_gacha_splash.webp',
    shortcutKey: '4',
    isOnStage: true,
    accentColor: '#8b5cf6'
  }
];

export const THEME_BACKGROUNDS = {
  ordem: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
  cthulhu: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop',
  clean: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1920&auto=format&fit=crop'
};

export const DEFAULT_BACKGROUND_URL = THEME_BACKGROUNDS.ordem;
