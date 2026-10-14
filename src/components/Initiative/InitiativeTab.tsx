import React, { useState } from 'react';
import { NPC, InitiativeState, InitiativeItem } from '../../types';
import { INITIATIVE_BORDER_COLORS, DEFAULT_ENEMY_BORDER, DEFAULT_ALLY_BORDER } from '../../constants/initiativeColors';
import {
  Swords,
  Skull,
  Shield,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Users,
  SortDesc,
  Check
} from 'lucide-react';

interface InitiativeTabProps {
  initiative: InitiativeState;
  npcs: NPC[];
  onNextTurn: () => void;
  onPrevTurn: () => void;
  onSetActiveTurnIndex: (index: number) => void;
  onToggleVisibility: () => void;
  onAddInitiativeItem: (item: Omit<InitiativeItem, 'id'>) => void;
  onRemoveInitiativeItem: (id: string) => void;
  onUpdateInitiativeItem: (id: string, patch: Partial<InitiativeItem>) => void;
  onReorderInitiative: (items: InitiativeItem[]) => void;
  onSortByValue: (descending?: boolean) => void;
  onClearInitiative: () => void;
  onAddNPCsToInitiative: (npcs: NPC[]) => void;
}

export const InitiativeTab: React.FC<InitiativeTabProps> = ({
  initiative,
  npcs,
  onNextTurn,
  onPrevTurn,
  onSetActiveTurnIndex,
  onToggleVisibility,
  onAddInitiativeItem,
  onRemoveInitiativeItem,
  onUpdateInitiativeItem,
  onReorderInitiative,
  onSortByValue,
  onClearInitiative,
  onAddNPCsToInitiative
}) => {
  const { items, activeTurnIndex, isVisibleOnStage, round } = initiative;

  // Estados locais para adição rápida
  const [quickAddType, setQuickAddType] = useState<'enemy' | 'ally' | 'roster' | 'custom'>('enemy');

  // Formulário rápido de Inimigo
  const [enemyName, setEnemyName] = useState('');
  const [enemyBorder, setEnemyBorder] = useState(DEFAULT_ENEMY_BORDER);
  const [enemyInitValue, setEnemyInitValue] = useState<string>('');

  // Formulário rápido de Aliado
  const [allyName, setAllyName] = useState('');
  const [allyBorder, setAllyBorder] = useState(DEFAULT_ALLY_BORDER);
  const [allyInitValue, setAllyInitValue] = useState<string>('');

  // Formulário Customizado
  const [customName, setCustomName] = useState('');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customIsFullCard, setCustomIsFullCard] = useState(false);
  const [customBorder, setCustomBorder] = useState('#a855f7');
  const [customInitValue, setCustomInitValue] = useState<string>('');

  // Handler para adicionar Inimigo
  const handleAddEnemy = (e: React.FormEvent) => {
    e.preventDefault();
    const countEnemies = items.filter(i => i.type === 'enemy').length + 1;
    const finalName = enemyName.trim() || `Inimigo ${countEnemies}`;
    onAddInitiativeItem({
      name: finalName,
      type: 'enemy',
      borderColor: enemyBorder,
      initiativeValue: enemyInitValue ? parseInt(enemyInitValue, 10) : undefined,
      tag: 'INIMIGO'
    });
    setEnemyName('');
    setEnemyInitValue('');
  };

  // Handler para adicionar Aliado
  const handleAddAlly = (e: React.FormEvent) => {
    e.preventDefault();
    const countAllies = items.filter(i => i.type === 'ally').length + 1;
    const finalName = allyName.trim() || `Aliado ${countAllies}`;
    onAddInitiativeItem({
      name: finalName,
      type: 'ally',
      borderColor: allyBorder,
      initiativeValue: allyInitValue ? parseInt(allyInitValue, 10) : undefined,
      tag: 'ALIADO'
    });
    setAllyName('');
    setAllyInitValue('');
  };

  // Handler para adicionar Customizado
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddInitiativeItem({
      name: customName.trim(),
      type: 'custom',
      avatarUrl: customImageUrl.trim() || undefined,
      isFullCardArt: customIsFullCard,
      borderColor: customBorder,
      initiativeValue: customInitValue ? parseInt(customInitValue, 10) : undefined,
      tag: 'CUSTO'
    });
    setCustomName('');
    setCustomImageUrl('');
    setCustomInitValue('');
  };

  // Mover item para cima na ordem
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const next = [...items];
    const temp = next[index - 1];
    next[index - 1] = next[index];
    next[index] = temp;
    onReorderInitiative(next);
  };

  // Mover item para baixo na ordem
  const handleMoveDown = (index: number) => {
    if (index >= items.length - 1) return;
    const next = [...items];
    const temp = next[index + 1];
    next[index + 1] = next[index];
    next[index] = temp;
    onReorderInitiative(next);
  };

  const activeParticipant = items[activeTurnIndex];

  return (
    <div className="space-y-6 text-zinc-300 font-mono text-xs">
      {/* ── BARRA SUPERIOR DE CONTROLE DE COMBATE ─────────────────────── */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-600/10 border border-red-500/30 text-red-500 rounded-xl">
              <Swords className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm text-white tracking-wider uppercase">
                  TRILHA DE INICIATIVA
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-[10px] text-red-400 font-bold">
                  RODADA {round}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                {items.length === 0
                  ? 'Nenhum participante no combate.'
                  : `${items.length} participante(s) em ordem de ação.`}
              </p>
            </div>
          </div>

          {/* Toggle Visibilidade no Palco com Slide Motion */}
          <button
            onClick={onToggleVisibility}
            className={`group relative flex items-center gap-3 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-[2px_2px_0px_#000] active:scale-95 select-none ${
              isVisibleOnStage
                ? 'bg-amber-950/40 border-amber-500/80 text-amber-300 hover:border-amber-400'
                : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'
            }`}
            title="Alterna a exibição das cartas no canto superior do palco"
            role="switch"
            aria-checked={isVisibleOnStage}
          >
            <div className="flex items-center gap-1.5 font-mono text-[11px] font-black uppercase tracking-wider">
              {isVisibleOnStage ? (
                <Eye className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 group-hover:scale-110" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-zinc-500 transition-transform duration-300 group-hover:scale-110" />
              )}
              <span>{isVisibleOnStage ? 'NO PALCO' : 'OCULTO'}</span>
            </div>

            {/* Sliding Switch Pill Track */}
            <div
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 p-0.5 flex items-center ${
                isVisibleOnStage
                  ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                  : 'bg-zinc-800 border border-zinc-700'
              }`}
            >
              {/* Sliding Thumb Knob */}
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center ${
                  isVisibleOnStage ? 'translate-x-5' : 'translate-x-0'
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                    isVisibleOnStage ? 'bg-amber-600' : 'bg-zinc-400'
                  }`}
                />
              </div>
            </div>
          </button>
        </div>

        {/* ── BOTÕES DE GESTÃO DE TURNO (NEXT / PREV) ────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-800/80">
          <button
            onClick={onPrevTurn}
            disabled={items.length === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-200 text-xs font-bold uppercase transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000]"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>TURNO ANTERIOR</span>
          </button>

          <button
            onClick={onNextTurn}
            disabled={items.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 border border-red-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_#000] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="w-4 h-4" />
            <span>PRÓXIMO TURNO</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (window.confirm('Deseja limpar todos os participantes da iniciativa?')) {
                onClearInitiative();
              }
            }}
            disabled={items.length === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800 text-zinc-400 hover:text-red-400 text-xs font-bold uppercase transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>LIMPAR TRILHA</span>
          </button>
        </div>

        {/* Status de quem é o turno ativo */}
        {activeParticipant && (
          <div
            className="p-3 rounded-xl border flex items-center justify-between gap-3 bg-black/60"
            style={{ borderColor: activeParticipant.borderColor || '#e11d48' }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full animate-ping shrink-0" style={{ backgroundColor: activeParticipant.borderColor || '#e11d48' }} />
              <div className="min-w-0">
                <span className="text-[10px] text-zinc-500 uppercase font-bold block">
                  AGINDO NO MOMENTO (VEZ):
                </span>
                <span className="text-sm font-black text-white truncate block">
                  {activeParticipant.name}
                </span>
              </div>
            </div>
            <span
              className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase shrink-0 border"
              style={{
                borderColor: activeParticipant.borderColor,
                color: activeParticipant.borderColor
              }}
            >
              {activeParticipant.tag || activeParticipant.type}
            </span>
          </div>
        )}
      </div>

      {/* ── SELETOR DE MODO DE ADIÇÃO RÁPIDA ─────────────────────────── */}
      <div className="space-y-3">
        <label className="block font-black text-white uppercase tracking-wider text-xs">
          ADICIONAR PARTICIPANTES À INICIATIVA
        </label>

        <div className="grid grid-cols-4 gap-1.5 bg-black/60 p-1.5 rounded-xl border border-zinc-800">
          <button
            onClick={() => setQuickAddType('enemy')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
              quickAddType === 'enemy'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span className="truncate">INIMIGO</span>
          </button>

          <button
            onClick={() => setQuickAddType('ally')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
              quickAddType === 'ally'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="truncate">ALIADO</span>
          </button>

          <button
            onClick={() => setQuickAddType('roster')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
              quickAddType === 'roster'
                ? 'bg-zinc-800 text-white border border-zinc-600'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="truncate">ELENCO</span>
          </button>

          <button
            onClick={() => setQuickAddType('custom')}
            className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[11px] font-bold uppercase transition-all ${
              quickAddType === 'custom'
                ? 'bg-zinc-800 text-white border border-zinc-600'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="truncate">OUTRO</span>
          </button>
        </div>

        {/* ── 1. FORMULÁRIO DE INIMIGO PADRÃO ─────────────────────────── */}
        {quickAddType === 'enemy' && (
          <form onSubmit={handleAddEnemy} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-red-400 uppercase flex items-center gap-1.5">
                <Skull className="w-4 h-4 text-red-500" />
                CARTA DE INIMIGO (PRETA COM DETALHES VERMELHOS)
              </span>
              <span className="text-[10px] text-zinc-500">Molde Padrão</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Nome / Identificador:</label>
                <input
                  type="text"
                  value={enemyName}
                  onChange={e => setEnemyName(e.target.value)}
                  placeholder="Ex: Cultista #1, Zumbi, Chefe"
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Iniciativa (Rolagem):</label>
                <input
                  type="number"
                  value={enemyInitValue}
                  onChange={e => setEnemyInitValue(e.target.value)}
                  placeholder="Ex: 14"
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-red-500 font-mono text-center"
                />
              </div>
            </div>

            {/* Seletor de Cor da Borda para Distinção */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1.5">
                Cor da Borda de Distinção (para diferenciar múltiplos inimigos):
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {INITIATIVE_BORDER_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setEnemyBorder(c.value)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center ${
                      enemyBorder === c.value ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value, borderColor: '#fff' }}
                    title={c.label}
                  >
                    {enemyBorder === c.value && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[2px_2px_0px_#000] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADICIONAR INIMIGO</span>
            </button>
          </form>
        )}

        {/* ── 2. FORMULÁRIO DE ALIADO PADRÃO ─────────────────────────── */}
        {quickAddType === 'ally' && (
          <form onSubmit={handleAddAlly} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-blue-400 uppercase flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-500" />
                CARTA DE ALIADO (BRANCA COM DETALHES AZUIS)
              </span>
              <span className="text-[10px] text-zinc-500">Molde Padrão</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Nome / Identificador:</label>
                <input
                  type="text"
                  value={allyName}
                  onChange={e => setAllyName(e.target.value)}
                  placeholder="Ex: Guarda Real, Clérigo, Cão"
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Iniciativa (Rolagem):</label>
                <input
                  type="number"
                  value={allyInitValue}
                  onChange={e => setAllyInitValue(e.target.value)}
                  placeholder="Ex: 18"
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-blue-500 font-mono text-center"
                />
              </div>
            </div>

            {/* Seletor de Cor da Borda para Distinção */}
            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1.5">
                Cor da Borda de Distinção (para diferenciar aliados):
              </label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {INITIATIVE_BORDER_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setAllyBorder(c.value)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center ${
                      allyBorder === c.value ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value, borderColor: '#fff' }}
                    title={c.label}
                  >
                    {allyBorder === c.value && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[2px_2px_0px_#000] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADICIONAR ALIADO</span>
            </button>
          </form>
        )}

        {/* ── 3. ADICIONAR A PARTIR DO ELENCO DE NPCS ────────────────── */}
        {quickAddType === 'roster' && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-white uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4 text-red-500" />
                SELECIONAR DOS PERSONAGENS CADASTRADOS
              </span>
              <button
                onClick={() => onAddNPCsToInitiative(npcs.filter(n => n.isOnStage))}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-[10px] font-bold uppercase transition-all"
              >
                + TODOS EM CENA ({npcs.filter(n => n.isOnStage).length})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {npcs.map(npc => {
                const isAlreadyIn = items.some(i => i.npcId === npc.id);
                return (
                  <div
                    key={npc.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-black border border-zinc-800 hover:border-zinc-700 gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={npc.iconUrl || npc.avatarUrl}
                        alt={npc.name}
                        className="w-8 h-8 rounded-lg object-cover shrink-0 border"
                        style={{ borderColor: npc.accentColor || '#e11d48' }}
                      />
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-white truncate">
                          {npc.name}
                        </span>
                        <span className="text-[9px] text-zinc-500 block truncate">
                          {npc.tag || 'NPC'} {npc.isOnStage ? '• [EM CENA]' : ''}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onAddNPCsToInitiative([npc])}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all shrink-0 ${
                        isAlreadyIn
                          ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                    >
                      {isAlreadyIn ? '+ OUTRO' : '+ ADICIONAR'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 4. FORMULÁRIO DE PARTICIPANTE CUSTOMIZADO ─────────────── */}
        {quickAddType === 'custom' && (
          <form onSubmit={handleAddCustom} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <span className="text-[11px] font-black text-purple-400 uppercase flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-500" />
              PARTICIPANTE PERSONALIZADO
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Nome:</label>
                <input
                  type="text"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="Nome do monstro ou entidade"
                  required
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 uppercase mb-1">Iniciativa:</label>
                <input
                  type="number"
                  value={customInitValue}
                  onChange={e => setCustomInitValue(e.target.value)}
                  placeholder="Ex: 12"
                  className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1">URL da Imagem / Ícone:</label>
              <input
                type="url"
                value={customImageUrl}
                onChange={e => setCustomImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.png"
                className="w-full px-3 py-2 bg-black border border-zinc-700 rounded-lg text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-300">
              <input
                type="checkbox"
                checked={customIsFullCard}
                onChange={e => setCustomIsFullCard(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded bg-black border-zinc-700"
              />
              <span>A imagem já é uma arte completa de carta (TCG vertical)</span>
            </label>

            <div>
              <label className="block text-[10px] text-zinc-400 uppercase mb-1.5">Cor da Moldura:</label>
              <div className="flex items-center gap-1.5 flex-wrap">
                {INITIATIVE_BORDER_COLORS.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCustomBorder(c.value)}
                    className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center ${
                      customBorder === c.value ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c.value, borderColor: '#fff' }}
                    title={c.label}
                  >
                    {customBorder === c.value && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[2px_2px_0px_#000] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ ADICIONAR PARTICIPANTE</span>
            </button>
          </form>
        )}
      </div>

      {/* ── LISTA DE ORDEM DE TURNOS ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-2">
            <span>ORDEM DOS TURNOS ({items.length})</span>
          </label>
          {items.length > 1 && (
            <button
              onClick={() => onSortByValue(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-zinc-300 hover:text-white transition-all"
              title="Reordenar por valor de iniciativa (Maior para o Menor)"
            >
              <SortDesc className="w-3.5 h-3.5" />
              <span>ORDENAR POR ROLAGEM</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center bg-black/40 rounded-2xl border border-dashed border-zinc-800 font-mono">
            <Swords className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400 mb-1">Nenhum combatente na iniciativa.</p>
            <p className="text-[10px] text-zinc-500">Adicione inimigos, aliados ou NPCs acima para iniciar o combate.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item, index) => {
              const isActive = index === activeTurnIndex;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all gap-2 ${
                    isActive
                      ? 'bg-zinc-900 border-red-500 shadow-[3px_3px_0px_#000] ring-1 ring-red-500/60'
                      : 'bg-black/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                  style={{
                    borderLeftWidth: '5px',
                    borderLeftColor: item.borderColor || '#ef4444'
                  }}
                >
                  {/* Posição e Identificador */}
                  <div
                    onClick={() => onSetActiveTurnIndex(index)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="w-5 text-center text-xs font-black text-zinc-500">
                      #{index + 1}
                    </span>

                    {/* Miniatura ou Ícone */}
                    <div
                      className="w-8 h-8 rounded-lg overflow-hidden border flex items-center justify-center shrink-0 bg-black"
                      style={{ borderColor: item.borderColor || '#52525b' }}
                    >
                      {item.type === 'enemy' ? (
                        <Skull className="w-4 h-4 text-red-500" />
                      ) : item.type === 'ally' ? (
                        <Shield className="w-4 h-4 text-blue-500" />
                      ) : item.iconUrl || item.avatarUrl ? (
                        <img
                          src={item.iconUrl || item.avatarUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Swords className="w-4 h-4 text-zinc-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white truncate">
                          {item.name}
                        </span>
                        {isActive && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-red-600 text-white animate-pulse">
                            TURNO
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 block truncate">
                        {item.tag || item.type}
                      </span>
                    </div>
                  </div>

                  {/* Input Rápido de Iniciativa */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      value={item.initiativeValue ?? ''}
                      onChange={e =>
                        onUpdateInitiativeItem(item.id, {
                          initiativeValue: e.target.value ? parseInt(e.target.value, 10) : undefined
                        })
                      }
                      placeholder="Init"
                      className="w-12 px-1.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-center text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500"
                      title="Valor de iniciativa"
                    />

                    {/* Mover para Cima / Baixo */}
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 transition-all"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === items.length - 1}
                      className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 transition-all"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Remover */}
                    <button
                      onClick={() => onRemoveInitiativeItem(item.id)}
                      className="p-1 rounded hover:bg-red-950 text-zinc-500 hover:text-red-400 transition-all"
                      title="Remover da iniciativa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
