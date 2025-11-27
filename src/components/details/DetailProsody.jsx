import React, { useState, useMemo } from 'react';
import { Mic2, Activity, ArrowLeft, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { STOPWORDS } from '../../utils/textAnalyzer'; 

export default function DetailProsody({ analysis, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // SEGURIDAD: Si por lo que sea el análisis no viene bien, evitamos el crash
    if (!analysis || !analysis.rhythmAnalysis) return null;

    // 1. DETECCIÓN DE PATRONES RÍTMICOS (Consola)
    const rhythmicIssues = useMemo(() => {
        return analysis.rhythmAnalysis
            .map((data, idx) => {
                if (data.highlights && data.highlights.length > 0) {
                    // Determinamos el tipo dominante
                    const types = data.highlights.map(h => h.type);
                    // Encontrar el más frecuente
                    const mainType = types.sort((a,b) => 
                        types.filter(v => v===a).length - types.filter(v => v===b).length
                    ).pop();
                    return { ...data, originalIndex: idx, mainType };
                }
                return null;
            })
            .filter(item => item !== null);
    }, [analysis.rhythmAnalysis]);

    const currentIssue = rhythmicIssues[currentIndex];

    // Helper para colorear la rejilla
    const getGridColor = (sentenceData, typeToCheck) => {
        const hasType = sentenceData.highlights.some(h => h.type === typeToCheck);
        if (!hasType) return "bg-gray-100"; // Celda vacía
        
        if (typeToCheck === 'Dactílico') return "bg-indigo-500";
        if (typeToCheck === 'Anfíbraco') return "bg-emerald-500";
        if (typeToCheck === 'Trocaico') return "bg-amber-500";
        return "bg-gray-200";
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Mic2 className="text-indigo-500" /> Escáner Prosódico
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>

            {/* GRÁFICO TIPO REJILLA (HEATMAP) - A PRUEBA DE FALLOS */}
            <div className="mb-10 p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <Activity size={16}/> Partitura Rítmica (Evolución)
                </h3>
                
                <div className="space-y-6">
                    {/* Carril DACTÍLICO */}
                    <div className="flex items-center gap-4">
                        <div className="w-24 text-right shrink-0">
                            <span className="block text-[10px] font-bold text-indigo-600 uppercase">Dactílico</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-wide">(Vals)</span>
                        </div>
                        <div className="flex-1 flex gap-0.5 h-4 w-full bg-gray-200/50 rounded overflow-hidden">
                            {analysis.rhythmAnalysis.map((s, i) => (
                                <div 
                                    key={i} 
                                    className={`flex-1 h-full transition-colors ${getGridColor(s, 'Dactílico')}`}
                                    title={`Frase ${i+1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Carril ANFÍBRACO */}
                    <div className="flex items-center gap-4">
                        <div className="w-24 text-right shrink-0">
                            <span className="block text-[10px] font-bold text-emerald-600 uppercase">Anfíbraco</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-wide">(Narrativo)</span>
                        </div>
                        <div className="flex-1 flex gap-0.5 h-4 w-full bg-gray-200/50 rounded overflow-hidden">
                            {analysis.rhythmAnalysis.map((s, i) => (
                                <div 
                                    key={i} 
                                    className={`flex-1 h-full transition-colors ${getGridColor(s, 'Anfíbraco')}`}
                                    title={`Frase ${i+1}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Carril TROCAICO */}
                    <div className="flex items-center gap-4">
                        <div className="w-24 text-right shrink-0">
                            <span className="block text-[10px] font-bold text-amber-600 uppercase">Trocaico</span>
                            <span className="text-[9px] text-gray-400 uppercase tracking-wide">(Machacón)</span>
                        </div>
                        <div className="flex-1 flex gap-0.5 h-4 w-full bg-gray-200/50 rounded overflow-hidden">
                            {analysis.rhythmAnalysis.map((s, i) => (
                                <div 
                                    key={i} 
                                    className={`flex-1 h-full transition-colors ${getGridColor(s, 'Trocaico')}`}
                                    title={`Frase ${i+1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* CONSOLA DE NAVEGACIÓN */}
                {rhythmicIssues.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
                        <div className="bg-indigo-50/50 px-3 py-2 flex justify-between items-center border-b border-indigo-100">
                            <span className="text-xs font-bold text-indigo-800 uppercase flex items-center gap-2">
                                <MusicNoteIcon type={currentIssue.mainType} /> 
                                Detectado ({currentIndex + 1}/{rhythmicIssues.length})
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentIndex(p => Math.max(0, p-1))} disabled={currentIndex === 0} className="p-1 hover:bg-white rounded disabled:opacity-30 text-indigo-600"><ChevronLeft size={16}/></button>
                                <button onClick={() => setCurrentIndex(p => Math.min(rhythmicIssues.length-1, p+1))} disabled={currentIndex === rhythmicIssues.length-1} className="p-1 hover:bg-white rounded disabled:opacity-30 text-indigo-600"><ChevronRight size={16}/></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-600 font-serif italic text-sm mb-2">"...{currentIssue.text}..."</p>
                            <div className="text-xs text-indigo-400 mt-2 flex items-center gap-2">
                                <Info size={12} />
                                <span>Frase con predominio de ritmo <strong>{currentIssue.mainType}</strong>.</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* TEXTO ANALIZADO */}
            <div className="space-y-6 font-serif text-lg leading-relaxed text-gray-700 mb-8">
                {analysis.rhythmAnalysis.map((sentData, idx) => {
                    if (!sentData) return null;
                    if (!sentData.highlights || sentData.highlights.length === 0) {
                        return <p key={idx} className="mb-2 opacity-70">{sentData.text}</p>;
                    }
                    
                    return (
                        <div key={idx} className="p-4 rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all bg-white relative group">
                            <span className="absolute top-2 right-2 text-xs font-sans font-bold text-gray-300">Frase {idx+1}</span>
                            <div className="flex flex-wrap gap-x-3 gap-y-4 items-end leading-none">
                                {sentData.prosody.map((w, wIdx) => {
                                    const highlight = sentData.highlights.find(h => wIdx >= h.startWordIdx && wIdx <= h.endWordIdx);
                                    let containerClass = "flex flex-col items-center group relative p-1 rounded";
                                    let label = null;
                                    
                                    if (highlight) {
                                        if (highlight.type === 'Dactílico') { containerClass += " bg-indigo-50 text-indigo-900"; if(wIdx===highlight.startWordIdx) label="Dáctilo"; }
                                        else if (highlight.type === 'Anfíbraco') { containerClass += " bg-emerald-50 text-emerald-900"; if(wIdx===highlight.startWordIdx) label="Anfíbraco"; }
                                        else if (highlight.type === 'Trocaico') { containerClass += " bg-amber-50 text-amber-900"; if(wIdx===highlight.startWordIdx) label="Troqueo"; }
                                    }

                                    return (
                                        <div key={wIdx} className={containerClass}>
                                            {label && <span className="absolute -top-4 left-0 text-[9px] font-sans font-bold uppercase tracking-wider text-gray-400">{label}</span>}
                                            <div className="flex gap-[2px] mb-2">
                                                {w.syllableMap.map((isStressed, sIdx) => (
                                                    <div key={sIdx} className={`rounded-full transition-all ${isStressed && !STOPWORDS.has(w.clean) ? 'bg-indigo-600 w-2 h-2' : 'bg-gray-200 w-1.5 h-1.5'}`} />
                                                ))}
                                            </div>
                                            <span>{w.clean}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Helper de Icono
const MusicNoteIcon = ({ type }) => {
    if (type === 'Dactílico') return <span className="text-indigo-600">Dactílico (Vals) 🎵</span>;
    if (type === 'Anfíbraco') return <span className="text-emerald-600">Anfíbraco (Narrativo) 📖</span>;
    return <span className="text-amber-600">Trocaico (Machacón) 🥁</span>;
};