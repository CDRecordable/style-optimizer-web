import React, { useState, useMemo } from 'react';
import { Layers, Activity, ArrowLeft, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { SUFIJOS_ADJETIVOS, STOPWORDS } from '../../utils/textAnalyzer';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailMetrics({ analysis, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // 1. DETECCIÓN DE PROBLEMAS (Consola)
    const styleIssues = useMemo(() => {
        const sentences = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s));
        const list = [];

        sentences.forEach((text, idx) => {
            const words = text.split(/\s+/);
            const cleanWords = words.map(w => w.toLowerCase().replace(/[.,;:!?]/g, ""));
            
            // Buscamos vicios en esta frase
            const mentes = cleanWords.filter(w => w.endsWith("mente") && w.length > 5);
            const ciones = cleanWords.filter(w => (w.endsWith("ción") || w.endsWith("cion")) && w.length > 4);
            
            // Detectar Clusters de Adjetivos
            let hasCluster = false;
            for(let i=0; i < cleanWords.length - 1; i++) {
                const w1 = cleanWords[i];
                const w2 = cleanWords[i+1];
                const isAdj = (w) => SUFIJOS_ADJETIVOS.some(s => w.endsWith(s));
                if (!STOPWORDS.has(w1) && isAdj(w1) && isAdj(w2) && !STOPWORDS.has(w2)) {
                    hasCluster = true;
                }
            }

            if (mentes.length > 0 || ciones.length > 0 || hasCluster) {
                list.push({ 
                    text: text.trim(), 
                    details: { mentes, ciones, hasCluster },
                    originalIndex: idx 
                });
            }
        });
        return list;
    }, [analysis.rawText]);

    const currentIssue = styleIssues[currentIndex];

    // 2. Renderizado de Texto (Visualización Global)
    const renderText = () => {
        const paragraphs = analysis.rawText.split(/\n+/);
        return paragraphs.map((para, pIdx) => (
            <p key={pIdx} className="mb-6">
                {para.split(/(\s+)/).map((w, i, arr) => {
                    const clean = w.toLowerCase().replace(/[.,;:!?]/g, "");
                    let style = "";
                    
                    if (clean.endsWith("mente") && clean.length > 5) style += " bg-purple-100 text-purple-900 border-b-2 border-purple-300";
                    if ((clean.endsWith("ción") || clean.endsWith("cion")) && clean.length > 4) style += " bg-indigo-100 text-indigo-900 border-b-2 border-indigo-300";
                    
                    const isAdj = (word) => SUFIJOS_ADJETIVOS.some(s => word && word.endsWith(s));
                    let isClusterPart = false;
                    if (!STOPWORDS.has(clean) && isAdj(clean)) {
                        if (i < arr.length - 1 && isAdj(arr[i+1].toLowerCase().replace(/[.,;:!?]/g,"")) && !STOPWORDS.has(arr[i+1])) isClusterPart = true;
                        if (i > 0 && isAdj(arr[i-1].toLowerCase().replace(/[.,;:!?]/g,"")) && !STOPWORDS.has(arr[i-1])) isClusterPart = true;
                    }
                    if (isClusterPart) style = " bg-orange-100 text-orange-900 border-b-2 border-orange-300 font-medium"; 

                    return <span key={i} className={style}>{w}</span>;
                })}
            </p>
        ));
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Layers className="text-purple-500" /> Densidad y Estilo
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>

            <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <Activity size={16}/> Mapa de Calor Estilístico
                </h3>
                
                {/* TIMELINES (Igual que antes, solo visualización) */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex items-center gap-4">
                         <div className="w-24 text-right"><span className="block text-xs font-bold text-purple-600 uppercase">-mente</span></div>
                         <div className="flex-1 h-4 bg-gray-200 rounded flex overflow-hidden">{analysis.metricsTimeline.map((m, i) => (<div key={i} className={`flex-1 h-full ${m.mente > 0 ? 'bg-purple-500' : 'bg-transparent'}`}/>))}</div>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="w-24 text-right"><span className="block text-xs font-bold text-indigo-600 uppercase">-ción</span></div>
                         <div className="flex-1 h-4 bg-gray-200 rounded flex overflow-hidden">{analysis.metricsTimeline.map((m, i) => (<div key={i} className={`flex-1 h-full ${m.cion > 0 ? 'bg-indigo-500' : 'bg-transparent'}`}/>))}</div>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="w-24 text-right"><span className="block text-xs font-bold text-orange-600 uppercase">Adj+</span></div>
                         <div className="flex-1 h-4 bg-gray-200 rounded flex overflow-hidden">{analysis.metricsTimeline.map((m, i) => (<div key={i} className={`flex-1 h-full ${m.adj > 0 ? 'bg-orange-500' : 'bg-transparent'}`}/>))}</div>
                    </div>
                </div>

                {/* CONSOLA DE NAVEGACIÓN DE ERRORES */}
                {styleIssues.length > 0 ? (
                    <div className="bg-white rounded-xl border border-purple-200 shadow-sm overflow-hidden">
                        <div className="bg-purple-50 px-4 py-2 flex justify-between items-center border-b border-purple-100">
                            <span className="text-xs font-bold text-purple-800 uppercase flex items-center gap-2">
                                <Info size={14}/> Detección {currentIndex + 1} de {styleIssues.length}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0} className="p-1 hover:bg-white rounded disabled:opacity-50 text-purple-600"><ChevronLeft size={18}/></button>
                                <button onClick={() => setCurrentIndex(p => Math.min(styleIssues.length - 1, p + 1))} disabled={currentIndex === styleIssues.length - 1} className="p-1 hover:bg-white rounded disabled:opacity-50 text-purple-600"><ChevronRight size={18}/></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex gap-2 mb-3">
                                {currentIssue.details.mentes.length > 0 && <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-1 rounded font-bold uppercase">-MENTE</span>}
                                {currentIssue.details.ciones.length > 0 && <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-bold uppercase">-CIÓN</span>}
                                {currentIssue.details.hasCluster && <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-1 rounded font-bold uppercase">ADJETIVOS</span>}
                            </div>
                            <p className="text-gray-600 font-serif italic text-sm mb-4 bg-gray-50 p-3 rounded border border-gray-100">
                                "{currentIssue.text}"
                            </p>
                            <AIEnhancerButton 
                                key={currentIndex}
                                componentId="detail-metrics"
                                textToAnalyze={currentIssue.text}
                                contextLabel="Limpiar Estilo"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 italic text-sm">Texto limpio de vicios estilísticos comunes.</div>
                )}
            </div>

            <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                {renderText()}
            </div>
        </div>
    );
}