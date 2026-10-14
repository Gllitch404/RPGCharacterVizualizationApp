export interface InitiativeColorOption {
  label: string;
  value: string;
}

export const INITIATIVE_BORDER_COLORS: InitiativeColorOption[] = [
  { label: 'Vermelho Carmesim', value: '#ef4444' },
  { label: 'Laranja Flamejante', value: '#f97316' },
  { label: 'Amarelo Âmbar', value: '#f59e0b' },
  { label: 'Verde Esmeralda', value: '#10b981' },
  { label: 'Ciano Celeste', value: '#06b6d4' },
  { label: 'Azul Safira', value: '#3b82f6' },
  { label: 'Roxo Místico', value: '#a855f7' },
  { label: 'Rosa Choque', value: '#ec4899' },
  { label: 'Branco Platina', value: '#f8fafc' },
  { label: 'Dourado Radiante', value: '#eab308' }
];

export const DEFAULT_ENEMY_BORDER = '#ef4444';
export const DEFAULT_ALLY_BORDER = '#3b82f6';
