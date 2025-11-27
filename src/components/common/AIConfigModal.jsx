import React, { useState } from 'react';
import { X, Save, Cpu, Zap } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function AIConfigModal({ onClose }) {
    const { aiConfig, updateAiConfig } = useAppContext();
    
    // Por defecto usamos el modelo rápido y rentable
    const [model, setModel] = useState(aiConfig.model || 'gemini-2.0-flash');

    const handleSave = () => {
        updateAiConfig({
            ...aiConfig,
            provider: 'gemini', // Forzamos Gemini
            model: model
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-indigo-100">
                
                {/* Cabecera */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Cpu size={18} className="text-indigo-500"/> Configuración del Motor IA
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
                        <X size={20}/>
                    </button>
                </div>

                {/* Cuerpo */}
                <div className="p-6 space-y-6">
                    <div className="text-sm text-gray-600 mb-4">
                        Estás utilizando la versión gestionada de Style Optimizer. Selecciona la potencia del motor de análisis:
                    </div>

                    <div className="space-y-3">
                        {/* Opción 1: Flash (Rentable) */}
                        <button 
                            onClick={() => setModel('gemini-2.0-flash')}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${model === 'gemini-2.0-flash' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-indigo-200'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${model === 'gemini-2.0-flash' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    <Zap size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-800">Modo Turbo (Recomendado)</div>
                                    <div className="text-xs text-gray-500">Máxima velocidad, ideal para correcciones ágiles.</div>
                                </div>
                            </div>
                            {model === 'gemini-2.0-flash' && <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>}
                        </button>

                        {/* Opción 2: Pro (Más caro, quizás para plan superior) */}
                        <button 
                            disabled
                            className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 opacity-60 cursor-not-allowed"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-full bg-gray-200 text-gray-500">
                                    <Cpu size={18} />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-gray-800">Modo Profundo (Pro)</div>
                                    <div className="text-xs text-gray-500">Mayor razonamiento. Próximamente.</div>
                                </div>
                            </div>
                        </button>
                    </div>

                    <button 
                        onClick={handleSave}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Save size={18}/> Aplicar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
}