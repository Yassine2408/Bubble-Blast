import React, { useEffect } from "react";
import { useCandyGame } from "@/lib/stores/useCandyGame";
import Board from "./Board";
import ScoreBar from "./ScoreBar";
import Level from "./Level";
import { useAudio } from "@/lib/stores/useAudio";
import SpecialEffects from "./SpecialEffects";

const GameBoard: React.FC = () => {
  const { phase, board } = useCandyGame();
  const { backgroundMusic, isMuted } = useAudio();
  
  // Start background music when the game starts
  useEffect(() => {
    if (backgroundMusic && phase === "playing" && !isMuted) {
      backgroundMusic.currentTime = 0;
      backgroundMusic.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
    
    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [backgroundMusic, phase, isMuted]);

  if (phase !== "playing" || !board || board.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Game UI Container */}
      <div className="flex flex-col md:flex-row w-full h-full p-2 md:p-4 gap-4">
        {/* Left side - Game info */}
        <div className="w-full md:w-1/4 flex flex-col gap-4">
          <Level />
          <ScoreBar />
        </div>
        
        {/* Right side - Game board */}
        <div className="w-full md:w-3/4 h-full relative">
          <Board />
          <SpecialEffects />
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
