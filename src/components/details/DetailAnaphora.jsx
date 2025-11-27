import React from 'react';
import { RefreshCcw, ArrowLeft } from 'lucide-react';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailAnaphora({ analysis, onBack }) {

    // 1. Renderizado de Texto con Resaltado
    const renderText = () => {
        const paragraphs = analysis.rawText.split(/\n+/);
        return paragraphs.map((para, pIdx) => {
            const sentences = para.split(/([.!?]+)/);
            return (
                <p key={pIdx} className="mb-6">
                    {sentences.map((s, sIdx) => {
                        const words = s.trim().split(" ");
                        if(words.length > 0) {
                            const first = words[0].toLowerCase().replace(/[.,;:!?]/g,"");
                            // Verificamos si esta palabra de inicio provocó una alerta
                            const isAnaphora = analysis.anaphoraAlerts.some(a => a.word === first);
                            
                            if (isAnaphora) {
                                return (
                                    <span key={sIdx}>
                                        <span className="bg-teal-200 font-bold text-teal-900 px-1 rounded">
                                            {words[0]}
                                        </span>
                                        {" " + words.slice(1).join(" ")}
                                    </span>
                                );
                            }
                        }
                        return <span key={sIdx}>{s} </span>
                    })}
                </p>
            );
        });
    };

    // 2. Contexto para IA: Extraer el grupo de anáforas
    const getAnaphoraContext = () => {
        if (analysis.anaphoraAlerts.length === 0) return "No se detectaron anáforas.";

        // Tomamos la primera palabra conflictiva
        const conflictWord = analysis.anaphoraAlerts[0].word;
        
        // Buscamos en el texto crudo frases que empiecen por esa palabra
        // (Heurística simple para no recomponer todo el array de frases por índices)
        const sentences = analysis.rawText.split(/[.!?]+/);
        const repetitiveSentences = sentences.filter(s => 
            s.trim().toLowerCase().startsWith(conflictWord)
        );

        return repetitiveSentences.length > 0
            ? repetitiveSentences.slice(0, 3).join(". ") + "."
            : analysis.rawText.substring(0, 500);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <RefreshCcw className="text-teal-500" /> Inicios Repetitivos (Anáforas)
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>

            {/* Panel Informativo si hay alertas */}
            {analysis.anaphoraAlerts.length > 0 ? (
                <div className="mb-8 bg-teal-50 p-6 rounded-xl border border-teal-100">
                    <h3 className="text-sm font-bold text-teal-900 mb-2">Patrones Detectados</h3>
                    <p className="text-sm text-teal-800 mb-4">
                        Se han detectado varias frases consecutivas que comienzan con la misma palabra. Esto puede crear un efecto robótico o infantil si no es intencional.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {analysis.anaphoraAlerts.slice(0, 5).map((alert, idx) => (
                            <span key={idx} className="bg-white px-3 py-1 rounded-full text-xs font-bold text-teal-700 shadow-sm border border-teal-100">
                                "{alert.word}..." (x{alert.indices.length})
                            </span>
                        ))}
                    </div>

                    {/* Botón IA */}
                    <AIEnhancerButton 
                        componentId="detail-anaphora"
                        textToAnalyze={getAnaphoraContext()}
                        contextLabel="Variar Estructura Inicial"
                    />
                </div>
            ) : (
                <div className="mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100 text-center text-gray-500 italic">
                    No se han detectado anáforas evidentes en el texto.
                </div>
            )}

            {/* Texto Renderizado */}
            <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                {renderText()}
            </div>
        </div>
    );
}