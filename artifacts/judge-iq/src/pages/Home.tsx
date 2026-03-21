import React, { Suspense, lazy, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useVoiceState } from '@/context/VoiceStateContext';
import { IdleView } from '@/components/views/IdleView';
import { ProcessingView } from '@/components/views/ProcessingView';
import { ResultsView } from '@/components/views/ResultsView';
import { DevStateToggle } from '@/components/DevStateToggle';
import { DevConsole } from '@/components/DevConsole';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

const ElevenLabsSessionProvider = AGENT_ID
  ? lazy(() => import('@/components/ElevenLabsSession').then(m => ({ default: m.ElevenLabsSessionProvider })))
  : null;

const ElevenLabsCinematicView = AGENT_ID
  ? lazy(() => import('@/components/ElevenLabsCinematicView').then(m => ({ default: m.ElevenLabsCinematicView })))
  : null;

function getView(state: string, hasResults: boolean) {
  if (state === 'PROCESSING') return 'processing';
  if (state === 'SPEAKING') return 'results';
  if (hasResults) return 'results';
  return 'idle';
}

function DevCinematicView() {
  const { state, setState, hasResults } = useVoiceState();

  const handleStart = useCallback(() => {
    setState('LISTENING');
  }, [setState]);

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
          {currentView === 'idle' && <IdleView key="idle" onStart={handleStart} />}
          {currentView === 'processing' && <ProcessingView key="processing" />}
          {currentView === 'results' && <ResultsView key="results" />}
        </AnimatePresence>
      </div>

      <DevStateToggle />
      <DevConsole />
    </div>
  );
}

export default function Home() {
  if (ElevenLabsSessionProvider && ElevenLabsCinematicView) {
    return (
      <Suspense fallback={<DevCinematicView />}>
        <ElevenLabsSessionProvider>
          <ElevenLabsCinematicView />
        </ElevenLabsSessionProvider>
      </Suspense>
    );
  }
  return <DevCinematicView />;
}
