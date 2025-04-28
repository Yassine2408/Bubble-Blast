import React from "react";
import { motion } from "framer-motion";
import { useCandyGame } from "@/lib/stores/useCandyGame";

const ScoreBar: React.FC = () => {
  const { score, getCurrentLevelConfig, combo } = useCandyGame();
  const currentLevel = getCurrentLevelConfig();
  const progress = Math.min(100, Math.max(0, (score / currentLevel.targetScore) * 100));
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-purple-800">Score</h2>
          <motion.span
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-pink-600"
          >
            {score}
          </motion.span>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-md font-medium text-purple-700">Progress</h3>
            <span className="text-sm font-medium text-purple-800">
              {score} / {currentLevel.targetScore}
            </span>
          </div>
          
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
            <motion.div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
        
        {combo > 1 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-lg text-center"
          >
            <span className="text-sm font-medium">Combo</span>
            <span className="text-xl font-bold ml-2">{combo}x</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ScoreBar;
