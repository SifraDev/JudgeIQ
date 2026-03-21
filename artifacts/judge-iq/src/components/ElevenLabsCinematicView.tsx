import React, { useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useVoiceState } from '@/context/VoiceStateContext';
import { useElevenLabsSession } from '@/components/ElevenLabsSession';
import { IdleView } from '@/components/views/IdleView';
import { ProcessingView } from '@/components/views/ProcessingView';
import { ResultsView } from '@/components/views/ResultsView';
import { DevStateToggle } from '@/components/DevStateToggle';
import { DevConsole } from '@/components/DevConsole';

export function ElevenLabsCinematicView() {
  const { state } = useVoiceState();
  const { start } = useElevenLabsSession();

  const handleStart = useCallback(() => {
    start();
  }, [start]);

  const currentView = (() => {
    switch (state) {
      case 'IDLE':
      case 'LISTENING':
        return 'idle';
      case 'PROCESSING':
        return 'processing';
      case 'SPEAKING':
        return 'results';
      default:
        return 'idle';
    }
  })();

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
