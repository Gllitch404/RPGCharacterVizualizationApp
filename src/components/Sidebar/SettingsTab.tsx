import React, { useRef } from 'react';
import { StageTheme } from '../../types';
import { Upload, RotateCcw, Monitor, Sparkles, Tv, Eye, Film } from 'lucide-react';
import { THEME_BACKGROUNDS } from '../../constants/initialData';

interface SettingsTabProps {
  theme: StageTheme;
  enableVignette: boolean;
  enableFilmGrain: boolean;
  enableScanlines: boolean;
  backgroundUrl: string;
  isTransparentBg: boolean;
  onSetTheme: (theme: StageTheme) => void;
  onSetEnableVignette: (val: boolean) => void;
  onSetEnableFilmGrain: (val: boolean) => void;
  onSetEnableScanlines: (val: boolean) => void;
  onSetBackgroundUrl: (url: string) => void;
  onSetIsTransparentBg: (val: boolean) => void;
  onResetToDefaults: () => void;
}

const THEMES: { id: StageTheme; name: string; desc: string; icon: string; badgeColor: string }[] = [
  {
    id: 'ordem',
    name: 'Ordem Paranormal',
    desc: 'Terror contemporâneo, fitas pretas e vermelhas, scanlines CRT e estética de arquivo confidencial.',
    icon: '⚡',
    badgeColor: 'bg-red-600 border-red-400 text-white'
  },
  {
    id: 'cthulhu',
    name: 'Call of Cthulhu',
    desc: 'Horror cósmico dos anos 20, fichas amareladas de dossiê, verde abissal e granulação de filme.',
    icon: '👁',
    badgeColor: 'bg-emerald-700 border-emerald-400 text-amber-100'
  },
  {
    id: 'clean',
    name: 'Persona / Modern Pop',
    desc: 'Cortes angulares nítidos, alto contraste amarelo e preto sem ruído visual de época.',
    icon: '★',
    badgeColor: 'bg-amber-400 border-amber-200 text-black'
  }
];

export const SettingsTab: React.FC<SettingsTabProps> = ({
  theme,
  enableVignette,
  enableFilmGrain,
  enableScanlines,
  backgroundUrl,
  isTransparentBg,
  onSetTheme,
  onSetEnableVignette,
  onSetEnableFilmGrain,
  onSetEnableScanlines,
  onSetBackgroundUrl,
  onSetIsTransparentBg,
  onResetToDefaults
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSetBackgroundUrl(reader.result);
        onSetIsTransparentBg(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 text-zinc-300 font-mono text-xs">
      {/* 1. Seletor de Tema e Atmosfera */}
      <div className="space-y-3">
        <label className="block font-black text-white uppercase tracking-wider text-xs">
          PRESET DE ATMOSFERA & TEMA
        </label>
        <div className="space-y-2">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => onSetTheme(t.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${
                theme === t.id
                  ? 'bg-zinc-900 border-red-500 shadow-[4px_4px_0px_#000] ring-1 ring-red-500/60'
                  : 'bg-black/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/40'
              }`}
            >
              <span className="text-xl shrink-0 mt-0.5">{t.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{t.name}</span>
                  {theme === t.id && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-red-600 text-white">
                      ATIVO
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{t.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Efeitos de Pós-Processamento da Tela (Screen FX) */}
      <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-3">
        <label className="block font-black text-white uppercase tracking-wider text-xs flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-red-500" />
          EFEITOS DE TELA & OVERLAYS
        </label>

        <div className="space-y-2.5">
          {/* Vinheta */}
          <label className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-white">Vinheta de Bordas</span>
            </div>
            <input
              type="checkbox"
              checked={enableVignette}
              onChange={e => onSetEnableVignette(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded bg-zinc-900 border-zinc-700 focus:ring-red-500"
            />
          </label>

          {/* Scanlines CRT */}
          <label className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
            <div className="flex items-center gap-2">
              <Tv className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-white">Scanlines de Monitor CRT</span>
            </div>
            <input
              type="checkbox"
              checked={enableScanlines}
              onChange={e => onSetEnableScanlines(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded bg-zinc-900 border-zinc-700 focus:ring-red-500"
            />
          </label>

          {/* Film Grain */}
          <label className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 cursor-pointer hover:border-zinc-700">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-zinc-400" />
              <span className="font-bold text-white">Granulação de Filme Analógico</span>
            </div>
            <input
              type="checkbox"
              checked={enableFilmGrain}
              onChange={e => onSetEnableFilmGrain(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded bg-zinc-900 border-zinc-700 focus:ring-red-500"
            />
          </label>
        </div>
      </div>

      {/* 3. Modo OBS / Transparência */}
      <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white">Fundo Transparente (OBS)</span>
          </div>
          <input
            type="checkbox"
            checked={isTransparentBg}
            onChange={e => onSetIsTransparentBg(e.target.checked)}
            className="w-4 h-4 text-sky-500 rounded bg-zinc-900 border-zinc-700 focus:ring-sky-500"
          />
        </div>
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          Ative para usar como <strong>Browser Source</strong> transparente no OBS Studio diretamente sobre seu mapa ou jogo.
        </p>
      </div>

      {/* 4. Cenário de Fundo (Se não transparente) */}
      {!isTransparentBg && (
        <div className="space-y-3">
          <label className="block font-black text-white uppercase tracking-wider text-xs">
            IMAGEM DE FUNDO DO CENÁRIO
          </label>

          <div className="flex gap-2">
            <input
              type="url"
              value={backgroundUrl}
              onChange={e => onSetBackgroundUrl(e.target.value)}
              placeholder="https://link-da-imagem.jpg"
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleBgUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl transition-all"
              title="Upload de imagem local"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>

          {/* Cenários Rápidos por Tema */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => onSetBackgroundUrl(THEME_BACKGROUNDS.ordem)}
              className="p-2 bg-zinc-950 border border-zinc-800 hover:border-red-500 rounded-lg text-[10px] font-bold text-center truncate"
            >
              Gabinete Ordem
            </button>
            <button
              onClick={() => onSetBackgroundUrl(THEME_BACKGROUNDS.cthulhu)}
              className="p-2 bg-zinc-950 border border-zinc-800 hover:border-emerald-500 rounded-lg text-[10px] font-bold text-center truncate"
            >
              Arquivo 1920
            </button>
            <button
              onClick={() => onSetBackgroundUrl(THEME_BACKGROUNDS.clean)}
              className="p-2 bg-zinc-950 border border-zinc-800 hover:border-amber-400 rounded-lg text-[10px] font-bold text-center truncate"
            >
              Estúdio Pop
            </button>
          </div>
        </div>
      )}

      {/* 5. Reset */}
      <div className="pt-3 border-t border-zinc-800">
        <button
          onClick={() => {
            if (window.confirm('Deseja restaurar os NPCs e configurações de fábrica?')) {
              onResetToDefaults();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-900/50 hover:bg-red-950/20 text-xs font-bold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar Padrões de Fábrica
        </button>
      </div>
    </div>
  );
};
