import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useVoiceState } from '@/context/VoiceStateContext';
import { Citations } from '@/components/Citations';
import { CSSOrb } from '@/components/CSSOrb';
import { Download, Scale, BookOpen, AlertCircle, TrendingUp, Fingerprint, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2pdf from 'html2pdf.js';
import { useElevenLabsSession } from '@/components/ElevenLabsSession';

export function ResultsView() {
  const { searchResults, spokenScript, tendencies, biases, state } = useVoiceState();
  const contentRef = useRef<HTMLDivElement>(null);

  let judgeName = "Judge Profile";
  if (searchResults && searchResults.length > 0) {
    judgeName = (searchResults[0] as any).title?.split(/[-|]/)[0].trim() || "Judge Profile";
  }

  const dynamicSummary = spokenScript.length > 10
    ? spokenScript
    : "Analyzing judicial records and synthesizing profile... Please wait for the agent to finish speaking.";

  const dynamicTendencies = tendencies.length > 0
    ? tendencies
    : [`Analyzing procedural patterns for ${judgeName}.`];

  const dynamicBiases = biases.length > 0
    ? biases
    : ["Analyzing judicial records for biases and inclinations..."];

  const handleExportPDF = () => {
    if (!contentRef.current) return;
    const opt = {
      margin: 1,
      filename: `${judgeName.replace(/\s+/g, '_')}_Brief.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(contentRef.current).save();
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      key="results-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen pb-36"
    >
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-30"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
              <Scale className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="font-display text-xl font-bold tracking-widest text-white">JudgeIQ</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2 bg-neutral-900 border-white/10 hover:bg-neutral-800 text-white">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export Brief</span>
          </Button>
        </div>
      </motion.header>

      <div ref={contentRef} className="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="border-b border-white/10 pb-6 mb-2"
        >
           <h1 className="font-display text-4xl text-white mb-2 uppercase">{judgeName}</h1>
           <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
             <span className="flex items-center gap-1.5"><Gavel className="w-4 h-4 text-yellow-500/70" /> Federal Judiciary</span>
             <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-blue-400/70" /> Status: Active Data Retrieval</span>
           </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.div variants={itemVariants} className="md:col-span-3 bg-neutral-900/50 border border-white/5 p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500/70" />
            <h3 className="text-yellow-500 font-bold uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Executive Summary
            </h3>
            <p className="text-gray-200 text-lg leading-relaxed">{dynamicSummary}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-1 bg-neutral-900/30 border border-white/5 p-6 rounded-xl shadow-lg">
             <h3 className="text-blue-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Key Tendencies
            </h3>
            <ul className="space-y-3">
              {dynamicTendencies.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-2 bg-neutral-900/30 border border-white/5 p-6 rounded-xl shadow-lg">
             <h3 className="text-red-400 font-bold uppercase tracking-wider text-xs mb-4 flex items-center gap-2">
              <Fingerprint className="w-4 h-4" /> Known Biases & Inclinations
            </h3>
            <ul className="space-y-3">
              {dynamicBiases.map((item, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span> {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-4"
        >
          <Citations results={searchResults} isLoading={false} />
        </motion.div>
      </div>

      <FloatingOrb />
    </motion.div>
  );
}

function FloatingOrb() {
  const { state } = useVoiceState();
  const { start, status } = useElevenLabsSession();

  const isConnected = status === 'connected';
  const isActive = state === 'SPEAKING' || state === 'LISTENING' || isConnected;

  const handleOrbTap = async () => {
    if (isConnected) {
      return;
    }
    await start();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-20 right-12 z-40 cursor-pointer"
      onClick={handleOrbTap}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={isConnected ? "Mic is live — just speak" : "Tap to reconnect"}
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <CSSOrb state={state} size="sm" />

          {isActive && (
            <motion.div
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-black z-20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className={`mt-3 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap ${
            isConnected ? 'text-green-400' : 'text-neutral-500'
          }`}
        >
          {isConnected ? 'Listening...' : 'Tap to Reconnect'}
        </motion.div>
      </div>
    </motion.div>
  );
}
