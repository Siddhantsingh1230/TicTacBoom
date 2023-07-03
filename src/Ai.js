const PLAYER_X = "X";
const PLAYER_O = "O";

// Evaluate the board and return the result: "X" if X wins, "O" if O wins, "draw" for a tie, or null if the game is not finished
function evaluateBoard(board) {
  const winConditions = [
    // Rows
    [board[0][0], board[0][1], board[0][2]],
    [board[1][0], board[1][1], board[1][2]],
    [board[2][0], board[2][1], board[2][2]],
    // Columns
    [board[0][0], board[1][0], board[2][0]],
    [board[0][1], board[1][1], board[2][1]],
    [board[0][2], board[1][2], board[2][2]],
    // Diagonals
    [board[0][0], board[1][1], board[2][2]],
    [board[0][2], board[1][1], board[2][0]]
  ];

  for (const condition of winConditions) {
    if (condition[0] === condition[1] && condition[0] === condition[2]) {
      if (condition[0] === PLAYER_X) {
        return PLAYER_X;
      } else if (condition[0] === PLAYER_O) {
        return PLAYER_O;
      }
    }
  }

  for (const row of board) {
    for (const cell of row) {
      if (cell === "") {
        return null; // Game not finished
      }
    }
  }

  return "draw"; // It's a draw
}

// Minimax algorithm with alpha-beta pruning
function minimax(board, depth, player, alpha, beta) {
  const result = evaluateBoard(board);

  if (result !== null) {
    if (result === PLAYER_X) {
      return 10 - depth;
    } else if (result === PLAYER_O) {
      return depth - 10;
    } else {
      return 0; // Draw
    }
  }

  let bestScore;
  if (player === PLAYER_X) {
    bestScore = -Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === "") {
          board[i][j] = PLAYER_X;
          const score = minimax(board, depth + 1, PLAYER_O, alpha, beta);
          board[i][j] = "";
          bestScore = Math.max(score, bestScore);
          alpha = Math.max(alpha, bestScore);
          if (beta <= alpha) {
            break;
          }
        }
      }
    }
  } else {
    bestScore = Infinity;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === "") {
          board[i][j] = PLAYER_O;
          const score = minimax(board, depth + 1, PLAYER_X, alpha, beta);
          board[i][j] = "";
          bestScore = Math.min(score, bestScore);
          beta = Math.min(beta, bestScore);
          if (beta <= alpha) {
            break;
          }
        }
      }
    }
  }

  return bestScore;
}

// Get the best move for the AI using
// Get the best move for the AI using Minimax algorithm
function getBestMove(board) {
  let bestScore = -Infinity;
  let bestMove;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j] === "") {
        board[i][j] = PLAYER_X;
        const score = minimax(board, 0, PLAYER_O, -Infinity, Infinity);
        board[i][j] = "";
        if (score > bestScore) {
          bestScore = score;
          bestMove = [i, j];
        }
      }
    }
  }

  return bestMove;
}

// Example usage
const board = [
  ["X", "X", "O"],
  ["X", "O", "O"],
  ["", "O", "X"]
];

const bestMove = getBestMove(board);
console.log("Best Move:", bestMove);
