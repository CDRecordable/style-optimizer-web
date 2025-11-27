import React from 'react';
import { Repeat, ArrowLeft, List } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { STOPWORDS } from '../../utils/textAnalyzer';
import { CustomBarTooltip } from '../common/StyleComponents';

// Paleta de colores distintivos para el Top 10
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

export default function DetailRepetitions({ analysis, onBack }) {

    // 1. Datos para Gráfico de Densidad
    const densityData = Array(10).fill(0).map((_, i) => ({ x: i, count: 0 }));
    const totalWords = analysis.wordCount;
    
    [...analysis.closeRepetitionIndices].forEach(idx => {
        const bucket = Math.floor((idx / totalWords) * 10);
        if (bucket >= 0 && bucket < 10) densityData[bucket].count++;
    });

    // Extraemos el TOP 10 limpio
    const topRepetitions = analysis.repetitions.slice(0, 10).map(r => r[0]);

    // 2. Renderizado de Texto con Colores Diferenciados
    const renderText = () => {
        const paragraphs = analysis.rawText.split(/\n+/);
        
        return paragraphs.map((para, pIdx) => (
            <p key={pIdx} className="mb-6">
                {para.split(/(\s+)/).map((w, i) => {
                    const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                    
                    // Buscamos si la palabra está en el Top 10 para asignarle su color
                    const repIndex = topRepetitions.indexOf(clean);
                    const isRep = repIndex !== -1 && !STOPWORDS.has(clean);
                    
                    // Si está en el top, cogemos su color (o gris por defecto si se sale de rango)
                    const colorStyle = isRep ? HIGHLIGHT_COLORS[repIndex] : null;
                    
                    const className = colorStyle 
                        ? `${colorStyle.bg} ${colorStyle.text} border-b-2 ${colorStyle.border} font-medium px-0.5 rounded-t cursor-help`
                        : "";

                    return (
                        <span 
                            key={i} 
                            className={className} 
                            title={isRep ? `Top #${repIndex + 1}: ${clean}` : ""}
                        >
                            {w}
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
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 mb-8 h-full">
                 {/* COLUMNA IZQUIERDA: DATOS Y GRÁFICO (Sticky para que acompañe al scroll) */}
                 <div className="w-full md:w-1/3 space-y-6 h-fit sticky top-4">
                    
                    {/* Tabla Top 10 con Colores */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                         <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                            <List size={16}/> Palabras Frecuentes
                         </h3>
                         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="min-w-full text-sm text-left text-gray-500">
                                <tbody className="divide-y divide-gray-100">
                                    {analysis.repetitions.slice(0, 10).map(([word, count], idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-2 font-medium text-gray-900 capitalize flex items-center gap-2">
                                                {/* Punto de color identificativo */}
                                                <div className={`w-2.5 h-2.5 rounded-full ${HIGHLIGHT_COLORS[idx].dot}`}></div>
                                                {word}
                                            </td>
                                            <td className="px-4 py-2 text-right font-bold text-gray-400">{count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                    
                    {/* Gráfico de Densidad */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Densidad en el texto</h3>
                        <div className="h-24 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={densityData}>
                                    <defs>
                                        <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Tooltip cursor={{stroke: '#3b82f6'}} content={<CustomBarTooltip unit="repeticiones" labelPrefix="Tramo" />}/>
                                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRep)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                 </div>

                {/* COLUMNA DERECHA: TEXTO */}
                <div className="w-full md:w-2/3 prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {renderText()}
                </div>
            </div>
        </div>
    );
}