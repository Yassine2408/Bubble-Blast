import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useAudio } from "./useAudio";
import { checkForMatches, applyGravity, generateNewCandies } from "../gameUtils";

export type CandyType = 
  | "red" 
  | "orange" 
  | "yellow" 
  | "green" 
  | "blue" 
  | "purple";

export type SpecialCandyType = 
  | "striped-horizontal" 
  | "striped-vertical" 
  | "wrapped" 
  | "color-bomb";

export interface CandyObject {
  id: string;
  type: CandyType;
  specialType?: SpecialCandyType;
  isSelected?: boolean;
  isMatched?: boolean;
  isNew?: boolean;
  isAnimating?: boolean;
}

export type BoardType = (CandyObject | null)[][];

export type GamePhase = "ready" | "playing" | "ended";

export interface LevelConfig {
  id: number;
  rows: number;
  cols: number;
  targetScore: number;
  moveLimit: number;
  specialCandyThreshold: number; // Min match size to create special candy
}

export interface GameState {
  phase: GamePhase;
  board: BoardType;
  score: number;
  moves: number;
  movesLeft: number;
  level: number;
  levels: LevelConfig[];
  selectedCandy: { row: number; col: number } | null;
  isBoardLocked: boolean;
  isSwapping: boolean;
  isProcessingMatches: boolean;
  combo: number;
  
  // Game initialization
  init: () => void;
  
  // Game actions
  start: () => void;
  restart: () => void;
  end: () => void;
  
  // Board actions
  createBoard: (rows: number, cols: number) => void;
  selectCandy: (row: number, col: number) => void;
  swapCandies: (row1: number, col1: number, row2: number, col2: number) => Promise<boolean>;
  processMatches: () => Promise<boolean>;
  
  // Level management
  loadLevel: (level: number) => void;
  getCurrentLevelConfig: () => LevelConfig;
  
  // Move tracking
  decrementMoves: () => void;
}

const CANDY_TYPES: CandyType[] = ["red", "orange", "yellow", "green", "blue", "purple"];

const LEVELS: LevelConfig[] = [
  { id: 1, rows: 8, cols: 8, targetScore: 1000, moveLimit: 15, specialCandyThreshold: 4 },
  { id: 2, rows: 8, cols: 8, targetScore: 2000, moveLimit: 20, specialCandyThreshold: 4 },
  { id: 3, rows: 9, cols: 9, targetScore: 3000, moveLimit: 25, specialCandyThreshold: 4 },
  { id: 4, rows: 9, cols: 9, targetScore: 4000, moveLimit: 30, specialCandyThreshold: 4 },
  { id: 5, rows: 10, cols: 10, targetScore: 5000, moveLimit: 35, specialCandyThreshold: 4 },
];

