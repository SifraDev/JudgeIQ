import React from 'react';
import { motion } from 'framer-motion';
import { CSSOrb } from '@/components/CSSOrb';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

interface IdleViewProps {
  onStart: () => void;
}

export function IdleView({ onStart }: IdleViewProps) {
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
        <CSSOrb state="IDLE" size="md" />
      </motion.div>

      {!AGENT_ID && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-[10px] text-muted-foreground uppercase tracking-wider"
        >
          Dev Mode — Use toggles to simulate states
        </motion.span>
      )}
    </motion.div>
  );
}
