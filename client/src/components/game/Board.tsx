import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useCandyGame } from "@/lib/stores/useCandyGame";
import Bubble from "./Bubble";
import { useAudio } from "@/lib/stores/useAudio";
import { useIsMobile } from "@/hooks/use-is-mobile";

const Board: React.FC = () => {
  const { board, selectCandy, getCurrentLevelConfig } = useCandyGame();
  const level = getCurrentLevelConfig();
  const { isMuted, toggleMute } = useAudio();
  const isMobile = useIsMobile();
  const [boardSize, setBoardSize] = useState({ width: 0, height: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  
  // Calculate the board size based on the container and device
  const updateBoardSize = useCallback(() => {
    const container = document.querySelector('.board-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      setBoardSize({ width: size, height: size });
    }
  }, []);

  useEffect(() => {
    updateBoardSize();
    const debouncedResize = debounce(updateBoardSize, 100);
    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
    };
  }, [level.rows, level.cols, updateBoardSize]);

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent, rowIndex: number, colIndex: number) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent, rowIndex: number, colIndex: number) => {
    if (!touchStart) return;
    
    const touchEnd = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY
    };
    
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    // Only select if it's a tap (small movement)
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      selectCandy(rowIndex, colIndex);
    }
    
    setTouchStart(null);
  };

  // Memoize cell size calculation
  const cellSize = useMemo(() => 
    Math.min(
      boardSize.width / level.cols,
      boardSize.height / level.rows
    ),
    [boardSize.width, boardSize.height, level.cols, level.rows]
  );

  if (!board || board.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="board-container relative w-full h-full flex items-center justify-center">
      <div 
        className="game-board relative bg-gradient-to-br from-blue-100/80 to-cyan-200/80 rounded-2xl p-2 shadow-2xl border-4 border-white/20"
        style={{ 
          width: cellSize * level.cols,
          height: cellSize * level.rows,
          backgroundImage: 'url("/textures/water-pattern.svg")',
          backgroundSize: 'cover',
          backgroundBlendMode: 'soft-light',
          touchAction: 'none', // Prevent browser handling of touch events
        }}
      >
        {/* Bubble-like grid pattern */}
        <div className="absolute inset-0 bg-white/5 rounded-2xl"
          style={{
            backgroundImage: 'radial-gradient(circle, transparent 20%, rgba(255,255,255,0.03) 21%, rgba(255,255,255,0.03) 34%, transparent 35%, transparent)',
            backgroundSize: `${cellSize * 0.8}px ${cellSize * 0.8}px`,
          }}
        />

        {board.map((row, rowIndex) => 
          row.map((candy, colIndex) => (
            <div 
              key={`cell-${rowIndex}-${colIndex}`}
              className="absolute transition-all duration-300"
              style={{
                width: cellSize,
                height: cellSize,
                transform: `translate(${colIndex * cellSize}px, ${rowIndex * cellSize}px)`,
                willChange: 'transform',
              }}
              onClick={() => selectCandy(rowIndex, colIndex)}
              onTouchStart={(e) => handleTouchStart(e, rowIndex, colIndex)}
              onTouchEnd={(e) => handleTouchEnd(e, rowIndex, colIndex)}
            >
              {candy && (
                <Bubble 
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
          className={isMuted ? "text-gray-400" : "text-blue-600"}
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

// Utility function for debouncing
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default React.memo(Board);
