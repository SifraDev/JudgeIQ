import React, { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useVoiceState } from '@/context/VoiceStateContext';
import { useElevenLabsSession } from '@/components/ElevenLabsSession';
import { IdleView } from '@/components/views/IdleView';
import { ProcessingView } from '@/components/views/ProcessingView';
import { ResultsView } from '@/components/views/ResultsView';
import { DevStateToggle } from '@/components/DevStateToggle';
import { DevConsole } from '@/components/DevConsole';

function getView(state: string, hasResults: boolean) {
  if (state === 'PROCESSING') return 'processing';
  if (state === 'SPEAKING') return 'results';
  if (hasResults) return 'results';
  return 'idle';
}

export function ElevenLabsCinematicView() {
  const { state, hasResults } = useVoiceState();
  const { start } = useElevenLabsSession();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      start();
    }
  }, [start]);

  const handleReconnect = () => {
    hasStarted.current = true;
    start();
  };

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
          {currentView === 'idle' && <IdleView key="idle" onStart={handleReconnect} />}
          {currentView === 'processing' && <ProcessingView key="processing" />}
          {currentView === 'results' && <ResultsView key="results" />}
        </AnimatePresence>
      </div>

      <DevStateToggle />
      <DevConsole />
    </div>
  );
}
