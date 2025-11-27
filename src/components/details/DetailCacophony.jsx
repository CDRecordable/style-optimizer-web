import React, { useState, useMemo } from 'react';
import { Music, ArrowLeft, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailCacophony({ analysis, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // 1. Preparar datos para las Timelines (Visualización Global)
    const soundData = analysis.sentenceLengths.map((_, i) => {
         const sentenceText = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s))[i] || "";
         const words = sentenceText.toLowerCase().replace(/[.,;:!?()"«»]/g, "").split(/\s+/);
         let hasShock = false;
         let hasEcho = false;

         words.forEach((w, idx) => {
             if (idx < words.length - 1) {
                 const next = words[idx+1];
                 if (w.length >= 3 && next.length >= 3 && w.slice(-2) === next.slice(0,2)) hasShock = true;
             }
             if (w.length > 4) {
                 const suffix = w.slice(-3);
                 for(let k=1; k<=3; k++) {
                     if(idx+k < words.length && words[idx+k].endsWith(suffix) && words[idx+k] !== w) hasEcho = true;
                 }
             }
         });
         return { id: i+1, hasShock, hasEcho, text: sentenceText };
    });

    // 2. DETECCIÓN DE PROBLEMAS (Para la Consola)
    const issues = useMemo(() => {
        // Filtramos solo las frases que tienen choques o ecos
        return soundData
            .map((data, idx) => (data.hasShock || data.hasEcho) ? { ...data, originalIndex: idx } : null)
            .filter(item => item !== null);
    }, [soundData]);

    const currentIssue = issues[currentIndex];

    // 3. Renderizado de Texto (Global)
    const renderText = () => {
        const paragraphs = analysis.rawText.split(/\n+/);
        return paragraphs.map((para, pIdx) => (
            <p key={pIdx} className="mb-6">
                {para.split(/(\s+)/).map((w, i, arr) => {
                    if (!w.trim()) return <span key={i}>{w}</span>;
                    const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                    let style = "";
                    
                    // Choques
                    if (i < arr.length - 2) {
                        const nextWord = arr[i+2].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                        if (clean.length >= 3 && nextWord.length >= 3 && clean.slice(-2) === nextWord.slice(0,2)) {
                            style = "bg-red-100 text-red-800 border-b-2 border-red-400 font-bold cursor-help";
                        }
                    }
                    if (i >= 2) {
                        const prevWord = arr[i-2].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                        if (prevWord.length >= 3 && clean.length >= 3 && prevWord.slice(-2) === clean.slice(0,2)) {
                            style = "bg-red-100 text-red-800 border-b-2 border-red-400 font-bold cursor-help";
                        }
                    }
                    // Ecos
                    if (!style && clean.length > 4) {
                         const suffix = clean.slice(-3);
                         let hasEcho = false;
                         for(let k=1; k<=3; k++) {
                             let idx2 = i + (k*2);
                             if(idx2 < arr.length) {
                                 const target = arr[idx2].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                 if(target.endsWith(suffix) && target !== clean) hasEcho = true;
                             }
                         }
                         for(let k=1; k<=3; k++) {
                             let idx2 = i - (k*2);
                             if(idx2 >= 0) {
                                 const target = arr[idx2].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                 if(target.endsWith(suffix) && target !== clean) hasEcho = true;
                             }
                         }
                         if(hasEcho) style = "bg-orange-100 text-orange-800 border-b-2 border-orange-300 decoration-orange-500 underline decoration-dotted";
                    }
                    return <span key={i} className={style}>{w}</span>;
                })}
            </p>
        ));
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Music className="text-red-500" /> Escáner Sonoro
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>

            {/* Panel Visual */}
            <div className="mb-8 p-6 bg-red-50 rounded-xl border border-red-100">
                <h3 className="text-sm font-bold text-red-900 mb-4 flex items-center gap-2">
                    Mapa de Incidentes Sonoros
                </h3>
                
                {/* TIMELINES */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-red-600 w-24 text-right uppercase">Choques</span>
                        <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-red-100">
                            {soundData.map((entry, index) => (
                                <div key={index} className={`flex-1 h-full ${entry.hasShock ? 'bg-red-500' : 'bg-transparent'}`} title={`Frase ${index+1}: Choque`}/>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-orange-600 w-24 text-right uppercase">Rimas</span>
                        <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-orange-100">
                            {soundData.map((entry, index) => (
                                <div key={index} className={`flex-1 h-full ${entry.hasEcho ? 'bg-orange-500' : 'bg-transparent'}`} title={`Frase ${index+1}: Rima interna`}/>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CONSOLA DE NAVEGACIÓN */}
                {issues.length > 0 ? (
                    <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden mt-6">
                        <div className="bg-red-100/50 px-4 py-2 flex justify-between items-center border-b border-red-100">
                            <span className="text-xs font-bold text-red-800 uppercase flex items-center gap-2">
                                <AlertTriangle size={14}/> Incidente {currentIndex + 1} de {issues.length}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentIndex(p => Math.max(0, p - 1))} disabled={currentIndex === 0} className="p-1 hover:bg-white rounded disabled:opacity-30 text-red-700"><ChevronLeft size={18}/></button>
                                <button onClick={() => setCurrentIndex(p => Math.min(issues.length - 1, p + 1))} disabled={currentIndex === issues.length - 1} className="p-1 hover:bg-white rounded disabled:opacity-30 text-red-700"><ChevronRight size={18}/></button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-2 mb-3">
                                {currentIssue.hasShock && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded font-bold uppercase border border-red-200">Choque Léxico</span>}
                                {currentIssue.hasEcho && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold uppercase border border-orange-200">Rima Interna</span>}
                            </div>
                            <p className="text-gray-600 font-serif italic text-sm mb-4 bg-gray-50 p-3 rounded border border-gray-100">
                                "{currentIssue.text}"
                            </p>
                            <AIEnhancerButton 
                                key={currentIndex}
                                componentId="detail-cacophony"
                                textToAnalyze={currentIssue.text}
                                contextLabel="Eliminar Cacofonías"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-red-400 italic text-sm mt-4">¡Limpio! No se detectan cacofonías evidentes.</div>
                )}
            </div>

            {/* Texto Renderizado */}
            <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                {renderText()}
            </div>
        </div>
    );
}