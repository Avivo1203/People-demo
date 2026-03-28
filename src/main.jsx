import React, { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import WelcomePage from "./WelcomePage.jsx";
import "./index.css";


function RootEntry() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const alreadyEntered = localStorage.getItem("entered") === "true";
    setEntered(alreadyEntered);
  }, []);

  const handleEnter = () => {
    localStorage.setItem("entered", "true");
    localStorage.setItem("guest", "false");
    localStorage.setItem("viewer", "false");
    setEntered(true);
  };

  const handleGuestEnter = () => {
    localStorage.setItem("entered", "true");
    localStorage.setItem("guest", "true");
    localStorage.setItem("viewer", "false");
    localStorage.setItem("user", JSON.stringify({
      nickname: "אורח",
      firstName: "אורח",
      lastName: "",
      contact: ""
    }));
    setEntered(true);
  };

  const handleViewerEnter = () => {
    localStorage.setItem("entered", "true");
    localStorage.setItem("guest", "false");
    localStorage.setItem("viewer", "true");
    localStorage.setItem("user", JSON.stringify({
      nickname: "צופה",
      firstName: "צופה",
      lastName: "",
      contact: ""
    }));
    setEntered(true);
  };

  return entered ? (
    <App />
  ) : (
   <WelcomePage
  onEnter={handleEnter}
  onGuestEnter={handleGuestEnter}
  onViewerEnter={handleViewerEnter}
/>
  );
}

// ✅ הגנה נגד הפעלה כפולה של createRoot (בגלל Hot Reload של Vite)
if (!window.__REACT_ROOT__) {
  const container = document.getElementById("root");
  const root = createRoot(container);
  window.__REACT_ROOT__ = root;
  root.render(
    <StrictMode>
      <RootEntry />
    </StrictMode>
  );
}
