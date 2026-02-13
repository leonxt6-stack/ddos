import React, { useEffect, useState } from 'react';
import { Database, Hash } from 'lucide-react';

export const BlockchainLog = ({ blockchainAttacks }) => {
  const [recentTx, setRecentTx] = useState([]);
  
  useEffect(() => {
    if (blockchainAttacks?.attacks) {
      setRecentTx(blockchainAttacks.attacks.slice(-5));
    }
  }, [blockchainAttacks]);
  
  return (
    <div className="glass-panel p-6 space-y-4 h-full" data-testid="blockchain-log-panel">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-rajdhani font-bold uppercase tracking-wider text-neon-amber neon-text">
          Blockchain Ledger
        </h2>
        <Database className="w-5 h-5 text-neon-amber" />
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {recentTx.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No attacks logged yet
          </div>
        ) : (
          recentTx.reverse().map((attack, idx) => (
            <div
              key={idx}
              className="p-3 bg-black/40 border border-neon-amber/20 rounded space-y-1 hover:border-neon-amber/50 transition-colors"
            >
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Hash className="w-3 h-3" />
                <span className="font-jetbrains">
                  {attack.ip_hash?.substring(0, 16)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neon-amber">{attack.attack_type}</span>
                <span className="text-neon-red font-jetbrains">Severity: {attack.severity}/10</span>
              </div>
              <div className="text-xs text-gray-500 font-jetbrains">
                Block: #{attack.timestamp}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="pt-4 border-t border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Total on Chain</span>
          <span className="font-jetbrains text-neon-amber">{blockchainAttacks?.count || 0}</span>
        </div>
      </div>
    </div>
  );
};
