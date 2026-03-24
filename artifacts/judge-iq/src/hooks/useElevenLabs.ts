import { useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useVoiceState } from '@/context/VoiceStateContext';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string || '';
const MAX_RETRIES = 1;

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

export function useElevenLabs() {
  const { setState, addLog, setResearchData, addTranscript } = useVoiceState();
  const isToolRunning = useRef(false);
  const retryCount = useRef(0);
  const isRetrying = useRef(false);

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
        isToolRunning.current = false;

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
        // EL CANDADO MAESTRO: Bloquea interrupciones visuales mientras procesa
        if (isToolRunning.current) return;

        const mode = prop?.mode || prop;
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

          // FORZAMOS LA PANTALLA DE FUEGO
          isToolRunning.current = true;
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

            // --- EL RELOJ DE SUSPENSO (6 SEGUNDOS) ---
            // Mantiene la pantalla de fuego ardiendo para "vender" la investigación profunda
            await new Promise(resolve => setTimeout(resolve, 6000));

            // Actualización atómica de la UI
            setResearchData({
              results,
              tendencies: tendenciesArr,
              biases: biasesArr,
              // Reutilizamos el campo spokenScript de la UI para guardar el texto largo de OpenAI
            });

            isToolRunning.current = false;
            setState('SPEAKING');

            // --- LA VOZ CORTA Y PRECISA ---
            // Le mandamos a ElevenLabs exactamente la frase que pediste:
            return "Firecrawl finished the research. What specific area would you like to explore with ElevenLabs?";

          } catch (error: any) {
            isToolRunning.current = false;
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
      await startSession();
    } catch (error: any) {
      isRetrying.current = false;
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
        await navigator.mediaDevices.getUserMedia({ audio: true });
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