import React from 'react';
import { Track, TrackCategory } from '../../types/soundboard';
import {
  Play,
  Square,
  Volume2,
  Repeat,
  Edit2,
  Trash2,
  Youtube,
  FileAudio,
  Radio,
  Sparkles,
  Zap
} from 'lucide-react';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isSfxPlaying?: boolean;
  onTogglePlay: (track: Track) => void;
  onToggleLoop: (id: string, loop: boolean) => void;
  onChangeVolume: (id: string, volume: number) => void;
  onEdit: (track: Track) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_STYLES: Record<TrackCategory, { label: string; badge: string; border: string }> = {
  combate: {
    label: 'COMBATE',
    badge: 'bg-red-950/80 text-red-300 border-red-600/50',
    border: 'border-red-600/60'
  },
  suspense: {
    label: 'SUSPENSE / TERROR',
    badge: 'bg-purple-950/80 text-purple-300 border-purple-600/50',
    border: 'border-purple-600/60'
  },
  ambiencia: {
    label: 'AMBIÊNCIA',
    badge: 'bg-sky-950/80 text-sky-300 border-sky-600/50',
    border: 'border-sky-600/60'
  },
  taberna: {
    label: 'TABERNA & DESCANSO',
    badge: 'bg-amber-950/80 text-amber-300 border-amber-600/50',
    border: 'border-amber-600/60'
  },
  sfx: {
    label: 'EFEITO (SFX)',
    badge: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/50',
    border: 'border-emerald-600/60'
  },
  geral: {
    label: 'GERAL',
    badge: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    border: 'border-zinc-700'
  }
};

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isSfxPlaying,
  onTogglePlay,
  onToggleLoop,
  onChangeVolume,
  onEdit,
  onDelete
}) => {
  const categoryConfig = CATEGORY_STYLES[track.category] || CATEGORY_STYLES.geral;
  const isSfx = track.category === 'sfx';
  const activeState = isSfx ? Boolean(isSfxPlaying) : isPlaying;

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between gap-3.5 overflow-hidden font-mono ${
        activeState
          ? isSfx
            ? 'bg-zinc-900 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500'
            : 'bg-zinc-900 border-red-500 shadow-[0_0_25px_rgba(225,29,72,0.3)] ring-1 ring-red-500'
          : 'bg-zinc-950/90 border-zinc-800/80 hover:border-zinc-700'
      }`}
    >
      {/* Topo do Card: Categoria, Fonte e Loop */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${categoryConfig.badge}`}
        >
          {categoryConfig.label}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Badge da Fonte */}
          {track.sourceType === 'youtube' && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-red-600/20 border border-red-500/40 text-red-400 font-bold"
              title="Áudio do YouTube"
            >
              <Youtube className="w-3 h-3" />
              <span>YT</span>
            </span>
          )}
          {track.sourceType === 'file' && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 font-bold"
              title="Arquivo de Áudio Local"
            >
              <FileAudio className="w-3 h-3" />
              <span>MP3</span>
            </span>
          )}
          {track.sourceType === 'url' && (
            <span
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] bg-sky-950/80 border border-sky-500/40 text-sky-400 font-bold"
              title="Stream / URL Direta"
            >
              <Radio className="w-3 h-3" />
              <span>STREAM</span>
            </span>
          )}

          {/* Toggle de Loop Seamless */}
          <button
            onClick={() => onToggleLoop(track.id, !track.loop)}
            className={`p-1 rounded-md text-[10px] flex items-center gap-1 transition-all border ${
              track.loop
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-600/60 font-bold'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'
            }`}
            title={track.loop ? 'Loop Contínuo Ativo (Seamless)' : 'Loop Desativado (Toca 1 vez)'}
          >
            <Repeat className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Conteúdo Central: Miniatura + Título */}
      <div className="flex items-center gap-3">
        {track.thumbnailUrl ? (
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-800 bg-black relative group">
            <img
              src={track.thumbnailUrl}
              alt={track.title}
              className={`w-full h-full object-cover transition-all ${
                activeState ? 'scale-110' : 'grayscale group-hover:grayscale-0'
              }`}
            />
            {activeState && (
              <div
                className={`absolute inset-0 flex items-center justify-center ${
                  isSfx ? 'bg-emerald-600/30' : 'bg-red-600/30'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-ping ${
                    isSfx ? 'bg-emerald-400' : 'bg-red-500'
                  }`}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            className={`w-14 h-14 rounded-xl shrink-0 flex items-center justify-center border ${
              activeState
                ? isSfx
                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                  : 'bg-red-600/20 border-red-500 text-red-400'
                : 'bg-zinc-900 border-zinc-800 text-zinc-500'
            }`}
          >
            {isSfx ? <Zap className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4
            onClick={() => onTogglePlay(track)}
            className={`font-black text-xs sm:text-sm line-clamp-2 cursor-pointer hover:underline leading-snug ${
              activeState ? 'text-white' : 'text-zinc-200'
            }`}
          >
            {track.title}
          </h4>

          {/* Equalizador animado quando tocando / disparado */}
          {activeState && (
            <div className="flex items-end gap-1 mt-1.5 h-3">
              <span
                className={`w-1 h-3 rounded-full animate-bounce [animation-delay:-0.3s] ${
                  isSfx ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
              <span
                className={`w-1 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${
                  isSfx ? 'bg-emerald-400' : 'bg-red-400'
                }`}
              />
              <span
                className={`w-1 h-3.5 rounded-full animate-bounce [animation-delay:-0.45s] ${
                  isSfx ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
              <span
                className={`w-1 h-1.5 rounded-full animate-bounce [animation-delay:-0.2s] ${
                  isSfx ? 'bg-emerald-400' : 'bg-red-400'
                }`}
              />
              <span
                className={`text-[10px] font-bold ml-1.5 uppercase ${
                  isSfx ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isSfx ? 'SFX DISPARADO' : 'EM EXECUÇÃO'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Botão Principal de Tocar / Disparar SFX */}
      <button
        onClick={() => onTogglePlay(track)}
        className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[2px_2px_0px_#000] active:scale-95 ${
          activeState
            ? isSfx
              ? track.loop
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
              : 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.4)]'
            : isSfx
            ? 'bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 hover:border-emerald-500 text-emerald-300'
            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700'
        }`}
        title={isSfx ? 'Dispara este efeito sonoro imediatamente sem interromper a música ambiente' : undefined}
      >
        {isSfx ? (
          activeState && track.loop ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>PARAR SFX (LOOP)</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{activeState ? 'DISPARAR NOVAMENTE' : 'DISPARAR SFX (SOBREPOR)'}</span>
            </>
          )
        ) : isPlaying ? (
          <>
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>PARAR FAIXA (FADE-OUT)</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>REPRODUZIR COM FADE</span>
          </>
        )}
      </button>

      {/* Rodapé: Controle de Volume Individual + Ações */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-zinc-800/80">
        {/* Slider de Volume Individual */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Volume2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={track.volume}
            onChange={e => onChangeVolume(track.id, parseFloat(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
            title={`Volume: ${Math.round(track.volume * 100)}%`}
          />
          <span className="text-[10px] text-zinc-400 font-bold w-7 text-right shrink-0">
            {Math.round(track.volume * 100)}%
          </span>
        </div>

        {/* Botões Editar & Excluir */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(track)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
            title="Editar faixa"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(track.id)}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950 border border-zinc-800 hover:border-rose-600 text-zinc-400 hover:text-rose-400 transition-all"
            title="Excluir faixa"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
