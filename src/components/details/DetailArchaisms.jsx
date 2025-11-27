import React, { useState, useMemo } from 'react';
// IMPORTANTE: Añadido ArrowRight a la lista
import { Scroll, ArrowLeft, ArrowRight, Sparkles, Search, ChevronLeft, ChevronRight, Info, BookOpen, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useUserContext } from '../../context/UserContext';
import { callAI } from '../../services/aiService';
import { getPrompt } from '../../services/aiPrompts';
import PaywallModal from '../common/PaywallModal';

export default function DetailArchaisms({ analysis, onBack }) {
    const { aiConfig, tone } = useAppContext();
    const { isPremium } = useUserContext();
    
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState(null); 
    const [currentResultIndex, setCurrentResultIndex] = useState(0); 
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0); 
    const [showPaywall, setShowPaywall] = useState(false);
    const [error, setError] = useState(null);

    // DIVIDIR TEXTO EN BLOQUES
    const textBlocks = useMemo(() => {
        const paragraphs = analysis.rawText.split(/\n+/);
        const blocks = [];
        let currentChunk = "";
        paragraphs.forEach(p => {
            if ((currentChunk.length + p.length) > 2500) {
                blocks.push(currentChunk);
                currentChunk = p;
            } else {
                currentChunk += (currentChunk ? "\n\n" : "") + p;
            }
        });
        if (currentChunk) blocks.push(currentChunk);
        return blocks;
    }, [analysis.rawText]);

    const currentText = textBlocks[currentBlockIndex];

    const extractJSON = (text) => {
        try {
            return JSON.parse(text);
        } catch (e) {
            const firstBrace = text.indexOf('{');
            const lastBrace = text.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                try { return JSON.parse(text.substring(firstBrace, lastBrace + 1)); } catch(e2) {}
            }
            throw new Error("La IA no devolvió un formato válido.");
        }
    };

    const handleScanBlock = async () => {
        if (!isPremium) { setShowPaywall(true); return; }

        setScanning(true);
        setError(null);
        setResults(null); 
        setCurrentResultIndex(0);
        
        try {
            const prompt = getPrompt('detail-archaisms', tone, currentText);
            
            const response = await callAI(
                aiConfig.provider, 
                aiConfig.apiKey, 
                prompt, 
                aiConfig.model, 
                'detail-archaisms'
            );
            
            const data = extractJSON(response);
            
            if (data.archaisms && Array.isArray(data.archaisms)) {
                setResults(data.archaisms);
            } else {
                setResults([]); 
            }
        } catch (err) {
            console.error("Scan Error:", err);
            setError(err.message || "Error al escanear este bloque.");
        } finally {
            setScanning(false);
        }
    };

    const renderText = () => {
        if (!results || results.length === 0) return <p className="text-gray-600 whitespace-pre-wrap">{currentText}</p>;

        const currentWord = results[currentResultIndex].word;
        const safeWord = currentWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = currentText.split(new RegExp(`(${safeWord})`, 'gi'));
        
        return (
            <p className="whitespace-pre-wrap">
                {parts.map((part, i) => 
                    part.toLowerCase() === currentWord.toLowerCase() ? (
                        <span key={i} className="bg-amber-200 text-amber-900 px-1 rounded border-b-2 border-amber-500 font-bold animate-pulse scroll-mt-20" id="highlighted-word">
                            {part}
                        </span>
                    ) : (
                        <span key={i} className={part.toLowerCase().includes(currentWord.toLowerCase()) ? "" : "opacity-70"}>
                            {part}
                        </span>
                    )
                )}
            </p>
        );
    };

    const goToNextBlock = () => {
        if (currentBlockIndex < textBlocks.length - 1) {
            setCurrentBlockIndex(prev => prev + 1);
            setResults(null); 
        }
    };

    const goToPrevBlock = () => {
        if (currentBlockIndex > 0) {
            setCurrentBlockIndex(prev => prev - 1);
            setResults(null);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[600px] animate-in fade-in slide-in-from-right-4 duration-300 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            <div className="flex justify-between items-center mb-6 border-b pb-4 relative z-10">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Scroll className="text-amber-600" /> Detector de Arcaísmos
                    <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-2 border border-amber-200">
                        PRO AI
                    </span>
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200 mb-6 relative z-10">
                <button onClick={goToPrevBlock} disabled={currentBlockIndex === 0} className="p-2 hover:bg-white rounded-md disabled:opacity-30 transition text-gray-600">
                    <ChevronLeft size={20}/>
                </button>
                
                <div className="flex flex-col items-center w-full px-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Analizando Bloque {currentBlockIndex + 1} de {textBlocks.length}
                    </span>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${((currentBlockIndex + 1) / textBlocks.length) * 100}%` }}></div>
                    </div>
                </div>

                <button onClick={goToNextBlock} disabled={currentBlockIndex === textBlocks.length - 1} className="p-2 hover:bg-white rounded-md disabled:opacity-30 transition text-gray-600">
                    <ChevronRight size={20}/>
                </button>
            </div>

            <div className="flex-grow relative z-10">
                
                {!results && !scanning && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-amber-100 rounded-xl bg-amber-50/30">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 text-amber-600">
                                <Search size={32}/>
                            </div>
                            <p className="text-gray-500 mb-6 text-center max-w-md">
                                Este bloque aún no ha sido analizado. Pulsa para buscar vocabulario antiguo.
                            </p>
                            <button onClick={handleScanBlock} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center gap-2">
                                <Sparkles size={18}/> Escanear Bloque {currentBlockIndex + 1}
                            </button>
                        </div>
                        <div className="opacity-50 hover:opacity-100 transition-opacity">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Contenido del Bloque:</p>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-600 font-serif leading-relaxed max-h-60 overflow-y-auto">
                                {currentText}
                            </div>
                        </div>
                    </div>
                )}

                {scanning && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                        <p className="text-amber-700 font-medium animate-pulse">Consultando a la IA...</p>
                    </div>
                )}

                {results && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white border border-amber-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${results.length > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    <span className="text-xs font-bold text-amber-900 uppercase">
                                        {results.length > 0 ? `Hallazgo ${currentResultIndex + 1} de ${results.length}` : 'Sin Arcaísmos'}
                                    </span>
                                </div>
                                {results.length > 0 && (
                                    <div className="flex gap-1">
                                        <button onClick={() => setCurrentResultIndex(p => Math.max(0, p - 1))} disabled={currentResultIndex === 0} className="p-1 hover:bg-white rounded text-amber-700 disabled:opacity-30"><ChevronLeft size={18}/></button>
                                        <button onClick={() => setCurrentResultIndex(p => Math.min(results.length - 1, p + 1))} disabled={currentResultIndex === results.length - 1} className="p-1 hover:bg-white rounded text-amber-700 disabled:opacity-30"><ChevronRight size={18}/></button>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                {results.length > 0 ? (
                                    <div>
                                        <div className="flex items-baseline gap-3 mb-2">
                                            <h3 className="text-2xl font-serif font-bold text-gray-800 capitalize">"{results[currentResultIndex].word}"</h3>
                                            <ArrowRight size={16} className="text-gray-400"/>
                                            <span className="text-xl font-bold text-emerald-600">{results[currentResultIndex].suggestion}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex gap-3 items-start">
                                            <Info size={16} className="text-gray-400 mt-0.5 shrink-0"/>
                                            <p className="text-sm text-gray-600 leading-relaxed">{results[currentResultIndex].reason}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-500">
                                        <p>¡Todo limpio! No se detectaron términos obsoletos en este bloque.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border-t-4 border-amber-400 shadow-inner">
                            <div className="text-lg text-gray-700 font-serif leading-relaxed">
                                {renderText()}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            {currentBlockIndex < textBlocks.length - 1 && (
                                <button onClick={goToNextBlock} className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition">
                                    Siguiente Bloque <ChevronRight size={16}/>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} featureName="Detector de Arcaísmos con IA" />}
            {error && <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-lg text-center text-sm">{error}</div>}
        </div>
    );
}