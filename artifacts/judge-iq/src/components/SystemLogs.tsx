import React, { useEffect, useRef } from 'react';
import { useVoiceState } from '@/context/VoiceStateContext';
import { format } from 'date-fns';
import { Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SystemLogs() {
  const { logs } = useVoiceState();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'system': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="glass-panel rounded-xl flex flex-col h-[500px] overflow-hidden">
      <div className="bg-black/40 px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <Terminal className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-mono text-sm text-muted-foreground uppercase tracking-wider">System.Logs</h3>
        <div className="ml-auto flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed terminal-scrollbar space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 hover:bg-white/5 px-2 py-1 rounded transition-colors">
            <span className="text-white/30 shrink-0 select-none">
              [{format(log.timestamp, 'HH:mm:ss.SSS')}]
            </span>
            <span className={cn("break-words", getColor(log.type))}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
