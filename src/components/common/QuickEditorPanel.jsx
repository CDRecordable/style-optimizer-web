import React from 'react';
import { X, RefreshCcw, Check } from 'lucide-react';
import RichTextEditor from './RichTextEditor'; // <--- IMPORTAMOS EL EDITOR RICO

const QuickEditorPanel = ({ isOpen, onClose, text, setText, onReanalyze }) => {
  
  // Clases para la animación de entrada/salida
  const panelClasses = `fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[60] flex flex-col ${
    isOpen ? 'translate-x-0' : 'translate-x-full'
  }`;

  // Overlay oscuro de fondo
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay fondo: Eliminado el blur y el color oscuro para ver el fondo */}
      <div 
        className="fixed inset-0 bg-transparent z-[59]" 
        onClick={onClose}
      />

      {/* Panel Lateral */}
      <div className={panelClasses}>
        
        {/* --- HEADER DEL PANEL --- */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-indigo-50">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Editor Rápido
            </h3>
            <p className="text-xs text-gray-500">Los cambios se sincronizan automáticamente</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- CUERPO DEL PANEL (AQUÍ ESTÁ EL CAMBIO) --- */}
        <div className="flex-grow overflow-hidden flex flex-col bg-white">
          {/* Reemplazamos el <textarea> por <RichTextEditor> */}
          <RichTextEditor 
            content={text}           // El texto viene de App.jsx (estado global)
            onChange={setText}       // Al escribir, actualizamos el estado global
            placeholder="Edita tu texto aquí..."
            className="h-full border-none shadow-none rounded-none focus-within:ring-0" 
          />
        </div>

        {/* --- FOOTER DEL PANEL --- */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="text-xs text-gray-400 font-mono">
             {/* Calculamos longitud aproximada eliminando tags HTML para el contador */}
             {(text || '').replace(/<[^>]*>/g, '').length} caracteres
          </span>
          
          <button 
            onClick={() => {
                onReanalyze(); // Ejecuta el análisis
                // Opcional: onClose(); // Si quieres que se cierre al analizar
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200 font-bold text-sm"
          >
            <RefreshCcw size={16} /> Actualizar Análisis
          </button>
        </div>

      </div>
    </>
  );
};

export default QuickEditorPanel;