export const useCandyGame = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    phase: "ready",
    board: [],
    score: 0,
    moves: 0, 
    movesLeft: 0,
    level: 1,
    levels: LEVELS,
    selectedCandy: null,
    isBoardLocked: false,
    isSwapping: false,
    isProcessingMatches: false,
    combo: 0,
    
    init: () => {
      set({ phase: "ready" });
    },
    
    start: () => {
      const { loadLevel } = get();
      set({ 
        phase: "playing", 
        score: 0, 
        moves: 0, 
        level: 1,
        combo: 0
      });
      loadLevel(1);
    },
    
    restart: () => {
      set({ phase: "ready" });
    },
    
    end: () => {
      set({ phase: "ended" });
    },
    
    createBoard: (rows, cols) => {
      // Generate a new board with random candies
      const newBoard: BoardType = Array(rows).fill(null).map(() => Array(cols).fill(null));
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          // Avoid creating immediate matches when generating the board
          let availableTypes = [...CANDY_TYPES];
          
          // Check horizontal
          if (col >= 2) {
            if (newBoard[row][col-1]?.type === newBoard[row][col-2]?.type) {
              availableTypes = availableTypes.filter(type => type !== newBoard[row][col-1]?.type);
            }
          }
          
          // Check vertical
          if (row >= 2) {
            if (newBoard[row-1][col]?.type === newBoard[row-2][col]?.type) {
              availableTypes = availableTypes.filter(type => type !== newBoard[row-1][col]?.type);
            }
          }
          
          // If we've filtered out all types, just use any type
          if (availableTypes.length === 0) {
            availableTypes = [...CANDY_TYPES];
          }
          
          // Pick a random type from the available types
          const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
          
          newBoard[row][col] = {
            id: `candy-${row}-${col}-${Date.now()}`,
            type: randomType,
            isNew: true
          };
        }
      }
      
      set({ board: newBoard });
      
      // After a short delay, remove the "new" flag from all candies
      setTimeout(() => {
        set(state => ({
          board: state.board.map(row => 
            row.map(candy => 
              candy ? { ...candy, isNew: false } : null
            )
          )
        }));
      }, 500);
    },
    
    selectCandy: (row, col) => {
      const { board, selectedCandy, isBoardLocked, swapCandies } = get();
      
      if (isBoardLocked) return;
      
      // If there's no candy at this position, do nothing
      if (!board[row][col]) return;
      
      // If there's already a selected candy
      if (selectedCandy) {
        // If clicking the same candy, deselect it
        if (selectedCandy.row === row && selectedCandy.col === col) {
          set({
            selectedCandy: null,
            board: board.map(r => r.map(c => c ? { ...c, isSelected: false } : null))
          });
          return;
        }
        
        // Check if the new selection is adjacent to the currently selected candy
        const isAdjacent = 
          (Math.abs(selectedCandy.row - row) === 1 && selectedCandy.col === col) ||
          (Math.abs(selectedCandy.col - col) === 1 && selectedCandy.row === row);
        
        if (isAdjacent) {
          // Try to swap the candies
          swapCandies(selectedCandy.row, selectedCandy.col, row, col);
          return;
        }
        
        // If not adjacent, select the new candy instead
        set({
          selectedCandy: { row, col },
          board: board.map((r, rIndex) => 
            r.map((c, cIndex) => 
              c ? { ...c, isSelected: rIndex === row && cIndex === col } : null
            )
          )
        });
        return;
      }
      
      // If no candy is selected yet, select this one
      set({
        selectedCandy: { row, col },
        board: board.map((r, rIndex) => 
          r.map((c, cIndex) => 
            c ? { ...c, isSelected: rIndex === row && cIndex === col } : null
          )
        )
      });
    },
    
    swapCandies: async (row1, col1, row2, col2) => {
      const { board, processMatches, decrementMoves } = get();
      
      // Lock the board during the swap
      set({ isBoardLocked: true, isSwapping: true, selectedCandy: null });
      
      // Create a copy of the board
      const newBoard = [...board.map(row => [...row])];
      
      // Swap the candies
      const temp = newBoard[row1][col1];
      newBoard[row1][col1] = newBoard[row2][col2];
      newBoard[row2][col2] = temp;
      
      // Update the board with the swap
      set({ board: newBoard });
      
      // Wait for the swap animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Check if the swap created any matches
      const hasMatches = await processMatches();
      
      if (!hasMatches) {
        // If no matches, swap back
        const revertBoard = [...newBoard.map(row => [...row])];
        const revertTemp = revertBoard[row1][col1];
        revertBoard[row1][col1] = revertBoard[row2][col2];
        revertBoard[row2][col2] = revertTemp;
        
        set({ board: revertBoard });
        
        // Wait for the swap-back animation
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Unlock the board
        set({ 
          isBoardLocked: false, 
          isSwapping: false, 
          board: revertBoard.map(r => r.map(c => c ? { ...c, isSelected: false } : null))
        });
        return false;
      }
      
      // If we did have matches, decrement the moves
      decrementMoves();
      
      // Swap was successful and created matches
      return true;
    },
    
    processMatches: async () => {
      const { board, score, combo } = get();
      set({ isProcessingMatches: true });
      
      // Find matches
      const { hasMatches, matchedBoard, matchCount, scoreEarned, specialCandies } = checkForMatches(board, get().getCurrentLevelConfig().specialCandyThreshold);
      
      if (!hasMatches) {
        set({ isProcessingMatches: false, isSwapping: false, isBoardLocked: false, combo: 0 });
        return false;
      }
      
      // Play sound for matches
      if (matchCount > 0) {
        useAudio.getState().playPop();
      }
      
      // Update the board with matched candies
      set({ 
        board: matchedBoard,
        score: score + scoreEarned,
        combo: combo + 1
      });
      
      // Wait for match animation
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Apply gravity to make candies fall
      const boardAfterGravity = applyGravity(matchedBoard);
      set({ board: boardAfterGravity });
      
      // Wait for gravity animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate new candies to fill empty spaces
      const { boardWithNewCandies } = generateNewCandies(boardAfterGravity, CANDY_TYPES);
      set({ board: boardWithNewCandies });
      
      // Wait for new candies animation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Clear the "new" flag from candies
      set(state => ({
        board: state.board.map(row => 
          row.map(candy => 
            candy ? { ...candy, isNew: false } : null
          )
        )
      }));
      
      // Check for cascading matches
      const hasCascadingMatches = await get().processMatches();
      
      if (!hasCascadingMatches) {
        set({ isProcessingMatches: false, isSwapping: false, isBoardLocked: false, combo: 0 });
      }
      
      return true;
    },
    
    loadLevel: (levelNumber) => {
      const { levels, createBoard } = get();
      const levelConfig = levels.find(l => l.id === levelNumber) || levels[0];
      
      set({ 
        level: levelNumber,
        movesLeft: levelConfig.moveLimit,
        moves: 0,
        score: 0
      });
      
      createBoard(levelConfig.rows, levelConfig.cols);
    },
    
    getCurrentLevelConfig: () => {
      const { levels, level } = get();
      return levels.find(l => l.id === level) || levels[0];
    },
    
    decrementMoves: () => {
      const { movesLeft, score, getCurrentLevelConfig, end } = get();
      const newMovesLeft = movesLeft - 1;
      set({ movesLeft: newMovesLeft, moves: get().moves + 1 });
      
      // Check for game over condition
      if (newMovesLeft <= 0) {
        const currentLevel = getCurrentLevelConfig();
        
        // Check if the level is completed
        if (score >= currentLevel.targetScore) {
          // If there are more levels, load the next one
          const nextLevel = currentLevel.id + 1;
          if (get().levels.some(l => l.id === nextLevel)) {
            get().loadLevel(nextLevel);
          } else {
            // If all levels completed, end the game
            end();
          }
        } else {
          // If the level is not completed and there are no more moves, end the game
          end();
        }
      }
    }
  }))
);
