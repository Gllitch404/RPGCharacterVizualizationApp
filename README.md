# 🎭 RPG NPC Stream Overlay — Persona & Investigative Edition (OUTDATED)

> Um overlay de avatares com design dinâmico e angular inspirado na estética **Persona / Manga Cut-In** e presets temáticos para RPGs modernos de investigação e horror (**Ordem Paranormal**, **Call of Cthulhu** e **Clean Pop**).

---

## ⚡ Novas Funcionalidades

### 1. 📐 Estética Persona Cut-In Angular
- **Molduras e Silhuetas Chanfradas**: Inclinação diagonal dinâmica (`-skew-x-6` a `-skew-x-12`) com sombras duras sólidas de quadrinhos (`drop-shadow(4px 4px 0px #000)`).
- **Tarjas Cut-in de Nome**: Fitas adesivas inclinadas com tags de função em relevo (`[AGENTE]`, `[OCULTISTA]`, `[INVESTIGADOR]`).
- **Animação de Impacto (Glitch Pop)**: Efeito de salto dinâmico ao assumir a voz ativa.

### 2. 🌌 Presets de Atmosfera & Temas
- **⚡ Ordem Paranormal**:
  - Vermelho sangue (`#dc2626`), fitas pretas e amarelas, tipografia militar (`Share Tech Mono`), aura vermelha e scanlines CRT analógicas.
- **👁 Call of Cthulhu**:
  - Verde abissal (`#10b981`), ficha de dossiê amarelada, tipografia de máquina de escrever (`Special Elite`), névoa esmeralda e ruído analógico de filme antigo.
- **★ Persona Clean**:
  - Alto contraste pop amarelo/ciano/preto, cortes nítidos e sombras sólidas sem ruído de época.

### 3. 📺 Efeitos de Pós-Processamento da Tela (Screen FX)
- **Vinheta de Horror**: Escurecimento suave nas bordas para imersão.
- **Scanlines CRT**: Linhas de monitor analógico para mesas com tecnologia ou arquivo.
- **Film Grain**: Granulação analógica com textura de película.
- **Fundo Transparente**: 1 clique para usar como **Browser Source** no OBS Studio sobrepondo seu mapa/câmera.

---

## 🎮 Controles & Mapeamento de Teclas

| Tecla / Atalho | Ação |
|---|---|
| `1` | Ativa / Desativa voz de **Arthur Foster** (`[INVESTIGADOR]`) |
| `2` | Ativa / Desativa voz de **Agatha Volkomenn** (`[OCULTISTA]`) |
| `3` | Ativa / Desativa voz de **Dante Veríssimo** (`[AGENTE TÁTICO]`) |
| `Espaço` ou `Esc` | **Silencia todos** os personagens |
| `H` | **Modo Palco Limpo** (oculta/exibe a barra lateral para OBS) |
| `F11` | Alterna modo Tela Cheia |

---

## 🚀 Como Iniciar

1. Dê dois cliques em [`iniciar.bat`](file:///c:/Users/diego/OneDrive/Documentos/RPGCharacterVizualizationApp/iniciar.bat) ou execute no terminal:
```powershell
npm run dev
```
2. Abra `http://localhost:3000` no seu navegador ou adicione como fonte de navegador no OBS Studio!
