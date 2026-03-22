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

const CONIC = `conic-gradient(
  from 180deg at 45% 52%,
  hsl(190, 90%, 80%) 0deg,
  hsl(200, 95%, 75%) 35deg,
  hsl(215, 90%, 78%) 70deg,
  hsl(240, 65%, 82%) 110deg,
  hsl(300, 60%, 80%) 140deg,
  hsl(325, 80%, 78%) 165deg,
  hsl(290, 50%, 82%) 195deg,
  hsl(250, 55%, 82%) 225deg,
  hsl(215, 85%, 75%) 260deg,
  hsl(195, 95%, 78%) 295deg,
  hsl(185, 90%, 85%) 330deg,
  hsl(190, 90%, 80%) 360deg
)`;

export function CSSOrb({ state, size = 'md' }: CSSorbProps) {
  const s = sizes[size];
  const isProcessing = state === 'PROCESSING';
  const isListening = state === 'LISTENING';
  const isSpeaking = state === 'SPEAKING';
  const isActive = isListening || isSpeaking;
  const isIdle = state === 'IDLE';

  const containerStyle = { width: s.px, height: s.px };
  const blurBase = Math.max(2, Math.round(s.px * 0.04));

  const saturation = isSpeaking ? 'saturate(1.3) brightness(1.1)' : isListening ? 'saturate(1.15) brightness(1.05)' : 'saturate(1)';
  const rotationDuration = isSpeaking ? 3 : isListening ? 6 : 12;
  const glowOpacityRange = isSpeaking
    ? [0.6, 0.9, 0.6]
    : isListening
      ? [0.4, 0.7, 0.4]
      : [0.25, 0.4, 0.25];
  const glowScaleRange = isSpeaking
    ? [1.15, 1.35, 1.15]
    : isListening
      ? [1.1, 1.25, 1.1]
      : [1.05, 1.12, 1.05];
  const breatheDuration = isSpeaking ? 1.2 : isListening ? 2 : 5;
  const breatheScale = isSpeaking
    ? [1, 1.06, 1]
    : isListening
      ? [1, 1.04, 1]
      : [1, 1.015, 1];

  return (
    <div className="relative flex items-center justify-center" style={containerStyle}>
      <AnimatePresence mode="wait">
        {isProcessing ? (
          <motion.div
            key="firecrawl"
            initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className="absolute rounded-full"
              style={{ inset: '-20%', background: 'radial-gradient(circle, rgba(255,100,20,0.4) 0%, transparent 70%)' }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-950 via-black to-red-950 border border-orange-500/30 shadow-[0_0_60px_rgba(255,100,20,0.3),inset_0_0_40px_rgba(255,60,0,0.2)]">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'conic-gradient(from 0deg, transparent, rgba(255,100,20,0.3), transparent, rgba(255,60,0,0.2), transparent)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                filter: ['drop-shadow(0 0 12px rgba(255,100,20,0.8))', 'drop-shadow(0 0 25px rgba(255,60,0,1))', 'drop-shadow(0 0 12px rgba(255,100,20,0.8))'],
              }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10"
            >
              <Flame className={`${s.flame} text-orange-400`} strokeWidth={1.5} />
            </motion.div>
            <motion.div
              className="absolute inset-0 rounded-full border border-orange-500/20"
              animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-orange-400/15"
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="voice-orb"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ filter: saturation }}
          >
            <motion.div
              className="absolute rounded-full"
              style={{
                inset: '-30%',
                background: CONIC,
                filter: `blur(${blurBase * 5}px)`,
              }}
              animate={{ opacity: glowOpacityRange, scale: glowScaleRange }}
              transition={{ duration: breatheDuration, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute rounded-full"
              style={{
                inset: '-8%',
                background: CONIC,
                filter: `blur(${blurBase * 2}px)`,
              }}
              animate={{
                rotate: [0, 360],
                opacity: isActive ? [0.5, 0.7, 0.5] : [0.3, 0.45, 0.3],
              }}
              transition={{
                rotate: { duration: rotationDuration * 1.3, repeat: Infinity, ease: "linear" },
                opacity: { duration: breatheDuration, repeat: Infinity, ease: "easeInOut" },
              }}
            />

            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{ background: CONIC }}
              animate={{
                rotate: [0, 360],
                scale: breatheScale,
              }}
              transition={{
                rotate: { duration: rotationDuration, repeat: Infinity, ease: "linear" },
                scale: { duration: breatheDuration, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(ellipse at 35% 30%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 35%, transparent 65%)',
                }}
              />

              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(0,0,0,0.08) 100%)',
                }}
              />
            </motion.div>

            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1.5px solid rgba(160,210,255,0.35)' }}
                  animate={{ scale: [1, 1.5], opacity: [0.45, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(160,210,255,0.25)' }}
                  animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(160,210,255,0.15)' }}
                  animate={{ scale: [1, 2.1], opacity: [0.2, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
                />
              </>
            )}

            {isSpeaking && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid rgba(180,210,255,0.4)' }}
                  animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1.5px solid rgba(180,210,255,0.3)' }}
                  animate={{ scale: [1, 2.0], opacity: [0.4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(180,210,255,0.2)' }}
                  animate={{ scale: [1, 2.4], opacity: [0.25, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                />
              </>
            )}

            {isIdle && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(160,200,255,0.15)' }}
                animate={{ scale: [1, 1.3], opacity: [0.2, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
