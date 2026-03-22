import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const isLiveKitError =
    reason === undefined ||
    reason === null ||
    (typeof reason === "object" &&
      !(reason instanceof Error) &&
      reason?.isTrusted !== undefined) ||
    (typeof reason === "string" &&
      (reason.includes("RTC") ||
        reason.includes("DataChannel") ||
        reason.includes("LiveKit") ||
        reason.includes("websocket closed") ||
        reason.includes("peer connection")));

  if (isLiveKitError) {
    event.preventDefault();
    console.warn("[JudgeIQ] Suppressed SDK-internal rejection:", reason);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
