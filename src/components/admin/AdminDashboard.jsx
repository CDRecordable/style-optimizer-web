import React, { useEffect, useState } from 'react';
import { Users, Activity, DollarSign, BarChart2, ArrowLeft, RefreshCw, Search, Check, X, Crown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard({ onExit }) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ totalUsers: 0, premiumUsers: 0, totalCalls: 0, costs: 0 });
    const [usageByFeature, setUsageByFeature] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    
    // NUEVO: ESTADO PARA GESTIÓN DE USUARIOS
    const [usersList, setUsersList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Cargar perfiles (Ahora con política de Admin funcionará)
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profilesError) throw profilesError;

            // 2. Cargar Logs
            const { data: allLogs, count: totalCalls } = await supabase
                .from('ai_usage')
                .select('*', { count: 'exact' });

            // Calcular métricas
            const totalUsers = profiles.length;
            const premiumUsers = profiles.filter(p => p.is_premium).length;
            
            // Procesar gráfico
            const featureMap = {};
            allLogs.forEach(log => {
                const feat = log.feature_used.replace('detail-', '');
                featureMap[feat] = (featureMap[feat] || 0) + 1;
            });
            const chartData = Object.entries(featureMap)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            setStats({ 
                totalUsers, 
                premiumUsers, 
                totalCalls: totalCalls || 0, 
                costs: (totalCalls * 0.0005).toFixed(2) 
            });
            
            setUsageByFeature(chartData);
            setRecentLogs(allLogs ? allLogs.slice(0, 10) : []);
            setUsersList(profiles);

        } catch (error) {
            console.error("Error admin:", error);
            alert("Error de permisos. Asegúrate de haber ejecutado el SQL de políticas de Admin.");
        } finally {
            setLoading(false);
        }
    };

    // FUNCIÓN PARA REGALAR/QUITAR PREMIUM
    const togglePremium = async (userId, currentStatus) => {
        const { error } = await supabase
            .from('profiles')
            .update({ is_premium: !currentStatus })
            .eq('id', userId);

        if (!error) {
            // Actualizar localmente para feedback instantáneo
            setUsersList(usersList.map(u => u.id === userId ? { ...u, is_premium: !currentStatus } : u));
        } else {
            alert("Error al actualizar usuario");
        }
    };

    useEffect(() => { fetchData(); }, []);

    // Filtrado de usuarios
    const filteredUsers = usersList.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center border-b border-slate-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <span className="bg-indigo-500 p-2 rounded-lg"><BarChart2 size={24}/></span>
                        Centro de Mando
                    </h1>
                    <p className="text-slate-400 mt-1">Gestión y Métricas en tiempo real</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={fetchData} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"><RefreshCw size={20} className={loading ? "animate-spin" : ""} /></button>
                    <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold transition"><ArrowLeft size={18}/> Volver</button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Users size={24}/></div>
                            <span className="text-xs font-bold bg-slate-700 px-2 py-1 rounded text-slate-300">Total</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-green-500/10 text-green-400 rounded-xl"><DollarSign size={24}/></div>
                            <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded">Premium</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stats.premiumUsers}</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Activity size={24}/></div>
                            <span className="text-xs font-bold bg-slate-700 px-2 py-1 rounded text-slate-300">Peticiones</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">{stats.totalCalls}</div>
                    </div>
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-red-500/10 text-red-400 rounded-xl"><DollarSign size={24}/></div>
                            <span className="text-xs font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded">Coste API</span>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">~{stats.costs}€</div>
                    </div>
                </div>

                {/* GRÁFICO USO */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-6">Herramientas Top</h3>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={usageByFeature}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                                    <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* GESTIÓN DE USUARIOS (NUEVO) */}
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 flex flex-col h-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Usuarios ({filteredUsers.length})</h3>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-slate-500" size={14}/>
                                <input 
                                    type="text" 
                                    placeholder="Buscar email..." 
                                    className="bg-slate-900 border border-slate-600 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:ring-2 focus:ring-indigo-500 outline-none w-40"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                            {filteredUsers.map(u => (
                                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-700 group">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${u.is_premium ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-500'}`}></div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium text-slate-200 truncate">{u.email}</span>
                                            <span className="text-[10px] text-slate-500 font-mono">{new Date(u.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => togglePremium(u.id, u.is_premium)}
                                        className={`p-1.5 rounded transition-colors ${u.is_premium ? 'bg-green-500/20 text-green-400 hover:bg-red-500/20 hover:text-red-400' : 'bg-slate-600 text-slate-400 hover:bg-green-500/20 hover:text-green-400'}`}
                                        title={u.is_premium ? "Quitar Premium" : "Regalar Premium"}
                                    >
                                        {u.is_premium ? <Check size={16}/> : <Crown size={16}/>}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}