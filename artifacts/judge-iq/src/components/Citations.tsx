import React from 'react';
import { ExternalLink, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FirecrawlResult } from '@workspace/api-client-react';

interface CitationsProps {
  results: FirecrawlResult[] | undefined;
  isLoading: boolean;
}

export function Citations({ results, isLoading }: CitationsProps) {
  if (isLoading) {
    return (
      <div className="glass-panel p-6 rounded-xl animate-pulse">
        <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-white/5 rounded-lg border border-white/5"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-xl flex flex-col items-center justify-center text-center text-muted-foreground border border-dashed border-white/10">
        <Scale className="w-12 h-12 mb-3 opacity-20" />
        <p className="font-display text-lg">No Citations Extracted</p>
        <p className="text-sm mt-1">Initiate a search to gather judicial records.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-xl">
      <h3 className="font-display text-xl mb-4 text-primary flex items-center gap-2">
        <Scale className="w-5 h-5" />
        Source Citations
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.filter(r => r.url).map((result, idx) => {
          let domain = 'unknown';
          try { domain = new URL(result.url).hostname.replace('www.', ''); } catch { /* invalid url */ }
          
          return (
            <motion.a
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={idx}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-black/20 border border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                  {domain}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h4 className="text-sm font-medium text-white line-clamp-2 mb-2 group-hover:text-primary-foreground transition-colors">
                {result.title || "Document Extracted"}
              </h4>
              <p className="text-xs text-muted-foreground line-clamp-3">
                {result.description || result.markdown?.substring(0, 150) + "..." || "No snippet available."}
              </p>
            </motion.a>
          );
        })}
      </div>
    </div>
  );
}
