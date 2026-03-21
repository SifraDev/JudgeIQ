import React from 'react';
import { motion } from 'framer-motion';
import { SystemLogs } from '@/components/SystemLogs';
import { Loader2 } from 'lucide-react';

export function ProcessingView() {
  return (
    <motion.div
      key="processing-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen flex items-center justify-center px-6"
    >
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center justify-center"
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-2xl overflow-hidden border border-primary/20 shadow-[0_0_80px_rgba(212,175,55,0.15)]">
            <video
              src={`${import.meta.env.BASE_URL}orb-video.webm`}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent animate-spin" style={{ animationDuration: '4s' }} />
              <Loader2 className="w-12 h-12 text-primary animate-spin drop-shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 text-center font-display text-lg text-primary/80 tracking-wider"
          >
            Searching judicial records...
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="h-[500px]"
        >
          <SystemLogs />
        </motion.div>
      </div>
    </motion.div>
  );
}
