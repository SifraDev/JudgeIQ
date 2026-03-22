import { useCallback, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react';
import type { Mode } from '@elevenlabs/react';
import { useVoiceState } from '@/context/VoiceStateContext';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID as string || '';

interface SearchParameters {
  query?: string;
  judge_name?: string;
}

export function useElevenLabs() {
  const { setState, addLog, setSearchResults, addTranscript } = useVoiceState();
  const isToolRunning = useRef(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      setConnectionError(null);
      addLog('Connected to ElevenLabs agent.', 'success');
      setState('LISTENING');
    },
    onDisconnect: () => {
      addLog('Disconnected from ElevenLabs agent.', 'system');
      setState('IDLE');
      isToolRunning.current = false;
    },
    onMessage: (props) => {
      if (props.role === 'agent') {
        addLog(`Agent: ${props.message.slice(0, 120)}`, 'info');
        addTranscript('agent', props.message);
      } else if (props.role === 'user') {
        addTranscript('user', props.message);
      }
    },
    onError: (message) => {
      const errorStr = typeof message === 'string' ? message : JSON.stringify(message);
      addLog(`ElevenLabs error: ${errorStr}`, 'error');
      setConnectionError(errorStr);
      setState('IDLE');
    },
    onModeChange: (prop: { mode: Mode }) => {
      if (prop.mode === 'speaking') {
        if (isToolRunning.current) {
          addLog('Firecrawl data received. Agent synthesizing profile...', 'success');
          isToolRunning.current = false;
        }
        setState('SPEAKING');
      } else if (prop.mode === 'listening') {
        setState('LISTENING');
        addLog('Listening...', 'info');
      }
    },
    clientTools: {
      firecrawl_search: async (parameters: SearchParameters): Promise<string> => {
        const query = parameters.query || parameters.judge_name || '';
        addLog(`Searching for "${query}" via Firecrawl...`, 'warning');
        setState('PROCESSING');
        isToolRunning.current = true;

        try {
          const baseUrl = (import.meta.env.BASE_URL as string).replace(/\/$/, '');
          const response = await fetch(`${baseUrl}/api/firecrawl/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });
          const data = await response.json();
          const results = Array.isArray(data.results) ? data.results : [];
          addLog(`Firecrawl returned ${results.length} documents.`, 'success');
          setSearchResults(results);

          return JSON.stringify(data);
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : String(error);
          addLog(`Firecrawl search failed: ${msg}`, 'error');
          return JSON.stringify({ error: msg, success: false, results: [] });
        }
      },
    },
  });

  const start = useCallback(async () => {
    if (!AGENT_ID) {
      addLog('No ElevenLabs Agent ID configured.', 'error');
      setConnectionError('VITE_ELEVENLABS_AGENT_ID is not set.');
      return;
    }

    setConnectionError(null);
    addLog('Requesting microphone access...', 'system');

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      addLog('Microphone granted. Connecting to ElevenLabs...', 'system');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Microphone access denied: ${msg}`, 'error');
      setConnectionError(`Microphone access denied. Please allow microphone access and try again.`);
      return;
    }

    try {
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: 'webrtc',
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Failed to connect: ${msg}`, 'error');
      setConnectionError(`Connection failed: ${msg}`);
    }
  }, [conversation, addLog]);

  const stop = useCallback(async () => {
    addLog('Ending session...', 'system');
    try {
      await conversation.endSession();
    } catch (e) {
      console.warn('[ElevenLabs] Session teardown error:', e);
    }
    setState('IDLE');
  }, [conversation, addLog, setState]);

  return {
    start,
    stop,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    connectionError,
  };
}
