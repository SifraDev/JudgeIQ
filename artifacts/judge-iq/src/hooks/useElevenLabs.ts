import { useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useVoiceState } from '@/context/VoiceStateContext';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string || '';
const MAX_RETRIES = 1;
const SUSPENSE_DELAY_MS = 4000;
const MIC_HEALTH_CHECK_DELAY_MS = 500;

interface SearchParameters {
  query?: string;
  judge_name?: string;
}

async function getSignedUrl(): Promise<string | null> {
  try {
    const baseUrl = (import.meta.env.BASE_URL as string || '').replace(/\/$/, '');
    const res = await fetch(`${baseUrl}/api/elevenlabs/signed-url`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.signedUrl || null;
  } catch {
    return null;
  }
}

function checkMicStreamHealth(stream: MediaStream | null): { alive: boolean; details: string } {
  if (!stream) {
    return { alive: false, details: 'No MediaStream stored' };
  }

  const tracks = stream.getAudioTracks();
  if (tracks.length === 0) {
    return { alive: false, details: 'MediaStream has no audio tracks' };
  }

  const staleTrack = tracks.find(t => t.readyState === 'ended' || !t.enabled);
  if (staleTrack) {
    return {
      alive: false,
      details: `Track "${staleTrack.label}" is ${staleTrack.readyState}, enabled=${staleTrack.enabled}`,
    };
  }

  const trackInfo = tracks.map(t => `"${t.label}" readyState=${t.readyState} enabled=${t.enabled}`).join(', ');
  return { alive: true, details: trackInfo };
}

export function useElevenLabs() {
  const { setState, addLog, setResearchData, addTranscript } = useVoiceState();
  const isToolRunning = useRef(false);
  const retryCount = useRef(0);
  const isRetrying = useRef(false);
  const pendingMode = useRef<string | null>(null);
  const micStream = useRef<MediaStream | null>(null);
  const needsSessionRestart = useRef(false);

  const conversation = useConversation({
    onConnect: () => {
      try {
        retryCount.current = 0;
        isRetrying.current = false;
        addLog('Connected to ElevenAgents.', 'success');
        setState('LISTENING');
      } catch (e) {
        console.warn('[useElevenLabs] onConnect error:', e);
      }
    },
    onDisconnect: () => {
      try {
        const wasToolRestart = needsSessionRestart.current;
        isToolRunning.current = false;
        pendingMode.current = null;
        needsSessionRestart.current = false;

        if (wasToolRestart) {
          addLog('Session ended for mic recovery. Reconnecting...', 'system');
          setTimeout(() => {
            attemptReconnect();
          }, 300);
          return;
        }

        if (retryCount.current < MAX_RETRIES && !isRetrying.current) {
          isRetrying.current = true;
          retryCount.current += 1;
          addLog(`Connection lost. Retrying (${retryCount.current}/${MAX_RETRIES})...`, 'warning');
          setTimeout(() => {
            attemptReconnect();
          }, 1500);
          return;
        }

        addLog('Connection lost. Tap the orb to reconnect.', 'error');
        setState('IDLE');
      } catch (e) {
        console.warn('[useElevenLabs] onDisconnect error:', e);
      }
    },
    onMessage: (props: any) => {
      try {
        const text = props?.message || '';
        const role = props?.role || '';
        if (role === 'agent' && text.length > 0) {
          addLog(`Agent: ${text.substring(0, 120)}`, 'info');
          addTranscript('agent', text);
        } else if (role === 'user' && text.length > 0) {
          addTranscript('user', text);
        }
      } catch (error) {
        console.warn('[useElevenLabs] onMessage error:', error);
      }
    },
    onError: (error: any) => {
      try {
        const msg = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
        addLog(`ElevenAgents error: ${msg}`, 'error');
      } catch (e) {
        console.warn('[useElevenLabs] onError handler error:', e);
      }
    },
    onModeChange: (prop: any) => {
      try {
        const mode = prop?.mode || prop;

        if (isToolRunning.current) {
          pendingMode.current = mode;
          console.log('[useElevenLabs] Mode change during tool execution (buffered):', mode);
          return;
        }

        if (mode === 'speaking') {
          setState('SPEAKING');
        } else if (mode === 'listening') {
          setState('LISTENING');
          addLog('Listening to voice input...', 'info');
        }
      } catch (e) {
        console.warn('[useElevenLabs] onModeChange error:', e);
      }
    },
    clientTools: {
      firecrawl_search: async (parameters: SearchParameters): Promise<string> => {
        try {
          const query = parameters?.query || parameters?.judge_name || '';
          addLog(`Researching "${query}"...`, 'warning');

          isToolRunning.current = true;
          pendingMode.current = null;
          setState('PROCESSING');

          const baseUrl = (import.meta.env.BASE_URL as string || '').replace(/\/$/, '');
          const response = await fetch(`${baseUrl}/api/research`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });

          if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

          const data = await response.json();
          const results = Array.isArray(data?.results) ? data.results : [];
          const spokenScript = data?.spoken_script || '';
          const tendenciesArr = Array.isArray(data?.tendencies) ? data.tendencies : [];
          const biasesArr = Array.isArray(data?.biases) ? data.biases : [];

          addLog(`Research complete: ${results.length} sources, script ready.`, 'success');

          await new Promise(resolve => setTimeout(resolve, SUSPENSE_DELAY_MS));

          setResearchData({
            results,
            tendencies: tendenciesArr,
            biases: biasesArr,
            spokenScript,
          });

          isToolRunning.current = false;

          const micHealth = checkMicStreamHealth(micStream.current);
          console.log('[useElevenLabs] Post-tool mic health:', micHealth);

          if (!micHealth.alive) {
            addLog(`Mic stream stale (${micHealth.details}). Restarting session...`, 'warning');
            needsSessionRestart.current = true;

            try {
              await conversation.endSession();
            } catch (e) {
              console.warn('[useElevenLabs] endSession for restart failed:', e);
              needsSessionRestart.current = false;
              setState('SPEAKING');
            }

            return "Firecrawl finished the research. What specific area would you like to explore with ElevenLabs?";
          }

          const sdkInputVol = conversation.getInputVolume();
          console.log('[useElevenLabs] Post-tool SDK input volume:', sdkInputVol);

          const lastMode = pendingMode.current;
          pendingMode.current = null;
          if (lastMode === 'listening') {
            setState('LISTENING');
          } else {
            setState('SPEAKING');
          }

          addLog(`Mic verified: tracks healthy (vol=${sdkInputVol.toFixed(2)}).`, 'success');

          await new Promise(resolve => setTimeout(resolve, MIC_HEALTH_CHECK_DELAY_MS));
          const delayedVol = conversation.getInputVolume();
          if (delayedVol <= 0 && micHealth.alive) {
            addLog('SDK input silent after tool. Forcing session restart for fresh mic...', 'warning');
            needsSessionRestart.current = true;
            try {
              await conversation.endSession();
            } catch (e) {
              console.warn('[useElevenLabs] delayed restart failed:', e);
              needsSessionRestart.current = false;
            }
          }

          return "Firecrawl finished the research. What specific area would you like to explore with ElevenLabs?";

        } catch (error: any) {
          isToolRunning.current = false;
          pendingMode.current = null;
          setState('SPEAKING');
          const msg = error instanceof Error ? error.message : String(error);
          addLog(`Research failed: ${msg}`, 'error');
          return `I was unable to complete the research. ${msg}`;
        }
      },
    },
  });

  const startSession = useCallback(async () => {
    const signedUrl = await getSignedUrl();

    if (signedUrl) {
      addLog('Using WebSocket connection...', 'system');
      await conversation.startSession({ signedUrl });
    } else {
      addLog('Using WebRTC connection...', 'system');
      await conversation.startSession({ agentId: AGENT_ID, connectionType: 'webrtc' as const });
    }
  }, [conversation, addLog]);

  const attemptReconnect = useCallback(async () => {
    try {
      if (micStream.current) {
        micStream.current.getTracks().forEach(t => t.stop());
        micStream.current = null;
      }
      const freshStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStream.current = freshStream;
      const health = checkMicStreamHealth(freshStream);
      console.log('[useElevenLabs] Fresh mic acquired for reconnect:', health);
      addLog('Fresh mic acquired. Reconnecting...', 'system');

      await startSession();
    } catch (error: any) {
      isRetrying.current = false;
      needsSessionRestart.current = false;
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Reconnection failed: ${msg}. Tap the orb to try again.`, 'error');
      setState('IDLE');
    }
  }, [startSession, addLog, setState]);

  const start = useCallback(async () => {
    try {
      if (!AGENT_ID) {
        addLog('VITE_ELEVENLABS_AGENT_ID not configured.', 'error');
        return;
      }

      retryCount.current = 0;
      isRetrying.current = false;
      addLog('Connecting to ElevenAgents...', 'system');

      try {
        if (micStream.current) {
          micStream.current.getTracks().forEach(t => t.stop());
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStream.current = stream;
        const health = checkMicStreamHealth(stream);
        console.log('[useElevenLabs] Initial mic acquired:', health);
      } catch (micError: any) {
        addLog(`Microphone permission denied: ${micError.message}`, 'error');
        setState('IDLE');
        return;
      }

      await startSession();
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Failed to start session: ${msg}`, 'error');
      setState('IDLE');
    }
  }, [startSession, addLog, setState]);

  const stop = useCallback(async () => {
    try {
      retryCount.current = MAX_RETRIES;
      addLog('Ending session...', 'system');
      if (micStream.current) {
        micStream.current.getTracks().forEach(t => t.stop());
        micStream.current = null;
      }
      await conversation.endSession();
      setState('IDLE');
    } catch (e) {
      console.warn('[useElevenLabs] stop error:', e);
    }
  }, [conversation, addLog, setState]);

  return {
    start,
    stop,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
  };
}
