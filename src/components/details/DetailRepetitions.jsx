import React, { useState, useEffect, useContext } from 'react';
import { Repeat, ArrowLeft, List, Zap, Loader2, RefreshCcw } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { STOPWORDS } from '../../utils/textAnalyzer';
import { CustomBarTooltip } from '../common/StyleComponents';

// Contextos y Servicios
import { DocumentContext } from '../../context/DocumentContext';
import { UserContext } from '../../context/UserContext'; 
import { analyzeRepetitionsNearby } from '../../services/aiService'; 

const HIGHLIGHT_COLORS = [
    { bg: "bg-blue-100", text: "text-blue-900", border: "border-blue-300", dot: "bg-blue-500" },
    { bg: "bg-green-100", text: "text-green-900", border: "border-green-300", dot: "bg-green-500" },
    { bg: "bg-purple-100", text: "text-purple-900", border: "border-purple-300", dot: "bg-purple-500" },
    { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-300", dot: "bg-orange-500" },
    { bg: "bg-pink-100", text: "text-pink-900", border: "border-pink-300", dot: "bg-pink-500" },
    { bg: "bg-teal-100", text: "text-teal-900", border: "border-teal-300", dot: "bg-teal-500" },
    { bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-300", dot: "bg-yellow-500" },
    { bg: "bg-red-100", text: "text-red-900", border: "border-red-300", dot: "bg-red-500" },
    { bg: "bg-indigo-100", text: "text-indigo-900", border: "border-indigo-300", dot: "bg-indigo-500" },
    { bg: "bg-cyan-100", text: "text-cyan-900", border: "border-cyan-300", dot: "bg-cyan-500" },
];

const stripHtml = (html) => {
   if (!html) return "";
   const tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
};

export default function DetailRepetitions({ analysis, onBack }) {
    
    const userContext = useContext(UserContext);
    const isPro = userContext?.isPremium || userContext?.isPro || false; 

    const docContext = useContext(DocumentContext);
    const rawContent = docContext?.docContent || analysis?.rawText || '';
    const cleanText = stripHtml(rawContent);
    
    const analysisResults = docContext?.analysisResults || {};
    const repetitionsNearbyContext = analysisResults.repetitionsNearby || null;
    const updateAnalysis = docContext?.updateAnalysis || (() => {});

    const [aiAnalysisResult, setAiAnalysisResult] = useState(repetitionsNearbyContext); 
    const [isAiLoading, setIsAiLoading] = useState(false);

    const currentAnalysis = analysis || {};
    
    const densityData = Array(10).fill(0).map((_, i) => ({ x: i, count: 0 }));
    const totalWords = cleanText.split(/\s+/).length || 1; 
    
    const closeRepetitionIndices = currentAnalysis.closeRepetitionIndices || [];
    [...closeRepetitionIndices].forEach(idx => {
        const bucket = Math.floor((idx / totalWords) * 10);
        if (bucket >= 0 && bucket < 10) densityData[bucket].count++;
    });

    const topRepetitions = (currentAnalysis.repetitions || []).slice(0, 10).map(r => r[0]);

    const runAiAnalysis = async () => {
        if (!cleanText || cleanText.length < 50) {
            alert('Por favor escribe al menos 50 caracteres para el análisis IA.');
            return;
        }

        setIsAiLoading(true);
        try {
            const result = await analyzeRepetitionsNearby(cleanText);
            setAiAnalysisResult(result);
            updateAnalysis({ repetitionsNearby: result });
        } catch (error) {
            console.error('Error running AI analysis:', error);
            setAiAnalysisResult({ error: 'Fallo el análisis de IA. Inténtalo de nuevo.' });
        } finally {
            setIsAiLoading(false);
        }
    };

    useEffect(() => {
        if (repetitionsNearbyContext) {
          setAiAnalysisResult(repetitionsNearbyContext);
        }
    }, [repetitionsNearbyContext]);

    const renderText = () => {
        if (!cleanText) return <p className="text-gray-500 italic">No hay texto para analizar.</p>;
        
        const paragraphs = cleanText.split(/\n+/);
        
        return paragraphs.map((para, pIdx) => (
            <p key={pIdx} className="mb-6 leading-relaxed text-gray-700 font-serif text-lg">
                {para.split(/(\s+)/).map((w, i) => {
                    const wordClean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                    const repIndex = topRepetitions.indexOf(wordClean);
                    const isRep = repIndex !== -1 && !STOPWORDS.has(wordClean);
                    const colorStyle = isRep ? HIGHLIGHT_COLORS[repIndex] : null;
                    
                    const className = colorStyle 
                        ? `${colorStyle.bg} ${colorStyle.text} border-b-2 ${colorStyle.border} font-medium px-0.5 rounded-t cursor-help transition-colors`
                        : "";

                    return (
                        <span key={i} className={className} title={isRep ? `Top #${repIndex + 1}` : ""}>
                            {w}{' '}
                        </span>
                    );
                })}
            </p>
        ));
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Repeat className="text-blue-500" /> Repeticiones Cercanas
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>
            
            {/* Layout Principal: 1/3 Izquierda (Sidebar) - 2/3 Derecha (IA + Texto) */}
            <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-250px)]"> 
                 
                 {/* 1. COLUMNA IZQUIERDA (1/3) - Sidebar Sticky */}
                 <div className="w-full md:w-1/3 space-y-6 h-full sticky top-0 overflow-y-auto pr-2 custom-scrollbar pb-20">
                    
                    {/* Tabla Top 10 (Ahora arriba del todo) */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                         <div className="p-4 border-b border-gray-200 bg-white">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm">
                                <List size={16} className="text-blue-500"/> Palabras Frecuentes
                            </h3>
                         </div>
                         <div className="bg-white p-0">
                            <div className="overflow-hidden">
                                <table className="min-w-full text-sm text-left text-gray-500">
                                    <tbody className="divide-y divide-gray-100">
                                        {(currentAnalysis.repetitions || []).length > 0 ? (
                                            (currentAnalysis.repetitions || []).slice(0, 10).map(([word, count], idx) => (
                                                <tr key={idx} className="hover:bg-blue-50 transition-colors group cursor-default">
                                                    <td className="px-4 py-2 font-medium text-gray-900 capitalize flex items-center gap-2">
                                                        <div className={`w-2.5 h-2.5 rounded-full ${HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length].dot} group-hover:scale-125 transition-transform`}></div>
                                                        {word}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-bold text-gray-400 group-hover:text-blue-600">{count}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td className="px-4 py-8 text-center text-gray-400 italic" colSpan="2">
                                                    Calculando...
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    {/* Gráfico (Debajo de la tabla) */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Mapa de Densidad</h3>
                        <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={densityData}>
                                    <defs>
                                        <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip cursor={{stroke: '#3b82f6', strokeWidth: 2}} content={<CustomBarTooltip unit="repeticiones" labelPrefix="Tramo" />}/>
                                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRep)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                 </div>

                {/* 2. COLUMNA DERECHA (2/3) - Consola IA + Texto */}
                <div className="w-full md:w-2/3 h-full overflow-y-auto custom-scrollbar pb-20 pr-2">
                    
                    {/* Consola IA (Primera posición columna derecha) */}
                    <div className={`bg-white border rounded-xl overflow-hidden shadow-sm mb-8 ${!isPro ? 'opacity-90' : ''}`}>
                        <div className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b">
                            <h3 className="text-lg font-semibold flex items-center text-gray-800">
                                <Zap className="w-5 h-5 mr-2 text-yellow-500 fill-yellow-500" />
                                IA: Detector de Repeticiones Cercanas
                            </h3>
                            <button
                                onClick={runAiAnalysis}
                                disabled={isAiLoading || !isPro || cleanText.length < 50}
                                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isPro 
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isAiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
                                {isAiLoading ? 'Analizando...' : 'Analizar Texto'}
                            </button>
                        </div>
                        
                        <div className="p-4 bg-gray-50/50 min-h-[120px]">
                            {!isPro ? (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                                    <p className="font-semibold text-yellow-800 text-sm">Funcionalidad PRO</p>
                                    <p className="text-xs text-yellow-700 mt-1">Activa tu suscripción para análisis avanzado con IA.</p>
                                </div>
                            ) : (
                                <div className="overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                                    {aiAnalysisResult && Array.isArray(aiAnalysisResult) ? (
                                        aiAnalysisResult.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3">
                                                {aiAnalysisResult.map((item, index) => (
                                                    <div key={index} className="p-3 border border-red-100 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-xs font-bold text-red-600 uppercase tracking-wide bg-red-50 px-2 py-0.5 rounded">
                                                                Repetición
                                                            </span>
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-bold border border-red-200">
                                                                {item.word}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-700 text-sm mb-3 italic border-l-4 border-red-200 pl-3 py-1 bg-gray-50 rounded-r">
                                                            "{item.segment}"
                                                        </p>
                                                        <div className="text-sm bg-green-50 p-2.5 rounded border border-green-200 flex items-start">
                                                            <span className="text-green-600 mr-2 font-bold">💡</span>
                                                            <div>
                                                                <span className="font-semibold text-green-800 text-xs uppercase mb-1 block">Sugerencia:</span>
                                                                <span className="text-gray-800">{item.suggestion}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center flex flex-col items-center justify-center">
                                                <span className="text-3xl mb-3">✨</span>
                                                <p className="font-semibold text-green-800 text-lg">¡Texto limpio!</p>
                                                <p className="text-sm text-green-600">La IA no encontró repeticiones reseñables en este fragmento.</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                                            {aiAnalysisResult?.error ? (
                                                <p className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-100 flex items-center">
                                                    <span className="mr-2">⚠️</span> {aiAnalysisResult.error}
                                                </p>
                                            ) : (
                                                <>
                                                    <Zap className="w-10 h-10 text-gray-300 mb-3" />
                                                    <p className="text-sm">Pulsa "Analizar Texto" para que la IA detecte repeticiones molestas.</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Texto del Usuario (Debajo de la consola) */}
                    <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                        {renderText()}
                    </div>
                </div>
            </div>
        </div>
    );
}