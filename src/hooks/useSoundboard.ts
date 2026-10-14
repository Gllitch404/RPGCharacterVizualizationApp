import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Track, SoundboardConfig } from '../types/soundboard';
import { INITIAL_TRACKS } from '../constants/soundboardPresets';
import { extractYouTubeId } from '../utils/youtubeHelper';
import { getAudioFile } from '../utils/audioStorage';
import { loadCampaignFromDisk } from '../utils/campaignStorage';

const STORAGE_KEYS = {
  TRACKS: 'rpg_soundboard_tracks_v1',
  CONFIG: 'rpg_soundboard_config_v1'
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface MixerChannelSlot {
  id: 'A' | 'B';
  track: Track | null;
  gain: number; // 0.0 a 1.0 (envelope do fade)
  sourceType: 'youtube' | 'audio' | null;
}

export function useSoundboard() {
  const [tracks, setTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRACKS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_TRACKS;
  });

  const [config, setConfig] = useState<SoundboardConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return { masterVolume: 0.8, crossfadeDuration: 2.0 };
  });

  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Slots do Mixer Virtual com isolamento total de volume por canal
  const slotARef = useRef<MixerChannelSlot>({
    id: 'A',
    track: null,
    gain: 0,
    sourceType: null
  });

  const slotBRef = useRef<MixerChannelSlot>({
    id: 'B',
    track: null,
    gain: 0,
    sourceType: null
  });

  const activeSlotIdRef = useRef<'A' | 'B'>('A');

  // Canais físicos de áudio
  const audioChannelARef = useRef<HTMLAudioElement | null>(null);
  const audioChannelBRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerARef = useRef<any>(null);
  const ytPlayerBRef = useRef<any>(null);

  // Instâncias independentes de SFX (Efeitos Sonoros One-Shot)
  const sfxInstancesRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const [playingSfxIds, setPlayingSfxIds] = useState<string[]>([]);

  // Animação de transição
  const crossfadeAnimRef = useRef<number | null>(null);
  const configRef = useRef<SoundboardConfig>(config);
  configRef.current = config;

  // Sincronizar trilhas e configuração com localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
    } catch (e) {}
  }, [tracks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {}
  }, [config]);

  // Aplica o volume matemático exato no canal:
  // Volume Efetivo = (Volume Individual da Faixa) * (Volume Master Geral) * (Ganho do Fade)
  const applySlotVolume = useCallback((slot: MixerChannelSlot) => {
    if (!slot.track) return;
    const masterVol = configRef.current.masterVolume;
    const trackVol = slot.track.volume;
    const fadeGain = Math.max(0, Math.min(1, slot.gain));

    // Garante que o áudio NUNCA ultrapasse o volume configurado para aquela faixa específica
    const effectiveVol = Math.max(0, Math.min(1, trackVol * masterVol * fadeGain));

    if (slot.sourceType === 'youtube') {
      const ytPlayer = slot.id === 'A' ? ytPlayerARef.current : ytPlayerBRef.current;
      if (ytPlayer && typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(Math.round(effectiveVol * 100));
      }
    } else if (slot.sourceType === 'audio') {
      const audioEl = slot.id === 'A' ? audioChannelARef.current : audioChannelBRef.current;
      if (audioEl) {
        audioEl.volume = effectiveVol;
      }
    }
  }, []);

  // Inicializar HTML5 Audio
  useEffect(() => {
    const audioA = new Audio();
    const audioB = new Audio();
    audioA.preload = 'auto';
    audioB.preload = 'auto';
    audioChannelARef.current = audioA;
    audioChannelBRef.current = audioB;

    return () => {
      audioA.pause();
      audioB.pause();
      audioA.src = '';
      audioB.src = '';
      sfxInstancesRef.current.forEach(a => {
        a.pause();
        a.src = '';
      });
      sfxInstancesRef.current.clear();
    };
  }, []);

  // Inicializar YouTube IFrame API com dois players isolados
  useEffect(() => {
    const initYtPlayers = () => {
      if (!window.YT || !window.YT.Player) return;

      if (!ytPlayerARef.current) {
        ytPlayerARef.current = new window.YT.Player('yt-soundboard-player-a', {
          height: '1',
          width: '1',
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0 },
          events: {
            onStateChange: (event: any) => {
              if (event.data === 0 && slotARef.current.track?.loop) {
                ytPlayerARef.current?.seekTo(0);
                ytPlayerARef.current?.playVideo();
              }
            }
          }
        });
      }

      if (!ytPlayerBRef.current) {
        ytPlayerBRef.current = new window.YT.Player('yt-soundboard-player-b', {
          height: '1',
          width: '1',
          playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0 },
          events: {
            onStateChange: (event: any) => {
              if (event.data === 0 && slotBRef.current.track?.loop) {
                ytPlayerBRef.current?.seekTo(0);
                ytPlayerBRef.current?.playVideo();
              }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initYtPlayers();
    } else {
      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = () => {
        initYtPlayers();
      };
    }

    return () => {
      if (crossfadeAnimRef.current) {
        cancelAnimationFrame(crossfadeAnimRef.current);
      }
    };
  }, []);

  // Resolver URL de áudio local ou remoto
  const resolveAudioUrl = async (track: Track): Promise<string> => {
    if (track.sourceType === 'file' && track.fileDataId) {
      const blob = await getAudioFile(track.fileDataId);
      if (blob) {
        return URL.createObjectURL(blob);
      }
    }
    return track.sourceUrl;
  };

  // Motor de Crossfade com isolamento total de volume por faixa
  const crossfadeTo = useCallback(async (newTrack: Track) => {
    if (crossfadeAnimRef.current) {
      cancelAnimationFrame(crossfadeAnimRef.current);
      crossfadeAnimRef.current = null;
    }

    // Determina o canal de saída (out) e o canal que vai receber a nova faixa (in)
    const currentActiveId = activeSlotIdRef.current;
    const outSlot = currentActiveId === 'A' ? slotARef.current : slotBRef.current;
    const inSlot = currentActiveId === 'A' ? slotBRef.current : slotARef.current;

    // Atualiza estado reativo
    setActiveTrackId(newTrack.id);
    setIsPlaying(true);

    const durationMs = Math.max(100, configRef.current.crossfadeDuration * 1000);
    const isYouTube = newTrack.sourceType === 'youtube';

    // 1. Configura a nova faixa no canal 'inSlot' com ganho estritamente ZERO
    inSlot.track = newTrack;
    inSlot.sourceType = isYouTube ? 'youtube' : 'audio';
    inSlot.gain = 0;
    applySlotVolume(inSlot); // Garante que começa 100% mudo

    // 2. Inicia reprodução física da nova faixa no hardware
    if (isYouTube) {
      const videoId = extractYouTubeId(newTrack.sourceUrl);
      const ytPlayer = inSlot.id === 'A' ? ytPlayerARef.current : ytPlayerBRef.current;
      if (videoId && ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.setVolume(0);
        ytPlayer.loadVideoById(videoId);
        ytPlayer.playVideo();
      }
    } else {
      const audioUrl = await resolveAudioUrl(newTrack);
      const audioEl = inSlot.id === 'A' ? audioChannelARef.current : audioChannelBRef.current;
      if (audioEl) {
        audioEl.src = audioUrl;
        audioEl.loop = newTrack.loop;
        audioEl.volume = 0;
        audioEl.play().catch(e => console.warn('Autoplay bloqueado pelo navegador:', e));
      }
    }

    // 3. Captura o ganho inicial do canal antigo (para o fade-out descer exatamente de onde ele está)
    const initialOutGain = outSlot.track ? Math.max(0, outSlot.gain) : 0;
    const startTime = performance.now();

    // 4. Loop de interpolação independente para cada faixa
    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);

      // Faixa antiga: desce de initialOutGain para 0, mantendo a proporção de seu volume específico
      if (outSlot.track) {
        outSlot.gain = Math.max(0, initialOutGain * (1 - progress));
        applySlotVolume(outSlot);
      }

      // Nova faixa: sobe de 0 para 1, atingindo o volume configurado para ela
      inSlot.gain = progress;
      applySlotVolume(inSlot);

      if (progress < 1) {
        crossfadeAnimRef.current = requestAnimationFrame(step);
      } else {
        // Transição concluída: desligar o canal antigo
        if (outSlot.sourceType === 'audio') {
          const oldAudio = outSlot.id === 'A' ? audioChannelARef.current : audioChannelBRef.current;
          if (oldAudio) {
            oldAudio.pause();
            oldAudio.currentTime = 0;
          }
        } else if (outSlot.sourceType === 'youtube') {
          const oldYt = outSlot.id === 'A' ? ytPlayerARef.current : ytPlayerBRef.current;
          if (oldYt && typeof oldYt.pauseVideo === 'function') {
            oldYt.pauseVideo();
          }
        }

        outSlot.track = null;
        outSlot.gain = 0;
        outSlot.sourceType = null;

        inSlot.gain = 1.0;
        applySlotVolume(inSlot);
        activeSlotIdRef.current = inSlot.id;
      }
    };

    crossfadeAnimRef.current = requestAnimationFrame(step);
  }, [applySlotVolume]);

  // Parar todas as músicas com fade-out gradual e seguro
  const stopAll = useCallback((fadeMs = 1000) => {
    if (crossfadeAnimRef.current) {
      cancelAnimationFrame(crossfadeAnimRef.current);
      crossfadeAnimRef.current = null;
    }

    const slotA = slotARef.current;
    const slotB = slotBRef.current;

    const startGainA = slotA.track ? slotA.gain : 0;
    const startGainB = slotB.track ? slotB.gain : 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / fadeMs);
      const factor = 1 - progress;

      if (slotA.track) {
        slotA.gain = Math.max(0, startGainA * factor);
        applySlotVolume(slotA);
      }

      if (slotB.track) {
        slotB.gain = Math.max(0, startGainB * factor);
        applySlotVolume(slotB);
      }

      if (progress < 1) {
        crossfadeAnimRef.current = requestAnimationFrame(step);
      } else {
        // Pausar ambos os canais de áudio e YouTube
        if (audioChannelARef.current) {
          audioChannelARef.current.pause();
          audioChannelARef.current.currentTime = 0;
        }
        if (audioChannelBRef.current) {
          audioChannelBRef.current.pause();
          audioChannelBRef.current.currentTime = 0;
        }
        if (ytPlayerARef.current && typeof ytPlayerARef.current.pauseVideo === 'function') {
          ytPlayerARef.current.pauseVideo();
        }
        if (ytPlayerBRef.current && typeof ytPlayerBRef.current.pauseVideo === 'function') {
          ytPlayerBRef.current.pauseVideo();
        }

        slotA.track = null;
        slotA.gain = 0;
        slotA.sourceType = null;

        slotB.track = null;
        slotB.gain = 0;
        slotB.sourceType = null;

        setActiveTrackId(null);
        setIsPlaying(false);
      }
    };

    // Parar também quaisquer SFX ativos
    sfxInstancesRef.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    sfxInstancesRef.current.clear();
    setPlayingSfxIds([]);

    crossfadeAnimRef.current = requestAnimationFrame(step);
  }, [applySlotVolume]);

  // Reproduzir Efeito Sonoro (SFX) em canal independente sem interromper o BGM de fundo
  const playSFX = useCallback(async (track: Track) => {
    try {
      const url = await resolveAudioUrl(track);
      const existing = sfxInstancesRef.current.get(track.id);

      if (existing) {
        if (track.loop) {
          // Se for loop contínuo, segundo clique pausa e desativa
          existing.pause();
          existing.currentTime = 0;
          sfxInstancesRef.current.delete(track.id);
          setPlayingSfxIds(prev => prev.filter(id => id !== track.id));
          return;
        } else {
          // Se for one-shot, reinicia instantaneamente
          existing.currentTime = 0;
          existing.volume = Math.max(0, Math.min(1, track.volume * configRef.current.masterVolume));
          existing.play().catch(e => console.warn('Autoplay SFX bloqueado:', e));
          setPlayingSfxIds(prev => (prev.includes(track.id) ? prev : [...prev, track.id]));
          return;
        }
      }

      const audio = new Audio(url);
      audio.loop = track.loop;
      audio.volume = Math.max(0, Math.min(1, track.volume * configRef.current.masterVolume));

      sfxInstancesRef.current.set(track.id, audio);
      setPlayingSfxIds(prev => [...prev.filter(id => id !== track.id), track.id]);

      audio.onended = () => {
        sfxInstancesRef.current.delete(track.id);
        setPlayingSfxIds(prev => prev.filter(id => id !== track.id));
      };

      await audio.play();
    } catch (err) {
      console.warn('Erro ao disparar SFX:', err);
    }
  }, []);

  const stopSFX = useCallback((trackId: string) => {
    const audio = sfxInstancesRef.current.get(trackId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      sfxInstancesRef.current.delete(trackId);
      setPlayingSfxIds(prev => prev.filter(id => id !== trackId));
    }
  }, []);

  // Alternar Play/Pause de uma faixa
  const toggleTrack = useCallback((track: Track) => {
    if (track.category === 'sfx') {
      playSFX(track);
      return;
    }

    if (activeTrackId === track.id && isPlaying) {
      stopAll(1000);
    } else {
      crossfadeTo(track);
    }
  }, [activeTrackId, isPlaying, crossfadeTo, stopAll, playSFX]);

  // Atualizar volume master e sincronizar ambos os canais e SFX em tempo real
  const setMasterVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(1, val));
    setConfig(prev => ({ ...prev, masterVolume: clamped }));
    configRef.current.masterVolume = clamped;

    applySlotVolume(slotARef.current);
    applySlotVolume(slotBRef.current);

    // Ajusta o volume de efeitos sonoros em execução simultânea
    sfxInstancesRef.current.forEach((audio, trackId) => {
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        audio.volume = Math.max(0, Math.min(1, track.volume * clamped));
      }
    });
  }, [applySlotVolume, tracks]);

  // Atualizar duração de crossfade
  const setCrossfadeDuration = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(5, val));
    setConfig(prev => ({ ...prev, crossfadeDuration: clamped }));
    configRef.current.crossfadeDuration = clamped;
  }, []);

  // CRUD de Trilhas
  const addTrack = useCallback((newTrackData: Omit<Track, 'id'>) => {
    const newTrack: Track = {
      ...newTrackData,
      id: `track-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };
    setTracks(prev => [newTrack, ...prev]);
    return newTrack;
  }, []);

  const updateTrack = useCallback((id: string, updates: Partial<Omit<Track, 'id'>>) => {
    setTracks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));

    // Se a faixa alterada estiver tocando em algum slot, atualizar imediatamente seus parâmetros
    [slotARef.current, slotBRef.current].forEach(slot => {
      if (slot.track && slot.track.id === id) {
        slot.track = { ...slot.track, ...updates };

        if (updates.volume !== undefined) {
          applySlotVolume(slot);
        }

        if (updates.loop !== undefined && slot.sourceType === 'audio') {
          const audioEl = slot.id === 'A' ? audioChannelARef.current : audioChannelBRef.current;
          if (audioEl) audioEl.loop = updates.loop;
        }
      }
    });

    // Se for SFX ativo
    const sfxAudio = sfxInstancesRef.current.get(id);
    if (sfxAudio) {
      if (updates.volume !== undefined) {
        sfxAudio.volume = Math.max(0, Math.min(1, updates.volume * configRef.current.masterVolume));
      }
      if (updates.loop !== undefined) {
        sfxAudio.loop = updates.loop;
      }
    }
  }, [applySlotVolume]);

  const deleteTrack = useCallback((id: string) => {
    stopSFX(id);
    if (activeTrackId === id) {
      stopAll(800);
    }
    setTracks(prev => prev.filter(t => t.id !== id));
  }, [activeTrackId, stopAll, stopSFX]);

  const currentActiveTrack = useMemo(() => {
    return tracks.find(t => t.id === activeTrackId) || null;
  }, [tracks, activeTrackId]);

  const restoreTracks = useCallback((newTracks: Track[], newConfig?: SoundboardConfig) => {
    if (Array.isArray(newTracks) && newTracks.length > 0) {
      setTracks(newTracks);
    }
    if (newConfig) {
      setConfig(newConfig);
      configRef.current = newConfig;
    }
  }, []);

  // Carregar trilhas de campaign_state.json ao iniciar se existir
  useEffect(() => {
    loadCampaignFromDisk().then(diskData => {
      if (diskData && Array.isArray(diskData.tracks) && diskData.tracks.length > 0) {
        restoreTracks(diskData.tracks, diskData.soundboardConfig);
      }
    });
  }, [restoreTracks]);

  return {
    tracks,
    config,
    activeTrackId,
    isPlaying,
    activeTrack: currentActiveTrack,
    playingSfxIds,
    toggleTrack,
    playSFX,
    stopSFX,
    stopAll,
    setMasterVolume,
    setCrossfadeDuration,
    addTrack,
    updateTrack,
    deleteTrack,
    restoreTracks
  };
}
