import React from 'react';
import { NPC, StageTheme } from '../../types';
import { Mic, MicOff, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';

interface NPCCardProps {
  npc: NPC;
  theme: StageTheme;
  isActive: boolean;
  onToggleSpeaker: (id: string) => void;
  onToggleStage: (id: string) => void;
  onEdit: (npc: NPC) => void;
  onDelete: (id: string) => void;
}

export const NPCCard: React.FC<NPCCardProps> = ({
  npc,
  theme,
  isActive,
  onToggleSpeaker,
  onToggleStage,
  onEdit,
  onDelete
}) => {
  const getActiveBorder = () => {
    if (!isActive) return npc.isOnStage ? 'bg-zinc-900/90 border-zinc-800' : 'bg-black/60 border-zinc-900 opacity-65';
    if (theme === 'ordem') return 'bg-red-950/40 border-red-600 ring-1 ring-red-500/50 shadow-[4px_4px_0px_#7f1d1d]';
    if (theme === 'cthulhu') return 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-400/50 shadow-[4px_4px_0px_#064e3b]';
    return 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400/50 shadow-[4px_4px_0px_#000]';
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-200 p-3 flex items-center gap-3 ${getActiveBorder()}`}
    >
      {/* Miniatura do Avatar com botão de fala rápido */}
      <button
        onClick={() => onToggleSpeaker(npc.id)}
        className="relative w-12 h-12 rounded-lg bg-black border border-zinc-700 overflow-hidden shrink-0 group/avatar focus:outline-none focus:ring-2 focus:ring-red-500"
        title="Clique para alternar voz ativa"
      >
        <img
          src={npc.avatarUrl}
          alt={npc.name}
          className={`w-full h-full object-cover transition-all ${
            isActive ? 'scale-110' : 'grayscale opacity-75 group-hover/avatar:grayscale-0 group-hover/avatar:opacity-100'
          }`}
        />
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            isActive ? 'bg-red-600/40 opacity-100' : 'bg-black/50 opacity-0 group-hover/avatar:opacity-100'
          }`}
        >
          {isActive ? (
            <Mic className="w-5 h-5 text-white animate-pulse" />
          ) : (
            <MicOff className="w-4 h-4 text-zinc-300" />
          )}
        </div>
      </button>

      {/* Informações do NPC */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          {npc.tag && (
            <span
              className={`px-1.5 py-0.2 text-[9px] font-mono font-black uppercase tracking-wider rounded border ${
                isActive
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {npc.tag}
            </span>
          )}
          <h3
            onClick={() => onToggleSpeaker(npc.id)}
            className={`font-bold text-sm truncate cursor-pointer hover:underline ${
              isActive ? 'text-white' : 'text-zinc-200'
            }`}
          >
            {npc.name}
          </h3>
          <span
            className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-black shrink-0 border ${
              isActive
                ? 'bg-red-600 text-white border-red-400'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
            title={`Atalho: Tecla [ ${npc.shortcutKey.toUpperCase()} ]`}
          >
            {npc.shortcutKey.toUpperCase()}
          </span>
        </div>

        {npc.title ? (
          <p className="text-xs text-zinc-400 truncate mt-0.5 font-mono">{npc.title}</p>
        ) : (
          <p className="text-[11px] text-zinc-500 italic mt-0.5">
            {npc.isOnStage ? 'Em cena' : 'No banco'}
          </p>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Toggle Em Cena / Banco */}
        <button
          onClick={() => onToggleStage(npc.id)}
          className={`p-1.5 rounded-lg border transition-all ${
            npc.isOnStage
              ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-400 hover:bg-emerald-900/80'
              : 'bg-zinc-800/80 border-zinc-700 text-zinc-500 hover:text-zinc-300'
          }`}
          title={npc.isOnStage ? 'Em Cena (Clique para mandar para o banco)' : 'No Banco (Clique para pôr em cena)'}
        >
          {npc.isOnStage ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        {/* Editar */}
        <button
          onClick={() => onEdit(npc)}
          className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/50 transition-all"
          title="Editar NPC"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        {/* Excluir */}
        <button
          onClick={() => onDelete(npc.id)}
          className="p-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700 text-zinc-400 hover:text-rose-400 hover:border-rose-500/50 transition-all"
          title="Excluir NPC"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
