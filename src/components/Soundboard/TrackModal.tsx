import React, { useState, useEffect, useRef } from 'react';
import { Track, TrackCategory, TrackSource } from '../../types/soundboard';
import { extractYouTubeId, getYouTubeThumbnail } from '../../utils/youtubeHelper';
import { saveAudioFile } from '../../utils/audioStorage';
import { X, Youtube, Upload, Radio, Repeat, Volume2, Music } from 'lucide-react';

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trackData: Omit<Track, 'id'>, editingId?: string) => void;
  editingTrack: Track | null;
}

const CATEGORIES: { id: TrackCategory; label: string }[] = [
  { id: 'combate', label: '⚔️ Combate (Ação & Batalha)' },
  { id: 'suspense', label: '👁️ Suspense / Terror' },
  { id: 'ambiencia', label: '🌲 Ambiência / Exploração' },
  { id: 'taberna', label: '🍺 Taberna & Descanso' },
  { id: 'sfx', label: '⚡ Efeito Sonoro (SFX Curto)' },
  { id: 'geral', label: '🎵 Geral' }
];

export const TrackModal: React.FC<TrackModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTrack
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TrackCategory>('combate');
  const [sourceType, setSourceType] = useState<TrackSource>('youtube');
  const [sourceUrl, setSourceUrl] = useState('');
  const [volume, setVolume] = useState(0.85);
  const [loop, setLoop] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileBlob, setFileBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTrack) {
      setTitle(editingTrack.title);
      setCategory(editingTrack.category);
      setSourceType(editingTrack.sourceType);
      setSourceUrl(editingTrack.sourceUrl);
      setVolume(editingTrack.volume);
      setLoop(editingTrack.loop);
      setThumbnailUrl(editingTrack.thumbnailUrl || '');
      setFileName(editingTrack.fileName || '');
      setFileBlob(null);
    } else {
      setTitle('');
      setCategory('combate');
      setSourceType('youtube');
      setSourceUrl('');
      setVolume(0.85);
      setLoop(true);
      setThumbnailUrl('');
      setFileName('');
      setFileBlob(null);
    }
    setError(null);
  }, [editingTrack, isOpen]);

  // Ao digitar link do YouTube, atualizar thumbnail automaticamente
  const handleYouTubeUrlChange = (val: string) => {
    setSourceUrl(val);
    const videoId = extractYouTubeId(val);
    if (videoId) {
      setThumbnailUrl(getYouTubeThumbnail(videoId));
      setError(null);
    }
  };

  // Upload de arquivo local de áudio
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|webm|flac)$/i)) {
      setError('Por favor selecione um arquivo de áudio válido (MP3, WAV, OGG, M4A, WebM).');
      return;
    }

    setFileBlob(file);
    setFileName(file.name);
    if (!title.trim()) {
      // Auto-preencher título a partir do nome do arquivo
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Por favor, informe um título para a trilha.');
      return;
    }

    let finalSourceUrl = sourceUrl;
    let fileDataId = editingTrack?.fileDataId;

    if (sourceType === 'youtube') {
      const videoId = extractYouTubeId(sourceUrl);
      if (!videoId) {
        setError('Link do YouTube inválido. Cole a URL completa ou o ID do vídeo.');
        return;
      }
      finalSourceUrl = `https://www.youtube.com/watch?v=${videoId}`;
    } else if (sourceType === 'file') {
      if (!fileBlob && !editingTrack?.fileDataId) {
        setError('Por favor selecione um arquivo de áudio do seu computador.');
        return;
      }

      // Se um novo arquivo foi selecionado, salvar no IndexedDB
      if (fileBlob) {
        fileDataId = `audio-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        await saveAudioFile(fileDataId, fileBlob);
        finalSourceUrl = URL.createObjectURL(fileBlob);
      }
    } else if (sourceType === 'url') {
      if (!sourceUrl.trim()) {
        setError('Por favor informe a URL do arquivo de áudio.');
        return;
      }
    }

    onSave(
      {
        title: title.trim(),
        category,
        sourceType,
        sourceUrl: finalSourceUrl,
        fileDataId,
        fileName: fileName || undefined,
        volume,
        loop,
        thumbnailUrl: thumbnailUrl || undefined
      },
      editingTrack ? editingTrack.id : undefined
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 font-mono">
      <div className="relative w-full max-w-lg bg-zinc-950 border-2 border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header do Modal */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-black/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-600 flex items-center justify-center">
              <Music className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                {editingTrack ? 'EDITAR TRILHA SONORA' : 'NOVA TRILHA SONORA'}
              </h2>
              <span className="text-[10px] text-zinc-400">
                Adicione músicas para a sua soundboard com troca suave
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-600 rounded-xl text-rose-300 font-bold">
              {error}
            </div>
          )}

          {/* 1. Título */}
          <div className="space-y-1.5">
            <label className="block font-bold text-white uppercase">Nome da Música / Efeito</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Combate contra o Boss, Chuva Noturna..."
              className="w-full px-3.5 py-2.5 bg-black/70 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-sans"
              required
            />
          </div>

          {/* 2. Categoria */}
          <div className="space-y-1.5">
            <label className="block font-bold text-white uppercase">Categoria</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as TrackCategory)}
              className="w-full px-3.5 py-2.5 bg-black/70 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-red-500 font-sans"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Tipo de Origem (Abas: YouTube, Arquivo Local, URL Direta) */}
          <div className="space-y-2 pt-1">
            <label className="block font-bold text-white uppercase">Origem do Áudio</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSourceType('youtube')}
                className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold uppercase text-[11px] transition-all ${
                  sourceType === 'youtube'
                    ? 'bg-red-600 border-red-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Youtube className="w-4 h-4" />
                <span>YouTube</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('file')}
                className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold uppercase text-[11px] transition-all ${
                  sourceType === 'file'
                    ? 'bg-cyan-700 border-cyan-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Arquivo MP3</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('url')}
                className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 font-bold uppercase text-[11px] transition-all ${
                  sourceType === 'url'
                    ? 'bg-sky-600 border-sky-500 text-white shadow-sm'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Radio className="w-4 h-4" />
                <span>URL Web</span>
              </button>
            </div>

            {/* Campo específico por tipo */}
            {sourceType === 'youtube' && (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={e => handleYouTubeUrlChange(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3.5 py-2.5 bg-black/70 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 font-sans"
                />
                {thumbnailUrl && (
                  <div className="flex items-center gap-2.5 p-2 bg-zinc-900/60 rounded-xl border border-zinc-800">
                    <img src={thumbnailUrl} alt="Preview" className="w-16 h-10 object-cover rounded-lg" />
                    <span className="text-[10px] text-emerald-400 font-bold">
                      ✓ Vídeo do YouTube identificado com sucesso
                    </span>
                  </div>
                )}
              </div>
            )}

            {sourceType === 'file' && (
              <div className="space-y-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-zinc-700 hover:border-cyan-500 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 flex flex-col items-center justify-center gap-1.5 transition-all"
                >
                  <Upload className="w-6 h-6 text-cyan-400" />
                  <span className="font-bold text-white">
                    {fileName ? `Arquivo: ${fileName}` : 'Clique para selecionar arquivo de áudio do computador'}
                  </span>
                  <span className="text-[10px] text-zinc-500">Suporta MP3, WAV, OGG, M4A e WebM</span>
                </button>
              </div>
            )}

            {sourceType === 'url' && (
              <div className="space-y-2 pt-1">
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={e => setSourceUrl(e.target.value)}
                  placeholder="https://exemplo.com/audio.mp3"
                  className="w-full px-3.5 py-2.5 bg-black/70 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500 font-sans"
                />
              </div>
            )}
          </div>

          {/* 4. Volume Padrão & Repetição Seamless */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
            {/* Volume */}
            <div className="space-y-1.5">
              <label className="flex items-center justify-between font-bold text-white uppercase">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-zinc-400" /> Volume
                </span>
                <span>{Math.round(volume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
            </div>

            {/* Loop Toggle */}
            <div className="space-y-1.5">
              <label className="block font-bold text-white uppercase">Repetição</label>
              <button
                type="button"
                onClick={() => setLoop(prev => !prev)}
                className={`w-full py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 font-bold uppercase transition-all ${
                  loop
                    ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>{loop ? 'Loop Seamless Ativo' : 'Tocar 1 Vez'}</span>
              </button>
            </div>
          </div>

          {/* Rodapé com Botões */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold uppercase transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_#000]"
            >
              {editingTrack ? 'Salvar Alterações' : 'Adicionar Trilha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
