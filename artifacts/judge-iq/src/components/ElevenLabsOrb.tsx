import React from 'react';
import { useElevenLabs } from '@/hooks/useElevenLabs';
import { useVoiceState } from '@/context/VoiceStateContext';
import { Orb } from '@/components/Orb';

export function ElevenLabsOrb() {
  const { state } = useVoiceState();
  const { start, stop } = useElevenLabs();

  const handleToggle = () => {
    if (state === 'IDLE') start();
    else stop();
  };

  return <Orb onToggle={handleToggle} />;
}
