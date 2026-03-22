import React, { useState, useRef, useEffect } from 'react';
import { useVoiceState, VoiceState } from '@/context/VoiceStateContext';
import { Button } from '@/components/ui/button';
import { Settings2, Mic, Cpu, Volume2, RotateCcw, ChevronRight, ChevronLeft, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_PROFILE = [
  'Judge William Alsup is a United States District Judge for the Northern District of California, appointed by President Bill Clinton in 1999. Born on March 26, 1945, in Jackson, Mississippi, Judge Alsup earned his J.D. from Harvard Law School in 1971. Before joining the federal bench, he served as a law clerk to Justice William O. Douglas of the U.S. Supreme Court and spent over two decades in private practice at Morrison & Foerster LLP, where he specialized in intellectual property and antitrust litigation.',

  'Judge Alsup is widely recognized for his deep engagement with technology cases. He presided over Oracle v. Google, one of the most significant software copyright disputes in history, and famously taught himself the Java programming language to better understand the technical arguments. His rulings have shaped key legal precedents around API copyrightability, patent eligibility of software, and trade secret protections in Silicon Valley. He has also handled major antitrust matters, securities fraud cases, and civil rights litigation throughout his tenure.',

  'Known for his rigorous and hands-on approach to case management, Judge Alsup maintains one of the most demanding courtrooms in the Northern District. He frequently issues detailed, technically informed opinions and is not hesitant to challenge counsel on both sides. Legal commentators have noted his intellectual curiosity, his commitment to understanding the facts at a granular level, and his willingness to hold parties accountable for litigation conduct. He continues to serve as an active federal judge.',
];

const MOCK_CITATIONS = [
  {
    url: 'https://supreme.justia.com/justices/william-alsup/',
    title: 'Judge William Alsup — Federal Judicial Profile',
    description: 'Comprehensive profile of Judge William Alsup, U.S. District Court for the Northern District of California. Includes appointment history, notable cases, and judicial philosophy.',
    markdown: 'Full Justia profile content...',
  },
  {
    url: 'https://ballotpedia.org/William_Alsup',
    title: 'William Alsup — Ballotpedia',
    description: 'Political and judicial background of William Alsup, including his nomination by President Clinton, Senate confirmation, and key rulings on technology and intellectual property law.',
    markdown: 'Ballotpedia article content...',
  },
  {
    url: 'https://www.courtlistener.com/person/william-alsup/',
    title: 'Opinions Authored by Judge William Alsup',
    description: 'Browse court opinions and orders authored by Judge William Alsup, including landmark decisions in Oracle v. Google, Uber v. Waymo, and other significant technology disputes.',
    markdown: 'CourtListener opinions listing...',
  },
  {
    url: 'https://law.justia.com/cases/federal/district-courts/california/candce/3:2010cv03561/231846/1202/',
    title: 'Oracle America, Inc. v. Google Inc. — Final Ruling',
    description: 'Full text of Judge Alsup\'s landmark ruling in Oracle v. Google regarding the copyrightability of Java APIs, holding that APIs are not subject to copyright protection.',
    markdown: 'Oracle v. Google ruling text...',
  },
  {
    url: 'https://ballotpedia.org/Notable_opinions_of_Judge_William_Alsup',
    title: 'Notable Opinions of Judge William Alsup',
    description: 'A curated list of significant judicial opinions by Judge Alsup, spanning technology, civil rights, immigration, and antitrust law from 1999 to present.',
    markdown: 'Notable opinions listing...',
  },
];

export function DevStateToggle() {
  const { state, setState, reset, addLog, setSearchResults, addTranscript } = useVoiceState();
  const [isOpen, setIsOpen] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleState = (newState: VoiceState) => () => {
    if (simulating) return;
    if (newState === 'SPEAKING') {
      reset();
      setSearchResults(MOCK_CITATIONS);
      addLog(`Firecrawl returned ${MOCK_CITATIONS.length} documents.`, 'success');
      MOCK_PROFILE.forEach(paragraph => {
        addTranscript('agent', paragraph);
      });
      addLog('Agent synthesizing profile from extracted documents...', 'info');
    }
    setState(newState);
  };

  const simulateFullFlow = () => {
    if (simulating) return;
    setSimulating(true);

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    reset();

    setState('LISTENING');
    addLog('User speaking: "Tell me about Judge William Alsup"', 'info');

    const t1 = setTimeout(() => {
      setState('PROCESSING');
      addLog('Agent recognized query. Invoking Firecrawl search tool...', 'warning');
      addLog('POST /api/firecrawl/search — query: "Judge William Alsup"', 'info');
    }, 1000);

    const t2 = setTimeout(() => {
      addLog('Firecrawl crawling justia.com...', 'info');
    }, 2000);

    const t3 = setTimeout(() => {
      addLog('Firecrawl crawling ballotpedia.org...', 'info');
    }, 2800);

    const t4 = setTimeout(() => {
      addLog('Firecrawl crawling courtlistener.com...', 'info');
    }, 3500);

    const t5 = setTimeout(() => {
      setSearchResults(MOCK_CITATIONS);
      addLog(`Firecrawl returned ${MOCK_CITATIONS.length} documents (total: 247K chars).`, 'success');
      MOCK_PROFILE.forEach(paragraph => {
        addTranscript('agent', paragraph);
      });
      addLog('Agent synthesizing profile from extracted documents...', 'success');
      setState('SPEAKING');
      setSimulating(false);
    }, 5000);

    timeoutsRef.current = [t1, t2, t3, t4, t5];
  };

  const handleReset = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setSimulating(false);
    reset();
  };

  return (
    <div className="fixed bottom-20 left-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="glass-panel p-3 rounded-xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-black/70 w-52 mb-2"
          >
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
              <Settings2 className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white">Dev Toggles</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <Button
                variant="default"
                size="sm"
                onClick={simulateFullFlow}
                disabled={simulating}
                className="justify-start text-[11px] h-8 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
              >
                <Play className="w-3 h-3 mr-1.5" />
                {simulating ? 'Simulating...' : 'Simulate Full Flow'}
              </Button>

              <div className="h-px bg-white/10 my-0.5" />

              <Button
                variant={state === 'LISTENING' ? 'default' : 'outline'}
                size="sm"
                onClick={handleState('LISTENING')}
                disabled={simulating}
                className="justify-start text-[11px] h-7"
              >
                <Mic className="w-3 h-3 mr-1.5" /> Listening
              </Button>
              <Button
                variant={state === 'PROCESSING' ? 'default' : 'outline'}
                size="sm"
                onClick={handleState('PROCESSING')}
                disabled={simulating}
                className="justify-start text-[11px] h-7"
              >
                <Cpu className="w-3 h-3 mr-1.5" /> Processing
              </Button>
              <Button
                variant={state === 'SPEAKING' ? 'default' : 'outline'}
                size="sm"
                onClick={handleState('SPEAKING')}
                disabled={simulating}
                className="justify-start text-[11px] h-7"
              >
                <Volume2 className="w-3 h-3 mr-1.5" /> Speaking
              </Button>
              <div className="h-px bg-white/10 my-0.5" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="justify-start text-[11px] h-7 text-muted-foreground hover:text-white"
              >
                <RotateCcw className="w-3 h-3 mr-1.5" /> Reset
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
