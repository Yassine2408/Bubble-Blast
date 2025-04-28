import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  popSound: HTMLAudioElement | null; // Renamed from hitSound
  splashSound: HTMLAudioElement | null; // Renamed from successSound
  isMuted: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setPopSound: (sound: HTMLAudioElement) => void; // Renamed from setHitSound
  setSplashSound: (sound: HTMLAudioElement) => void; // Renamed from setSuccessSound
  
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
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setPopSound: (sound) => set({ popSound: sound }),
  setSplashSound: (sound) => set({ splashSound: sound }),
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    // Update the muted state
    set({ isMuted: newMutedState });
    
    // Adjust background music if it exists
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else if (document.visibilityState !== 'hidden') {
        backgroundMusic.play().catch(err => console.log("Background music auto-play prevented:", err));
      }
    }
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playPop: () => {
    const { popSound, isMuted } = get();
    if (popSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Pop sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = popSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.4; // Slightly louder for better feedback
      soundClone.play().catch(error => {
        console.log("Pop sound play prevented:", error);
      });
    }
  },
  
  playSplash: () => {
    const { splashSound, isMuted } = get();
    if (splashSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Splash sound skipped (muted)");
        return;
      }
      
      splashSound.currentTime = 0;
      splashSound.volume = 0.5;
      splashSound.play().catch(error => {
        console.log("Splash sound play prevented:", error);
      });
    }
  }
}));
