import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useAudio } from "./lib/stores/useAudio";
import { useCandyGame } from "./lib/stores/useCandyGame";
import GameBoard from "./components/game/GameBoard";
import StartScreen from "./components/game/StartScreen";
import GameOver from "./components/game/GameOver";
import "@fontsource/inter";

function App() {
  const { phase, init } = useCandyGame();
  const [backgroundAudio, setBackgroundAudio] = useState<HTMLAudioElement | null>(null);
  const [popAudio, setPopAudio] = useState<HTMLAudioElement | null>(null);
  const [splashAudio, setSplashAudio] = useState<HTMLAudioElement | null>(null);
  const { setBackgroundMusic, setPopSound, setSplashSound, isMuted } = useAudio();

  // Initialize the game
  useEffect(() => {
    init();
  }, [init]);

  // Set up audio elements
  useEffect(() => {
    // Load audio files
    const bgMusic = new Audio("/sounds/background.mp3");
    bgMusic.loop = true;
    bgMusic.volume = 0.4;
    setBackgroundAudio(bgMusic);
    setBackgroundMusic(bgMusic);
    
    // Auto-play background music if not muted
    if (!isMuted) {
      bgMusic.play().catch(err => console.log("Background music auto-play prevented:", err));
    }

    const popSound = new Audio("/sounds/hit.mp3");
    popSound.volume = 0.4;
    setPopAudio(popSound);
    setPopSound(popSound);

    const splashSound = new Audio("/sounds/success.mp3");
    splashSound.volume = 0.5;
    setSplashAudio(splashSound);
    setSplashSound(splashSound);

    return () => {
      bgMusic.pause();
      popSound.pause();
      splashSound.pause();
    };
  }, [setBackgroundMusic, setPopSound, setSplashSound, isMuted]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-full w-full overflow-hidden bg-gradient-to-b from-blue-800 to-cyan-600">
        {phase === "ready" && <StartScreen />}
        {phase === "playing" && <GameBoard />}
        {phase === "ended" && <GameOver />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
