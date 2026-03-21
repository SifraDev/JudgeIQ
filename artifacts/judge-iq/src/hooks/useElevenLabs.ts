import { useCallback, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { useVoiceState } from '@/context/VoiceStateContext';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

export function useElevenLabs() {
  const { setState, addLog } = useVoiceState();
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
    onMessage: (message: any) => {
      if (message.type === 'agent_response') {
        addLog(`Agent: ${(message as any).message?.slice(0, 120) || '...'}`, 'info');
      }
    },
    onError: (error: any) => {
      addLog(`ElevenAgents error: ${error?.message || String(error)}`, 'error');
      setState('IDLE');
    },
    onModeChange: (mode: any) => {
      if (mode.mode === 'speaking') {
        if (isToolRunning.current) {
          addLog('Extracted documents successfully. Synthesizing...', 'success');
          isToolRunning.current = false;
        }
        setState('SPEAKING');
      } else if (mode.mode === 'listening') {
        setState('LISTENING');
        addLog('Listening to voice input...', 'info');
      }
    },
    clientTools: {
      firecrawl_search: async (parameters: any) => {
        const query = parameters.query || parameters.judge_name || '';
        addLog(`Triggering Firecrawl Search Tool for "${query}"...`, 'warning');
        setState('PROCESSING');
        isToolRunning.current = true;

        try {
          const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
          const response = await fetch(`${baseUrl}/api/firecrawl/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });
          const data = await response.json();
          addLog(`Firecrawl returned ${data.results?.length || 0} documents.`, 'success');

          return JSON.stringify(data);
        } catch (error: any) {
          addLog(`Firecrawl search failed: ${error.message}`, 'error');
          return JSON.stringify({ error: error.message, success: false, results: [] });
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
      await conversation.startSession({ agentId: AGENT_ID });
    } catch (error: any) {
      addLog(`Failed to start session: ${error.message}`, 'error');
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
