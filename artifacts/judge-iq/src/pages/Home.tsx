import React, { useCallback, useState, Component, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  { children: ReactNode; onError: (msg: string) => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('[ElevenLabs] Render error:', error);
    this.props.onError(error.message);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
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

function ProductionInner() {
  const { start, connectionError } = useElevenLabsSession();

  const handleStart = useCallback(() => {
    start();
  }, [start]);

  return <CinematicShell onStart={handleStart} connectionError={connectionError} />;
}

function DevCinematicView({ renderError }: { renderError?: string | null }) {
  const { setState } = useVoiceState();

  const handleStart = useCallback(() => {
    setState('LISTENING');
  }, [setState]);

  return <CinematicShell onStart={handleStart} connectionError={renderError} />;
}

export default function Home() {
  const [renderError, setRenderError] = useState<string | null>(null);

  if (AGENT_ID) {
    return (
      <>
        <ElevenLabsErrorBoundary onError={(msg) => setRenderError(msg)}>
          <ElevenLabsSessionProvider>
            <ProductionInner />
          </ElevenLabsSessionProvider>
        </ElevenLabsErrorBoundary>
        {renderError && (
          <DevCinematicView renderError={`Voice unavailable: ${renderError}. Using demo mode.`} />
        )}
      </>
    );
  }
  return <DevCinematicView />;
}
