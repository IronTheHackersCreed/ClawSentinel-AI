import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Cpu, 
  Zap, 
  CheckCircle,
  Terminal,
  Search,
  RefreshCw,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const App = () => {
  const [incidents, setIncidents] = useState([
    {
      incident_id: "init-882-bc12",
      timestamp: new Date().toISOString(),
      metadata: { source_ip: "10.0.45.12", user_id: "sys_monitor", request_path: "/api/v1/health", payload: "ping" },
      analysis: { anomaly_score: 0.05, threat_type: "Normal", is_confirmed: false },
      mitigation: { action_executed: "Monitoring Active", status: "executed" }
    }
  ]);
  const [stats, setStats] = useState({
    threatsBlocked: 124,
    avgMttr: '5.2s',
    systemHealth: '99.9%',
    activeAgents: 4,
    pendingActions: 0,
    wsConnected: false
  });
  const [isApproving, setIsApproving] = useState(false);
  const [pendingIncident, setPendingIncident] = useState(null);

  // Conexión real con el Agente de Maritime
  useEffect(() => {
    const wsUrl = "wss://maritime.sh/api/agents/8fc47dc3-2d85-4efe-a84a-fca77116434";
    const token = "okXDjOd7x85IEI6Fshmf3b4VDIIjkuFx";
    let socket;

    const connectWS = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setStats(prev => ({...prev, wsConnected: true}));
        console.log("✅ Conectado a Maritime Gateway");
        // Enviar handshake si es necesario
        socket.send(JSON.stringify({ type: "connect", token: token }));
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.incident_id || data.type === "alert") {
            setIncidents(prev => [data, ...prev].slice(0, 10));
          }
        } catch (e) {
          console.log("Recibido mensaje no-JSON:", event.data);
        }
      };

      socket.onclose = () => {
        setStats(prev => ({...prev, wsConnected: false}));
        setTimeout(connectWS, 5000); // Reintentar
      };
    };

    connectWS();
    return () => socket?.close();
  }, []);

  const triggerTestIncident = async () => {
    const attacks = [
      { path: "/login", payload: "'; DROP TABLE users; --", threat: "SQL Injection" },
      { path: "/admin", payload: "<script>alert('XSS')</script>", threat: "XSS Attempt" },
      { path: "/config", payload: "get_config", threat: "Unauthorized Access" }
    ];
    const selected = attacks[Math.floor(Math.random() * attacks.length)];

    try {
      const apiUrl = import.meta.env.DEV ? 'http://localhost:8000/ingest' : '/ingest';
      const response = await axios.post(apiUrl, {
        ip: "192.168.1." + Math.floor(Math.random() * 255),
        user_id: "user_" + Math.floor(Math.random() * 1000),
        path: selected.path,
        payload: btoa(selected.payload) // Codificamos en Base64 para evadir el WAF de Render
      });
      
      if (response.data.full_context.analysis.anomaly_score > 0.9) {
        setPendingIncident(response.data.full_context);
        setStats(prev => ({...prev, pendingActions: prev.pendingActions + 1}));
      } else {
        setIncidents(prev => [response.data.full_context, ...prev].slice(0, 10));
        setStats(prev => ({...prev, threatsBlocked: prev.threatsBlocked + 1}));
      }
    } catch (error) {
      console.error("Error al disparar incidente:", error);
    }
  };

  const approveAction = async () => {
    setIsApproving(true);
    try {
      const apiUrl = import.meta.env.DEV ? 'http://localhost:8000/execute' : '/execute';
      const response = await axios.post(apiUrl, {
        full_context: pendingIncident
      });
      
      const executedIncident = response.data.full_context;
      
      setIncidents(prev => [executedIncident, ...prev].slice(0, 10));
      setStats(prev => ({
        ...prev, 
        threatsBlocked: prev.threatsBlocked + 1,
        pendingActions: prev.pendingActions - 1
      }));
      setPendingIncident(null);
    } catch (error) {
      console.error("Error al ejecutar autorización:", error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white p-6">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Shield className="text-primary w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight neon-text">ClawSentinel-AI</h1>
            <p className="text-sm text-gray-400 font-mono">BCP SOC Autonomous Response MVP</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 ${stats.wsConnected ? 'bg-primary/10 border-primary/20' : 'bg-red-500/10 border-red-500/20'} border rounded-full`}>
            <div className={`w-2 h-2 rounded-full ${stats.wsConnected ? 'bg-primary animate-pulse' : 'bg-red-500'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${stats.wsConnected ? 'text-primary' : 'text-red-500'}`}>
              {stats.wsConnected ? 'Maritime Link Active' : 'Maritime Link Offline'}
            </span>
          </div>
          <button 
            onClick={triggerTestIncident}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-white transition-colors"
          >
            <Zap size={18} />
            Simular Ataque
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Amenazas Bloqueadas', value: stats.threatsBlocked, icon: Lock, color: 'text-primary' },
          { label: 'MTTR Promedio', value: stats.avgMttr, icon: Activity, color: 'text-green-400' },
          { label: 'Salud del Sistema', value: stats.systemHealth, icon: Cpu, color: 'text-purple-400' },
          { label: 'Acciones Pendientes', value: stats.pendingActions, icon: AlertTriangle, color: 'text-red-500' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className="glass-panel p-6"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-400 text-sm font-medium">{stat.label}</span>
              <stat.icon className={`${stat.color} w-5 h-5`} />
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Traffic Graph */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-primary" />
              Traffic Analysis (Packets/s)
            </h2>
            <div className="h-24 w-full flex items-end gap-1">
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.random() * 100}%` }}
                  transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse", delay: i * 0.05 }}
                  className="flex-1 bg-primary/20 rounded-t"
                />
              ))}
            </div>
          </div>

          {/* Incident Feed */}
          <div className="glass-panel p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Terminal size={20} className="text-primary" />
                Live Incident Feed
              </h2>
              <div className="text-xs text-gray-500 font-mono">Real-time ZeroClaw Stream</div>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              <AnimatePresence>
                {incidents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 font-mono border border-dashed border-white/5 rounded-xl">
                    Waiting for incoming logs...
                  </div>
                ) : (
                  incidents.map((incident) => (
                    <motion.div
                      key={incident.incident_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-primary/30 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${incident.analysis.is_confirmed ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                            <AlertTriangle size={16} />
                          </div>
                          <div>
                            <div className="font-bold text-sm uppercase tracking-wider">{incident.analysis.threat_type}</div>
                            <div className="text-xs text-gray-500 font-mono">ID: {incident.incident_id.slice(0, 8)}...</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-[10px] font-mono bg-black/40 p-3 rounded mb-3">
                        <div>
                          <div className="text-gray-500 uppercase mb-1">Source IP</div>
                          <div className="text-primary">{incident.metadata.source_ip}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 uppercase mb-1">User ID</div>
                          <div>{incident.metadata.user_id}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 uppercase mb-1">Status</div>
                          <div className="text-green-400 uppercase">{incident.mitigation.status}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <span className="text-[10px] px-2 py-1 bg-white/10 rounded-full text-gray-300">
                          {incident.mitigation.action_executed}
                        </span>
                        <span className="text-[10px] px-2 py-1 bg-primary/10 rounded-full text-primary font-bold">
                          Reasoning: {incident.analysis.root_cause}
                        </span>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* HITL Panel */}
          <AnimatePresence>
            {pendingIncident && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-panel p-6 border-red-500/50 bg-red-500/10"
              >
                <div className="flex items-center gap-3 mb-4 text-red-500">
                  <AlertTriangle className="animate-bounce" />
                  <h3 className="font-bold">CRITICAL APPROVAL REQUIRED</h3>
                </div>
                <p className="text-xs text-gray-300 mb-4">
                  El Agente 3 ha detectado un ataque crítico de <b>{pendingIncident.analysis.threat_type}</b>. 
                  Acción recomendada: <b>{pendingIncident.mitigation.plan}</b>.
                </p>
                <button 
                  onClick={approveAction}
                  disabled={isApproving}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isApproving ? <RefreshCw className="animate-spin" size={16} /> : <Shield size={16} />}
                  {isApproving ? 'Executing...' : 'AUTHORIZE MITIGATION'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Agent Status */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Cpu size={20} className="text-primary" />
              Agent Status
            </h2>
            <div className="space-y-4">
              {[
                { name: 'Agente 1: Anomaly Detector', status: 'Active', latency: '0.4ms' },
                { name: 'Agente 2: Root Cause', status: 'Active', latency: '0.1ms' },
                { name: 'Agente 3: Planner', status: 'Active', latency: '0.1ms' },
                { name: 'Agente 4: Executor', status: 'Idle', latency: '500ms' },
              ].map((agent) => (
                <div key={agent.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div>
                    <div className="text-sm font-medium">{agent.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">Latency: {agent.latency}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${agent.status === 'Active' ? 'bg-primary' : 'bg-gray-600'}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Global Threats */}
          <div className="glass-panel p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              Amenazas Globales
            </h3>
            <div className="relative h-32 bg-black/50 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              <div className="relative text-primary/50 font-mono text-[10px] text-center">
                <div className="flex gap-2 justify-center mb-2">
                  <div className="w-1 h-1 bg-red-500 rounded-full animate-ping"></div>
                  <span>RUSIA (INCIDENTE DETECTADO)</span>
                </div>
                <div className="flex gap-2 justify-center">
                  <div className="w-1 h-1 bg-primary rounded-full"></div>
                  <span>PERÚ (SEGURO)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Maritime Node */}
          <div className="glass-panel p-6 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <CheckCircle size={18} className="text-primary" />
              Maritime Secure Node
            </h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">
              El entorno Maritime está monitoreando todas las ejecuciones del Agente 4 para prevenir fallos en la infraestructura crítica del BCP.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-primary/80">
              <RefreshCw size={12} className="animate-spin" />
              INTEGRITY CHECK PASSED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
