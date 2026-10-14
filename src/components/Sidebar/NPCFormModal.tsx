import React, { useState, useEffect, useRef } from 'react';
import { NPC } from '../../types';
import { PRESET_AVATARS } from '../../constants/initialData';
import { X, Upload, Link as LinkIcon, Sparkles, Keyboard, Check } from 'lucide-react';

interface NPCFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (npcData: Omit<NPC, 'id'>, idToUpdate?: string) => void;
  editingNPC: NPC | null;
}

const TAG_SUGGESTIONS = ['INVESTIGADOR', 'OCULTISTA', 'AGENTE', 'CIVIL', 'ARQUIVISTA', 'TESTEMUNHA', 'MONSTRO'];

export const NPCFormModal: React.FC<NPCFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingNPC
}) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('INVESTIGADOR');
  const [title, setTitle] = useState('');
  const [accentColor, setAccentColor] = useState('#e11d48');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [isFullCardArt, setIsFullCardArt] = useState(false);
  const [shortcutKey, setShortcutKey] = useState('');
  const [isOnStage, setIsOnStage] = useState(true);
  const [isRecordingKey, setIsRecordingKey] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<'preset' | 'upload' | 'url'>('preset');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingNPC) {
      setName(editingNPC.name);
      setTag(editingNPC.tag || 'INVESTIGADOR');
      setTitle(editingNPC.title || '');
      setAccentColor(editingNPC.accentColor || '#e11d48');
      setAvatarUrl(editingNPC.avatarUrl);
      setIconUrl(editingNPC.iconUrl || '');
      setIsFullCardArt(editingNPC.isFullCardArt || false);
      setShortcutKey(editingNPC.shortcutKey);
      setIsOnStage(editingNPC.isOnStage);
      setActiveImageTab('url');
    } else {
      setName('');
      setTag('INVESTIGADOR');
      setTitle('');
      setAccentColor(PRESET_AVATARS[0].accentColor || '#e11d48');
      setAvatarUrl(PRESET_AVATARS[0].url);
      setIconUrl('');
      setIsFullCardArt(false);
      setShortcutKey('');
      setIsOnStage(true);
      setActiveImageTab('preset');
    }
    setError(null);
    setIsRecordingKey(false);
  }, [editingNPC, isOpen]);

  // Listener para capturar tecla
  useEffect(() => {
    if (!isRecordingKey) return;

    const handleKeyCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      let key = e.key;
      if (e.code.startsWith('Numpad')) {
        key = e.code.replace('Numpad', '');
      } else if (e.code.startsWith('Digit')) {
        key = e.code.replace('Digit', '');
      }

      setShortcutKey(key);
      setIsRecordingKey(false);
    };

    window.addEventListener('keydown', handleKeyCapture, { capture: true, once: true });
    return () => {
      window.removeEventListener('keydown', handleKeyCapture, { capture: true });
    };
  }, [isRecordingKey]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        setError(null);
      }
    };
    reader.onerror = () => {
      setError('Erro ao ler a imagem selecionada.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome do personagem.');
      return;
    }
    if (!avatarUrl.trim()) {
      setError('Por favor, defina a imagem do avatar.');
      return;
    }
    if (!shortcutKey.trim()) {
      setError('Por favor, defina uma tecla de atalho.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        tag: tag.trim() || undefined,
        title: title.trim() || undefined,
        accentColor: accentColor || undefined,
        avatarUrl: avatarUrl.trim(),
        iconUrl: iconUrl.trim() || undefined,
        isFullCardArt,
        shortcutKey: shortcutKey.trim(),
        isOnStage
      },
      editingNPC ? editingNPC.id : undefined
    );

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-zinc-950 border-2 border-red-600/70 rounded-2xl shadow-[10px_10px_0px_#000] overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header do Modal */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/90">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-600 rotate-45" />
            <h2 className="text-base font-mono font-black text-white uppercase tracking-wider">
              {editingNPC ? 'EDITAR PERSONAGEM' : 'NOVO PERSONAGEM'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-600 text-red-200 text-xs font-mono">
              [ERRO]: {error}
            </div>
          )}

          {/* Nome e Tag */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
                Nome do Personagem *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Arthur Foster"
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 text-sm font-medium"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
                Tag / Função
              </label>
              <input
                type="text"
                value={tag}
                onChange={e => setTag(e.target.value.toUpperCase())}
                placeholder="Ex: AGENTE"
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-red-400 font-mono font-bold text-xs uppercase focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Sugestões de Tags Rápidas */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-zinc-500">Tags rápidas:</span>
            {TAG_SUGGESTIONS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all ${
                  tag === t
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Ocupação / Título */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
              Ocupação / Subtítulo (Opcional)
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Detetive Particular & Perito"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          {/* Tecla de Atalho */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">
              Tecla de Atalho (Macro / Stream Deck) *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shortcutKey}
                onChange={e => setShortcutKey(e.target.value)}
                placeholder="Ex: 1, 2, q"
                className="w-24 text-center font-mono font-black uppercase px-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-red-400 focus:outline-none focus:border-red-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setIsRecordingKey(true)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-mono font-bold uppercase transition-all ${
                  isRecordingKey
                    ? 'bg-red-600 text-white border-red-400 animate-pulse'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Keyboard className="w-4 h-4" />
                {isRecordingKey ? 'Pressione a tecla...' : 'Gravar Tecla'}
              </button>
            </div>
          </div>

          {/* Imagem do Avatar */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-2">
              Avatar do Personagem *
            </label>

            {/* Abas */}
            <div className="flex rounded-lg bg-black p-1 border border-zinc-800 mb-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveImageTab('preset')}
                className={`flex-1 py-1.5 font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  activeImageTab === 'preset'
                    ? 'bg-zinc-800 text-red-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Presets
              </button>
              <button
                type="button"
                onClick={() => setActiveImageTab('upload')}
                className={`flex-1 py-1.5 font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  activeImageTab === 'upload'
                    ? 'bg-zinc-800 text-red-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
              <button
                type="button"
                onClick={() => setActiveImageTab('url')}
                className={`flex-1 py-1.5 font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  activeImageTab === 'url'
                    ? 'bg-zinc-800 text-red-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Link URL
              </button>
            </div>

            {/* Presets */}
            {activeImageTab === 'preset' && (
              <div className="grid grid-cols-4 gap-2">
                {PRESET_AVATARS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(preset.url);
                      if (!name) setName(preset.name);
                      if (preset.tag) setTag(preset.tag);
                      if (preset.title) setTitle(preset.title);
                    }}
                    className={`relative rounded-xl border p-1.5 flex flex-col items-center gap-1 bg-zinc-900 transition-all ${
                      avatarUrl === preset.url
                        ? 'border-red-500 ring-2 ring-red-500/40'
                        : 'border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-14 h-14 object-contain rounded-lg"
                    />
                    <span className="text-[9px] font-mono font-bold text-zinc-400 truncate w-full text-center">
                      {preset.name}
                    </span>
                    {avatarUrl === preset.url && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Upload */}
            {activeImageTab === 'upload' && (
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-red-500/70 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all bg-zinc-900/60"
                >
                  <Upload className="w-6 h-6 text-red-500 mb-1" />
                  <p className="text-xs font-mono font-bold text-zinc-200">Selecionar arquivo de imagem</p>
                  <p className="text-[10px] text-zinc-500 font-mono">PNG, JPG, SVG, WebP (Salvo em Base64)</p>
                </div>
              </div>
            )}

            {/* URL */}
            {activeImageTab === 'url' && (
              <div>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={e => setAvatarUrl(e.target.value)}
                  placeholder="https://exemplo.com/personagem.png"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 text-xs font-mono"
                />
              </div>
            )}

            {/* Preview */}
            {avatarUrl && (
              <div className="mt-3 p-2 bg-black rounded-xl border border-zinc-800 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <div className="text-xs font-mono text-zinc-400 truncate">
                  <span className="font-bold text-red-400 block">Avatar Ativo</span>
                  <span className="truncate block opacity-70">{avatarUrl.substring(0, 45)}...</span>
                </div>
              </div>
            )}
          </div>

          {/* Configurações de Carta para Iniciativa & HUD */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-3">
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase flex items-center justify-between">
              <span>CARTA DE INICIATIVA & ÍCONE</span>
              <span className="text-[10px] text-zinc-500 font-normal">Opcional</span>
            </label>

            {/* Checkbox para arte completa de carta vs molde com avatar */}
            <label className="flex items-start gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={isFullCardArt}
                onChange={e => setIsFullCardArt(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-red-600 rounded bg-zinc-950 border-zinc-700 focus:ring-red-500"
              />
              <div className="text-xs font-mono">
                <span className="font-bold text-white block">Arte Completa de Carta (Vertical / TCG)</span>
                <span className="text-zinc-400 text-[11px] leading-relaxed block">
                  Marque se a imagem é uma ilustração vertical de carta inteira. Se desmarcado, o avatar quadrado será posicionado dentro do molde padrão de carta com moldura e nome.
                </span>
              </div>
            </label>

            {/* Ícone específico opcional para a iniciativa */}
            <div>
              <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                Ícone/Arte Alternativa para a Iniciativa (se diferente do avatar principal):
              </label>
              <input
                type="url"
                value={iconUrl}
                onChange={e => setIconUrl(e.target.value)}
                placeholder="https://exemplo.com/icone-carta.png (Deixe vazio para usar o avatar)"
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 text-xs font-mono"
              />
            </div>
          </div>

          {/* Em Cena Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-3 p-3 bg-zinc-900/80 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-all">
              <input
                type="checkbox"
                checked={isOnStage}
                onChange={e => setIsOnStage(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded bg-zinc-950 border-zinc-700 focus:ring-red-500"
              />
              <div className="text-xs font-mono">
                <span className="font-bold text-white block">Exibir no Palco Imediatamente</span>
                <span className="text-zinc-500 text-[11px]">Se desmarcado, ficará no banco de reservas.</span>
              </div>
            </label>
          </div>

          {/* Rodapé */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-white transition-all shadow-[4px_4px_0px_#000] active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {editingNPC ? 'SALVAR ALTERAÇÕES' : 'CRIAR PERSONAGEM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
