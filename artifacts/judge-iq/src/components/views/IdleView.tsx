import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';

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
        className="relative"
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-3xl -m-8"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <button
          onClick={onStart}
          className="relative w-40 h-40 rounded-full bg-gradient-to-br from-slate-800 to-black border border-white/10 shadow-[inset_0_-10px_30px_rgba(0,0,0,0.8),0_0_60px_rgba(212,175,55,0.15)] flex items-center justify-center group hover:border-primary/30 transition-all duration-500 cursor-pointer"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/10"
            animate={{ scale: [1, 1.1, 1], opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <Mic className="w-10 h-10 text-primary/70 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
        </button>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-8 text-sm text-muted-foreground font-display tracking-wider"
        >
          Tap to Start
        </motion.p>
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
