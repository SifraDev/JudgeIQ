import React, { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useVoiceState } from '@/context/VoiceStateContext';
import { useElevenLabsSession } from '@/components/ElevenLabsSession';
import { IdleView } from '@/components/views/IdleView';
import { ProcessingView } from '@/components/views/ProcessingView';
import { ResultsView } from '@/components/views/ResultsView';
import { DevStateToggle } from '@/components/DevStateToggle';
import { DevConsole } from '@/components/DevConsole';

// ELIMINAMOS la vista "connected" que inventó Replit.
// Si no hay resultados y no está procesando, siempre mostrará "idle" (nuestro orbe bonito).
function getView(state: string, hasResults: boolean) {
if (state === 'PROCESSING') return 'processing';
if (hasResults) return 'results';
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

// Solo consideramos que es un "reconnect" si el estado vuelve a IDLE después de haber conectado.
// Mientras esté LISTENING o SPEAKING, no es un reconnect.
const isReconnect = hasConnectedBefore.current && state === 'IDLE';

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