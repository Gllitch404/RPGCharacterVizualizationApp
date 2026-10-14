import React, { useState, useMemo } from 'react';
import { Track, TrackCategory } from '../../types/soundboard';
import { useSoundboardContext } from '../../context/SoundboardContext';
import { TrackCard } from './TrackCard';
import { TrackModal } from './TrackModal';
import {
  Volume2,
  VolumeX,
  Square,
  Plus,
  Search,
  Music,
  Radio,
  SlidersHorizontal
} from 'lucide-react';

export const SoundboardTab: React.FC = () => {
  const {
    tracks,
    config,
    activeTrackId,
    isPlaying,
    activeTrack,
    playingSfxIds,
    toggleTrack,
    stopAll,
    setMasterVolume,
    setCrossfadeDuration,
    addTrack,
    updateTrack,
    deleteTrack
  } = useSoundboardContext();

  const [filterCategory, setFilterCategory] = useState<'all' | TrackCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  const filteredTracks = useMemo(() => {
    return tracks.filter(t => {
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          t.sourceType.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [tracks, filterCategory, searchQuery]);

  const handleOpenCreateModal = () => {
    setEditingTrack(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (track: Track) => {
    setEditingTrack(track);
    setIsModalOpen(true);
  };

  const handleSaveTrack = (trackData: Omit<Track, 'id'>, editingId?: string) => {
    if (editingId) {
      updateTrack(editingId, trackData);
    } else {
      addTrack(trackData);
    }
  };

  const handleToggleLoop = (id: string, loop: boolean) => {
    updateTrack(id, { loop });
  };

  const handleChangeVolume = (id: string, volume: number) => {
    updateTrack(id, { volume });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-mono pb-24">
      {/* ── BARRA MASTER DE CONTROLES DE ÁUDIO ────────────────────────────── */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Lado Esquerdo: Volume Master & Crossfade Duration */}
        <div className="flex items-center gap-6 flex-wrap">
          {/* Volume Geral Master */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMasterVolume(config.masterVolume > 0 ? 0 : 0.8)}
              className="p-2 rounded-xl bg-black/60 border border-zinc-800 text-zinc-300 hover:text-white transition-all"
              title={config.masterVolume === 0 ? 'Desmutar Volume Geral' : 'Mutar Volume Geral'}
            >
              {config.masterVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-zinc-300" />
              )}
            </button>
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-white uppercase">
                <span>VOLUME GERAL</span>
                <span className="text-red-400">{Math.round(config.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.masterVolume}
                onChange={e => setMasterVolume(parseFloat(e.target.value))}
                className="w-28 sm:w-36 h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>
          </div>

          {/* Duração do Crossfade (Troca Suave) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-white uppercase">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3 text-red-500" /> TROCA SUAVE (CROSSFADE)
              </span>
              <span className="text-red-400">{config.crossfadeDuration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={config.crossfadeDuration}
              onChange={e => setCrossfadeDuration(parseFloat(e.target.value))}
              className="w-28 sm:w-36 h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-red-500"
              title="Tempo de transição entre músicas para que uma suba enquanto a outra desce suavemente"
            />
          </div>
        </div>

        {/* Lado Direito: Parar Tudo & Nova Trilha */}
        <div className="flex items-center gap-2.5">
          {isPlaying && (
            <button
              onClick={() => stopAll(1200)}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-600/70 text-rose-300 font-bold text-xs uppercase transition-all shadow-[2px_2px_0px_#000] active:scale-95 animate-pulse"
              title="Parar qualquer música tocando com fade-out gradual"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>PARAR TUDO (FADE-OUT)</span>
            </button>
          )}

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-[3px_3px_0px_#000] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ADICIONAR TRILHA</span>
          </button>
        </div>
      </div>

      {/* ── BANNER DA FAIXA EM REPRODUÇÃO ATIVA ──────────────────────────── */}
      <div className="bg-black/80 border border-zinc-800 rounded-2xl px-4 sm:px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Radio className={`w-4 h-4 shrink-0 ${isPlaying ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`} />
          <div className="truncate">
            <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mr-2">
              REPRODUZINDO AGORA:
            </span>
            {activeTrack && isPlaying ? (
              <span className="text-xs sm:text-sm font-black text-white truncate">
                {activeTrack.title}
                <span className="ml-2 text-[10px] text-red-400 font-bold uppercase">
                  ({activeTrack.category.toUpperCase()})
                </span>
              </span>
            ) : (
              <span className="text-xs text-zinc-500 italic">
                Nenhuma trilha sonora em execução (clique em qualquer cartão abaixo para reproduzir)
              </span>
            )}
          </div>
        </div>

        {activeTrack && isPlaying && (
          <button
            onClick={() => stopAll(1000)}
            className="shrink-0 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-[11px] font-bold uppercase transition-all"
          >
            PARAR
          </button>
        )}
      </div>

      {/* ── BARRA DE FILTROS POR CATEGORIA & BUSCA ────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800">
        {/* Chips de Categoria */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              filterCategory === 'all'
                ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            TODAS ({tracks.length})
          </button>
          <button
            onClick={() => setFilterCategory('combate')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              filterCategory === 'combate'
                ? 'bg-red-950/80 text-red-300 border border-red-600/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ⚔️ COMBATE
          </button>
          <button
            onClick={() => setFilterCategory('suspense')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              filterCategory === 'suspense'
                ? 'bg-purple-950/80 text-purple-300 border border-purple-600/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            👁️ TERROR
          </button>
          <button
            onClick={() => setFilterCategory('ambiencia')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              filterCategory === 'ambiencia'
                ? 'bg-sky-950/80 text-sky-300 border border-sky-600/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🌲 AMBIÊNCIA
          </button>
          <button
            onClick={() => setFilterCategory('taberna')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              filterCategory === 'taberna'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-600/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            🍺 TABERNA
          </button>
          <button
            onClick={() => setFilterCategory('sfx')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
              filterCategory === 'sfx'
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ⚡ SFX
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar trilha ou efeito..."
            className="w-full pl-9 pr-4 py-2 bg-black/60 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-sans"
          />
        </div>
      </div>

      {/* ── GRID DE CARTÕES DE MÚSICAS & EFEITOS ────────────────────────── */}
      {filteredTracks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTracks.map(track => (
            <TrackCard
              key={track.id}
              track={track}
              isPlaying={activeTrackId === track.id && isPlaying}
              isSfxPlaying={playingSfxIds.includes(track.id)}
              onTogglePlay={toggleTrack}
              onToggleLoop={handleToggleLoop}
              onChangeVolume={handleChangeVolume}
              onEdit={handleOpenEditModal}
              onDelete={deleteTrack}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-zinc-900/40 rounded-2xl border border-zinc-800">
          <Music className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white uppercase">
            NENHUMA TRILHA ENCONTRADA
          </h3>
          <p className="text-xs text-zinc-400 mt-1 mb-4">
            Adicione uma música do YouTube ou faça upload de um MP3 local para a sua sessão.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-[2px_2px_0px_#000]"
          >
            Adicionar Trilha Sonora
          </button>
        </div>
      )}

      {/* ── MODAL DE ADICIONAR / EDITAR TRILHA ──────────────────────────── */}
      <TrackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTrack}
        editingTrack={editingTrack}
      />
    </div>
  );
};
