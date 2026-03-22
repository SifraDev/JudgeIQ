import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import type { VoiceState } from '@/context/VoiceStateContext';

interface CSSorbProps {
  state: VoiceState;
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  // Reducimos las dimensiones para que el orbe se vea más sutil
  sm: { container: 'w-10 h-10', flame: 'w-5 h-5', ring: '-m-1.5', glow: '-m-2' },
  md: { container: 'w-28 h-28', flame: 'w-10 h-10', ring: '-m-4', glow: '-m-5' },
  lg: { container: 'w-56 h-56 md:w-64 md:h-64', flame: 'w-20 h-20', ring: '-m-8', glow: '-m-10' },
};

export function CSSOrb({ state, size = 'md' }: CSSorbProps) {
  const s = sizes[size];
  const isProcessing = state === 'PROCESSING';
  const isActive = state === 'LISTENING' || state === 'SPEAKING';

  return (
    <div className={`relative ${s.container} flex items-center justify-center`}>
      <AnimatePresence mode="wait">
        {isProcessing ? (
          // --- ESTADO FIRECRAWL (Se mantiene) ---
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
          </motion.div>
        ) : (
          // --- NUEVO ORBE BURBUJA PROFESIONAL (Dorado/Gris) ---
          <motion.div
            key="elevenlabs"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* 1. Resplandor Exterior Suave (Ámbar/Oro) */}
            <motion.div
              className={`absolute inset-0 rounded-full ${s.glow} blur-2xl`}
              style={{ background: isActive ? 'radial-gradient(circle, rgba(234,179,8,0.25) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)' : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }}
              animate={{
                scale: isActive ? [1, 1.3, 1] : [1, 1.05, 1],
                opacity: isActive ? [0.6, 0.9, 0.6] : [0.3, 0.5, 0.3],
              }}
              transition={{ duration: isActive ? 1.5 : 4, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* 2. Contenedor de la Burbuja Principal */}
            <div className="absolute inset-0 rounded-full overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.05),inset_0_-10px_25px_rgba(0,0,0,0.5)] bg-white/5 backdrop-blur-sm">

              {/* 3. Colores Giratorios (Negro a Oro Brillante) */}
              <motion.div
                className="absolute inset-[-50%] opacity-90"
                style={{
                  // Conic gradient con negro, gris oscuro y amarillo dorado
                  background: isActive ? 'conic-gradient(from 0deg at 50% 50%, #171717 0%, #525252 15%, #eab308 35%, #525252 50%, #eab308 65%, #525252 85%, #171717 100%)' : 'conic-gradient(from 0deg at 50% 50%, #171717 0%, #404040 15%, #d4d4d4 35%, #404040 50%, #d4d4d4 65%, #404040 85%, #171717 100%)',
                  filter: isActive ? 'blur(10px) saturate(1.2) brightness(1.2)' : 'blur(16px) saturate(0.8) brightness(0.9)',
                  transition: 'filter 0.5s ease'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: isActive ? (state === 'SPEAKING' ? 1.5 : 2.5) : 8, repeat: Infinity, ease: "linear" }}
              />

              {/* 4. Efecto Cristal: Brillo superior intensificado */}
              <div 
                className="absolute inset-0 rounded-full bg-gradient-to-b from-white/80 to-transparent opacity-90" 
                style={{ clipPath: 'ellipse(60% 30% at 50% 15%)' }} 
              />

              {/* 5. Efecto Cristal: Sombra interior brillante 3D y borde metálico */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.9),inset_0_-15px_30px_rgba(234,179,8,0.3)] pointer-events-none" />
            </div>

            {/* 6. Anillos de Ondas Doradas */}
            {isActive && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full border border-yellow-300/60"
                  animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                  transition={{ duration: state === 'SPEAKING' ? 1 : 2, repeat: Infinity, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/30"
                  animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                  transition={{ duration: state === 'SPEAKING' ? 1 : 2, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}