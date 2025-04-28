import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  popSound: HTMLAudioElement | null; // Renamed from hitSound
  splashSound: HTMLAudioElement | null; // Renamed from successSound
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (audio: HTMLAudioElement) => void;
  setPopSound: (audio: HTMLAudioElement) => void; // Renamed from setHitSound
  setSplashSound: (audio: HTMLAudioElement) => void; // Renamed from setSuccessSound
  
  // Control functions
  toggleMute: () => void;
  playPop: () => void; // Renamed from playHit
  playSplash: () => void; // Renamed from playSuccess
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  popSound: null,
  splashSound: null,
  isMuted: false, // Start with sound on for better experience
  
  setBackgroundMusic: (audio: HTMLAudioElement) => {
    // Configure background music for optimal mobile performance
    audio.preload = 'auto';
    audio.loop = true;
    audio.volume = 0.4;
    
    // Enable low latency playback if supported
    if ('mozAutoplayEnabled' in audio || 'webkitAudioContext' in window) {
      audio.mozPreservesPitch = false;
      (audio as any).webkitPreservesPitch = false;
    }
    
    set({ backgroundMusic: audio });
  },
  
  setPopSound: (audio: HTMLAudioElement) => {
    // Configure pop sound for optimal mobile performance
    audio.preload = 'auto';
    audio.volume = 0.4;
    
    // Create audio pool for rapid succession sounds
    const audioPool: HTMLAudioElement[] = [audio];
    for (let i = 0; i < 3; i++) {
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.preload = 'auto';
      clone.volume = 0.4;
      audioPool.push(clone);
    }
    
    // Store the original audio
    set({ popSound: audio });
    
    // Attach the pool to the original audio element
    (audio as any).pool = audioPool;
    (audio as any).poolIndex = 0;
  },
  
  setSplashSound: (audio: HTMLAudioElement) => {
    // Configure splash sound for optimal mobile performance
    audio.preload = 'auto';
    audio.volume = 0.5;
    set({ splashSound: audio });
  },
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else {
        // Handle mobile audio context resuming
        if (backgroundMusic.paused) {
          const resumeAudio = () => {
            backgroundMusic.play().catch(error => {
              console.log("Background music play prevented:", error);
            });
            document.removeEventListener('touchstart', resumeAudio);
          };
          document.addEventListener('touchstart', resumeAudio);
        }
      }
    }
    
    set({ isMuted: newMutedState });
  },
  
  playPop: () => {
    const { popSound, isMuted } = get();
    if (popSound && !isMuted) {
      // Use audio pool for rapid succession sounds
      const pool = (popSound as any).pool as HTMLAudioElement[];
      if (pool) {
        const audio = pool[(popSound as any).poolIndex];
        audio.currentTime = 0;
        audio.play().catch(error => {
          console.log("Pop sound play prevented:", error);
        });
        (popSound as any).poolIndex = ((popSound as any).poolIndex + 1) % pool.length;
      }
    }
  },
  
  playSplash: () => {
    const { splashSound, isMuted } = get();
    if (splashSound && !isMuted) {
      splashSound.currentTime = 0;
      splashSound.play().catch(error => {
        console.log("Splash sound play prevented:", error);
      });
    }
  }
}));
