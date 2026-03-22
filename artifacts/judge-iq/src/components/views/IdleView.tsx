import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CSSOrb } from '@/components/CSSOrb';

interface IdleViewProps {
  onStart: () => void;
}

export function IdleView({ onStart }: IdleViewProps) {
  const [localState, setLocalState] = useState<'IDLE' | 'LISTENING'>('IDLE');

  const handleClick = () => {
    // 1. Cambiar la vista local al instante para el efecto visual
    setLocalState('LISTENING');
    // 2. Disparar la función original para intentar conectar la voz
    onStart();
  };

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
        {/* TITULO Y LOGO PROFESIONAL */}
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight flex items-center justify-center gap-4">
          JudgeIQ
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto leading-relaxed">
          Voice-powered judicial intelligence.
          <br />
          <span className="text-cyan-400/80">Speak a judge's name to begin.</span>
        </p>
      </motion.div>

      {/* EL ORBE REACTIVO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative cursor-pointer flex flex-col items-center justify-center"
        onClick={handleClick}
      >
        {/* Pasamos el estado local para que reaccione al clic instantáneamente */}
        <CSSOrb state={localState} size="md" />

        {/* TEXTO INFERIOR DINÁMICO */}
        <motion.p
          animate={{ opacity: localState === 'LISTENING' ? [0.5, 1, 0.5] : 1 }}
          transition={{ duration: 1.5, repeat: localState === 'LISTENING' ? Infinity : 0 }}
          className={`text-center mt-12 text-sm font-display tracking-widest uppercase ${
            localState === 'LISTENING' ? 'text-cyan-400 font-bold' : 'text-muted-foreground'
          }`}
        >
          {localState === 'LISTENING' ? 'Listening...' : 'Tap to Start'}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}