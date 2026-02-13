import React, { useMemo } from "react";
import { getPseudoLegalTargets, pieceToGlyph } from "../chess/engine";

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

/**
 * PUBLIC_INTERFACE
 * Chessboard UI component.
 */
export function Chessboard({ state, selected, onSelect, onMove }) {
  const highlights = useMemo(() => {
    if (!selected) return { moves: new Set(), captures: new Set() };
    const { moves, captures } = getPseudoLegalTargets(state.board, selected);
    return { moves: new Set(moves), captures: new Set(captures) };
  }, [state.board, selected]);

  const squares = [];
  for (let r = 8; r >= 1; r--) {
    for (let f = 0; f < 8; f++) {
      const sq = `${FILES[f]}${r}`;
      const isLight = (f + r) % 2 === 0;
      const piece = state.board.get(sq) || null;

      const classNames = [
        "square",
        isLight ? "light" : "dark",
        selected === sq ? "selected" : "",
        highlights.moves.has(sq) ? "movable" : "",
        highlights.captures.has(sq) ? "capturable" : ""
      ].filter(Boolean).join(" ");

      const showFile = r === 1;
      const showRank = f === 0;

      squares.push(
        <div
          key={sq}
          className={classNames}
          role="button"
          tabIndex={0}
          aria-label={`Square ${sq}${piece ? ` with ${piece}` : ""}`}
          onClick={() => {
            if (!selected) {
              onSelect?.(sq);
              return;
            }
            if (selected === sq) {
              onSelect?.(null);
              return;
            }
            // If selecting another square that has own side piece, switch selection.
            const targetPiece = state.board.get(sq);
            const selectedPiece = state.board.get(selected);
            const selectedIsWhite = selectedPiece && selectedPiece.toUpperCase() === selectedPiece;
            const targetIsWhite = targetPiece && targetPiece.toUpperCase() === targetPiece;

            if (targetPiece && selectedPiece && selectedIsWhite === targetIsWhite) {
              onSelect?.(sq);
              return;
            }

            onMove?.(selected, sq);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") e.currentTarget.click();
          }}
        >
          {showRank ? <div className="file-rank rank-label">{r}</div> : null}
          {showFile ? <div className="file-rank file-label">{sq[0]}</div> : null}
          {piece ? <div className="piece">{pieceToGlyph(piece)}</div> : null}
        </div>
      );
    }
  }

  return <div className="board" aria-label="Chess board">{squares}</div>;
}
