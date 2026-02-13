import React, { useState } from "react";
import { Modal } from "./Modal";
import { useAuth } from "../state/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Login/Register modal.
 */
export function AuthModal({ open, onClose }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  async function submit() {
    setBusy(true);
    setMessage(null);
    try {
      if (mode === "login") {
        await login(username.trim(), password);
        setMessage({ type: "success", text: "Logged in." });
        onClose?.();
      } else {
        await register(username.trim(), password);
        setMessage({ type: "success", text: "Registered. You can now log in." });
        setMode("login");
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message || "Request failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      title={mode === "login" ? "Login" : "Register"}
      description={mode === "login" ? "Sign in to sync games and history." : "Create an account to track your games."}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={busy || !username.trim() || !password}>
            {busy ? "Please wait…" : (mode === "login" ? "Login" : "Register")}
          </button>
        </>
      }
    >
      <label className="label" htmlFor="username">Username</label>
      <input
        id="username"
        className="input"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="e.g. jordan"
        autoComplete="username"
      />

      <label className="label" htmlFor="password">Password</label>
      <input
        id="password"
        className="input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />

      <div className="help">
        {mode === "login" ? (
          <>
            Need an account?{" "}
            <button className="btn btn-ghost" type="button" onClick={() => setMode("register")}>
              Register
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button className="btn btn-ghost" type="button" onClick={() => setMode("login")}>
              Login
            </button>
          </>
        )}
      </div>

      {message ? <div className={`toast ${message.type}`}>{message.text}</div> : null}
    </Modal>
  );
}
