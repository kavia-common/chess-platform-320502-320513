/**
 * Lightweight REST client for the chess backend.
 * The backend OpenAPI currently only exposes a health endpoint, so most methods
 * provide a mock fallback until the backend implements them.
 */

const DEFAULT_BASE_URL = "";

/**
 * PUBLIC_INTERFACE
 * Create an API client.
 * @param {Object} options
 * @param {string=} options.baseUrl Base URL (e.g., http://localhost:3001). If empty, uses same-origin.
 * @param {() => (string|null)=} options.getAccessToken Function returning a bearer token (if logged in).
 * @param {boolean=} options.enableMocks When true, use mock implementations for missing endpoints.
 * @returns {Object} API methods
 */
export function createApiClient({ baseUrl = DEFAULT_BASE_URL, getAccessToken, enableMocks = true } = {}) {
  async function request(path, { method = "GET", body, headers } = {}) {
    const token = getAccessToken ? getAccessToken() : null;

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers || {})
      },
      body: body ? JSON.stringify(body) : undefined
    });

    // Attempt JSON parse, otherwise return text.
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!res.ok) {
      const message = (data && data.detail) || (typeof data === "string" ? data : "") || `Request failed: ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  // ---- Implemented in backend today ----
  async function health() {
    return request("/", { method: "GET" });
  }

  // ---- Auth (mock fallback) ----
  async function login({ username, password }) {
    if (enableMocks) {
      if (!username || !password) throw new Error("Username and password required.");
      return {
        access_token: `mock-${btoa(`${username}:${Date.now()}`)}`,
        token_type: "bearer",
        user: { id: "mock-user", username }
      };
    }
    return request("/auth/login", { method: "POST", body: { username, password } });
  }

  async function register({ username, password }) {
    if (enableMocks) {
      if (!username || !password) throw new Error("Username and password required.");
      return { id: `mock-${cryptoRandomId()}`, username };
    }
    return request("/auth/register", { method: "POST", body: { username, password } });
  }

  async function me() {
    if (enableMocks) {
      const token = getAccessToken ? getAccessToken() : null;
      if (!token) return null;
      return { id: "mock-user", username: "mock" };
    }
    return request("/auth/me", { method: "GET" });
  }

  // ---- Game APIs (mock fallback) ----
  async function createGame({ mode, aiLevel }) {
    if (enableMocks) {
      return {
        gameId: `mock-game-${cryptoRandomId()}`,
        mode,
        aiLevel: aiLevel ?? null,
        initialFen: "startpos",
        createdAt: new Date().toISOString()
      };
    }
    return request("/games", { method: "POST", body: { mode, aiLevel } });
  }

  async function getGame(gameId) {
    if (enableMocks) {
      return { gameId, fen: "startpos", turn: "w", status: "active", moves: [] };
    }
    return request(`/games/${encodeURIComponent(gameId)}`, { method: "GET" });
  }

  async function makeMove(gameId, move) {
    if (enableMocks) {
      // Frontend updates state locally; backend validation will be added later.
      return { ok: true, gameId, move };
    }
    return request(`/games/${encodeURIComponent(gameId)}/move`, { method: "POST", body: move });
  }

  async function getHistory() {
    if (enableMocks) {
      return [
        { id: "mock-h-1", opponent: "AI (Level 2)", result: "1-0", endedAt: new Date(Date.now() - 86400000).toISOString() },
        { id: "mock-h-2", opponent: "User: alex", result: "0-1", endedAt: new Date(Date.now() - 2 * 86400000).toISOString() }
      ];
    }
    return request("/history", { method: "GET" });
  }

  return {
    health,
    login,
    register,
    me,
    createGame,
    getGame,
    makeMove,
    getHistory
  };
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint8Array(8);
    crypto.getRandomValues(buf);
    return Array.from(buf).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(16).slice(2);
}
