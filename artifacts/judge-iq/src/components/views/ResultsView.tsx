import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useVoiceState } from '@/context/VoiceStateContext';
import { Citations } from '@/components/Citations';
import { Download, Scale, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2pdf from 'html2pdf.js';

export function ResultsView() {
  const { searchResults, transcript, state } = useVoiceState();
  const contentRef = useRef<HTMLDivElement>(null);

  const agentMessages = transcript.filter(t => t.role === 'agent');
  const profileText = agentMessages.map(t => t.message).join('\n\n');

  const handleExportPDF = () => {
    if (!contentRef.current) return;
    const opt = {
      margin: 1,
      filename: 'Judge_Profile_Brief.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(contentRef.current).save();
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
        className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-30"
      >
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
              <Scale className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-display text-lg font-bold tracking-widest text-white">JudgeIQ</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2 bg-black/40">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Brief</span>
          </Button>
        </div>
      </motion.header>

      <div ref={contentRef} className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        {profileText ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass-panel p-8 rounded-xl"
          >
            <h2 className="font-display text-2xl text-primary mb-6 flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Judge Profile Summary
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed text-[15px]">
              {agentMessages.map((entry, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.15, duration: 0.5 }}
                >
                  {entry.message}
                </motion.p>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass-panel p-8 rounded-xl text-center"
          >
            <Scale className="w-12 h-12 text-primary/30 mx-auto mb-4" />
            <h2 className="font-display text-xl text-white mb-2">Profile Synthesis</h2>
            <p className="text-muted-foreground text-sm">
              {state === 'SPEAKING'
                ? 'Agent is speaking the synthesized profile...'
                : 'The agent will narrate the judge profile here.'}
            </p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
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
  const isActive = state === 'SPEAKING' || state === 'LISTENING';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-8 right-8 z-40"
    >
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/30 blur-xl -m-3"
          animate={{
            scale: isActive ? [1, 1.4, 1] : 1,
            opacity: isActive ? [0.3, 0.6, 0.3] : 0.2,
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/40 shadow-[0_0_40px_rgba(212,175,55,0.25)]">
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
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Mic className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-white/50'}`} />
          </div>
        </div>
        {isActive && (
          <motion.div
            className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-black"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] text-primary/60 uppercase tracking-wider whitespace-nowrap font-mono"
        >
          {isActive ? 'Listening' : 'Mic Ready'}
        </motion.span>
      </div>
    </motion.div>
  );
}
