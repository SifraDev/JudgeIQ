import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { format } from 'date-fns';

export type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING';

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
}

interface VoiceStateContextType {
  state: VoiceState;
  logs: LogEntry[];
  setState: (state: VoiceState) => void;
  addLog: (message: string, type?: LogEntry['type']) => void;
  reset: () => void;
}

const VoiceStateContext = createContext<VoiceStateContextType | undefined>(undefined);

export function VoiceStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VoiceState>('IDLE');
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

  const reset = useCallback(() => {
    setState('IDLE');
    setLogs([{
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      message: 'State reset. System ready.',
      type: 'system'
    }]);
  }, []);

  // Hook into state changes to auto-generate logs for dev testing
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
    <VoiceStateContext.Provider value={{ state, logs, setState: setVoiceState, addLog, reset }}>
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
