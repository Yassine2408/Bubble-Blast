import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useCandyGame } from "@/lib/stores/useCandyGame";
import { useAudio } from "@/lib/stores/useAudio";
import Confetti from "react-confetti";

const GameOver: React.FC = () => {
  const { score, level, restart } = useCandyGame();
  const { successSound, playSuccess, isMuted } = useAudio();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    // Play success sound
    if (!isMuted) {
      playSuccess();
    }

    // Update window size for confetti
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [playSuccess, isMuted]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <Confetti
        width={windowSize.width}
        height={windowSize.height}
        recycle={false}
        numberOfPieces={300}
        gravity={0.2}
        colors={['#FF5555', '#FF9933', '#FFDD44', '#44CC44', '#3399FF', '#9955FF']}
      />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-gradient-to-br from-pink-100 to-purple-200 p-8 rounded-2xl shadow-2xl border-4 border-white/20 max-w-md w-full mx-4"
      >
        <div className="text-center">
          <motion.h2
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl font-bold text-purple-800 mb-2"
          >
            Game Over!
          </motion.h2>
          
          <div className="mb-6 py-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-purple-700"
            >
              You reached level {level}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="candy-counter font-bold text-5xl my-4 text-pink-600"
            >
              {score}
              <span className="text-2xl ml-2">points</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-md text-purple-600 italic"
            >
              {score > 5000 
                ? "Amazing! You're a candy crushing master!" 
                : score > 2000 
                  ? "Great job! You're getting good at this!" 
                  : "Good effort! Keep practicing!"}
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center"
          >
            <Button
              variant="candy"
              size="xl"
              onClick={restart}
              className="font-bold text-white shadow-lg"
            >
              Play Again
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default GameOver;
