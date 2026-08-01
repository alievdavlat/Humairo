import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import MainProvider from "./components/providers/main-provider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MainProvider>
      <App />
    </MainProvider>
  </StrictMode>,
);
