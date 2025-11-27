import React, { useState, useMemo } from 'react';
import { UserX, AlertTriangle, ArrowLeft, Info, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailPassive({ analysis, onBack }) {
    const [currentIssueIndex, setCurrentIssueIndex] = useState(0);
    
    // 1. Datos del gráfico
    const activeSentences = analysis.sentenceCount - analysis.passiveCount;
    const data = [
        { name: 'Activa', value: activeSentences },
        { name: 'Pasiva', value: analysis.passiveCount },
    ];
    const COLORS = ['#4ade80', '#94a3b8']; 

    // 2. DETECCIÓN DE PROBLEMAS (Consola)
    const passiveIssues = useMemo(() => {
        const sentences = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s));
        
        return sentences.map((text, idx) => {
            const lower = text.toLowerCase();
            // Lógica simple de detección (la misma que usábamos para contar)
            const isPassive = lower.includes('fue ') || lower.includes('sido ') || lower.includes('fueron ') || lower.includes('se ');
            if (isPassive) return { text: text.trim(), originalIndex: idx };
            return null;
        }).filter(item => item !== null);
    }, [analysis.rawText]);

    const currentIssue = passiveIssues[currentIssueIndex];

    // 3. Renderizado de texto completo
    const renderText = () => {
        const paragraphs = analysis.rawText.split(/\n+/);
        return paragraphs.map((para, pIdx) => (
            <p key={pIdx} className="mb-6">
                {para.split(/(\s+)/).map((w, i) => {
                    if (!/\w+/.test(w)) return <span key={i}>{w}</span>;
                    const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                    const isPassive = (clean === 'se' || clean === 'fue' || clean === 'fueron' || clean === 'sido');
                    return (
                        <span key={i} className={isPassive ? "bg-slate-200 text-slate-800 font-bold border-b-2 border-slate-400 px-1 rounded cursor-help" : ""}>
                            {w}
                        </span>
                    );
                })}
            </p>
        ));
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <UserX className="text-gray-500" /> Voz Pasiva e Impersonal
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                <div className="w-full md:w-1/3 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" dataKey="value" paddingAngle={5}>
                                {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="w-full md:w-2/3 space-y-3">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><AlertTriangle className="text-amber-500" size={20}/> ¿Por qué evitarla?</h3>
                    <p className="text-sm text-slate-600 mb-4">La voz pasiva ("fue hecho por") oculta al responsable y alarga la frase. En español, suena burocrática.</p>
                    
                    {/* CONSOLA DE NAVEGACIÓN */}
                    {passiveIssues.length > 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mt-4">
                            <div className="bg-slate-100 px-3 py-2 flex justify-between items-center border-b border-slate-200">
                                <span className="text-xs font-bold text-slate-600 uppercase">Caso {currentIssueIndex + 1} de {passiveIssues.length}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setCurrentIssueIndex(prev => Math.max(0, prev - 1))} disabled={currentIssueIndex === 0} className="p-1 hover:bg-white rounded disabled:opacity-30"><ChevronLeft size={16}/></button>
                                    <button onClick={() => setCurrentIssueIndex(prev => Math.min(passiveIssues.length - 1, prev + 1))} disabled={currentIssueIndex === passiveIssues.length - 1} className="p-1 hover:bg-white rounded disabled:opacity-30"><ChevronRight size={16}/></button>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-600 font-serif italic text-sm mb-3 bg-slate-50 p-2 rounded border border-slate-100">"...{currentIssue.text}..."</p>
                                <AIEnhancerButton 
                                    key={currentIssueIndex}
                                    componentId="detail-passive"
                                    textToAnalyze={currentIssue.text}
                                    contextLabel="Activar Sujeto"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-green-50 text-green-700 text-sm rounded-lg border border-green-100">¡Excelente! No se detectan construcciones pasivas graves.</div>
                    )}
                </div>
            </div>

            <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">{renderText()}</div>
        </div>
    );
}