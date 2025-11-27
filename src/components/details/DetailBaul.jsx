import React, { useState, useMemo } from 'react';
import { Package, ArrowLeft, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { PALABRAS_BAUL } from '../../utils/textAnalyzer';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailBaul({ analysis, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // DETECCIÓN DE PROBLEMAS
    const baulIssues = useMemo(() => {
        const sentences = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s));
        const issues = [];
        sentences.forEach((text, idx) => {
            const words = text.toLowerCase().split(/\s+/);
            const foundBaul = words.filter(w => PALABRAS_BAUL.has(w.replace(/[^\w]/g, ''))); // Limpieza básica
            if (foundBaul.length > 0) {
                issues.push({ text: text.trim(), words: foundBaul, originalIndex: idx });
            }
        });
        return issues;
    }, [analysis.rawText]);

    const currentIssue = baulIssues[currentIndex];

    // Renderizado Texto
    const renderText = () => {
        const paragraphs = analysis.rawText.split(/\n+/);
        return paragraphs.map((para, pIdx) => (
            <p key={pIdx} className="mb-6">
                {para.split(/(\s+)/).map((w, i) => {
                    const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                    const isBaul = PALABRAS_BAUL.has(clean);
                    return <span key={i} className={isBaul ? "bg-orange-100 text-orange-900 border-b-2 border-orange-300 px-1 rounded font-bold" : ""}>{w}</span>
                })}
            </p>
        ));
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Package className="text-orange-500" /> Palabras Baúl</h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                    <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2"><Info size={16}/> ¿Qué son?</h3>
                    <p className="text-sm text-orange-800 mb-4">Términos vagos como <i>"cosa", "algo", "hacer"</i> que diluyen la precisión.</p>
                    
                    {/* CONSOLA */}
                    {baulIssues.length > 0 ? (
                        <div className="bg-white rounded-xl border border-orange-200 shadow-sm">
                            <div className="bg-orange-100/50 px-3 py-2 flex justify-between items-center border-b border-orange-100">
                                <span className="text-xs font-bold text-orange-800 uppercase">Imprecisión {currentIndex + 1} de {baulIssues.length}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => setCurrentIndex(p => Math.max(0, p-1))} disabled={currentIndex === 0} className="p-1 hover:bg-white rounded disabled:opacity-30 text-orange-700"><ChevronLeft size={16}/></button>
                                    <button onClick={() => setCurrentIndex(p => Math.min(baulIssues.length-1, p+1))} disabled={currentIndex === baulIssues.length-1} className="p-1 hover:bg-white rounded disabled:opacity-30 text-orange-700"><ChevronRight size={16}/></button>
                                </div>
                            </div>
                            <div className="p-4">
                                <p className="text-gray-600 font-serif italic text-sm mb-3">"{currentIssue.text}"</p>
                                <div className="flex gap-2 mb-3">
                                    {currentIssue.words.map((w, i) => <span key={i} className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold uppercase">{w}</span>)}
                                </div>
                                <AIEnhancerButton key={currentIndex} componentId="detail-baul" textToAnalyze={currentIssue.text} contextLabel="Precisar Vocabulario" />
                            </div>
                        </div>
                    ) : <p className="text-sm text-orange-600 italic">Texto limpio de palabras baúl.</p>}
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Distribución</h3>
                    <div className="h-12 w-full bg-gray-100 rounded-full relative flex items-center overflow-hidden">
                        {analysis.baulTimeline.map((item, idx) => (
                            <div key={idx} className="absolute w-1 h-full bg-orange-500 opacity-50" style={{ left: `${item.position * 100}%` }} />
                        ))}
                    </div>
                </div>
            </div>
            <div className="prose max-w-none text-lg text-gray-700 font-serif">{renderText()}</div>
        </div>
    );
}