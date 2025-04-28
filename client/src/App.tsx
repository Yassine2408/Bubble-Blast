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
  const [hitAudio, setHitAudio] = useState<HTMLAudioElement | null>(null);
  const [successAudio, setSuccessAudio] = useState<HTMLAudioElement | null>(null);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

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

    const hitSound = new Audio("/sounds/hit.mp3");
    hitSound.volume = 0.3;
    setHitAudio(hitSound);
    setHitSound(hitSound);

    const successSound = new Audio("/sounds/success.mp3");
    successSound.volume = 0.5;
    setSuccessAudio(successSound);
    setSuccessSound(successSound);

    return () => {
      bgMusic.pause();
      hitSound.pause();
      successSound.pause();
    };
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-full w-full overflow-hidden bg-gradient-to-b from-purple-600 to-purple-900">
        {phase === "ready" && <StartScreen />}
        {phase === "playing" && <GameBoard />}
        {phase === "ended" && <GameOver />}
      </div>
    </QueryClientProvider>
  );
}

export default App;
