import { useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useVoiceState } from '@/context/VoiceStateContext';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string || '';

interface SearchParameters {
  query?: string;
  judge_name?: string;
}

export function useElevenLabs() {
  const { setState, addLog, setSearchResults, addTranscript } = useVoiceState();
  const isToolRunning = useRef(false);

  const conversation = useConversation({
    onConnect: () => {
      try {
        addLog('Connected to ElevenAgents.', 'success');
        setState('LISTENING');
      } catch (e) {}
    },
    onDisconnect: () => {
      try {
        addLog('Disconnected from ElevenAgents.', 'system');
        setState('IDLE');
        isToolRunning.current = false;
      } catch (e) {}
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
        console.error("Error processing message:", error);
      }
    },
    onError: (error: any) => {
      try {
        const msg = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);
        addLog(`ElevenAgents error: ${msg}`, 'error');
        setState('IDLE');
      } catch (e) {}
    },
    onModeChange: (prop: any) => {
      try {
        const mode = prop?.mode || prop;
        if (mode === 'speaking') {
          if (isToolRunning.current) {
            addLog('Extracted documents successfully. Synthesizing...', 'success');
            isToolRunning.current = false;
          }
          setState('SPEAKING');
        } else if (mode === 'listening') {
          setState('LISTENING');
          addLog('Listening to voice input...', 'info');
        }
      } catch (e) {}
    },
    clientTools: {
      firecrawl_search: async (parameters: SearchParameters): Promise<string> => {
        try {
          const query = parameters?.query || parameters?.judge_name || '';
          addLog(`Triggering Firecrawl Search Tool for "${query}"...`, 'warning');
          setState('PROCESSING');
          isToolRunning.current = true;

          const baseUrl = (import.meta.env.BASE_URL as string || '').replace(/\/$/, '');
          const response = await fetch(`${baseUrl}/api/firecrawl/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });

          if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

          const data = await response.json();
          const results = Array.isArray(data?.results) ? data.results : [];
          addLog(`Firecrawl returned ${results.length} documents.`, 'success');
          setSearchResults(results);

          return JSON.stringify(data);
        } catch (error: any) {
          const msg = error instanceof Error ? error.message : String(error);
          addLog(`Firecrawl search failed: ${msg}`, 'error');
          return JSON.stringify({ error: msg, success: false, results: [] });
        }
      },
    },
  });

  const start = useCallback(async () => {
    try {
      if (!AGENT_ID) {
        addLog('VITE_ELEVENLABS_AGENT_ID not configured.', 'error');
        return;
      }
      addLog('Connecting to ElevenAgents...', 'system');

      // La Mac pide permiso de audio en el mismo hilo del clic.
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micError: any) {
        addLog(`Microphone permission denied: ${micError.message}`, 'error');
        setState('IDLE');
        return;
      }

      // IMPORTANTE: Quitamos "connectionType: webrtc" para que el SDK salte el bloqueo del proxy de Replit.
      await conversation.startSession({ agentId: AGENT_ID, connectionType: 'webrtc' as const }); 
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Failed to start session: ${msg}`, 'error');
      setState('IDLE');
    }
  }, [conversation, addLog, setState]);

  const stop = useCallback(async () => {
    try {
      addLog('Ending session...', 'system');
      await conversation.endSession();
      setState('IDLE');
    } catch (e) {}
  }, [conversation, addLog, setState]);

  return {
    start,
    stop,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
  };
}