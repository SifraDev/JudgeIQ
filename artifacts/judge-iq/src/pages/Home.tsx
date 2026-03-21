import React, { useRef, Suspense, lazy } from 'react';
import { VoiceStateProvider, useVoiceState } from '@/context/VoiceStateContext';
import { Orb } from '@/components/Orb';
import { SystemLogs } from '@/components/SystemLogs';
import { DevStateToggle } from '@/components/DevStateToggle';
import { DevConsole } from '@/components/DevConsole';
import { Citations } from '@/components/Citations';
import { Button } from '@/components/ui/button';
import { Scale, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';
const ElevenLabsOrb = AGENT_ID
  ? lazy(() => import('@/components/ElevenLabsOrb').then(m => ({ default: m.ElevenLabsOrb })))
  : null;

function HomeContent() {
  const contentRef = useRef<HTMLDivElement>(null);
  const { searchResults } = useVoiceState();

  const handleExportPDF = () => {
    if (!contentRef.current) return;
    
    const opt = {
      margin:       1,
      filename:     'Judge_Profile_Brief.pdf',
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(contentRef.current).save();
  };

  return (
    <div className="min-h-screen bg-background relative pb-24">
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-screen"
        style={{ 
          backgroundImage: `url(${import.meta.env.BASE_URL}images/legal-bg.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <header className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
              <Scale className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-display text-xl font-bold tracking-widest text-white">JudgeIQ</h1>
            <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 text-muted-foreground ml-2 hidden sm:inline-flex">
              ElevenHacks Demo
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2 bg-black/40">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download Brief</span>
          </Button>
        </div>
      </header>

      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex flex-col gap-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-3 flex flex-col items-center justify-center min-h-[500px]">
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Voice-Powered Judicial Intel
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Speak a judge's name. Our AI searches Justia, CourtListener, and Ballotpedia instantly to synthesize their background and rulings.
              </p>
            </div>

            {ElevenLabsOrb ? (
              <Suspense fallback={<Orb />}>
                <ElevenLabsOrb />
              </Suspense>
            ) : (
              <Orb />
            )}
          </div>

          <div className="lg:col-span-2">
            <SystemLogs />
          </div>
        </div>

        <div>
          <Citations results={searchResults} isLoading={false} />
        </div>
      </div>

      <DevStateToggle />
      <DevConsole />
    </div>
  );
}

export default function Home() {
  return (
    <VoiceStateProvider>
      <HomeContent />
    </VoiceStateProvider>
  );
}
