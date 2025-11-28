import React from 'react';
import { FileText, Plus, Trash2, Book, ChevronRight } from 'lucide-react';
import { useDocument } from '../../context/DocumentContext';

const FileSidebar = ({ className = "" }) => {
  const { 
    documents, 
    currentDocId, 
    selectDocument, 
    createNewDocument, 
    deleteDocument 
  } = useDocument();

  // Función para obtener texto plano corto para la preview
  const getPreview = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    let text = tmp.textContent || tmp.innerText || "";
    return text.slice(0, 45) + (text.length > 45 ? "..." : "");
  }

  return (
    <div className={`flex flex-col bg-white border-r border-gray-200 h-full ${className}`}>
      {/* HEADER SIDEBAR */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Book size={14}/> Mis Proyectos
        </h3>
        <button 
          onClick={createNewDocument}
          className="p-1.5 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-600 hover:text-white transition-all"
          title="Nuevo Documento"
        >
          <Plus size={16}/>
        </button>
      </div>

      {/* LISTA DE ARCHIVOS */}
      <div className="flex-grow overflow-y-auto p-2 space-y-1">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            onClick={() => selectDocument(doc.id)}
            className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border ${
              currentDocId === doc.id 
                ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
            }`}
          >
            <FileText 
              size={18} 
              className={`mt-0.5 ${currentDocId === doc.id ? 'text-indigo-600' : 'text-gray-400'}`} 
            />
            
            <div className="flex-grow min-w-0">
              <h4 className={`text-sm font-semibold truncate ${
                currentDocId === doc.id ? 'text-indigo-900' : 'text-gray-700'
              }`}>
                {doc.title || 'Sin título'}
              </h4>
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {getPreview(doc.content) || "Vacío"}
              </p>
            </div>

            <button
              onClick={(e) => deleteDocument(doc.id, e)}
              className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all ${
                currentDocId === doc.id ? 'opacity-100 text-indigo-300' : ''
              }`}
              title="Borrar archivo"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* FOOTER SIDEBAR (Opcional) */}
      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
        <span className="text-[10px] text-gray-400 font-medium">
          {documents.length} documento{documents.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default FileSidebar;