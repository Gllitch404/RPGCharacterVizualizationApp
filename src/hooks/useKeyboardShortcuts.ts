import { useEffect, useRef } from 'react';
import { NPC } from '../types';

interface KeyboardShortcutsProps {
  npcs: NPC[];
  activeSpeakerId: string | null;
  toggleSpeaker: (id: string) => void;
  silenceAll: () => void;
  toggleSidebar: () => void;
  isFormOpen?: boolean;
}

/**
 * Normaliza uma string de tecla para comparação precisa.
 * Exemplos: "Num1" -> "1", "Numpad1" -> "1", "1" -> "1", "a" -> "a"
 */
export function normalizeKey(keyStr: string): string {
  if (!keyStr) return '';
  const lower = keyStr.toLowerCase().trim();
  if (lower.startsWith('numpad') || lower.startsWith('num')) {
    return lower.replace(/^(numpad|num)/, '');
  }
  return lower;
}

export function useKeyboardShortcuts({
  npcs,
  activeSpeakerId,
  toggleSpeaker,
  silenceAll,
  toggleSidebar,
  isFormOpen = false
}: KeyboardShortcutsProps) {
  // Use refs to avoid stale closure in listener while maintaining zero delay
  const propsRef = useRef({ npcs, activeSpeakerId, toggleSpeaker, silenceAll, toggleSidebar, isFormOpen });
  
  useEffect(() => {
    propsRef.current = { npcs, activeSpeakerId, toggleSpeaker, silenceAll, toggleSidebar, isFormOpen };
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { npcs, toggleSpeaker, silenceAll, toggleSidebar, isFormOpen } = propsRef.current;

      // Se o usuário estiver editando em um input/textarea ou formulário aberto, ignorar atalhos globais
      const target = event.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isInput || isFormOpen) {
        return;
      }

      const pressedKey = event.key;
      const pressedCode = event.code;
      const normalizedPressed = normalizeKey(pressedKey);

      // Tecla Escape ou Espaço: Silencia todos
      if (pressedKey === 'Escape' || pressedKey === ' ') {
        event.preventDefault();
        silenceAll();
        return;
      }

      // Tecla H: Alterna Modo Palco Limpo (esconder/mostrar UI)
      if (pressedKey === 'h' || pressedKey === 'H') {
        event.preventDefault();
        toggleSidebar();
        return;
      }

      // Procurar NPC associado ao atalho
      const matchedNpc = npcs.find(npc => {
        if (!npc.shortcutKey) return false;
        const normalizedShortcut = normalizeKey(npc.shortcutKey);

        // Comparação por key (ex: "1", "q", "a")
        if (normalizedShortcut === normalizedPressed) return true;

        // Comparação por e.key direto (sem lowercase especial)
        if (npc.shortcutKey.toLowerCase() === pressedKey.toLowerCase()) return true;

        // Comparação por code (ex: "Digit1", "Numpad1", "KeyQ")
        if (pressedCode.toLowerCase().endsWith(normalizedShortcut)) return true;
        if (pressedCode.toLowerCase() === npc.shortcutKey.toLowerCase()) return true;

        return false;
      });

      if (matchedNpc) {
        event.preventDefault();
        toggleSpeaker(matchedNpc.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

