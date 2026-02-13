import React from "react";
import { useAuth } from "../state/AuthContext";

/**
 * PUBLIC_INTERFACE
 * Profile page.
 */
export function ProfilePage({ onOpenAuth }) {
  const { user, accessToken } = useAuth();

  return (
    <div className="page">
      <div className="container">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Profile</h3>
            <p className="card-subtitle">Account status and session info.</p>
          </div>

          <div className="card-body">
            {user ? (
              <>
                <div className="list">
                  <div className="list-row">
                    <div style={{ fontWeight: 900 }}>Username</div>
                    <div className="mono">{user.username}</div>
                  </div>
                  <div className="list-row">
                    <div style={{ fontWeight: 900 }}>Token</div>
                    <div className="mono">{accessToken?.slice(0, 22)}…</div>
                  </div>
                </div>
                <div className="hr" />
                <div className="help">
                  Once the backend implements real auth (JWT), this page will show rating, stats, and settings.
                </div>
              </>
            ) : (
              <>
                <div className="help">
                  You’re not logged in. Login to sync games and history to your account.
                </div>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-primary" onClick={onOpenAuth}>Login / Register</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
