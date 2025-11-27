import React, { useState, useMemo } from 'react';
import { Trash2, Info, XCircle, CheckCircle2, ArrowRight, Feather, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailPleonasms({ analysis, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // DETECCIÓN DE FRASES CON PLEONASMOS
    const issues = useMemo(() => {
        if (analysis.pleonasmsFound.length === 0) return [];
        const sentences = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s));
        const list = [];
        
        sentences.forEach((text, idx) => {
            const found = analysis.pleonasmsFound.filter(p => text.toLowerCase().includes(p));
            if (found.length > 0) {
                list.push({ text: text.trim(), pleonasms: found, originalIndex: idx });
            }
        });
        return list;
    }, [analysis.rawText, analysis.pleonasmsFound]);

    const currentIssue = issues[currentIndex];

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Trash2 className="text-red-500" /> Detector de Pleonasmos
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                    <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                        <Info size={16}/> Redundancias
                    </h3>
                    <p className="text-sm text-red-800 leading-relaxed mb-4">
                        Palabras innecesarias que no añaden información ("subir arriba").
                    </p>

                    {/* CONSOLA DE CORRECCIÓN */}
                    {issues.length > 0 ? (
                        <div className="bg-white rounded-xl border border-red-200 shadow-sm mt-4">
                            <div className="bg-red-100/50 px-3 py-2 flex justify-between items-center border-b border-red-100">
                                <span className="text-xs font-bold text-red-800 uppercase">Error {currentIndex + 1} de {issues.length}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setCurrentIndex(p => Math.max(0, p-1))} disabled={currentIndex === 0} className="p-1 hover:bg-white rounded disabled:opacity-30 text-red-700"><ChevronLeft size={16}/></button>
                                    <button onClick={() => setCurrentIndex(p => Math.min(issues.length-1, p+1))} disabled={currentIndex === issues.length-1} className="p-1 hover:bg-white rounded disabled:opacity-30 text-red-700"><ChevronRight size={16}/></button>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-600 font-serif italic text-sm mb-3">"{currentIssue.text}"</p>
                                <div className="flex gap-2 mb-3">
                                    {currentIssue.pleonasms.map((p, i) => <span key={i} className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold uppercase line-through decoration-red-500">{p}</span>)}
                                </div>
                                <AIEnhancerButton 
                                    key={currentIndex}
                                    componentId="detail-pleonasms"
                                    textToAnalyze={currentIssue.text}
                                    contextLabel="Poda Lógica"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-white rounded-lg border border-red-100 text-center text-gray-400 text-sm">
                            ¡Limpio! No se detectan pleonasmos.
                        </div>
                    )}
                </div>
                
                {/* Ejemplo Visual */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <h3 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider text-center">Ejemplo Esquemático</h3>
                    <div className="flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold mb-1 line-through decoration-red-400">Cita previa</span>
                            <XCircle size={20} className="text-red-400"/>
                        </div>
                        <ArrowRight className="text-gray-300"/>
                        <div className="flex flex-col items-center">
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-1">Cita</span>
                            <CheckCircle2 size={20} className="text-green-500"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista Completa (Legacy) */}
            {analysis.pleonasmsFound.length > 0 && (
                <div className="grid gap-4 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="bg-white p-2 border-b border-gray-100 text-gray-400 text-sm font-bold uppercase mb-2">
                        Listado Total
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {analysis.pleonasmsFound.map((p, i) => (
                            <li key={i} className="flex items-center p-3 bg-white border border-gray-100 rounded-lg">
                                <span className="font-bold text-gray-700 capitalize text-sm">"{p}"</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}