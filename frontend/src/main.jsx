import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import * as Sentry from "@sentry/react";
import { router } from "./router.jsx";
import "./index.css";

// Requests to these origins get Sentry trace headers, linking frontend and backend traces.
const apiBase = import.meta.env.VITE_API_URL;
const apiTracePropagationTargets = apiBase
  ? [apiBase]
  : [window.location.origin];

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      maskAllInputs: false,
      blockAllMedia: false,
    }),
  ],
  tracePropagationTargets: apiTracePropagationTargets,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 1.0,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
