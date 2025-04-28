import { BoardType, CandyObject, CandyType, SpecialCandyType } from "./stores/useCandyGame";

interface MatchResult {
  hasMatches: boolean;
  matchedBoard: BoardType;
  matchCount: number;
  scoreEarned: number;
  specialCandies: { row: number; col: number; type: SpecialCandyType }[];
}

// Check the entire board for matches (3 or more in a row)
export function checkForMatches(board: BoardType, specialCandyThreshold: number): MatchResult {
  const rows = board.length;
  const cols = board[0].length;
  
  // Create a copy of the board to mark matches
  const matchedBoard: BoardType = board.map(row => 
    row.map(candy => candy ? { ...candy, isMatched: false } : null)
  );
  
  let hasMatches = false;
  let matchCount = 0;
  let scoreEarned = 0;
  const specialCandies: { row: number; col: number; type: SpecialCandyType }[] = [];
  
  // Check horizontal matches
  for (let row = 0; row < rows; row++) {
    let currentType: CandyType | null = null;
    let matchLength = 1;
    
    for (let col = 0; col < cols; col++) {
      const candy = board[row][col];
      
      if (candy && candy.type === currentType) {
        matchLength++;
        
        // Check if we have a match at the end of a row
        if (col === cols - 1 && matchLength >= 3) {
          hasMatches = true;
          matchCount++;
          
          // Mark the candies as matched
          for (let i = 0; i < matchLength; i++) {
            if (matchedBoard[row][col - i] && !matchedBoard[row][col - i]?.isMatched) {
              matchedBoard[row][col - i]!.isMatched = true;
              scoreEarned += 10 * (1 + (matchLength - 3) * 0.5); // More points for longer matches
            }
          }
          
          // Check if we should create a special candy
          if (matchLength >= specialCandyThreshold) {
            specialCandies.push({
              row,
              col: col - Math.floor(matchLength / 2),
              type: "striped-horizontal"
            });
          }
        }
      } else {
        // Check if we have a match ending at this position
        if (matchLength >= 3) {
          hasMatches = true;
          matchCount++;
          
          // Mark the candies as matched
          for (let i = 0; i < matchLength; i++) {
            if (matchedBoard[row][col - 1 - i] && !matchedBoard[row][col - 1 - i]?.isMatched) {
              matchedBoard[row][col - 1 - i]!.isMatched = true;
              scoreEarned += 10 * (1 + (matchLength - 3) * 0.5);
            }
          }
          
          // Check if we should create a special candy
          if (matchLength >= specialCandyThreshold) {
            specialCandies.push({
              row,
              col: col - 1 - Math.floor(matchLength / 2),
              type: "striped-horizontal"
            });
          }
        }
        
        // Reset for the next potential match
        currentType = candy?.type || null;
        matchLength = candy ? 1 : 0;
      }
    }
  }
  
  // Check vertical matches
  for (let col = 0; col < cols; col++) {
    let currentType: CandyType | null = null;
    let matchLength = 1;
    
    for (let row = 0; row < rows; row++) {
      const candy = board[row][col];
      
      if (candy && candy.type === currentType) {
        matchLength++;
        
        // Check if we have a match at the bottom of a column
        if (row === rows - 1 && matchLength >= 3) {
          hasMatches = true;
          matchCount++;
          
          // Mark the candies as matched
          for (let i = 0; i < matchLength; i++) {
            if (matchedBoard[row - i][col] && !matchedBoard[row - i][col]?.isMatched) {
              matchedBoard[row - i][col]!.isMatched = true;
              scoreEarned += 10 * (1 + (matchLength - 3) * 0.5);
            }
          }
          
          // Check if we should create a special candy
          if (matchLength >= specialCandyThreshold) {
            specialCandies.push({
              row: row - Math.floor(matchLength / 2),
              col,
              type: "striped-vertical"
            });
          }
        }
      } else {
        // Check if we have a match ending at this position
        if (matchLength >= 3) {
          hasMatches = true;
          matchCount++;
          
          // Mark the candies as matched
          for (let i = 0; i < matchLength; i++) {
            if (matchedBoard[row - 1 - i][col] && !matchedBoard[row - 1 - i][col]?.isMatched) {
              matchedBoard[row - 1 - i][col]!.isMatched = true;
              scoreEarned += 10 * (1 + (matchLength - 3) * 0.5);
            }
          }
          
          // Check if we should create a special candy
          if (matchLength >= specialCandyThreshold) {
            specialCandies.push({
              row: row - 1 - Math.floor(matchLength / 2),
              col,
              type: "striped-vertical"
            });
          }
        }
        
        // Reset for the next potential match
        currentType = candy?.type || null;
        matchLength = candy ? 1 : 0;
      }
    }
  }
  
  // Check for L or T shaped matches (more complex special candies)
  // This would be implemented in a more complete version
  
  return { hasMatches, matchedBoard, matchCount, scoreEarned, specialCandies };
}

// Apply gravity to make candies fall into empty spaces
export function applyGravity(board: BoardType): BoardType {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard: BoardType = Array(rows).fill(null).map(() => Array(cols).fill(null));
  
  // For each column, move candies down
  for (let col = 0; col < cols; col++) {
    let newRow = rows - 1;
    
    // Move existing candies down
    for (let row = rows - 1; row >= 0; row--) {
      const candy = board[row][col];
      
      // If this position has a non-matched candy, move it down
      if (candy && !candy.isMatched) {
        newBoard[newRow][col] = {
          ...candy,
          isMatched: false,
          isAnimating: row !== newRow // Flag for animation if candy moved
        };
        newRow--;
      }
      // If matched, it will be removed, no need to include in the new board
    }
  }
  
  return newBoard;
}

// Generate new candies to fill empty spaces
export function generateNewCandies(board: BoardType, candyTypes: CandyType[]): { boardWithNewCandies: BoardType } {
  const rows = board.length;
  const cols = board[0].length;
  const boardWithNewCandies: BoardType = board.map(row => [...row]);
  
  // For each empty space, generate a new candy
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      if (!boardWithNewCandies[row][col]) {
        const randomType = candyTypes[Math.floor(Math.random() * candyTypes.length)];
        
        boardWithNewCandies[row][col] = {
          id: `candy-${row}-${col}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: randomType,
          isNew: true // Flag for animation
        };
      }
    }
  }
  
  return { boardWithNewCandies };
}
