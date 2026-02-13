import React, { useEffect } from "react";

/**
 * PUBLIC_INTERFACE
 * Accessible modal with backdrop.
 */
export function Modal({ open, title, description, onClose, children, footer }) {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close modal">
            Close
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer ? <div className="modal-actions">{footer}</div> : null}
      </div>
    </div>
  );
}
