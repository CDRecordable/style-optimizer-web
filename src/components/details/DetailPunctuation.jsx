import React, { useState, useMemo } from 'react';
import { PauseCircle, ArrowLeft, Info, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { 
    BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { CustomBarTooltip } from '../common/StyleComponents';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailPunctuation({ analysis, onBack }) {
    
    // Estado para la navegación de errores
    const [currentErrorIndex, setCurrentErrorIndex] = useState(0);

    // 1. Datos para el Gráfico (Igual que antes)
    const chartData = analysis.commasPerSentence.map((count, i) => ({
        id: i + 1,
        realValue: count,
        visualValue: count === 0 ? 0.2 : count 
    }));

    // 2. DETECCIÓN DE PROBLEMAS (Array de objetos)
    // Usamos useMemo para no recalcularlo en cada render
    const labyrinthIssues = useMemo(() => {
        const sentences = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s));
        
        // Filtramos y guardamos índice original y texto
        const issues = sentences.map((text, idx) => {
            const commaCount = (text.match(/,/g) || []).length;
            return { text: text.trim(), commaCount, originalIndex: idx };
        }).filter(item => item.commaCount > 3); // Umbral de laberinto

        return issues;
    }, [analysis.rawText]);

    // Helpers de navegación
    const currentIssue = labyrinthIssues[currentErrorIndex];
    const hasIssues = labyrinthIssues.length > 0;

    const handleNext = () => {
        if (currentErrorIndex < labyrinthIssues.length - 1) {
            setCurrentErrorIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentErrorIndex > 0) {
            setCurrentErrorIndex(prev => prev - 1);
        }
    };

    // 3. Renderizado de Texto con Resaltado (Igual que antes)
    const renderText = () => {
        const paragraphs = analysis.rawText.split(/\n+/);
        return paragraphs.map((para, pIdx) => {
            const sentences = para.split(/([.!?]+)/);
            return (
                <p key={pIdx} className="mb-6">
                    {sentences.map((part, sIdx) => {
                        if (/^[.!?]+$/.test(part) || part.trim().length === 0) return <span key={sIdx}>{part}</span>;
                        const commaCount = (part.match(/,/g) || []).length;
                        const isLabyrinth = commaCount > 3;
                        return (
                            <span 
                                key={sIdx} 
                                className={isLabyrinth ? "bg-red-50 text-red-900 decoration-red-300 underline decoration-wavy" : ""}
                            >
                                {part.split(/([,])/).map((token, i) => (
                                    <span key={i} className={token === ',' ? "font-bold text-orange-600" : ""}>{token}</span>
                                ))}
                            </span>
                        );
                    })}
                </p>
            );
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <PauseCircle className="text-orange-500" /> Ritmo Respiratorio
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>

            {/* PANEL PRINCIPAL */}
            <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                
                {/* Gráfico */}
                <div className="h-32 w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="id" hide />
                            <Tooltip content={<CustomBarTooltip unit="comas" labelPrefix="Frase" />} cursor={{fill: 'transparent'}} />
                            <Bar dataKey="visualValue" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => {
                                    const count = entry.realValue;
                                    let color = "#4ade80"; 
                                    if (count === 0) color = "#60a5fa"; 
                                    if (count > 3) color = "#f87171";   
                                    return <Cell key={`cell-${index}`} fill={color} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* === CONSOLA DE CORRECCIÓN CON NAVEGACIÓN === */}
                <div className="mt-6 bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
                    {hasIssues ? (
                        <>
                            {/* Barra de Navegación */}
                            <div className="bg-indigo-50/50 px-4 py-2 flex justify-between items-center border-b border-indigo-100">
                                <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-2">
                                    <Info size={14}/> Detección #{currentErrorIndex + 1} de {labyrinthIssues.length}
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handlePrev} 
                                        disabled={currentErrorIndex === 0}
                                        className="p-1 rounded hover:bg-white disabled:opacity-30 text-indigo-600 transition"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button 
                                        onClick={handleNext} 
                                        disabled={currentErrorIndex === labyrinthIssues.length - 1}
                                        className="p-1 rounded hover:bg-white disabled:opacity-30 text-indigo-600 transition"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Área de Trabajo */}
                            <div className="p-6">
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1">
                                        <Quote size={12}/> FRASE ORIGINAL ({currentIssue.commaCount} comas)
                                    </p>
                                    <p className="text-gray-700 font-serif italic bg-red-50/50 p-3 rounded-lg border border-red-100 text-sm leading-relaxed">
                                        "{currentIssue.text}"
                                    </p>
                                </div>

                                {/* Botón Vitamina IA - Con KEY dinámica para resetearse al cambiar de frase */}
                                <AIEnhancerButton 
                                    key={currentErrorIndex} // IMPORTANTE: Esto resetea el botón al cambiar de frase
                                    componentId="detail-punctuation"
                                    textToAnalyze={currentIssue.text}
                                    contextLabel={`Desatrancar Frase ${currentIssue.originalIndex + 1}`}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center text-gray-400">
                            <p>¡Excelente! No se han detectado frases laberínticas (+3 comas).</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Texto Completo Renderizado */}
            <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700 opacity-80 hover:opacity-100 transition-opacity">
                {renderText()}
            </div>
        </div>
    );
}