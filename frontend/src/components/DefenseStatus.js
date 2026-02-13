import React from 'react';
import { Server, CheckCircle, XCircle } from 'lucide-react';

export const DefenseStatus = ({ nodes }) => {
  return (
    <div className="glass-panel p-6 space-y-4" data-testid="defense-status-panel">
      <h2 className="text-lg font-rajdhani font-bold uppercase tracking-wider text-neon-green neon-text">
        Multi-Cloud Defense
      </h2>
      
      <div className="space-y-2">
        {nodes.map((node, idx) => (
          <div
            key={node.node_id}
            className="flex items-center justify-between p-3 bg-black/40 border border-white/10 rounded hover:border-neon-green/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Server className="w-4 h-4 text-neon-blue" />
              <span className="font-rajdhani text-sm uppercase">{node.node_id}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">Blocked:</span>
                <span className="font-jetbrains text-neon-red text-sm">
                  {node.blocked_threats}
                </span>
              </div>
              {node.status === 'active' ? (
                <CheckCircle className="w-4 h-4 text-neon-green" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-white/10">
        <p className="text-xs text-gray-400">
          All nodes share threat intelligence via blockchain. Coordinated defense active.
        </p>
      </div>
    </div>
  );
};
