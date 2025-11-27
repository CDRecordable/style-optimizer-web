import React, { useMemo, useState } from 'react';
import { 
    BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
    AreaChart, Area, YAxis
} from 'recharts';
import { Activity, ArrowLeft, Info, Zap, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { CustomBarTooltip } from '../common/StyleComponents';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailSismografo({ analysis, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // 1. Datos para el Gráfico de Barras (Estructura)
    const barData = useMemo(() => {
        return analysis.sentenceLengths.map((len, i) => {
            const alert = analysis.sismografoAlerts.find(a => i >= a.start && i <= a.end);
            let color = "#818cf8"; // Indigo (Normal)
            let label = null;
            
            if (alert) {
                if (alert.type === 'staccato') { color = "#3b82f6"; label = "Staccato"; }
                if (alert.type === 'wall') { color = "#ef4444"; label = "Muro"; }
                if (alert.type === 'flat') { color = "#9ca3af"; label = "Monotonía"; }
            }
            return { id: i + 1, len, color, alert: label };
        });
    }, [analysis]);

    // 2. Datos para el Gráfico de Velocidad (Flujo)
    const speedData = useMemo(() => {
        return analysis.sentenceLengths.map((len, i) => {
            const speedScore = Math.max(5, 60 - len); 
            return { id: i + 1, speed: speedScore, len };
        });
    }, [analysis.sentenceLengths]);

    // 3. Consola de Navegación de Problemas
    const issues = useMemo(() => {
        const sentences = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s));
        return analysis.sismografoAlerts.map(alert => {
            const textChunk = sentences.slice(alert.start, alert.end + 1).join(". ") + ".";
            return { ...alert, text: textChunk, originalIndex: alert.start };
        });
    }, [analysis]);

    const currentIssue = issues[currentIndex];

    // 4. Renderizado de Texto
    const renderText = () => {
        const paragraphs = analysis.rawText.split(/\n+/);
        let globalSentenceIdx = 0;

        return paragraphs.map((para, pIdx) => {
            if (!para.trim()) return null;
            const sentences = para.split(/([.!?]+)/);
            const renderedSentences = [];
            let buffer = "";
            
            for (let i = 0; i < sentences.length; i++) {
                const part = sentences[i];
                buffer += part;
                if (/^[.!?]+$/.test(part) || i === sentences.length - 1) {
                    if (buffer.trim().length > 0 && !/^[.!?]+$/.test(buffer)) {
                        const currentIdx = globalSentenceIdx;
                        const alert = analysis.sismografoAlerts.find(a => currentIdx >= a.start && currentIdx <= a.end);
                        let className = "transition-colors duration-300 rounded px-0.5 ";
                        if (alert) {
                            if (alert.type === 'staccato') className += "bg-blue-100 text-blue-900 decoration-blue-300 underline decoration-2 underline-offset-4 ";
                            if (alert.type === 'wall') className += "bg-red-100 text-red-900 decoration-red-300 underline decoration-2 underline-offset-4 ";
                            if (alert.type === 'flat') className += "bg-gray-200 text-gray-800 ";
                        }
                        renderedSentences.push(<span key={currentIdx} className={className} title={alert ? alert.type.toUpperCase() : `Frase ${currentIdx + 1}`}>{buffer}</span>);
                        globalSentenceIdx++;
                    } else {
                        renderedSentences.push(<span key={`punct-${i}`}>{buffer}</span>);
                    }
                    buffer = "";
                }
            }
            return <p key={pIdx} className="mb-4">{renderedSentences}</p>;
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Activity className="text-indigo-500" /> Mapa de Longitud y Cadencia
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>

            {/* GRÁFICOS APILADOS VERTICALMENTE (Cambio aquí: grid-cols-1 en lugar de lg:grid-cols-2) */}
            <div className="space-y-8 mb-10">
                
                {/* GRÁFICO 1: ESTRUCTURA (Barras) */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
                        <Activity size={14}/> Peso de las Frases (Estructura)
                    </h3>
                    <div className="h-48 w-full"> {/* Aumentado un poco la altura para que respire mejor */}
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <Tooltip content={<CustomBarTooltip unit="palabras" />} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="len" radius={[2, 2, 0, 0]}>
                                    {barData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-xs">
                        <span className="flex items-center gap-1 font-bold text-gray-500"><div className="w-2 h-2 bg-blue-400 rounded-sm"></div> Staccato</span>
                        <span className="flex items-center gap-1 font-bold text-gray-500"><div className="w-2 h-2 bg-red-400 rounded-sm"></div> Muro</span>
                        <span className="flex items-center gap-1 font-bold text-gray-500"><div className="w-2 h-2 bg-indigo-400 rounded-sm"></div> Normal</span>
                    </div>
                </div>

                {/* GRÁFICO 2: VELOCIMETRÍA (Línea de Flujo) */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100">
                    <h3 className="text-xs font-bold text-indigo-600 uppercase mb-4 flex items-center gap-2">
                        <Zap size={14}/> Velocidad de Lectura (Flujo)
                    </h3>
                    <div className="h-48 w-full"> {/* Aumentada altura */}
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={speedData}>
                                <defs>
                                    <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(139, 92, 246, 0.1)" />
                                <YAxis hide domain={[0, 60]} />
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const speed = payload[0].value;
                                            const label = speed > 45 ? "Muy Rápido" : speed > 25 ? "Fluido" : "Lento/Denso";
                                            return (
                                                <div className="bg-indigo-900 text-white text-xs p-2 rounded shadow-lg">
                                                    <p className="font-bold">{label}</p>
                                                    <p className="opacity-80">{payload[0].payload.len} palabras</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="speed" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={2} 
                                    fillOpacity={1} 
                                    fill="url(#colorSpeed)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-indigo-400 mt-2 px-2 uppercase tracking-wider">
                        <span>Lento (Denso)</span>
                        <span>Rápido (Ágil)</span>
                    </div>
                </div>
            </div>

            {/* CONSOLA DE CORRECCIÓN */}
            {issues.length > 0 ? (
                <div className="mb-8 bg-white rounded-xl border border-indigo-200 shadow-sm overflow-hidden">
                    <div className="bg-indigo-50/50 px-4 py-2 flex justify-between items-center border-b border-indigo-100">
                        <span className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-2">
                            <Info size={14}/> Problema de Ritmo {currentIndex + 1} de {issues.length}
                        </span>
                        <div className="flex gap-1">
                            <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0} className="p-1 hover:bg-white rounded disabled:opacity-50 text-indigo-600"><ChevronLeft size={18}/></button>
                            <button onClick={() => setCurrentIndex(p => Math.min(issues.length - 1, p + 1))} disabled={currentIndex === issues.length - 1} className="p-1 hover:bg-white rounded disabled:opacity-50 text-indigo-600"><ChevronRight size={18}/></button>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="flex gap-2 mb-3">
                            {currentIssue.type === 'wall' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded font-bold uppercase border border-red-200">Muro de Texto</span>}
                            {currentIssue.type === 'staccato' && <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold uppercase border border-blue-200">Staccato (Entrecortado)</span>}
                            {currentIssue.type === 'flat' && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold uppercase border border-gray-200">Monotonía</span>}
                        </div>

                        <p className="text-gray-600 font-serif italic text-sm mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            "{currentIssue.text}"
                        </p>
                        
                        <AIEnhancerButton 
                            key={currentIndex}
                            componentId="detail-sismografo"
                            textToAnalyze={currentIssue.text}
                            contextLabel={currentIssue.type === 'wall' ? "Romper Muro" : "Mejorar Cadencia"}
                        />
                    </div>
                </div>
            ) : (
                <div className="mb-8 p-6 bg-green-50 border border-green-100 rounded-xl text-center text-green-700 text-sm">
                    ¡Excelente! Tu texto tiene una variedad rítmica saludable. No hay muros ni staccatos graves.
                </div>
            )}

            {/* TEXTO COMPLETO */}
            <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700 opacity-90">
               {renderText()}
            </div>
        </div>
    );
}