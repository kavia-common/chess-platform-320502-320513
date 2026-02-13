import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Top navigation.
 */
export function Navbar({ onOpenAuth }) {
  const { user, logout } = useAuth();

  return (
    <div className="navbar">
      <div className="container navbar-inner">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true" />
          <div className="brand-title">
            <strong>Chess Platform</strong>
            <span>Play • AI • History</span>
          </div>
        </div>

        <div className="nav-actions">
          <div className="nav-links" aria-label="Primary navigation">
            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/">
              Play
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/history">
              History
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`} to="/profile">
              Profile
            </NavLink>
          </div>

          {user ? (
            <>
              <span className="badge" title="Logged in user">
                {user.username}
              </span>
              <button className="btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={onOpenAuth}>Login</button>
          )}
        </div>
      </div>
    </div>
  );
}
