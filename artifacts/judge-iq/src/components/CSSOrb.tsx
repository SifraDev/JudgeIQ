import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import type { VoiceState } from '@/context/VoiceStateContext';

interface CSSorbProps {
  state: VoiceState;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { container: 'w-12 h-12', flame: 'w-5 h-5', ring: '-m-2', glow: '-m-3' },
  md: { container: 'w-24 h-24', flame: 'w-10 h-10', ring: '-m-4', glow: '-m-6' },
  lg: { container: 'w-48 h-48 md:w-56 md:h-56', flame: 'w-16 h-16', ring: '-m-8', glow: '-m-10' },
};

export function CSSOrb({ state, size = 'md' }: CSSorbProps) {
  const s = sizes[size];
  const isProcessing = state === 'PROCESSING';
  const isActive = state === 'LISTENING' || state === 'SPEAKING';

  return (
    <div className={`relative ${s.container} flex items-center justify-center`}>
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
              className={`absolute inset-0 rounded-full ${s.glow}`}
              style={{ background: 'radial-gradient(circle, rgba(255,100,20,0.4) 0%, transparent 70%)' }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
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
                filter: [
                  'drop-shadow(0 0 12px rgba(255,100,20,0.8))',
                  'drop-shadow(0 0 25px rgba(255,60,0,1))',
                  'drop-shadow(0 0 12px rgba(255,100,20,0.8))',
                ],
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
            key="elevenlabs"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              className={`absolute inset-0 rounded-full ${s.glow}`}
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, transparent 70%)' }}
              animate={{
                scale: isActive ? [1, 1.3, 1] : [1, 1.08, 1],
                opacity: isActive ? [0.3, 0.6, 0.3] : [0.15, 0.25, 0.15],
              }}
              transition={{ duration: isActive ? 1.5 : 4, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="absolute inset-0 rounded-full overflow-hidden"
              animate={{
                boxShadow: isActive
                  ? [
                      '0 0 30px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.2)',
                      '0 0 50px rgba(212,175,55,0.3), inset 0 0 30px rgba(212,175,55,0.35)',
                      '0 0 30px rgba(212,175,55,0.15), inset 0 0 20px rgba(212,175,55,0.2)',
                    ]
                  : '0 0 20px rgba(212,175,55,0.06), inset 0 0 15px rgba(0,0,0,0.5)',
                borderColor: isActive ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.08)',
              }}
              transition={{
                duration: state === 'SPEAKING' ? 0.8 : 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 75%, rgba(0,0,0,0.4) 0%, transparent 50%), linear-gradient(135deg, #2a2d35 0%, #1a1c22 40%, #0d0e12 100%)',
              }}
            >
              <div
                className="absolute rounded-full"
                style={{
                  top: '12%',
                  left: '18%',
                  width: '35%',
                  height: '25%',
                  background: 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 70%)',
                  filter: 'blur(4px)',
                  transform: 'rotate(-20deg)',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  top: '15%',
                  left: '22%',
                  width: '18%',
                  height: '12%',
                  background: 'radial-gradient(ellipse, rgba(255,255,255,0.25) 0%, transparent 70%)',
                  filter: 'blur(2px)',
                  transform: 'rotate(-15deg)',
                }}
              />
            </motion.div>

            {isActive && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/20"
                  animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-primary/15"
                  animate={{ scale: [1, 1.7], opacity: [0.2, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                />
                {state === 'SPEAKING' && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-primary/10"
                    animate={{ scale: [1, 2.0], opacity: [0.15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
                  />
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
