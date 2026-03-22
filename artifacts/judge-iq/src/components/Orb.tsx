import React from 'react';
import { useVoiceState } from '@/context/VoiceStateContext';
import { CSSOrb } from '@/components/CSSOrb';
import { Button } from '@/components/ui/button';
import { Mic, MicOff } from 'lucide-react';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

interface OrbProps {
  onToggle?: () => void;
}

export function Orb({ onToggle }: OrbProps) {
  const { state, setState } = useVoiceState();

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    if (state === 'IDLE') setState('LISTENING');
    else setState('IDLE');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12">
      <CSSOrb state={state} size="lg" />

      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-display text-white tracking-wider">
          {state === 'IDLE' && 'Ready.'}
          {state === 'LISTENING' && 'Listening...'}
          {state === 'PROCESSING' && 'Searching records...'}
          {state === 'SPEAKING' && 'Synthesizing profile...'}
        </h2>

        <Button
          variant={state === 'IDLE' ? 'glass' : 'destructive'}
          size="lg"
          className="rounded-full w-16 h-16 p-0 flex items-center justify-center group"
          onClick={handleToggle}
        >
          {state === 'IDLE' ? (
            <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          ) : (
            <MicOff className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          )}
        </Button>

        {!AGENT_ID && (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Dev Mode — Use toggles to simulate</span>
        )}
        {AGENT_ID && (
          <span className="text-[10px] text-primary/60 uppercase tracking-wider">Production Mode</span>
        )}
      </div>
    </div>
  );
}
