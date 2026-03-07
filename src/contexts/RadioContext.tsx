import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

interface RadioContextType {
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  toggleRadio: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  currentSong: string;
  isLoading: boolean;
  error: string | null;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

const RADIO_STREAM_URL = 'https://panel.marcelotorres.live/listen/puntopas/radio.mp3';
const API_URL = 'https://panel.marcelotorres.live/api/nowplaying/puntopas';

export function RadioProvider({ children }: { children: ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [currentSong, setCurrentSong] = useState('Radio Punto Pas - En Vivo');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Crear elemento de audio
    const audio = new Audio(RADIO_STREAM_URL);
    audio.volume = volume;
    audio.preload = 'none';
    audio.crossOrigin = 'anonymous';
    
    // Event listeners
    audio.addEventListener('loadstart', () => {
      setIsLoading(true);
    });
    
    audio.addEventListener('canplay', () => {
      setIsLoading(false);
    });
    
    audio.addEventListener('play', () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    });
    
    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });
    
    audio.addEventListener('error', () => {
      setError('Error al reproducir la radio');
      setIsLoading(false);
      setIsPlaying(false);
    });
    
    audioRef.current = audio;
    
    // Cargar metadata inicial
    fetchMetadata();
    
    // Iniciar intervalo para actualizar metadata cada 15 segundos
    metadataIntervalRef.current = setInterval(fetchMetadata, 15000);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
    };
  }, []);
  
  // Actualizar volumen cuando cambie
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const fetchMetadata = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.now_playing?.song) {
        const { artist, title } = data.now_playing.song;
        if (artist && title) {
          setCurrentSong(`${artist} — ${title}`);
        }
      }
    } catch {
      // Silently fail - metadata not critical
    }
  };

  const toggleRadio = useCallback(async () => {
    if (!audioRef.current) {
      setError('Error interno - Recarga la página');
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setError(null);
        setIsLoading(true);
        
        // Recargar stream para evitar cache
        audioRef.current.src = `${RADIO_STREAM_URL}?t=${Date.now()}`;
        audioRef.current.load();
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
        
        // Actualizar metadata inmediatamente
        fetchMetadata();
      }
    } catch (err: any) {
      console.error('Radio error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'AbortError') {
        setError('Haz clic en la página primero, luego en Play');
      } else {
        setError('Radio no disponible');
      }
      
      setIsPlaying(false);
      setIsLoading(false);
    }
  }, [isPlaying]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const handleSetPlaying = useCallback((playing: boolean) => {
    if (!audioRef.current) return;
    
    if (playing) {
      audioRef.current.play().catch(() => {
        setError('Error al reproducir');
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
    setIsPlaying(playing);
  }, []);

  return (
    <RadioContext.Provider value={{ 
      isPlaying, 
      setIsPlaying: handleSetPlaying, 
      toggleRadio,
      volume,
      setVolume,
      currentSong,
      isLoading,
      error
    }}>
      {children}
    </RadioContext.Provider>
  );
}

export function useRadio() {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
}
