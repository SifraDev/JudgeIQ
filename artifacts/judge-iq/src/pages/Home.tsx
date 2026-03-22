import React, { useCallback, Component, type ReactNode } from 'react';
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

class ElevenLabsErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  state = { hasError: false, errorMsg: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[ElevenLabs] Session error, falling back to dev mode:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function CinematicShell({ onStart }: { onStart: () => void }) {
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
          {currentView === 'idle' && <IdleView key="idle" onStart={onStart} />}
          {currentView === 'processing' && <ProcessingView key="processing" />}
          {currentView === 'results' && <ResultsView key="results" />}
        </AnimatePresence>
      </div>

      <DevStateToggle />
      <DevConsole />
    </div>
  );
}

function ProductionInner() {
  const { start } = useElevenLabsSession();

  const handleStart = useCallback(() => {
    start();
  }, [start]);

  return <CinematicShell onStart={handleStart} />;
}

function DevCinematicView() {
  const { setState } = useVoiceState();

  const handleStart = useCallback(() => {
    setState('LISTENING');
  }, [setState]);

  return <CinematicShell onStart={handleStart} />;
}

export default function Home() {
  if (AGENT_ID) {
    return (
      <ElevenLabsErrorBoundary fallback={<DevCinematicView />}>
        <ElevenLabsSessionProvider>
          <ProductionInner />
        </ElevenLabsSessionProvider>
      </ElevenLabsErrorBoundary>
    );
  }
  return <DevCinematicView />;
}
