import React from 'react';
import { motion } from 'framer-motion';
import { SystemLogs } from '@/components/SystemLogs';
import { CSSOrb } from '@/components/CSSOrb';

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
          <CSSOrb state="PROCESSING" size="md" />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center font-display text-lg tracking-wider"
          >
            <span className="text-orange-400/90">Firecrawl</span>
            <span className="text-muted-foreground"> is scraping judicial records...</span>
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