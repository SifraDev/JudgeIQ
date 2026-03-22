import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;

  const isLiveKitSDKRejection =
    (reason instanceof Event && reason.isTrusted === true && reason.type === "error") ||
    (typeof reason === "string" &&
      /\b(DataChannel|LiveKit|livekit|websocket closed|peer connection|RTC path not found|could not createOffer)\b/.test(
        reason
      )) ||
    (reason instanceof Error &&
      /\b(DataChannel|LiveKit|livekit|websocket closed|peer connection|RTC path not found|could not createOffer)\b/.test(
        reason.message
      ));

  if (isLiveKitSDKRejection) {
    event.preventDefault();
    console.warn("[JudgeIQ] Suppressed LiveKit SDK rejection:", reason);
  }
});

createRoot(document.getElementById("root")!).render(<App />);
