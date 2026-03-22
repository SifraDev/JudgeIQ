import React from 'react';
import { motion } from 'framer-motion';
import { CSSOrb } from '@/components/CSSOrb';
import { useVoiceState } from '@/context/VoiceStateContext';

export function ConnectedView() {
  const { state } = useVoiceState();

  const statusLabel = state === 'SPEAKING' ? 'Speaking...' : 'Listening...';

  return (
    <motion.div
      key="connected-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen flex flex-col items-center justify-center relative"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center justify-center"
      >
        <CSSOrb state={state} size="lg" />

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center mt-12 text-sm font-display tracking-widest uppercase text-cyan-400 font-bold"
        >
          {statusLabel}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
