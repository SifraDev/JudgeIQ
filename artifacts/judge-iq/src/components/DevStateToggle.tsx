import React, { useState } from 'react';
import { useVoiceState, VoiceState } from '@/context/VoiceStateContext';
import { Button } from '@/components/ui/button';
import { Settings2, Mic, Cpu, Volume2, RotateCcw, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DevStateToggle() {
  const { state, setState, reset, addLog, setSearchResults } = useVoiceState();
  const [isOpen, setIsOpen] = useState(false);

  const handleState = (newState: VoiceState) => () => {
    if (newState === 'SPEAKING' && state === 'PROCESSING') {
      setSearchResults([
        { url: 'https://justia.com/judge/example', title: 'Judge Profile — Justia', description: 'Federal judge appointed in 2010.', markdown: 'Full profile text from Justia...' },
        { url: 'https://ballotpedia.org/Judge_Example', title: 'Judge Example — Ballotpedia', description: 'Political and judicial background.', markdown: 'Ballotpedia article content...' },
        { url: 'https://courtlistener.com/judge/example', title: 'Opinions by Judge Example', description: 'Court opinions and rulings.', markdown: 'CourtListener rulings...' },
      ]);
      addLog('Firecrawl returned 3 documents.', 'success');
    }
    setState(newState);
  };

  return (
    <div className="fixed bottom-20 left-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-panel p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-black/70 w-52 mb-2"
          >
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <Settings2 className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">Dev Toggles</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <Button
                variant={state === 'LISTENING' ? 'default' : 'outline'}
                size="sm"
                onClick={handleState('LISTENING')}
                className="justify-start text-[11px] h-7"
              >
                <Mic className="w-3 h-3 mr-1.5" /> Listening
              </Button>
              <Button
                variant={state === 'PROCESSING' ? 'default' : 'outline'}
                size="sm"
                onClick={handleState('PROCESSING')}
                className="justify-start text-[11px] h-7"
              >
                <Cpu className="w-3 h-3 mr-1.5" /> Processing
              </Button>
              <Button
                variant={state === 'SPEAKING' ? 'default' : 'outline'}
                size="sm"
                onClick={handleState('SPEAKING')}
                className="justify-start text-[11px] h-7"
              >
                <Volume2 className="w-3 h-3 mr-1.5" /> Speaking
              </Button>
              <div className="h-px bg-white/10 my-0.5" />
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="justify-start text-[11px] h-7 text-muted-foreground hover:text-white"
              >
                <RotateCcw className="w-3 h-3 mr-1.5" /> Reset
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
