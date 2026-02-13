import React, { useState, useEffect, useCallback } from 'react';
import '@/App.css';
import { Scene3D } from './components/Scene3D';
import { LiveMetrics } from './components/LiveMetrics';
import { BlockchainLog } from './components/BlockchainLog';
import { DefenseStatus } from './components/DefenseStatus';
import { Shield, Play, Square, TrendingUp } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WS_URL = BACKEND_URL.replace('http', 'ws');

function App() {
  const [wsConnection, setWsConnection] = useState(null);
  const [trafficData, setTrafficData] = useState({});
  const [detectionData, setDetectionData] = useState({});
  const [isAttack, setIsAttack] = useState(false);
  const [stats, setStats] = useState({});
  const [nodes, setNodes] = useState([]);
  const [blockchainAttacks, setBlockchainAttacks] = useState({ attacks: [], count: 0 });
  const [systemReady, setSystemReady] = useState(false);
  const [attackActive, setAttackActive] = useState(false);

  const initializeSystem = async () => {
    try {
      await axios.post(`${API}/init`);
      setSystemReady(true);
    } catch (error) {
      console.error('System initialization error:', error);
    }
  };

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, nodesRes, blockchainRes] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/nodes/status`),
        axios.get(`${API}/blockchain/attacks`)
      ]);
      
      setStats(statsRes.data);
      setNodes(nodesRes.data.nodes);
      setBlockchainAttacks(blockchainRes.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  useEffect(() => {
    initializeSystem();
    fetchStats();
    
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  useEffect(() => {
    if (!systemReady) return;

    const ws = new WebSocket(`${WS_URL}/api/traffic/stream`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      setWsConnection(ws);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setTrafficData(data.traffic);
        setDetectionData(data.detection);
        
        if (data.detection?.label === 'Confirmed DDoS') {
          setIsAttack(true);
          fetchStats();
        } else if (data.detection?.label === 'Normal') {
          setIsAttack(false);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setWsConnection(null);
    };
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [systemReady, fetchStats]);

  const startAttack = async () => {
    try {
      await axios.post(`${API}/attack/start`, null, { params: { intensity: 0.6 } });
      setAttackActive(true);
    } catch (error) {
      console.error('Error starting attack:', error);
    }
  };

  const stopAttack = async () => {
    try {
      await axios.post(`${API}/attack/stop`);
      setAttackActive(false);
      setIsAttack(false);
    } catch (error) {
      console.error('Error stopping attack:', error);
    }
  };

  const escalateAttack = async () => {
    try {
      await axios.post(`${API}/attack/escalate`);
    } catch (error) {
      console.error('Error escalating attack:', error);
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#050505] relative" data-testid="main-app">
      <div className="scanline"></div>
      
      <div className="absolute inset-0 z-0">
        <Scene3D isAttack={isAttack} nodes={nodes} />
      </div>

      <div className="absolute inset-0 z-10 pointer-events-none grid-background"></div>

      <div className="absolute top-0 left-0 right-0 p-6 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 glass-panel px-6 py-3 pointer-events-auto">
            <Shield className="w-8 h-8 text-neon-blue" />
            <div>
              <h1 className="text-2xl font-rajdhani font-bold uppercase tracking-wider text-white neon-text">
                Sentinel
              </h1>
              <p className="text-xs text-gray-400 font-jetbrains">
                Blockchain DDoS Protection
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="glass-panel px-4 py-2 pointer-events-auto">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${wsConnection ? 'bg-neon-green' : 'bg-gray-500'}`}></div>
                <span className="text-xs font-jetbrains text-gray-300">
                  {wsConnection ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
            </div>
            
            {!attackActive ? (
              <button
                onClick={startAttack}
                className="glass-panel px-6 py-3 flex items-center gap-2 bg-neon-red/10 border-neon-red/50 hover:bg-neon-red/20 hover:shadow-neon-red transition-all pointer-events-auto"
                data-testid="start-attack-btn"
              >
                <Play className="w-4 h-4 text-neon-red" />
                <span className="font-rajdhani font-bold uppercase text-neon-red">Start Attack</span>
              </button>
            ) : (
              <div className="flex gap-2 pointer-events-auto">
                <button
                  onClick={escalateAttack}
                  className="glass-panel px-4 py-3 flex items-center gap-2 bg-neon-amber/10 border-neon-amber/50 hover:bg-neon-amber/20 transition-all"
                  data-testid="escalate-attack-btn"
                >
                  <TrendingUp className="w-4 h-4 text-neon-amber" />
                  <span className="font-rajdhani font-bold uppercase text-neon-amber text-sm">Escalate</span>
                </button>
                <button
                  onClick={stopAttack}
                  className="glass-panel px-4 py-3 flex items-center gap-2 bg-neon-green/10 border-neon-green/50 hover:bg-neon-green/20 transition-all"
                  data-testid="stop-attack-btn"
                >
                  <Square className="w-4 h-4 text-neon-green" />
                  <span className="font-rajdhani font-bold uppercase text-neon-green text-sm">Stop</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none">
        <div className="grid grid-cols-3 gap-4 max-w-7xl mx-auto">
          <div className="pointer-events-auto">
            <LiveMetrics 
              trafficData={trafficData} 
              detectionData={detectionData} 
              stats={stats}
            />
          </div>
          
          <div className="pointer-events-auto">
            <DefenseStatus nodes={nodes} />
          </div>
          
          <div className="pointer-events-auto">
            <BlockchainLog blockchainAttacks={blockchainAttacks} />
          </div>
        </div>
      </div>

      {isAttack && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
          <div className="glass-panel px-8 py-4 bg-neon-red/20 border-neon-red animate-pulse">
            <p className="text-2xl font-rajdhani font-bold uppercase text-neon-red neon-text">
              DDoS ATTACK DETECTED
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
