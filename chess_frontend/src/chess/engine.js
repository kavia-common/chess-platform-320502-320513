/**
 * Minimal chess rules engine to support a playable UI.
 * Limitations (intentional for this step): no castling, en-passant, promotion UI, check/checkmate validation.
 */

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

/**
 * PUBLIC_INTERFACE
 * Create initial position.
 */
export function createInitialPosition() {
  return parseFen("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1");
}

/**
 * PUBLIC_INTERFACE
 * Convert board state to a simple move object for API.
 */
export function toMovePayload({ from, to }) {
  return { from, to };
}

/**
 * PUBLIC_INTERFACE
 * Parse a very small subset of FEN: piece placement + active color.
 */
export function parseFen(fen) {
  const [placement, activeColor] = fen.split(" ");
  const rows = placement.split("/");
  const board = new Map();

  for (let r = 0; r < 8; r++) {
    const row = rows[r];
    let fileIndex = 0;
    for (const ch of row) {
      if (/\d/.test(ch)) {
        fileIndex += Number(ch);
      } else {
        const file = FILES[fileIndex];
        const rank = 8 - r;
        const sq = `${file}${rank}`;
        board.set(sq, ch);
        fileIndex += 1;
      }
    }
  }

  return {
    fen,
    board,
    turn: activeColor === "b" ? "b" : "w",
    moveHistory: []
  };
}

function isWhitePiece(p) {
  return p && p.toUpperCase() === p;
}

function pieceColor(p) {
  return isWhitePiece(p) ? "w" : "b";
}

function inBounds(fileIndex, rank) {
  return fileIndex >= 0 && fileIndex < 8 && rank >= 1 && rank <= 8;
}

function sqToCoords(square) {
  const file = square[0];
  const rank = Number(square[1]);
  return { fileIndex: FILES.indexOf(file), rank };
}

function coordsToSq(fileIndex, rank) {
  return `${FILES[fileIndex]}${rank}`;
}

function getPiece(board, square) {
  return board.get(square) || null;
}

/**
 * PUBLIC_INTERFACE
 * Compute pseudo-legal moves for a selected square.
 * @param {Map<string,string>} board
 * @param {string} fromSquare
 * @returns {{moves: string[], captures: string[]}}
 */
export function getPseudoLegalTargets(board, fromSquare) {
  const piece = getPiece(board, fromSquare);
  if (!piece) return { moves: [], captures: [] };

  const color = pieceColor(piece);
  const { fileIndex, rank } = sqToCoords(fromSquare);

  const moves = [];
  const captures = [];

  const addIfEmpty = (fi, r) => {
    if (!inBounds(fi, r)) return false;
    const sq = coordsToSq(fi, r);
    if (!getPiece(board, sq)) {
      moves.push(sq);
      return true;
    }
    return false;
  };

  const addIfEnemy = (fi, r) => {
    if (!inBounds(fi, r)) return;
    const sq = coordsToSq(fi, r);
    const target = getPiece(board, sq);
    if (target && pieceColor(target) !== color) {
      captures.push(sq);
    }
  };

  const slide = (df, dr) => {
    let fi = fileIndex + df;
    let r = rank + dr;
    while (inBounds(fi, r)) {
      const sq = coordsToSq(fi, r);
      const target = getPiece(board, sq);
      if (!target) {
        moves.push(sq);
      } else {
        if (pieceColor(target) !== color) captures.push(sq);
        break;
      }
      fi += df;
      r += dr;
    }
  };

  const p = piece.toLowerCase();
  if (p === "p") {
    const dir = color === "w" ? 1 : -1;
    const startRank = color === "w" ? 2 : 7;

    // forward 1
    if (addIfEmpty(fileIndex, rank + dir)) {
      // forward 2 from start
      if (rank === startRank) addIfEmpty(fileIndex, rank + 2 * dir);
    }
    // captures
    addIfEnemy(fileIndex - 1, rank + dir);
    addIfEnemy(fileIndex + 1, rank + dir);
  } else if (p === "n") {
    const deltas = [
      [1, 2], [2, 1], [2, -1], [1, -2],
      [-1, -2], [-2, -1], [-2, 1], [-1, 2]
    ];
    for (const [df, dr] of deltas) {
      const fi = fileIndex + df;
      const r = rank + dr;
      if (!inBounds(fi, r)) continue;
      const sq = coordsToSq(fi, r);
      const target = getPiece(board, sq);
      if (!target) moves.push(sq);
      else if (pieceColor(target) !== color) captures.push(sq);
    }
  } else if (p === "b") {
    slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
  } else if (p === "r") {
    slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1);
  } else if (p === "q") {
    slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
    slide(1, 0); slide(-1, 0); slide(0, 1); slide(0, -1);
  } else if (p === "k") {
    const deltas = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    for (const [df, dr] of deltas) {
      const fi = fileIndex + df;
      const r = rank + dr;
      if (!inBounds(fi, r)) continue;
      const sq = coordsToSq(fi, r);
      const target = getPiece(board, sq);
      if (!target) moves.push(sq);
      else if (pieceColor(target) !== color) captures.push(sq);
    }
  }

  return { moves, captures };
}

/**
 * PUBLIC_INTERFACE
 * Apply a move (from->to) if it is pseudo-legal for the moving piece.
 * @returns {{ ok: boolean, next: Object, error?: string }}
 */
export function applyMove(state, from, to) {
  const piece = state.board.get(from);
  if (!piece) return { ok: false, next: state, error: "No piece on selected square." };

  const color = pieceColor(piece);
  if (color !== state.turn) return { ok: false, next: state, error: "It's not that side's turn." };

  const { moves, captures } = getPseudoLegalTargets(state.board, from);
  const allowed = new Set([...moves, ...captures]);
  if (!allowed.has(to)) return { ok: false, next: state, error: "Illegal move (basic rules)." };

  const nextBoard = new Map(state.board);
  nextBoard.delete(from);
  nextBoard.set(to, piece);

  const nextTurn = state.turn === "w" ? "b" : "w";
  const nextHistory = [...state.moveHistory, { from, to, piece, captured: state.board.get(to) || null }];

  return {
    ok: true,
    next: {
      ...state,
      board: nextBoard,
      turn: nextTurn,
      moveHistory: nextHistory
    }
  };
}

/**
 * PUBLIC_INTERFACE
 * Render piece letter to unicode chess glyph.
 */
export function pieceToGlyph(p) {
  const map = {
    K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙",
    k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"
  };
  return map[p] || "";
}
