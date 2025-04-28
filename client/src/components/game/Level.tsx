import React from "react";
import { motion } from "framer-motion";
import { useCandyGame } from "@/lib/stores/useCandyGame";

const Level: React.FC = () => {
  const { level, movesLeft, getCurrentLevelConfig } = useCandyGame();
  const currentLevel = getCurrentLevelConfig();
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-purple-800">Level</h2>
          <span className="text-3xl font-bold text-pink-600">{level}</span>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <h3 className="text-md font-medium text-purple-700">Target</h3>
          <span className="text-lg font-semibold text-purple-800">{currentLevel.targetScore} pts</span>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium text-purple-700">Moves Left</h3>
            <span className="text-lg font-semibold text-purple-800">{movesLeft}</span>
          </div>
          
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2.5 rounded-full"
              style={{ 
                width: `${Math.min(100, Math.max(0, (movesLeft / currentLevel.moveLimit) * 100))}%` 
              }}
              initial={{ width: '100%' }}
              animate={{ 
                width: `${Math.min(100, Math.max(0, (movesLeft / currentLevel.moveLimit) * 100))}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Level;
