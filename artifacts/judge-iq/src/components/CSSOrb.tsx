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
  const isActive = isListening || isSpeaking;
  const isIdle = state === 'IDLE';

  const containerStyle = { width: s.px, height: s.px };

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
          >
            <motion.div
              className="absolute rounded-full"
              style={{
                inset: '-40%',
                background: isActive
                  ? 'radial-gradient(circle, rgba(100,160,255,0.15) 0%, rgba(140,120,255,0.08) 40%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(100,140,255,0.08) 0%, rgba(120,100,220,0.04) 40%, transparent 70%)',
              }}
              animate={{
                scale: isActive ? [1, 1.2, 1] : [1, 1.06, 1],
                opacity: isActive ? [0.6, 1, 0.6] : [0.4, 0.6, 0.4],
              }}
              transition={{ duration: isActive ? 2 : 5, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute rounded-full"
              style={{
                inset: '-15%',
                background: isActive
                  ? 'radial-gradient(circle, rgba(120,160,255,0.25) 0%, rgba(80,120,255,0.1) 50%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(100,130,220,0.12) 0%, rgba(80,100,200,0.05) 50%, transparent 70%)',
                filter: `blur(${Math.round(s.px * 0.08)}px)`,
              }}
              animate={{
                scale: isActive ? [0.95, 1.1, 0.95] : [0.98, 1.03, 0.98],
              }}
              transition={{ duration: isActive ? 1.8 : 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: isActive
                  ? 'radial-gradient(ellipse at 35% 30%, rgba(160,190,255,0.5) 0%, rgba(100,140,255,0.3) 25%, rgba(60,80,180,0.4) 50%, rgba(30,40,100,0.6) 75%, rgba(15,20,60,0.8) 100%)'
                  : 'radial-gradient(ellipse at 35% 30%, rgba(130,150,210,0.3) 0%, rgba(80,100,170,0.2) 25%, rgba(50,60,120,0.3) 50%, rgba(25,30,70,0.5) 75%, rgba(12,15,40,0.7) 100%)',
                boxShadow: isActive
                  ? '0 0 40px rgba(100,150,255,0.25), 0 0 80px rgba(80,120,255,0.15), inset 0 0 30px rgba(140,180,255,0.2)'
                  : '0 0 25px rgba(80,110,200,0.1), 0 0 50px rgba(60,80,180,0.06), inset 0 0 20px rgba(100,130,200,0.08)',
              }}
              animate={{
                boxShadow: isActive
                  ? [
                      '0 0 40px rgba(100,150,255,0.25), 0 0 80px rgba(80,120,255,0.15), inset 0 0 30px rgba(140,180,255,0.2)',
                      '0 0 60px rgba(120,170,255,0.35), 0 0 100px rgba(90,130,255,0.2), inset 0 0 40px rgba(160,200,255,0.3)',
                      '0 0 40px rgba(100,150,255,0.25), 0 0 80px rgba(80,120,255,0.15), inset 0 0 30px rgba(140,180,255,0.2)',
                    ]
                  : [
                      '0 0 25px rgba(80,110,200,0.1), 0 0 50px rgba(60,80,180,0.06), inset 0 0 20px rgba(100,130,200,0.08)',
                      '0 0 30px rgba(90,120,210,0.14), 0 0 60px rgba(70,90,190,0.08), inset 0 0 25px rgba(110,140,210,0.12)',
                      '0 0 25px rgba(80,110,200,0.1), 0 0 50px rgba(60,80,180,0.06), inset 0 0 20px rgba(100,130,200,0.08)',
                    ],
              }}
              transition={{ duration: isSpeaking ? 0.8 : isListening ? 1.5 : 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute rounded-full"
                style={{
                  top: '8%', left: '15%', width: '45%', height: '35%',
                  background: 'radial-gradient(ellipse, rgba(200,220,255,0.4) 0%, rgba(160,190,255,0.15) 40%, transparent 70%)',
                  filter: `blur(${Math.round(s.px * 0.04)}px)`,
                  transform: 'rotate(-15deg)',
                }}
                animate={isActive ? { opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] } : { opacity: [0.4, 0.55, 0.4] }}
                transition={{ duration: isActive ? 2 : 5, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute rounded-full"
                style={{
                  top: '12%', left: '20%', width: '22%', height: '15%',
                  background: 'radial-gradient(ellipse, rgba(255,255,255,0.5) 0%, transparent 70%)',
                  filter: `blur(${Math.round(s.px * 0.02)}px)`,
                  transform: 'rotate(-10deg)',
                }}
                animate={isActive ? { opacity: [0.5, 0.8, 0.5] } : { opacity: [0.25, 0.35, 0.25] }}
                transition={{ duration: isActive ? 1.5 : 4, repeat: Infinity, ease: "easeInOut" }}
              />

              <motion.div
                className="absolute rounded-full"
                style={{
                  bottom: '15%', right: '15%', width: '30%', height: '25%',
                  background: isActive
                    ? 'radial-gradient(ellipse, rgba(140,100,255,0.3) 0%, transparent 70%)'
                    : 'radial-gradient(ellipse, rgba(100,80,180,0.15) 0%, transparent 70%)',
                  filter: `blur(${Math.round(s.px * 0.05)}px)`,
                }}
                animate={{
                  opacity: isActive ? [0.5, 0.8, 0.5] : [0.3, 0.45, 0.3],
                  scale: isActive ? [1, 1.15, 1] : [1, 1.05, 1],
                }}
                transition={{ duration: isActive ? 2.5 : 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />

              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(120,160,255,0.15) 25%, transparent 50%, rgba(160,140,255,0.1) 75%, transparent 100%)',
                  }}
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.div>

            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(120,160,255,0.25)' }}
                  animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(120,160,255,0.18)' }}
                  animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(120,160,255,0.12)' }}
                  animate={{ scale: [1, 2.1], opacity: [0.2, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut", delay: 1.2 }}
                />
              </>
            )}

            {isSpeaking && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1.5px solid rgba(140,180,255,0.3)' }}
                  animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1.5px solid rgba(140,180,255,0.2)' }}
                  animate={{ scale: [1, 2.0], opacity: [0.35, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(140,180,255,0.15)' }}
                  animate={{ scale: [1, 2.4], opacity: [0.25, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                />
              </>
            )}

            {isIdle && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ border: '1px solid rgba(100,130,220,0.1)' }}
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
