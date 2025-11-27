import React from 'react';
import { X, Save, RefreshCw } from 'lucide-react';

export default function QuickEditorPanel({ isOpen, onClose, text, setText, onReanalyze }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-white shadow-2xl border-l border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
            
            {/* Header del Editor */}
            <div className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-sm shrink-0">
                <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                    📝 Editor Rápido
                </h3>
                <div className="flex gap-2">
                     {/* Botón para forzar re-análisis si quieres manual, aunque React lo hará auto si está conectado */}
                    <button 
                        onClick={onReanalyze}
                        className="p-1.5 hover:bg-indigo-500 rounded text-indigo-100 transition"
                        title="Recalcular métricas"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={onClose} className="p-1.5 hover:bg-indigo-500 rounded text-indigo-100 transition">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Área de Texto */}
            <div className="flex-grow relative bg-gray-50">
                <textarea
                    className="w-full h-full p-6 bg-transparent border-none resize-none focus:ring-0 outline-none text-gray-700 font-serif text-lg leading-relaxed"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Escribe aquí..."
                />
            </div>

            {/* Footer informativo */}
            <div className="bg-white border-t border-gray-100 p-3 text-center">
                <p className="text-xs text-gray-400">
                    Los cambios actualizan las métricas en tiempo real.
                </p>
            </div>
        </div>
    );
}