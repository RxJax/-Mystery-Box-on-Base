export const BOARD_WIDTH = 8;
export const BOARD_HEIGHT = 8;

export function createBoard(colors) {
  const board = [];
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    const row = [];
    for (let c = 0; c < BOARD_WIDTH; c++) {
      let randomColor;
      // Ensure no 3 in a row initially
      do {
        randomColor = colors[Math.floor(Math.random() * colors.length)];
      } while (
        (c >= 2 && row[c - 1]?.type === randomColor && row[c - 2]?.type === randomColor) ||
        (r >= 2 && board[r - 1][c]?.type === randomColor && board[r - 2][c]?.type === randomColor)
      );
      row.push({
        type: randomColor,
        id: `${r}-${c}-${Math.random().toString(36).substring(2, 9)}`,
      });
    }
    board.push(row);
  }
  return board;
}

export function checkForMatches(board) {
  const matchedPositions = new Set();
  let specialEffects = []; // { type: 'multiplier' | 'comet', positions: [] }

  // Check horizontal
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    let matchLength = 1;
    for (let c = 0; c < BOARD_WIDTH; c++) {
      let checkMatch = false;
      if (c === BOARD_WIDTH - 1) {
        checkMatch = true;
      } else {
        if (board[r][c]?.type === board[r][c + 1]?.type && board[r][c]?.type !== null) {
          matchLength++;
        } else {
          checkMatch = true;
        }
      }

      if (checkMatch) {
        if (matchLength >= 3) {
          const matchIndices = [];
          for (let i = 0; i < matchLength; i++) {
            matchedPositions.add(`${r},${c - i}`);
            matchIndices.push({ r, c: c - i });
          }
          if (matchLength === 4) {
            specialEffects.push({ type: 'multiplier', positions: matchIndices });
          } else if (matchLength >= 5) {
            specialEffects.push({ type: 'comet', positions: matchIndices, center: matchIndices[2] }); // Center of the 5-match
          }
        }
        matchLength = 1;
      }
    }
  }

  // Check vertical
  for (let c = 0; c < BOARD_WIDTH; c++) {
    let matchLength = 1;
    for (let r = 0; r < BOARD_HEIGHT; r++) {
      let checkMatch = false;
      if (r === BOARD_HEIGHT - 1) {
        checkMatch = true;
      } else {
        if (board[r][c]?.type === board[r + 1][c]?.type && board[r][c]?.type !== null) {
          matchLength++;
        } else {
          checkMatch = true;
        }
      }

      if (checkMatch) {
        if (matchLength >= 3) {
          const matchIndices = [];
          for (let i = 0; i < matchLength; i++) {
            matchedPositions.add(`${r - i},${c}`);
            matchIndices.push({ r: r - i, c });
          }
          if (matchLength === 4) {
            specialEffects.push({ type: 'multiplier', positions: matchIndices });
          } else if (matchLength >= 5) {
            specialEffects.push({ type: 'comet', positions: matchIndices, center: matchIndices[2] });
          }
        }
        matchLength = 1;
      }
    }
  }

  return { matchedPositions, specialEffects };
}

// Applies gravity to make tiles fall and generate new ones
export function applyGravity(board, colors) {
  let hasFallen = false;
  const newBoard = board.map(row => row.slice());

  for (let c = 0; c < BOARD_WIDTH; c++) {
    let emptySpaces = 0;
    for (let r = BOARD_HEIGHT - 1; r >= 0; r--) {
      if (newBoard[r][c] === null) {
        emptySpaces++;
      } else if (emptySpaces > 0) {
        newBoard[r + emptySpaces][c] = newBoard[r][c];
        newBoard[r][c] = null;
        hasFallen = true;
      }
    }

    for (let i = 0; i < emptySpaces; i++) {
      newBoard[i][c] = {
        type: colors[Math.floor(Math.random() * colors.length)],
        id: `spawn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      };
      hasFallen = true;
    }
  }

  return { newBoard, hasFallen };
}

export function swap(board, r1, c1, r2, c2) {
  const newBoard = board.map(row => row.slice());
  const temp = newBoard[r1][c1];
  newBoard[r1][c1] = newBoard[r2][c2];
  newBoard[r2][c2] = temp;
  return newBoard;
}

export function hasValidMoves(board) {
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    for (let c = 0; c < BOARD_WIDTH; c++) {
      // Swap right
      if (c < BOARD_WIDTH - 1) {
        const testBoard = swap(board, r, c, r, c + 1);
        if (checkForMatches(testBoard).matchedPositions.size > 0) return true;
      }
      // Swap down
      if (r < BOARD_HEIGHT - 1) {
        const testBoard = swap(board, r, c, r + 1, c);
        if (checkForMatches(testBoard).matchedPositions.size > 0) return true;
      }
    }
  }
  return false;
}

export function reshuffle(board) {
  let tiles = [];
  for (let r = 0; r < BOARD_HEIGHT; r++) {
    for (let c = 0; c < BOARD_WIDTH; c++) {
      tiles.push(board[r][c]);
    }
  }

  let newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

  let maxAttempts = 100;
  let attempts = 0;
  let valid = false;

  while (!valid && attempts < maxAttempts) {
    // Shuffle array
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }

    // Place back
    let idx = 0;
    for (let r = 0; r < BOARD_HEIGHT; r++) {
      for (let c = 0; c < BOARD_WIDTH; c++) {
        newBoard[r][c] = tiles[idx++];
      }
    }

    if (checkForMatches(newBoard).matchedPositions.size === 0 && hasValidMoves(newBoard)) {
      valid = true;
    }
    attempts++;
  }

  return newBoard;
}
