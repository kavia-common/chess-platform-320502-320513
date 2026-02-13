import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import { Navbar } from "./components/Navbar";
import { AuthModal } from "./components/AuthModal";
import { PlayPage } from "./pages/PlayPage";
import { HistoryPage } from "./pages/HistoryPage";
import { ProfilePage } from "./pages/ProfilePage";

/**
 * PUBLIC_INTERFACE
 * App entry UI: top nav + routes + auth modal.
 */
function App() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div>
      <Navbar onOpenAuth={() => setAuthOpen(true)} />
      <Routes>
        <Route path="/" element={<PlayPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/profile" element={<ProfilePage onOpenAuth={() => setAuthOpen(true)} />} />
      </Routes>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

export default App;
