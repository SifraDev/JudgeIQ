import React, { useCallback, useState, useEffect, useRef, Component, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useVoiceState } from '@/context/VoiceStateContext';
import { IdleView } from '@/components/views/IdleView';
import { ProcessingView } from '@/components/views/ProcessingView';
import { ResultsView } from '@/components/views/ResultsView';
import { DevStateToggle } from '@/components/DevStateToggle';
import { DevConsole } from '@/components/DevConsole';
import { ElevenLabsSessionProvider, useElevenLabsSession } from '@/components/ElevenLabsSession';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

function getView(state: string, hasResults: boolean) {
  if (state === 'PROCESSING') return 'processing';
  if (state === 'SPEAKING') return 'results';
  if (hasResults) return 'results';
  return 'idle';
}

class VoiceErrorBoundary extends Component<
  { children: ReactNode; onError: (msg: string) => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ElevenLabs] Voice engine error:', error);
    this.props.onError(error.message);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function CinematicShell({ onStart, connectionError }: { onStart: () => void; connectionError?: string | null }) {
  const { state, hasResults } = useVoiceState();
  const currentView = getView(state, hasResults);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url(${import.meta.env.BASE_URL}images/legal-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentView === 'idle' && <IdleView key="idle" onStart={onStart} connectionError={connectionError} />}
          {currentView === 'processing' && <ProcessingView key="processing" />}
          {currentView === 'results' && <ResultsView key="results" />}
        </AnimatePresence>
      </div>

      <DevStateToggle />
      <DevConsole />
    </div>
  );
}

function ConnectedInner() {
  const { start, connectionError } = useElevenLabsSession();
  const hasAutoStarted = useRef(false);

  useEffect(() => {
    if (!hasAutoStarted.current) {
      hasAutoStarted.current = true;
      start();
    }
  }, [start]);

  const handleStart = useCallback(() => {
    start();
  }, [start]);

  return <CinematicShell onStart={handleStart} connectionError={connectionError} />;
}

function DevCinematicView({ connectionError }: { connectionError?: string | null }) {
  const { setState } = useVoiceState();

  const handleStart = useCallback(() => {
    setState('LISTENING');
  }, [setState]);

  return <CinematicShell onStart={handleStart} connectionError={connectionError} />;
}

export default function Home() {
  const [voiceMounted, setVoiceMounted] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);
  const { addLog } = useVoiceState();

  const handleFirstClick = useCallback(() => {
    if (!AGENT_ID) {
      return;
    }
    addLog('Initializing voice engine...', 'system');
    setVoiceMounted(true);
  }, [addLog]);

  if (!AGENT_ID) {
    return <DevCinematicView />;
  }

  if (mountError) {
    return <DevCinematicView connectionError={`Voice unavailable: ${mountError}. Using demo mode.`} />;
  }

  if (!voiceMounted) {
    return <CinematicShell onStart={handleFirstClick} />;
  }

  return (
    <VoiceErrorBoundary onError={(msg) => setMountError(msg)}>
      <ElevenLabsSessionProvider>
        <ConnectedInner />
      </ElevenLabsSessionProvider>
    </VoiceErrorBoundary>
  );
}
