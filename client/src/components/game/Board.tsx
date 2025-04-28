import React, { useEffect, useState } from "react";
import { useCandyGame } from "@/lib/stores/useCandyGame";
import Candy from "./Candy";
import { useAudio } from "@/lib/stores/useAudio";

const Board: React.FC = () => {
  const { board, selectCandy, getCurrentLevelConfig } = useCandyGame();
  const level = getCurrentLevelConfig();
  const { isMuted, toggleMute } = useAudio();
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  
  // Calculate the board size based on the container
  useEffect(() => {
    const updateBoardSize = () => {
      const container = document.querySelector('.board-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        setBoardSize({ width: size, height: size });
      }
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    
    return () => {
      window.removeEventListener('resize', updateBoardSize);
    };
  }, [level.rows, level.cols]);

  if (!board || board.length === 0) {
    return <div>Loading...</div>;
  }

  const cellSize = Math.min(
    boardSize.width / level.cols,
    boardSize.height / level.rows
  );

  return (
    <div className="board-container relative w-full h-full flex items-center justify-center">
      <div 
        className="game-board relative bg-gradient-to-br from-pink-100/80 to-purple-200/80 rounded-2xl p-2 shadow-2xl border-4 border-white/20"
        style={{ 
          width: cellSize * level.cols,
          height: cellSize * level.rows,
        }}
      >
        {board.map((row, rowIndex) => 
          row.map((candy, colIndex) => (
            <div 
              key={`cell-${rowIndex}-${colIndex}`}
              className="absolute transition-all duration-300"
              style={{
                width: cellSize,
                height: cellSize,
                transform: `translate(${colIndex * cellSize}px, ${rowIndex * cellSize}px)`,
              }}
              onClick={() => selectCandy(rowIndex, colIndex)}
            >
              {candy && (
                <Candy 
                  candy={candy} 
                  size={cellSize} 
                />
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Sound toggle button */}
      <button 
        className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-2 shadow-md"
        onClick={toggleMute}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className={isMuted ? "text-gray-400" : "text-purple-600"}
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
      </button>
    </div>
  );
};

export default Board;
