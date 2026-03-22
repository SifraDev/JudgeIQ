import { useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useVoiceState } from '@/context/VoiceStateContext';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string || '';
const MAX_RETRIES = 1;

interface SearchParameters {
  query?: string;
  judge_name?: string;
}

export function useElevenLabs() {
  const { setState, addLog, setSearchResults, addTranscript } = useVoiceState();
  const isToolRunning = useRef(false);
  const retryCount = useRef(0);
  const isRetrying = useRef(false);
  const sessionActive = useRef(false);

  const conversation = useConversation({
    onConnect: () => {
      try {
        retryCount.current = 0;
        isRetrying.current = false;
        sessionActive.current = true;
        addLog('Connected to ElevenAgents.', 'success');
        setState('LISTENING');
      } catch (e) {
        console.warn('[useElevenLabs] onConnect error:', e);
      }
    },
    onDisconnect: () => {
      try {
        sessionActive.current = false;
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

        addLog('Disconnected from ElevenAgents.', 'system');
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
      } catch (e) {
        console.warn('[useElevenLabs] onModeChange error:', e);
      }
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

  const attemptReconnect = useCallback(async () => {
    try {
      await conversation.startSession({ agentId: AGENT_ID, connectionType: 'webrtc' as const });
    } catch (error: any) {
      isRetrying.current = false;
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Reconnection failed: ${msg}`, 'error');
      setState('IDLE');
    }
  }, [conversation, addLog, setState]);

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

      await conversation.startSession({ agentId: AGENT_ID, connectionType: 'webrtc' as const });
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Failed to start session: ${msg}`, 'error');
      setState('IDLE');
    }
  }, [conversation, addLog, setState]);

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
