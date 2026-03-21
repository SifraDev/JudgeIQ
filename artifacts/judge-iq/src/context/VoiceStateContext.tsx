import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { FirecrawlResult } from '@workspace/api-client-react';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
}

export interface TranscriptEntry {
  role: 'user' | 'agent';
  message: string;
  timestamp: Date;
}

interface VoiceStateContextType {
  state: VoiceState;
  logs: LogEntry[];
  searchResults: FirecrawlResult[];
  transcript: TranscriptEntry[];
  hasResults: boolean;
  setState: (state: VoiceState) => void;
  addLog: (message: string, type?: LogEntry['type']) => void;
  setSearchResults: (results: FirecrawlResult[]) => void;
  addTranscript: (role: TranscriptEntry['role'], message: string) => void;
  reset: () => void;
}

const VoiceStateContext = createContext<VoiceStateContextType | undefined>(undefined);

export function VoiceStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VoiceState>('IDLE');
  const [searchResults, setSearchResultsRaw] = useState<FirecrawlResult[]>([]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [hasResults, setHasResults] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date(),
      message: 'System initialized. Ready for query.',
      type: 'system'
    }
  ]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      message,
      type
    }]);
  }, []);

  const addTranscript = useCallback((role: TranscriptEntry['role'], message: string) => {
    setTranscript(prev => [...prev, { role, message, timestamp: new Date() }]);
  }, []);

  const setSearchResults = useCallback((results: FirecrawlResult[]) => {
    setSearchResultsRaw(results);
    if (results.length > 0) {
      setHasResults(true);
    }
  }, []);

  const reset = useCallback(() => {
    setState('IDLE');
    setSearchResultsRaw([]);
    setTranscript([]);
    setHasResults(false);
    setLogs([{
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      message: 'State reset. System ready.',
      type: 'system'
    }]);
  }, []);

  const setVoiceState = useCallback((newState: VoiceState) => {
    setState(newState);
    switch (newState) {
      case 'LISTENING':
        addLog('Listening to voice input...', 'info');
        break;
      case 'PROCESSING':
        addLog('Triggering Firecrawl Search Tool...', 'warning');
        break;
      case 'SPEAKING':
        addLog('Extracted documents successfully. Synthesizing...', 'success');
        break;
      case 'IDLE':
        addLog('Agent idle.', 'info');
        break;
    }
  }, [addLog]);

  return (
    <VoiceStateContext.Provider value={{
      state,
      logs,
      searchResults,
      transcript,
      hasResults,
      setState: setVoiceState,
      addLog,
      setSearchResults,
      addTranscript,
      reset,
    }}>
      {children}
    </VoiceStateContext.Provider>
  );
}

export function useVoiceState() {
  const context = useContext(VoiceStateContext);
  if (context === undefined) {
    throw new Error('useVoiceState must be used within a VoiceStateProvider');
  }
  return context;
}
