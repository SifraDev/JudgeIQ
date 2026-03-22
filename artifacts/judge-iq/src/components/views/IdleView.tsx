import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CSSOrb } from '@/components/CSSOrb';
import { useVoiceState } from '@/context/VoiceStateContext';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

interface IdleViewProps {
  onStart: () => void;
}

export function IdleView({ onStart }: IdleViewProps) {
  const { state } = useVoiceState();
  const isListening = state === 'LISTENING';

  return (
    <motion.div
      key="idle-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen flex flex-col items-center justify-center relative"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-16"
      >
        <h1 className="font-display text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          JudgeIQ
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto leading-relaxed">
          Voice-powered judicial intelligence.
          <br />
          <span className="text-primary/70">Speak a judge's name to begin.</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative cursor-pointer"
        onClick={onStart}
      >
        <CSSOrb state={state} size="md" />
      </motion.div>

      <div className="h-8 mt-4 flex items-center justify-center">
        <AnimatePresence>
          {isListening && (
            <motion.span
              key="listening-label"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              exit={{ opacity: 0, y: -4 }}
              transition={{
                opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 0.3 },
              }}
              className="text-xs text-blue-300/60 uppercase tracking-[0.2em] font-display"
            >
              Listening...
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {!AGENT_ID && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 text-[10px] text-muted-foreground uppercase tracking-wider"
        >
          Dev Mode — Use toggles to simulate states
        </motion.span>
      )}
    </motion.div>
  );
}
