import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import type { VoiceState } from '@/context/VoiceStateContext';

interface CSSorbProps {
  state: VoiceState;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { px: 56, flame: 'w-5 h-5' },
  md: { px: 120, flame: 'w-10 h-10' },
  lg: { px: 200, flame: 'w-16 h-16' },
};

export function CSSOrb({ state, size = 'md' }: CSSorbProps) {
  const s = sizes[size];
  const isProcessing = state === 'PROCESSING';
  const isListening = state === 'LISTENING';
  const isSpeaking = state === 'SPEAKING';
  const isIdle = state === 'IDLE';

  const containerStyle = { width: s.px, height: s.px };

  const glowColor = isProcessing
    ? 'rgba(255,100,20,0.4)'
    : 'rgba(60,100,220,0.35)';
  const glowPulse = isSpeaking
    ? { scale: [1, 1.4, 1], opacity: [0.5, 0.9, 0.5] }
    : isListening
      ? { scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }
      : isProcessing
        ? { scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }
        : { scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] };
  const glowDuration = isSpeaking ? 1.0 : isListening ? 1.5 : 2.5;

  const sphereBg = isProcessing
    ? 'bg-gradient-to-br from-orange-950 via-black to-red-950'
    : isSpeaking
      ? 'bg-gradient-to-br from-blue-800 via-indigo-950 to-blue-900'
      : isListening
        ? 'bg-gradient-to-br from-blue-900 via-slate-950 to-indigo-950'
        : 'bg-gradient-to-br from-slate-900 via-slate-950 to-gray-900';
  const sphereBorder = isProcessing
    ? 'border-orange-500/30'
    : isSpeaking
      ? 'border-blue-400/40'
      : isListening
        ? 'border-blue-500/30'
        : 'border-slate-700/20';
  const sphereShadow = isProcessing
    ? 'shadow-[0_0_60px_rgba(255,100,20,0.3),inset_0_0_40px_rgba(255,60,0,0.2)]'
    : isSpeaking
      ? 'shadow-[0_0_60px_rgba(60,100,255,0.4),inset_0_0_40px_rgba(80,120,255,0.25)]'
      : isListening
        ? 'shadow-[0_0_40px_rgba(60,100,220,0.25),inset_0_0_30px_rgba(60,100,200,0.15)]'
        : 'shadow-[0_0_20px_rgba(40,60,120,0.1),inset_0_0_20px_rgba(30,50,100,0.08)]';

  const conicGradient = isProcessing
    ? 'conic-gradient(from 0deg, transparent, rgba(255,100,20,0.3), transparent, rgba(255,60,0,0.2), transparent)'
    : isSpeaking
      ? 'conic-gradient(from 0deg, transparent, rgba(80,140,255,0.4), transparent, rgba(100,120,255,0.3), transparent)'
      : isListening
        ? 'conic-gradient(from 0deg, transparent, rgba(60,120,220,0.3), transparent, rgba(80,100,200,0.2), transparent)'
        : 'conic-gradient(from 0deg, transparent, rgba(50,80,150,0.12), transparent, rgba(40,60,120,0.08), transparent)';
  const rotationDuration = isSpeaking ? 2 : isListening ? 3 : isProcessing ? 3 : 8;

  const ringColor = isProcessing
    ? { a: 'rgba(255,120,40,0.3)', b: 'rgba(255,100,20,0.2)' }
    : isSpeaking
      ? { a: 'rgba(100,160,255,0.4)', b: 'rgba(80,140,255,0.25)' }
      : isListening
        ? { a: 'rgba(80,140,220,0.3)', b: 'rgba(60,120,200,0.2)' }
        : { a: 'rgba(60,100,180,0.08)', b: 'rgba(50,80,150,0.05)' };
  const ringDuration = isSpeaking ? 1.2 : isListening ? 1.8 : isProcessing ? 2 : 4;

  const iconEl = isProcessing ? (
    <motion.div
      animate={{
        scale: [1, 1.15, 1],
        filter: [
          'drop-shadow(0 0 12px rgba(255,100,20,0.8))',
          'drop-shadow(0 0 25px rgba(255,60,0,1))',
          'drop-shadow(0 0 12px rgba(255,100,20,0.8))',
        ],
      }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      className="relative z-10"
    >
      <Flame className={`${s.flame} text-orange-400`} strokeWidth={1.5} />
    </motion.div>
  ) : null;

  return (
    <div className="relative flex items-center justify-center" style={containerStyle}>
      <motion.div
        key={isProcessing ? 'firecrawl' : 'voice-orb'}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: '-20%',
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
          }}
          animate={glowPulse}
          transition={{ duration: glowDuration, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div
          className={`absolute inset-0 rounded-full border ${sphereBg} ${sphereBorder} ${sphereShadow}`}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: conicGradient }}
            animate={{ rotate: 360 }}
            transition={{ duration: rotationDuration, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {iconEl}

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `1.5px solid ${ringColor.a}` }}
          animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
          transition={{ duration: ringDuration, repeat: Infinity, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: `1px solid ${ringColor.b}` }}
          animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
          transition={{ duration: ringDuration, repeat: Infinity, ease: 'easeOut', delay: ringDuration * 0.3 }}
        />
      </motion.div>
    </div>
  );
}
