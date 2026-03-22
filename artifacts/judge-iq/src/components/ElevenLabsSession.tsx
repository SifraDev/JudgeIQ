import React, { createContext, useContext, ReactNode } from 'react';
import { useElevenLabs } from '@/hooks/useElevenLabs';

interface ElevenLabsSessionContextType {
  start: () => Promise<void>;
  stop: () => Promise<void>;
  status: string;
  isSpeaking: boolean;
  connectionError: string | null;
}

const ElevenLabsSessionContext = createContext<ElevenLabsSessionContextType | null>(null);

export function ElevenLabsSessionProvider({ children }: { children: ReactNode }) {
  const session = useElevenLabs();

  return (
    <ElevenLabsSessionContext.Provider value={session}>
      {children}
    </ElevenLabsSessionContext.Provider>
  );
}

export function useElevenLabsSession() {
  const context = useContext(ElevenLabsSessionContext);
  if (!context) {
    throw new Error('useElevenLabsSession must be used within ElevenLabsSessionProvider');
  }
  return context;
}
