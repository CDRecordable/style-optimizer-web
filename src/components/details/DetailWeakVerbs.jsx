import React, { useState, useMemo } from 'react';
import { Zap, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailWeakVerbs({ analysis, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Encontrar frases que contienen los pares detectados
    const issues = useMemo(() => {
        const sentences = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s));
        const list = [];
        sentences.forEach((text, idx) => {
            // analysis.weakAdverbs es un array de strings ["corrió rápidamente", ...]
            const found = analysis.weakAdverbs.filter(pair => text.toLowerCase().includes(pair));
            if (found.length > 0) list.push({ text: text.trim(), pairs: found, originalIndex: idx });
        });
        return list;
    }, [analysis.rawText, analysis.weakAdverbs]);

    const currentIssue = issues[currentIndex];

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Zap className="text-purple-600" /> Fuerza Verbal</h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
            </div>

            {issues.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Zap size={48} className="mx-auto mb-4 opacity-20"/>
                    <p className="text-xl">¡Excelente! Tus verbos parecen fuertes y directos.</p>
                </div>
            ) : (
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-purple-900 mb-2">Construcciones Débiles</h3>
                            <p className="text-sm text-purple-700">El uso de "Verbo + Adverbio" suele indicar un verbo débil.</p>
                        </div>
                    </div>

                    {/* CONSOLA */}
                    <div className="bg-white rounded-xl border border-purple-200 shadow-sm">
                        <div className="bg-purple-100/50 px-3 py-2 flex justify-between items-center border-b border-purple-100">
                            <span className="text-xs font-bold text-purple-800 uppercase">Debilidad {currentIndex + 1} de {issues.length}</span>
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentIndex(p => Math.max(0, p-1))} disabled={currentIndex === 0} className="p-1 hover:bg-white rounded disabled:opacity-30 text-purple-700"><ChevronLeft size={16}/></button>
                                <button onClick={() => setCurrentIndex(p => Math.min(issues.length-1, p+1))} disabled={currentIndex === issues.length-1} className="p-1 hover:bg-white rounded disabled:opacity-30 text-purple-700"><ChevronRight size={16}/></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-600 font-serif italic text-sm mb-3">"{currentIssue.text}"</p>
                            <div className="flex gap-2 mb-3">
                                {currentIssue.pairs.map((p, i) => <span key={i} className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold uppercase line-through decoration-red-400">{p}</span>)}
                            </div>
                            <AIEnhancerButton key={currentIndex} componentId="detail-weakverbs" textToAnalyze={currentIssue.text} contextLabel="Potenciar Verbos" />
                        </div>
                    </div>
                </div>
            )}
            
            {/* Lista completa abajo (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.weakAdverbs.map((pair, i) => (
                    <div key={i} className="flex flex-col bg-white p-4 rounded shadow-sm border border-gray-100">
                        <span className="text-xs text-gray-400 font-bold uppercase mb-1">Detectado</span>
                        <span className="text-red-500 font-medium line-through decoration-red-300 mb-2 block">{pair}</span>
                        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center gap-2 text-green-600 text-sm font-bold"><ArrowRight size={14}/> <span>¿Verbo fuerte?</span></div>
                    </div>
                ))}
            </div>
        </div>
    );
}