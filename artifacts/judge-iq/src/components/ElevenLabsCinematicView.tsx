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
  // Si está buscando en Firecrawl, muestra el fuego
  if (state === 'PROCESSING') return 'processing';

  // SOLO ve a resultados si Firecrawl ya trajo la data real
  if (hasResults) return 'results';

  // Para cualquier otra cosa (saludar, escuchar tu voz, estar inactivo), quédate en el orbe inicial
  return 'idle';
}

export function ElevenLabsCinematicView() {
  const { state, hasResults } = useVoiceState();
  const { start } = useElevenLabsSession();
  const hasStarted = useRef(false);
  const hasConnectedBefore = useRef(false);

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      start();
    }
  }, [start]);

  useEffect(() => {
    if (state === 'LISTENING' || state === 'SPEAKING' || state === 'PROCESSING') {
      hasConnectedBefore.current = true;
    }
  }, [state]);

  const handleReconnect = () => {
    start();
  };

  const currentView = getView(state, hasResults);
  const isReconnect = hasConnectedBefore.current && currentView === 'idle';

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
          {currentView === 'idle' && (
            <IdleView key="idle" onStart={handleReconnect} isReconnect={isReconnect} />
          )}
          {currentView === 'processing' && <ProcessingView key="processing" />}
          {currentView === 'results' && <ResultsView key="results" />}
        </AnimatePresence>
      </div>

      <DevStateToggle />
      <DevConsole />
    </div>
  );
}
