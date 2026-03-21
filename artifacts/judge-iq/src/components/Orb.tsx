import React from 'react';
import { motion } from 'framer-motion';
import { useVoiceState } from '@/context/VoiceStateContext';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

interface OrbProps {
  onToggle?: () => void;
}

export function Orb({ onToggle }: OrbProps) {
  const { state, setState } = useVoiceState();

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    if (state === 'IDLE') setState('LISTENING');
    else setState('IDLE');
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-12">
      <div className="relative w-64 h-64 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-3xl"
          animate={{
            scale: state === 'LISTENING' ? [1, 1.2, 1] : state === 'SPEAKING' ? [1, 1.5, 1] : 1,
            opacity: state === 'IDLE' ? 0.3 : 0.8,
          }}
          transition={{
            duration: state === 'SPEAKING' ? 1 : 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {state === 'PROCESSING' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary/50 bg-black flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)]"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-transparent animate-spin" style={{ animationDuration: '3s' }} />
            <Loader2 className="w-12 h-12 text-primary animate-spin z-10" />
            <video 
              src={`${import.meta.env.BASE_URL}orb-video.mp4`}
              autoPlay 
              loop 
              muted 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = 'none';
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-slate-800 to-black border border-white/10 shadow-[inset_0_-10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center z-10"
            animate={{
              scale: state === 'LISTENING' ? [1, 1.05, 1] : 1,
              boxShadow: state === 'LISTENING' 
                ? "inset 0 0 20px rgba(212,175,55,0.5), 0 0 40px rgba(212,175,55,0.4)" 
                : state === 'SPEAKING'
                ? "inset 0 0 30px rgba(212,175,55,0.8), 0 0 60px rgba(212,175,55,0.6)"
                : "inset 0 -10px 30px rgba(0,0,0,0.8), 0 0 0px rgba(0,0,0,0)"
            }}
            transition={{
              duration: state === 'SPEAKING' ? 0.5 : 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <motion.div 
              className="w-1/2 h-1/2 rounded-full bg-primary/20 blur-xl"
              animate={{
                scale: state === 'LISTENING' ? [1, 1.5, 1] : state === 'SPEAKING' ? [1, 2, 1] : 0.5,
                opacity: state === 'IDLE' ? 0 : 1
              }}
              transition={{
                duration: state === 'SPEAKING' ? 0.3 : 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
      </div>

      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-display text-white tracking-wider">
          {state === 'IDLE' && 'Ready.'}
          {state === 'LISTENING' && 'Listening...'}
          {state === 'PROCESSING' && 'Searching records...'}
          {state === 'SPEAKING' && 'Synthesizing profile...'}
        </h2>
        
        <Button 
          variant={state === 'IDLE' ? 'glass' : 'destructive'} 
          size="lg" 
          className="rounded-full w-16 h-16 p-0 flex items-center justify-center group"
          onClick={handleToggle}
        >
          {state === 'IDLE' ? (
            <Mic className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          ) : (
            <MicOff className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          )}
        </Button>

        {!AGENT_ID && (
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Dev Mode — Use toggles to simulate</span>
        )}
        {AGENT_ID && (
          <span className="text-[10px] text-primary/60 uppercase tracking-wider">Production Mode</span>
        )}
      </div>
    </div>
  );
}
