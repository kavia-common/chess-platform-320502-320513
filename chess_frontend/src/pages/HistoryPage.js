import React, { useEffect, useMemo, useState } from "react";
import { createApiClient } from "../api/client";
import { useAuth } from "../state/AuthContext";

/**
 * PUBLIC_INTERFACE
 * History page showing completed games.
 */
export function HistoryPage() {
  const { accessToken } = useAuth();
  const api = useMemo(() => createApiClient({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "",
    getAccessToken: () => accessToken,
    enableMocks: true
  }), [accessToken]);

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setError("");
    api.getHistory()
      .then((data) => { if (mounted) setItems(Array.isArray(data) ? data : []); })
      .catch((e) => { if (mounted) setError(e.message || "Failed to load history."); });
    return () => { mounted = false; };
  }, [api]);

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Game History</h3>
            <p className="card-subtitle">Your recently completed games.</p>
          </div>

          <div className="card-body">
            {error ? <div className="toast error">{error}</div> : null}

            <div className="list" aria-label="History list">
              {items.length === 0 ? (
                <div className="list-row">
                  <div className="help">No history yet.</div>
                </div>
              ) : items.map((g) => (
                <div key={g.id} className="list-row">
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 13 }}>{g.opponent}</div>
                    <div className="help">Ended: {new Date(g.endedAt).toLocaleString()}</div>
                  </div>
                  <span className="badge">{g.result}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
