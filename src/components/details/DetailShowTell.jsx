import React, { useState, useMemo } from 'react';
import { Eye, ArrowLeft, Sparkles, Search, ChevronLeft, ChevronRight, Info, BookOpen, RefreshCw, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useUserContext } from '../../context/UserContext';
import { callAI } from '../../services/aiService';
import { getPrompt } from '../../services/aiPrompts';
import PaywallModal from '../common/PaywallModal';

export default function DetailShowTell({ analysis, onBack }) {
    const { aiConfig, tone } = useAppContext();
    const { isPremium } = useUserContext();
    
    const [scanning, setScanning] = useState(false);
    const [results, setResults] = useState(null);
    const [currentResultIndex, setCurrentResultIndex] = useState(0);
    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
    const [showPaywall, setShowPaywall] = useState(false);
    const [error, setError] = useState(null);

    // Paginación de Texto (igual que en Arcaísmos)
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
        try { return JSON.parse(text); } 
        catch (e) {
            const first = text.indexOf('{'); const last = text.lastIndexOf('}');
            if (first !== -1 && last !== -1) {
                try { return JSON.parse(text.substring(first, last + 1)); } catch(e2) {}
            }
            throw new Error("Formato inválido de IA.");
        }
    };

    const handleScanBlock = async () => {
        if (!isPremium) { setShowPaywall(true); return; }

        setScanning(true);
        setError(null);
        setResults(null);
        setCurrentResultIndex(0);
        
        try {
            const prompt = getPrompt('detail-showtell', tone, currentText);
            const response = await callAI(aiConfig.provider, aiConfig.apiKey, prompt, aiConfig.model, 'detail-showtell');
            const data = extractJSON(response);
            
            setResults(data.issues || []);

        } catch (err) {
            console.error("Scan Error:", err);
            setError(err.message || "Error al analizar el texto.");
        } finally {
            setScanning(false);
        }
    };

    // Renderizado inteligente con resaltado
    const renderText = () => {
        if (!results || results.length === 0) return <p className="text-gray-600 whitespace-pre-wrap">{currentText}</p>;

        const currentQuote = results[currentResultIndex].quote;
        // Limpieza de quote para regex (escapar caracteres raros)
        const safeQuote = currentQuote.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const parts = currentText.split(new RegExp(`(${safeQuote})`, 'gi'));
        
        return (
            <p className="whitespace-pre-wrap leading-relaxed">
                {parts.map((part, i) => 
                    part.toLowerCase() === currentQuote.toLowerCase() ? (
                        <span key={i} className="bg-green-100 text-green-900 px-1 rounded border-b-2 border-green-400 font-medium animate-pulse scroll-mt-20" id="highlighted-issue">
                            {part}
                        </span>
                    ) : (
                        <span key={i} className={part.toLowerCase().includes(currentQuote.toLowerCase()) ? "" : "opacity-70"}>
                            {part}
                        </span>
                    )
                )}
            </p>
        );
    };

    // Navegación
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b pb-4 relative z-10">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Eye className="text-green-600" /> Show, Don't Tell
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ml-2 border border-green-200">
                        PRO AI
                    </span>
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>

            {/* Barra de Progreso */}
            <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200 mb-6 relative z-10">
                <button onClick={goToPrevBlock} disabled={currentBlockIndex === 0} className="p-2 hover:bg-white rounded-md disabled:opacity-30 transition text-gray-600"><ChevronLeft size={20}/></button>
                <div className="flex flex-col items-center w-full px-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Analizando Bloque {currentBlockIndex + 1} de {textBlocks.length}</span>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${((currentBlockIndex + 1) / textBlocks.length) * 100}%` }}></div></div>
                </div>
                <button onClick={goToNextBlock} disabled={currentBlockIndex === textBlocks.length - 1} className="p-2 hover:bg-white rounded-md disabled:opacity-30 transition text-gray-600"><ChevronRight size={20}/></button>
            </div>

            <div className="flex-grow relative z-10">
                
                {/* ESTADO 1: INICIO */}
                {!results && !scanning && (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-green-100 rounded-xl bg-green-50/30">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600"><Search size={32}/></div>
                            <p className="text-gray-500 mb-6 text-center max-w-md">La IA buscará descripciones abstractas ("telling") y te sugerirá cómo convertirlas en experiencias sensoriales ("showing").</p>
                            <button onClick={handleScanBlock} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all flex items-center gap-2">
                                <Sparkles size={18}/> Analizar Narrativa
                            </button>
                        </div>
                        <div className="opacity-50 hover:opacity-100 transition-opacity">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Bloque actual:</p>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm text-gray-600 font-serif leading-relaxed max-h-40 overflow-y-auto">{currentText}</div>
                        </div>
                    </div>
                )}

                {/* ESTADO 2: LOADING */}
                {scanning && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-green-800 font-medium animate-pulse">Examinando narrativa...</p>
                    </div>
                )}

                {/* ESTADO 3: RESULTADOS */}
                {results && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="bg-white border border-green-200 rounded-xl shadow-sm overflow-hidden">
                            <div className="bg-green-50 px-4 py-2 border-b border-green-100 flex justify-between items-center">
                                <span className="text-xs font-bold text-green-900 uppercase flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${results.length > 0 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                    {results.length > 0 ? `Caso ${currentResultIndex + 1} de ${results.length}` : 'Narrativa Sólida'}
                                </span>
                                {results.length > 0 && (
                                    <div className="flex gap-1">
                                        <button onClick={() => setCurrentResultIndex(p => Math.max(0, p - 1))} disabled={currentResultIndex === 0} className="p-1 hover:bg-white rounded text-green-700 disabled:opacity-30"><ChevronLeft size={18}/></button>
                                        <button onClick={() => setCurrentResultIndex(p => Math.min(results.length - 1, p + 1))} disabled={currentResultIndex === results.length - 1} className="p-1 hover:bg-white rounded text-green-700 disabled:opacity-30"><ChevronRight size={18}/></button>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                {results.length > 0 ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Problema */}
                                        <div>
                                            <h4 className="text-xs font-bold text-red-500 uppercase mb-2">Detectado (Tell)</h4>
                                            <p className="font-serif text-gray-800 text-lg bg-red-50 p-3 rounded border border-red-100">
                                                "{results[currentResultIndex].quote}"
                                            </p>
                                            <div className="mt-2 flex gap-2 items-start text-xs text-gray-500">
                                                <Info size={14} className="mt-0.5 shrink-0"/>
                                                {results[currentResultIndex].issue}
                                            </div>
                                        </div>
                                        
                                        {/* Solución */}
                                        <div>
                                            <h4 className="text-xs font-bold text-green-600 uppercase mb-2">Sugerencia (Show)</h4>
                                            <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm h-full">
                                                <p className="font-serif text-green-900 italic leading-relaxed">
                                                    {results[currentResultIndex].suggestion}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Check size={32} className="mx-auto text-green-500 mb-2"/>
                                        <p>¡Excelente! El texto es evocador y muestra acciones en lugar de explicarlas.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl border-t-4 border-green-400 shadow-inner">
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

            {showPaywall && <PaywallModal onClose={() => setShowPaywall(false)} featureName="Análisis Show vs Tell con IA" />}
            {error && <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-lg text-center text-sm">{error}</div>}
        </div>
    );
}