import React from 'react';
import { motion } from 'framer-motion';
import { CSSOrb } from '@/components/CSSOrb';
import { useVoiceState } from '@/context/VoiceStateContext';

interface IdleViewProps {
  onStart: () => void;
  isReconnect?: boolean;
}

export function IdleView({ onStart, isReconnect = false }: IdleViewProps) {
  // Traemos el estado REAL de la IA
  const { state } = useVoiceState();

  const handleClick = () => {
    // Solo permitimos hacer clic para iniciar si está apagado
    if (state === 'IDLE') {
      onStart();
    }
  };

  // Decidimos qué texto mostrar basándonos en el estado real
  let label = 'Tap to Start';
  if (isReconnect && state === 'IDLE') {
    label = 'Connection Lost — Tap to Retry';
  } else if (state === 'LISTENING') {
    label = 'Listening...';
  } else if (state === 'SPEAKING') {
    label = 'Speaking...';
  } else if (state !== 'IDLE') {
    label = 'Connecting...'; 
  }

  // Decidimos los colores del texto
  let textColor = 'text-muted-foreground';
  if (state === 'LISTENING' || state === 'SPEAKING') {
    textColor = 'text-cyan-400 font-bold';
  } else if (isReconnect && state === 'IDLE') {
    textColor = 'text-orange-400/80';
  }

  const isAnimating = state !== 'IDLE';

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
        <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight flex items-center justify-center gap-4">
          JudgeIQ
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto leading-relaxed">
          Voice-powered judicial intelligence.
          <br />
          <span className="text-cyan-400/80">Speak a judge's name to begin.</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative cursor-pointer flex flex-col items-center justify-center"
        onClick={handleClick}
      >
        {/* Le pasamos el estado real al Orbe para que se mueva correctamente */}
        <CSSOrb state={state} size="md" />

        <motion.p
          animate={{ opacity: isAnimating ? [0.5, 1, 0.5] : 1 }}
          transition={{ duration: 1.5, repeat: isAnimating ? Infinity : 0 }}
          className={`text-center mt-12 text-sm font-display tracking-widest uppercase ${textColor}`}
        >
          {label}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}