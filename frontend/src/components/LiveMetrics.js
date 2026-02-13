import React from 'react';
import { Activity, Shield, Zap, AlertTriangle } from 'lucide-react';

export const LiveMetrics = ({ trafficData, detectionData, stats }) => {
  const packetRate = trafficData?.packet_rate || 0;
  const confidence = detectionData?.confidence || 0;
  const label = detectionData?.label || 'Normal';
  
  const getLabelColor = (lbl) => {
    if (lbl === 'Confirmed DDoS') return 'text-neon-red';
    if (lbl === 'Suspicious') return 'text-neon-amber';
    return 'text-neon-blue';
  };
  
  return (
    <div className="glass-panel p-6 space-y-4" data-testid="live-metrics-panel">
      <h2 className="text-lg font-rajdhani font-bold uppercase tracking-wider text-neon-blue neon-text">
        Live Metrics
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Activity className="w-4 h-4" />
            <span>Packet Rate</span>
          </div>
          <div className="text-2xl font-jetbrains font-bold text-white">
            {packetRate.toFixed(1)} <span className="text-sm text-gray-500">pps</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Detection</span>
          </div>
          <div className={`text-xl font-rajdhani font-bold ${getLabelColor(label)}`}>
            {label}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Zap className="w-4 h-4" />
            <span>Confidence</span>
          </div>
          <div className="text-2xl font-jetbrains font-bold text-white">
            {(confidence * 100).toFixed(1)}%
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Detected</span>
          </div>
          <div className="text-2xl font-jetbrains font-bold text-neon-red">
            {stats?.total_detected || 0}
          </div>
        </div>
      </div>
      
      <div className="pt-4 border-t border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Blocked</span>
          <span className="font-jetbrains text-neon-green">{stats?.total_blocked || 0}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-400">Active Nodes</span>
          <span className="font-jetbrains text-neon-blue">{stats?.active_nodes || 0}</span>
        </div>
      </div>
    </div>
  );
};
