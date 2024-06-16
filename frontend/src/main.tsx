import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.js";
import { MainContextProvider } from "./context/State.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <MainContextProvider>
        <App />
      </MainContextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
