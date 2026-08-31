import { useState, useEffect } from 'react';

/**
 * Extrai a cor dominante de uma imagem usando Canvas API.
 * Usa amostragem ponderada por saturação com fallback robusto para imagens escuras.
 */
async function extractDominantColor(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const SAMPLE = 120; // resolução maior = amostragem melhor
        canvas.width = SAMPLE;
        canvas.height = SAMPLE;

        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve('#e11d48'); return; }

        ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
        const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);

        // Coleta de pixels por faixa de saturação
        let rS = 0, gS = 0, bS = 0, satWeight = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          if (a < 80) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const brightness = (r + g + b) / 3;

          // Aceita um range mais amplo de brilho para capturar cores em imagens escuras
          // (entre quase-preto e quase-branco)
          if (brightness < 15 || brightness > 240) continue;

          // Saturação HSV
          const sat = max === 0 ? 0 : (max - min) / max;

          // Só interessa pixels que têm alguma cor (sat > 0.15 é bem permissivo)
          if (sat < 0.15) continue;

          // Peso exponencial: pixels mais saturados contribuem muito mais
          const weight = sat * sat * (brightness / 128);
          rS += r * weight;
          gS += g * weight;
          bS += b * weight;
          satWeight += weight;
        }

        let rFinal: number, gFinal: number, bFinal: number;

        if (satWeight > 0) {
          rFinal = rS / satWeight;
          gFinal = gS / satWeight;
          bFinal = bS / satWeight;
        } else {
          // Fallback: média geral de todos os pixels visíveis
          let ra = 0, ga = 0, ba = 0, n = 0;
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] < 80) continue;
            ra += data[i]; ga += data[i + 1]; ba += data[i + 2]; n++;
          }
          rFinal = n > 0 ? ra / n : 180;
          gFinal = n > 0 ? ga / n : 80;
          bFinal = n > 0 ? ba / n : 40;
        }

        // Boost de saturação: torna a cor mais vibrante para uso como accent
        const avg = (rFinal + gFinal + bFinal) / 3;
        const boost = 2.0;
        rFinal = Math.min(255, Math.max(0, Math.round(avg + (rFinal - avg) * boost)));
        gFinal = Math.min(255, Math.max(0, Math.round(avg + (gFinal - avg) * boost)));
        bFinal = Math.min(255, Math.max(0, Math.round(avg + (bFinal - avg) * boost)));

        // Garante luminância mínima para que a cor seja visível no polígono
        const lum = 0.299 * rFinal + 0.587 * gFinal + 0.114 * bFinal;
        if (lum < 60) {
          // Esclarece a cor escura mantendo a matiz
          const factor = 80 / Math.max(lum, 1);
          rFinal = Math.min(255, Math.round(rFinal * factor));
          gFinal = Math.min(255, Math.round(gFinal * factor));
          bFinal = Math.min(255, Math.round(bFinal * factor));
        }

        const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0');
        resolve(`#${toHex(rFinal)}${toHex(gFinal)}${toHex(bFinal)}`);
      } catch {
        resolve('#e11d48');
      }
    };

    img.onerror = () => resolve('#e11d48');
    img.src = imageUrl;
  });
}

/**
 * Hook que retorna a cor dominante de uma imagem.
 */
export function useImageColor(imageUrl: string, fallback = '#e11d48'): string {
  const [color, setColor] = useState<string>(fallback);

  useEffect(() => {
    if (!imageUrl) return;
    setColor(fallback);
    extractDominantColor(imageUrl).then(setColor);
  }, [imageUrl, fallback]);

  return color;
}
