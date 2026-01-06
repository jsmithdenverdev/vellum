import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Mode, applyMode } from "@cloudscape-design/global-styles";
import "@cloudscape-design/global-styles/index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./contexts/ThemeContext.tsx";

// Apply initial Cloudscape mode based on system preference
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyMode(prefersDark ? Mode.Dark : Mode.Light);

// Listen for system preference changes and update Cloudscape mode
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (event) => {
    applyMode(event.matches ? Mode.Dark : Mode.Light);
  });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
