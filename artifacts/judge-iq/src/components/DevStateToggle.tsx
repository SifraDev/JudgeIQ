import React from 'react';
import { useVoiceState, VoiceState } from '@/context/VoiceStateContext';
import { Button } from '@/components/ui/button';
import { Settings2, Mic, Cpu, Volume2, RotateCcw } from 'lucide-react';

export function DevStateToggle() {
  const { state, setState, reset } = useVoiceState();

  const handleState = (newState: VoiceState) => () => setState(newState);

  return (
    <div className="fixed top-24 right-6 z-50 glass-panel p-4 rounded-xl border border-white/10 shadow-2xl flex flex-col gap-3 w-64 backdrop-blur-2xl bg-black/60">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
        <Settings2 className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold uppercase tracking-wider text-white">Dev Toggles (Phase 2)</span>
      </div>
      
      <p className="text-[10px] text-muted-foreground leading-tight">
        Force UI states to build visuals without ElevenLabs API costs.
      </p>

      <div className="grid grid-cols-1 gap-2 mt-2">
        <Button 
          variant={state === 'LISTENING' ? 'default' : 'outline'} 
          size="sm" 
          onClick={handleState('LISTENING')}
          className="justify-start text-xs h-8"
        >
          <Mic className="w-3 h-3 mr-2" /> Simulate Listening
        </Button>
        <Button 
          variant={state === 'PROCESSING' ? 'default' : 'outline'} 
          size="sm" 
          onClick={handleState('PROCESSING')}
          className="justify-start text-xs h-8"
        >
          <Cpu className="w-3 h-3 mr-2" /> Simulate Tool Process
        </Button>
        <Button 
          variant={state === 'SPEAKING' ? 'default' : 'outline'} 
          size="sm" 
          onClick={handleState('SPEAKING')}
          className="justify-start text-xs h-8"
        >
          <Volume2 className="w-3 h-3 mr-2" /> Simulate Speaking
        </Button>
        <div className="h-px bg-white/10 my-1" />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={reset}
          className="justify-start text-xs h-8 text-muted-foreground hover:text-white"
        >
          <RotateCcw className="w-3 h-3 mr-2" /> Reset State
        </Button>
      </div>
    </div>
  );
}
