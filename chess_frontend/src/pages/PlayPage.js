import React, { useEffect, useMemo, useState } from "react";
import { Chessboard } from "../components/Chessboard";
import { applyMove, createInitialPosition, toMovePayload } from "../chess/engine";
import { createApiClient } from "../api/client";
import { useAuth } from "../state/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Main play page: chessboard center + sidebar actions.
 */
export function PlayPage() {
  const { accessToken } = useAuth();

  const api = useMemo(() => createApiClient({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "",
    getAccessToken: () => accessToken,
    enableMocks: true
  }), [accessToken]);

  const [serverOk, setServerOk] = useState(null);
  const [gameId, setGameId] = useState(null);

  const [state, setState] = useState(() => createInitialPosition());
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [mode, setMode] = useState("ai");
  const [aiLevel, setAiLevel] = useState(2);

  useEffect(() => {
    api.health()
      .then(() => setServerOk(true))
      .catch(() => setServerOk(false));
  }, [api]);

  async function startNewGame() {
    setError("");
    setToast(null);
    try {
      const res = await api.createGame({ mode, aiLevel: mode === "ai" ? aiLevel : null });
      setGameId(res.gameId);
      setState(createInitialPosition());
      setSelected(null);
      setToast({ type: "success", message: `New game started (${mode === "ai" ? `AI level ${aiLevel}` : "multiplayer"})` });
    } catch (e) {
      setError(e.message || "Failed to start game.");
    }
  }

  async function onMove(from, to) {
    setError("");
    setToast(null);

    const result = applyMove(state, from, to);
    if (!result.ok) {
      setError(result.error || "Move not allowed.");
      return;
    }

    setState(result.next);
    setSelected(null);

    // Notify backend (mock accepts everything for now).
    try {
      if (!gameId) {
        // Implicitly create a game on first move in case user didn't hit Start.
        const res = await api.createGame({ mode, aiLevel: mode === "ai" ? aiLevel : null });
        setGameId(res.gameId);
      }
      await api.makeMove(gameId || "pending", toMovePayload({ from, to }));
    } catch (e) {
      setToast({ type: "error", message: `Backend validation pending: ${e.message}` });
    }
  }

  return (
    <div className="page">
      <div className="container grid">
        <div className="card">
          <div className="card-header">
            <div className="board-header">
              <div className="status-line">
                <span className={`status-dot ${serverOk ? "live" : ""}`} aria-hidden="true" />
                <span className="badge">
                  {serverOk === null ? "Checking server…" : (serverOk ? "Server reachable" : "Server not reachable (mock mode)")}
                </span>
                <span className="badge">
                  Turn: {state.turn === "w" ? "White" : "Black"}
                </span>
                {gameId ? <span className="badge">Game: <span className="mono">{gameId}</span></span> : null}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => { setState(createInitialPosition()); setSelected(null); }}>
                  Reset board
                </button>
                <button className="btn btn-primary" onClick={startNewGame}>
                  Start game
                </button>
              </div>
            </div>
            <p className="card-subtitle">
              Click a piece to select it, then click a highlighted square to move. Backend validation and full rules will be enforced once the FastAPI endpoints are available.
            </p>
          </div>

          <div className="card-body board-wrap">
            <Chessboard
              state={state}
              selected={selected}
              onSelect={(sq) => setSelected(sq)}
              onMove={onMove}
            />

            {error ? <div className="toast error">{error}</div> : null}
            {toast ? <div className={`toast ${toast.type}`}>{toast.message}</div> : null}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Opponent</h3>
            <p className="card-subtitle">
              Choose AI or multiplayer. Multiplayer matchmaking will be wired once backend endpoints exist.
            </p>
          </div>

          <div className="section">
            <div className="section-title">Mode</div>

            <label className="label" htmlFor="mode">Game mode</label>
            <select id="mode" className="select" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="ai">Play vs AI</option>
              <option value="multiplayer">Match a user</option>
            </select>

            {mode === "ai" ? (
              <>
                <label className="label" htmlFor="ai">AI level</label>
                <select id="ai" className="select" value={aiLevel} onChange={(e) => setAiLevel(Number(e.target.value))}>
                  <option value={1}>Level 1 (easy)</option>
                  <option value={2}>Level 2</option>
                  <option value={3}>Level 3</option>
                  <option value={4}>Level 4 (hard)</option>
                </select>
                <div className="help">
                  AI move generation will be handled by the backend. For now, the UI supports local move input.
                </div>
              </>
            ) : (
              <>
                <div className="list">
                  <div className="list-row">
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 13 }}>Matchmaking</div>
                      <div className="help">Queued matching will be enabled when backend is ready.</div>
                    </div>
                    <button className="btn" disabled title="Backend not implemented yet">
                      Queue
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="section">
            <div className="section-title">Moves</div>
            <div className="help">
              Recent moves (basic):
            </div>
            <div className="list" aria-label="Move history">
              {state.moveHistory.length === 0 ? (
                <div className="list-row">
                  <div className="help">No moves yet.</div>
                </div>
              ) : (
                state.moveHistory.slice(-8).reverse().map((m, idx) => (
                  <div key={`${m.from}-${m.to}-${idx}`} className="list-row">
                    <div style={{ fontWeight: 900, fontSize: 13 }}>
                      {m.from} → {m.to}
                    </div>
                    <div className="mono">{m.piece}{m.captured ? `x${m.captured}` : ""}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
