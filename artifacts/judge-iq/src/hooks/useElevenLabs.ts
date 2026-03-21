import { useCallback, useRef } from 'react';
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

  const conversation = useConversation({
    onConnect: () => {
      addLog('Connected to ElevenAgents.', 'success');
      setState('LISTENING');
    },
    onDisconnect: () => {
      addLog('Disconnected from ElevenAgents.', 'system');
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
      addLog(`ElevenAgents error: ${message}`, 'error');
      setState('IDLE');
    },
    onModeChange: (prop: { mode: Mode }) => {
      if (prop.mode === 'speaking') {
        if (isToolRunning.current) {
          addLog('Extracted documents successfully. Synthesizing...', 'success');
          isToolRunning.current = false;
        }
        setState('SPEAKING');
      } else if (prop.mode === 'listening') {
        setState('LISTENING');
        addLog('Listening to voice input...', 'info');
      }
    },
    clientTools: {
      firecrawl_search: async (parameters: SearchParameters): Promise<string> => {
        const query = parameters.query || parameters.judge_name || '';
        addLog(`Triggering Firecrawl Search Tool for "${query}"...`, 'warning');
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
      addLog('VITE_ELEVENLABS_AGENT_ID not configured. Set this env var to enable voice.', 'error');
      return;
    }
    addLog('Connecting to ElevenAgents...', 'system');
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId: AGENT_ID, connectionType: 'webrtc' as const });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`Failed to start session: ${msg}`, 'error');
    }
  }, [conversation, addLog]);

  const stop = useCallback(async () => {
    addLog('Ending session...', 'system');
    await conversation.endSession();
    setState('IDLE');
  }, [conversation, addLog, setState]);

  return {
    start,
    stop,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
  };
}
