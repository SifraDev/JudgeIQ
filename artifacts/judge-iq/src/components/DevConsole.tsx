import React, { useState } from 'react';
import { useFirecrawlSearch } from '@workspace/api-client-react';
import { useVoiceState } from '@/context/VoiceStateContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TerminalSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function DevConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { addLog, setState, setSearchResults } = useVoiceState();
  
  const searchMutation = useFirecrawlSearch();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsOpen(true);
    addLog(`[Dev Console] Executing manual search for: ${query}`, 'system');
    setState('PROCESSING');

    try {
      const result = await searchMutation.mutateAsync({ data: { query } });
      addLog(`[Dev Console] Search complete. Found ${result.results.length} documents.`, 'success');
      setState('IDLE');
      setSearchResults(result.results);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      addLog(`[Dev Console] Search failed: ${msg}`, 'error');
      setState('IDLE');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-6 py-2 text-xs font-mono text-muted-foreground hover:text-white transition-colors w-full bg-black/20"
        >
          <TerminalSquare className="w-4 h-4" />
          PHASE 1: DEVELOPER TEXT CONSOLE
          {isOpen ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronUp className="w-4 h-4 ml-auto" />}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 border-t border-white/5 bg-black/40">
                <div className="lg:col-span-1 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Manual Webhook Test</h4>
                    <p className="text-xs text-muted-foreground mb-4">
                      Test the backend Firecrawl pipeline silently without consuming ElevenLabs credits.
                    </p>
                  </div>
                  
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input 
                      placeholder="e.g. Judge Maria Lopez" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      disabled={searchMutation.isPending}
                      className="font-mono text-xs"
                    />
                    <Button type="submit" disabled={searchMutation.isPending || !query.trim()}>
                      {searchMutation.isPending ? 'Searching...' : 'Search'}
                    </Button>
                  </form>
                </div>

                <div className="lg:col-span-2 relative">
                  <h4 className="text-sm font-semibold text-white mb-2">Raw JSON Response</h4>
                  <div className="bg-black border border-white/10 rounded-lg p-4 h-64 overflow-auto terminal-scrollbar">
                    {searchMutation.isPending ? (
                      <div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">
                        <span className="animate-pulse">Awaiting response from POST /api/firecrawl/search...</span>
                      </div>
                    ) : searchMutation.data ? (
                      <pre className="text-xs font-mono text-green-400">
                        {JSON.stringify(searchMutation.data, null, 2)}
                      </pre>
                    ) : searchMutation.error ? (
                      <pre className="text-xs font-mono text-red-400">
                        {JSON.stringify(searchMutation.error, null, 2)}
                      </pre>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground/50 font-mono text-sm">
                        No data. Execute a search to view JSON.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
