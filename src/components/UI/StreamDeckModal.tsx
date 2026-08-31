import React from 'react';
import { X, Tv, Gamepad2, VolumeX } from 'lucide-react';

interface StreamDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreamDeckModal: React.FC<StreamDeckModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-slate-100 font-serif" style={{ fontFamily: "'Cinzel', serif" }}>
              Guia: Stream Deck, Macro Pads & OBS Studio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Seção 1: Stream Deck / Macro Pads */}
          <div className="space-y-2.5">
            <h3 className="font-semibold text-amber-300 flex items-center gap-2 text-sm">
              <Gamepad2 className="w-4 h-4" /> 1. Configurando no Stream Deck ou Teclado Macro
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No software do seu Stream Deck, adicione a ação de <strong>Hotkey (Atalho de Teclado)</strong>:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-amber-400">Tecla "1", "2", "3"...</span>
                <p className="text-[11px] text-slate-400">Alterna a voz ativa do NPC correspondente.</p>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                <span className="font-mono font-bold text-rose-400">Tecla "Esc" ou "Espaço"</span>
                <p className="text-[11px] text-slate-400">Silencia todos os NPCs instantaneamente.</p>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1 col-span-2">
                <span className="font-mono font-bold text-sky-400">Tecla "H"</span>
                <p className="text-[11px] text-slate-400">Alterna o Modo Palco Limpo (esconde ou mostra a barra lateral).</p>
              </div>
            </div>
          </div>

          {/* Seção 2: OBS Studio Overlay */}
          <div className="space-y-2.5 pt-4 border-t border-slate-800">
            <h3 className="font-semibold text-amber-300 flex items-center gap-2 text-sm">
              <Tv className="w-4 h-4" /> 2. Integração como Overlay no OBS Studio
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-400 leading-relaxed">
              <li>
                Ative o interruptor <strong>"Fundo Transparente"</strong> na aba Cenário do painel lateral.
              </li>
              <li>
                No OBS Studio, crie uma fonte do tipo <strong>Browser Source (Navegador)</strong>.
              </li>
              <li>
                Cole o endereço local (ex: <code className="text-amber-300 font-mono">http://localhost:3000</code>).
              </li>
              <li>
                Defina a resolução como <strong>1920x1080</strong> (ou a resolução do seu streaming).
              </li>
              <li>
                Pressione a tecla <strong className="text-sky-300 font-mono">H</strong> para esconder o painel lateral e deixar apenas os avatares visíveis.
              </li>
            </ol>
          </div>

          {/* Dica de atalhos rápidos */}
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200/90">
            <VolumeX className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              <strong>Dica de Mestre:</strong> Pressionar a mesma tecla do personagem que já está falando desliga a voz dele automaticamente sem precisar silenciar tudo.
            </p>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

