import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useCandyGame } from "@/lib/stores/useCandyGame";
import { useAudio } from "@/lib/stores/useAudio";

const StartScreen: React.FC = () => {
  const { start } = useCandyGame();
  const { toggleMute, isMuted } = useAudio();
  const [bubbles, setBubbles] = useState<{ id: number; delay: number; color: string; x: number; y: number; size: number }[]>([]);
  const [showInstructions, setShowInstructions] = useState(false);
  
  const bubbleColors = [
    "#00BB00", // bright green
    "#FF3333", // bright red
    "#FFDD00", // bright yellow
    "#0088FF", // bright blue
    "#FF8800", // bright orange
    "#AA00FF", // bright purple
  ];
  
  // Generate floating bubble backgrounds
  useEffect(() => {
    const newBubbles = [];
    
    for (let i = 0; i < 25; i++) {
      newBubbles.push({
        id: i,
        delay: Math.random() * 5,
        color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 70 + 30
      });
    }
    
    setBubbles(newBubbles);
  }, []);
  
  // Toggle instructions panel
  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-cyan-700 flex items-center justify-center overflow-hidden">
      {/* Floating bubble backgrounds */}
      {bubbles.map(bubble => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full opacity-30"
          style={{
            boxShadow: `inset 0px -10px 20px rgba(0,0,0,0.3), inset 0px 5px 10px rgba(255,255,255,0.5)`,
            background: `radial-gradient(circle at 30% 30%, ${bubble.color}ee, ${bubble.color}aa)`,
          }}
          initial={{ 
            left: `${bubble.x}%`, 
            top: `${bubble.y}%`,
            width: bubble.size,
            height: bubble.size,
          }}
          animate={{
            y: [0, -120, 0],
            x: [0, Math.random() > 0.5 ? 20 : -20, 0],
            scale: [1, 1.05, 0.95, 1],
          }}
          transition={{
            y: {
              duration: 12 + bubble.delay,
              repeat: Infinity,
              ease: "easeInOut",
            },
            x: {
              duration: 15 + bubble.delay,
              repeat: Infinity,
              ease: "easeInOut", 
            },
            scale: {
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            },
            delay: bubble.delay,
          }}
        />
      ))}
      
      {/* Game title and start button */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="bg-white/20 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border-4 border-white/20 max-w-2xl w-full mx-4 relative z-10"
      >
        <div className="text-center">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-br from-cyan-300 to-white"
          >
            Bubble Blast
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-cyan-100 mb-8"
          >
            Pop bubbles and splash your way to the top!
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button
              variant="bubble"
              size="xl"
              onClick={start}
              className="font-bold text-white min-w-32 sm:min-w-40 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Start Game
            </Button>
            
            <Button
              variant="outline"
              size="xl"
              onClick={toggleInstructions}
              className="font-medium border-white text-white hover:bg-white/20 min-w-32 sm:min-w-40"
            >
              How to Play
            </Button>
          </motion.div>
          
          {/* Sound toggle button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            <button
              onClick={toggleMute}
              className="text-white/70 hover:text-white transition-colors flex items-center justify-center mx-auto gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {isMuted ? (
                  <>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
                    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </>
                ) : (
                  <>
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </>
                )}
              </svg>
              <span>{isMuted ? "Sound Off" : "Sound On"}</span>
            </button>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Instructions panel */}
      {showInstructions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 flex items-center justify-center bg-black/70 z-20"
          onClick={toggleInstructions}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md m-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-blue-800 mb-4">How to Play</h2>
            
            <div className="space-y-4 text-gray-700">
              <p>1. <span className="font-semibold">Match Bubbles:</span> Swap adjacent bubbles to make matches of 3 or more of the same color.</p>
              
              <p>2. <span className="font-semibold">Score Points:</span> Each match earns you points. The more bubbles you match at once, the more points you get!</p>
              
              <p>3. <span className="font-semibold">Create Special Bubbles:</span> Match 4 or more bubbles to create special bubbles with powerful splash effects.</p>
              
              <p>4. <span className="font-semibold">Level Up:</span> Meet the target score before running out of moves to advance to the next level.</p>
              
              <p>5. <span className="font-semibold">Limited Moves:</span> You have a limited number of moves to reach the target score, so choose wisely!</p>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button
                variant="bubble"
                onClick={toggleInstructions}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                Got it!
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StartScreen;
