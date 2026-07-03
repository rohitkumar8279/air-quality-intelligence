import React, { useState, useEffect } from 'react';
import { Server, Activity } from 'lucide-react';

const ServerWakeupToast = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleWakingUp = () => setIsVisible(true);
    const handleAwake = () => setIsVisible(false);

    window.addEventListener('server-waking-up', handleWakingUp);
    window.addEventListener('server-awake', handleAwake);

    return () => {
      window.removeEventListener('server-waking-up', handleWakingUp);
      window.removeEventListener('server-awake', handleAwake);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-fade-in">
      <div className="bg-[#0E1628] border border-[#22C55E]/30 shadow-[0_0_20px_rgba(34,197,94,0.15)] rounded-xl p-4 flex items-start gap-4 max-w-sm backdrop-blur-md">
        <div className="bg-[#22C55E]/10 p-2 rounded-lg mt-1">
          <Server className="text-[#22C55E] animate-pulse" size={20} />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-medium text-sm mb-1 flex items-center gap-2">
            Waking up server... 
            <Activity className="text-muted animate-spin" size={14} style={{ animationDuration: '2s' }} />
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed">
            Since we use a free Render instance, it sleeps when inactive. Please allow up to 45 seconds for it to wake up.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerWakeupToast;
