import React, { useState } from 'react';
import { Gauge, ArrowLeft, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailReadability({ analysis, onBack }) {
    const score = analysis.readabilityScore;
    
    // Configuración visual del Gauge
    let label = "Normal"; 
    let color = "text-yellow-600"; 
    let bg = "bg-yellow-50";
    if (score > 80) { label = "Muy Fácil"; color = "text-green-600"; bg = "bg-green-50"; }
    else if (score > 60) { label = "Fácil"; color = "text-green-500"; bg = "bg-green-50"; }
    else if (score > 40) { label = "Normal"; color = "text-yellow-600"; bg = "bg-yellow-50"; }
    else { label = "Difícil"; color = "text-red-600"; bg = "bg-red-50"; }

    // LÓGICA DE PAGINACIÓN DE BLOQUES
    // Dividimos el texto en bloques de párrafos para no saturar a la IA
    const paragraphs = analysis.rawText.split(/\n+/).filter(p => p.trim().length > 0);
    const BLOCK_SIZE = 3; // Párrafos por bloque
    const totalBlocks = Math.ceil(paragraphs.length / BLOCK_SIZE);
    const [currentBlock, setCurrentBlock] = useState(0);

    const getCurrentText = () => {
        const start = currentBlock * BLOCK_SIZE;
        return paragraphs.slice(start, start + BLOCK_SIZE).join("\n\n");
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Gauge className="text-teal-500" /> Índice de Legibilidad
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>

            {/* Visualización Gauge */}
            <div className="flex flex-col items-center justify-center py-8 space-y-6 border-b border-gray-100 mb-8">
                <div className={`relative w-48 h-48 flex items-center justify-center rounded-full border-[12px] ${bg.replace('bg-', 'border-')} transition-all duration-1000`}>
                    <div className="text-center">
                        <span className={`text-6xl font-black ${color} tracking-tighter`}>{score}</span>
                        <span className="block text-[10px] text-gray-400 uppercase mt-1 tracking-widest">Escala Huerta</span>
                    </div>
                </div>
                <div className="text-center">
                    <h3 className={`text-2xl font-bold ${color} mb-1`}>{label}</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        Mide la complejidad estructural basándose en la longitud de palabras y oraciones.
                    </p>
                </div>
            </div>

            {/* CONSOLA DE REESCRITURA POR BLOQUES */}
            <div className="bg-teal-50 rounded-xl border border-teal-100 overflow-hidden">
                <div className="bg-teal-100/50 px-4 py-3 flex justify-between items-center border-b border-teal-200">
                    <span className="text-xs font-bold text-teal-800 uppercase flex items-center gap-2">
                        <FileText size={14}/> 
                        Reescribir Bloque {currentBlock + 1} de {totalBlocks}
                    </span>
                    
                    {totalBlocks > 1 && (
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setCurrentBlock(p => Math.max(0, p - 1))} 
                                disabled={currentBlock === 0} 
                                className="p-1.5 bg-white rounded shadow-sm disabled:opacity-50 hover:text-teal-600 transition"
                            >
                                <ChevronLeft size={16}/>
                            </button>
                            <button 
                                onClick={() => setCurrentBlock(p => Math.min(totalBlocks - 1, p + 1))} 
                                disabled={currentBlock === totalBlocks - 1} 
                                className="p-1.5 bg-white rounded shadow-sm disabled:opacity-50 hover:text-teal-600 transition"
                            >
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-6">
                    <p className="text-gray-600 font-serif text-sm leading-relaxed mb-4 bg-white p-4 rounded-lg border border-teal-100 max-h-40 overflow-y-auto italic">
                        "{getCurrentText()}"
                    </p>
                    
                    <AIEnhancerButton 
                        key={currentBlock} // Resetea el estado al cambiar de página
                        componentId="detail-readability"
                        textToAnalyze={getCurrentText()}
                        contextLabel={`Nivelar Bloque ${currentBlock + 1}`}
                    />
                </div>
            </div>
        </div>
    );
}