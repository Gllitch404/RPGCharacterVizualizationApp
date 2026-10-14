import React, { useRef } from 'react';
import { StageTheme } from '../../types';
import {
  Upload,
  RotateCcw,
  Monitor,
  Sparkles,
  Tv,
  Eye,
  EyeOff,
  Film,
  Save,
  Download,
  HardDrive,
  Check,
  AlertCircle,
  Clock,
  Focus
} from 'lucide-react';
import { THEME_BACKGROUNDS } from '../../constants/initialData';

interface SettingsTabProps {
  theme: StageTheme;
  enableVignette: boolean;
  enableFilmGrain: boolean;
  enableScanlines: boolean;
  enableBlur?: boolean;
  blurIntensity?: number;
  blurTarget?: 'background' | 'all';
  backgroundUrl: string;
  isTransparentBg: boolean;
  hideStageControls?: boolean;
  onSetTheme: (theme: StageTheme) => void;
  onSetEnableVignette: (val: boolean) => void;
  onSetEnableFilmGrain: (val: boolean) => void;
  onSetEnableScanlines: (val: boolean) => void;
  onSetEnableBlur?: (val: boolean) => void;
  onSetBlurIntensity?: (val: number) => void;
  onSetBlurTarget?: (val: 'background' | 'all') => void;
  onSetBackgroundUrl: (url: string) => void;
  onSetIsTransparentBg: (val: boolean) => void;
  onSetHideStageControls?: (val: boolean) => void;
  onResetToDefaults: () => void;
  onSaveCampaign?: () => void;
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedTime?: number | null;
  onExportCampaign?: () => void;
  onImportCampaign?: () => void;
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
  enableBlur = false,
  blurIntensity = 8,
  blurTarget = 'background',
  backgroundUrl,
  isTransparentBg,
  hideStageControls,
  onSetTheme,
  onSetEnableVignette,
  onSetEnableFilmGrain,
  onSetEnableScanlines,
  onSetEnableBlur,
  onSetBlurIntensity,
  onSetBlurTarget,
  onSetBackgroundUrl,
  onSetIsTransparentBg,
  onSetHideStageControls,
  onResetToDefaults,
  onSaveCampaign,
  saveStatus = 'idle',
  lastSavedTime,
  onExportCampaign,
  onImportCampaign
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

          {/* Desfoque de Tela (Borrão / Blur Overlay) */}
          <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 space-y-2.5 hover:border-zinc-700 transition-colors">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Focus className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-bold text-white text-xs block">Desfoque de Tela (Borrão / Blur)</span>
                  <span className="text-[10px] text-zinc-500 block">Névoa, profundidade ou borrão cinemático</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableBlur}
                onChange={e => onSetEnableBlur && onSetEnableBlur(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded bg-zinc-900 border-zinc-700 focus:ring-amber-500 cursor-pointer"
              />
            </label>

            {/* Ajustes quando o Desfoque está ativo */}
            {enableBlur && (
              <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
                {/* Intensidade do Blur */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-400">Intensidade:</span>
                    <span className="text-amber-400 font-bold">{blurIntensity}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="24"
                    step="2"
                    value={blurIntensity}
                    onChange={e => onSetBlurIntensity && onSetBlurIntensity(Number(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                    <span>Suave (2px)</span>
                    <span>Médio (8px)</span>
                    <span>Forte (24px)</span>
                  </div>
                </div>

                {/* Alvo do Borrão (Fundo vs Cena Toda) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Alvo do Desfoque:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onSetBlurTarget && onSetBlurTarget('background')}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all border ${
                        blurTarget === 'background'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-[1px_1px_0px_#000]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Apenas Fundo (Bokeh)
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetBlurTarget && onSetBlurTarget('all')}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-bold font-mono transition-all border ${
                        blurTarget === 'all'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-[1px_1px_0px_#000]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Cena Toda (Sonho)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Modo OBS / Transparência */}
      <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-4">
        <div className="space-y-2">
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

        {onSetHideStageControls && (
          <div className="pt-3 border-t border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Ocultar Botões no Palco</span>
              </div>
              <input
                type="checkbox"
                checked={hideStageControls || false}
                onChange={e => onSetHideStageControls(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded bg-zinc-900 border-zinc-700 focus:ring-amber-500"
              />
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Esconde todos os botões flutuantes de comando na tela principal do Palco, deixando a transmissão 100% limpa.
            </p>
          </div>
        )}
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

      {/* 5. Gerenciamento de Campanha & Backup em Disco */}
      {onSaveCampaign && (
        <div className="pt-4 border-t border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-red-500" />
              <span>PERSISTÊNCIA EM DISCO</span>
            </label>
            {lastSavedTime && (
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(lastSavedTime).toLocaleTimeString()}
              </span>
            )}
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Salva permanentemente seus personagens, músicas do soundboard, presets e fundos no arquivo <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded">campaign_state.json</code>. Ao fechar com Ctrl+C e rodar <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded">iniciar.bat</code>, tudo será restaurado automaticamente.
          </p>

          <div className="space-y-2">
            <button
              onClick={onSaveCampaign}
              disabled={saveStatus === 'saving'}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0px_#000] active:scale-95 ${
                saveStatus === 'saved'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  : saveStatus === 'error'
                  ? 'bg-red-950/80 border-red-500 text-red-300'
                  : saveStatus === 'saving'
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-400 cursor-wait'
                  : 'bg-red-600 hover:bg-red-500 border-red-500 text-white'
              }`}
            >
              {saveStatus === 'saved' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>SALVO COM SUCESSO NO DISCO!</span>
                </>
              ) : saveStatus === 'saving' ? (
                <>
                  <Save className="w-4 h-4 animate-spin text-zinc-400" />
                  <span>SALVANDO CAMPANHA...</span>
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>FALHA AO SALVAR</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>SALVAR ESTADO DA CAMPANHA</span>
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-2">
              {onExportCampaign && (
                <button
                  onClick={onExportCampaign}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                  title="Baixar arquivo JSON de backup"
                >
                  <Download className="w-3.5 h-3.5 text-zinc-400" />
                  <span>EXPORTAR .JSON</span>
                </button>
              )}
              {onImportCampaign && (
                <button
                  onClick={onImportCampaign}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                  title="Restaurar de arquivo JSON"
                >
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  <span>IMPORTAR .JSON</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Reset */}
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
