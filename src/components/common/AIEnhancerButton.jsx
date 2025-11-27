import React, { useState } from 'react';
import { Sparkles, Lock, X, Copy, Check, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useUserContext } from '../../context/UserContext';
import PaywallModal from './PaywallModal';
import { callAI } from '../../services/aiService';
import { getPrompt, TONE_LABELS } from '../../services/aiPrompts';

export default function AIEnhancerButton({ componentId, textToAnalyze, contextLabel }) {
    const { aiConfig, tone } = useAppContext();
    const { isPremium } = useUserContext();
    
    const [showPaywall, setShowPaywall] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    // LÓGICA DE TEXTO: 
    // 1. Si nos pasan un 'contextLabel' (ej: "Pedir Informe"), lo usamos.
    // 2. Si no, miramos nuestra lista interna.
    // 3. Si no está en la lista, usamos "Mejorar con IA".
    const getButtonText = () => {
        if (contextLabel) return contextLabel;

        const hooks = {
            'detail-prosody': 'Modificar Ritmo Musical',
            'detail-passive': 'Activar Sujeto Auto',
            'detail-readability': 'Simplificar Lenguaje',
            'detail-sismografo': 'Romper Muros de Texto',
            'detail-showtell': 'Aplicar Show Don\'t Tell',
            'detail-baul': 'Precisar Vocabulario',
            'detail-punctuation': 'Desatrancar Sintaxis',
            'detail-metrics': 'Limpiar Estilo',
            'detail-cacophony': 'Eliminar Cacofonías',
            'detail-sticky': 'Desengrasar Texto',
            'detail-pleonasms': 'Poda Lógica',
            'detail-weakverbs': 'Potenciar Verbos',
            'detail-dialogue': 'Humanizar Diálogos',
            'detail-anaphora': 'Variar Estructura',
            'detail-starts': 'Variar Inicios',
            'detail-uncountables': 'Concretar Datos'
        };
        return hooks[componentId] || 'Mejorar con IA';
    };

    const handleClick = async () => {
        if (!isPremium) {
            setShowPaywall(true);
            return;
        }

        if (!textToAnalyze) {
            setError("No hay texto seleccionado para analizar.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const prompt = getPrompt(componentId, tone, textToAnalyze);
            
            const aiResponse = await callAI(
                aiConfig.provider, 
                aiConfig.apiKey, 
                prompt, 
                aiConfig.model,
                componentId 
            );
            
            setResult(aiResponse);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="mt-6 pt-4 border-t border-gray-100">
            {!result && !loading && (
                <button 
                    onClick={handleClick}
                    className={`
                        w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all border
                        ${isPremium 
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 hover:shadow-md' 
                            : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-white hover:text-indigo-600 hover:border-indigo-200 group'}
                    `}
                >
                    {isPremium ? (
                        <Sparkles size={16} className="text-indigo-500" />
                    ) : (
                        <Lock size={16} className="text-gray-400 group-hover:text-indigo-400" />
                    )}
                    
                    <span>
                        {/* AQUÍ USAMOS LA NUEVA LÓGICA */}
                        ✨ {getButtonText()} <span className="opacity-50 font-normal">({TONE_LABELS[tone].split(' ')[1]})</span>
                    </span>
                </button>
            )}

            {loading && (
                <div className="flex flex-col items-center justify-center gap-2 py-4 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-pulse">
                    <Sparkles size={20} className="animate-spin text-indigo-500" />
                    <span className="text-xs font-bold text-indigo-400">Consultando a la IA ({tone})...</span>
                </div>
            )}

            {error && (
                <div className="flex gap-2 items-start text-xs text-red-600 bg-red-50 p-3 rounded-lg mt-2 border border-red-100">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto"><X size={14}/></button>
                </div>
            )}

            {result && (
                <div className="bg-white rounded-xl border border-indigo-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="bg-indigo-50/50 px-3 py-2 border-b border-indigo-100 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={10}/> Resultado IA
                        </span>
                        <div className="flex gap-1">
                            <button 
                                onClick={handleCopy} 
                                className="p-1.5 hover:bg-white rounded-md text-indigo-400 hover:text-indigo-600 transition flex items-center gap-1 text-[10px] font-bold"
                                title="Copiar"
                            >
                                {copied ? <Check size={12}/> : <Copy size={12}/>}
                                {copied ? 'Copiado' : 'Copiar'}
                            </button>
                            <button 
                                onClick={() => setResult(null)} 
                                className="p-1.5 hover:bg-white rounded-md text-gray-400 hover:text-red-500 transition"
                                title="Cerrar"
                            >
                                <X size={12}/>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-white to-indigo-50/30">
                        <p className="text-sm text-gray-700 font-serif italic leading-relaxed selection:bg-indigo-100 selection:text-indigo-900 whitespace-pre-wrap">
                            {result}
                        </p>
                    </div>
                </div>
            )}

            {showPaywall && (
                <PaywallModal 
                    onClose={() => setShowPaywall(false)} 
                    featureName={getButtonText()} 
                />
            )}
        </div>
    );
}