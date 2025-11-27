import React, { useMemo } from 'react';
import { StickyNote, ArrowLeft, Info } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { STOPWORDS } from '../../utils/textAnalyzer';
import { CustomBarTooltip } from '../common/StyleComponents';

export default function DetailSticky({ analysis, onBack }) {
    
    // 1. Recalculamos datos para TODAS las frases (para llenar el gráfico)
    const chartData = useMemo(() => {
        const sentences = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s));
        
        return sentences.map((text, i) => {
            const words = text.trim().split(/\s+/);
            if (words.length === 0) return { id: i + 1, ratio: 0, text };

            let glueCount = 0;
            words.forEach(w => {
                const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                if (STOPWORDS.has(clean)) glueCount++;
            });

            // Evitamos NaN en frases vacías
            const ratio = words.length > 0 ? Math.round((glueCount / words.length) * 100) : 0;
            
            return { id: i + 1, ratio, text };
        });
    }, [analysis.rawText]);

    // Helper para color de barras
    const getBarColor = (ratio) => {
        if (ratio > 45) return "#ef4444"; // Rojo (Mal)
        if (ratio > 30) return "#eab308"; // Amarillo (Ojo)
        return "#22c55e";                 // Verde (Bien)
    };

    // 2. Renderizado de Texto
    // Iteramos sobre los datos calculados arriba para mantener sincronía con el gráfico
    const renderText = () => {
        // Necesitamos reconstruir el texto manteniendo párrafos, así que usamos la lógica original de split
        // pero cruzamos datos con el cálculo de ratio para colorear.
        let globalSentenceIdx = 0;

        return analysis.rawText.split(/\n+/).map((para, pIdx) => {
            if (!para.trim()) return null;
            
            const sentences = para.split(/([.!?]+)/);
            const renderedSentences = [];
            let buffer = "";

            for (let i = 0; i < sentences.length; i++) {
                const part = sentences[i];
                buffer += part;
                
                // Si terminamos una frase o es el final
                if (/^[.!?]+$/.test(part) || i === sentences.length - 1) {
                    if (buffer.trim().length > 0 && !/^[.!?]+$/.test(buffer)) {
                        const currentIdx = globalSentenceIdx;
                        const data = chartData[currentIdx];
                        
                        // Si existe dato y supera el umbral, resaltamos
                        if (data && data.ratio > 45) {
                            const words = buffer.split(/(\s+|[.,;:!?])/);
                            const highlightedContent = words.map((w, wIdx) => {
                                const clean = w.toLowerCase().replace(/[.,;:!?]/g, "");
                                const isGlue = STOPWORDS.has(clean);
                                return (
                                    <span key={wIdx} className={isGlue ? "font-bold text-yellow-900 opacity-80" : ""}>
                                        {w}
                                    </span>
                                );
                            });

                            renderedSentences.push(
                                <span key={currentIdx} className="bg-yellow-100 border-b-2 border-yellow-400 mx-1 px-1 rounded" title={`Grasa: ${data.ratio}%`}>
                                    {highlightedContent}
                                </span>
                            );
                        } else {
                            renderedSentences.push(<span key={currentIdx}>{buffer}</span>);
                        }
                        globalSentenceIdx++;
                    } else {
                        renderedSentences.push(<span key={`punct-${i}`}>{buffer}</span>);
                    }
                    buffer = "";
                }
            }
            return <p key={pIdx} className="mb-4">{renderedSentences}</p>;
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <StickyNote className="text-yellow-600" /> Frases Pegajosas (Grasa Textual)
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>
            
            {/* Panel Educativo y Gráfico */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                
                {/* Columna Info */}
                <div className="lg:col-span-1 bg-yellow-50 p-6 rounded-xl border border-yellow-200 h-fit">
                    <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                        <Info size={20}/> ¿Qué es la "Grasa"?
                    </h3>
                    <p className="text-sm text-yellow-800 mb-4 leading-relaxed">
                        Las palabras funcionales (de, el, que, para, con...) son el pegamento que une las frases. Son necesarias, pero <strong>en exceso diluyen el mensaje</strong>.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-yellow-100 text-xs space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                            <span className="font-bold text-gray-600">&gt; 45% (Pegajosa)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                            <span className="font-bold text-gray-600">30% - 45% (Normal)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                            <span className="font-bold text-gray-600">&lt; 30% (Directa)</span>
                        </div>
                    </div>
                    <p className="text-xs text-yellow-700 mt-4 italic">
                        Tip: Intenta eliminar preposiciones innecesarias o reescribir la frase para usar verbos más fuertes.
                    </p>
                </div>

                {/* Columna Gráfico */}
                <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Mapa de Densidad por Frase</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} barGap={2}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="id" tick={{fontSize: 10}} interval={4} stroke="#9ca3af" />
                                <YAxis hide domain={[0, 100]} />
                                <Tooltip content={<CustomBarTooltip unit="%" labelPrefix="Frase" />} cursor={{fill: '#fefce8'}} />
                                <ReferenceLine y={45} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'right', value: 'Límite 45%', fill: '#ef4444', fontSize: 10 }} />
                                <Bar dataKey="ratio" radius={[2, 2, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={getBarColor(entry.ratio)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Texto Renderizado */}
            <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                {renderText()}
            </div>
        </div>
    );
}