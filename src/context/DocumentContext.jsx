import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useUserContext } from './UserContext';

// CORRECCIÓN: Añadido 'export' para evitar el error de importación
export const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const { user } = useUserContext();
  
  // --- ESTADOS ---
  const [documents, setDocuments] = useState([]);
  const [currentDocId, setCurrentDocId] = useState(null);
  
  // Buffers de edición (lo que se ve en el editor)
  const [docContent, setDocContent] = useState('');
  const [docTitle, setDocTitle] = useState('Sin título');
  
  // --- NUEVO: Estado para guardar análisis de IA (Repeticiones, etc.) ---
  // Esto permite que DetailRepetitions guarde datos sin romper tu estructura
  const [analysisResults, setAnalysisResults] = useState({}); 

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Referencia para el debounce del guardado en nube
  const saveTimeoutRef = useRef(null);

  // Función para actualizar el análisis (Usada por los componentes de Detalle)
  const updateAnalysis = (newAnalysisData) => {
      setAnalysisResults(prev => ({
          ...prev,
          ...newAnalysisData
      }));
  };

  // ----------------------------------------------------------------
  // 1. CARGA INICIAL (HYBRID LOADING)
  // ----------------------------------------------------------------
  useEffect(() => {
    async function loadDocuments() {
      setIsLoading(true);
      
      if (user) {
        // --- MODO NUBE (Usuario Logueado) ---
        try {
          const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('updated_at', { ascending: false });

          if (error) throw error;

          if (data && data.length > 0) {
            setDocuments(data);
            // Seleccionar el primero o el último editado si no hay ID activo
            setCurrentDocId(data[0].id);
            setDocContent(data[0].content || '');
            setDocTitle(data[0].title || 'Sin título');
          } else {
            // Si no tiene documentos en la nube, creamos uno vacío
            await createNewCloudDoc();
          }
        } catch (error) {
          console.error("Error cargando documentos:", error);
        }
      } else {
        // --- MODO LOCAL (Invitado) ---
        const savedDocs = localStorage.getItem('style_optimizer_documents');
        const parsedDocs = savedDocs ? JSON.parse(savedDocs) : [];
        
        if (parsedDocs.length > 0) {
          setDocuments(parsedDocs);
          const savedId = localStorage.getItem('style_optimizer_current_id');
          // Validar que el ID guardado existe
          const targetId = parsedDocs.find(d => d.id === savedId) ? savedId : parsedDocs[0].id;
          
          setCurrentDocId(targetId);
          const activeDoc = parsedDocs.find(d => d.id === targetId);
          setDocContent(activeDoc ? activeDoc.content : '');
          setDocTitle(activeDoc ? activeDoc.title : 'Sin título');
        } else {
          // Crear primer doc local
          createNewLocalDoc();
        }
      }
      setIsLoading(false);
    }

    loadDocuments();
  }, [user]); // Se recarga si el usuario cambia (login/logout)

  // ----------------------------------------------------------------
  // 2. SELECCIÓN DE DOCUMENTO
  // ----------------------------------------------------------------
  const selectDocument = (id) => {
    // Antes de cambiar, asegúrate de guardar lo pendiente si es necesario
    // (El useEffect de guardado ya se encarga, pero esto es visual)
    const docToLoad = documents.find(d => d.id === id);
    if (docToLoad) {
      setCurrentDocId(id);
      setDocContent(docToLoad.content || '');
      setDocTitle(docToLoad.title || 'Sin título');
      setAnalysisResults({}); // Limpiar análisis al cambiar de doc
      
      if (!user) {
        localStorage.setItem('style_optimizer_current_id', id);
      }
    }
  };

  // ----------------------------------------------------------------
  // 3. SISTEMA DE GUARDADO (AUTO-SAVE)
  // ----------------------------------------------------------------
  
  // A. Actualizar estado local inmediato (UI Snappy)
  useEffect(() => {
    if (!currentDocId) return;

    setDocuments(prevDocs => 
      prevDocs.map(doc => 
        doc.id === currentDocId 
          ? { ...doc, content: docContent, title: docTitle, updated_at: new Date().toISOString() } 
          : doc
      )
    );
  }, [docContent, docTitle]);

  // B. Persistencia (Debounced)
  useEffect(() => {
    if (!currentDocId) return;

    // Limpiar timeout anterior
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      if (user) {
        // --- GUARDAR EN NUBE ---
        setIsSaving(true);
        try {
          const { error } = await supabase
            .from('documents')
            .update({ 
              content: docContent, 
              title: docTitle, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', currentDocId);

          if (error) console.error("Error auto-guardando:", error);
        } finally {
          setIsSaving(false);
        }
      } else {
        // --- GUARDAR EN LOCAL ---
        localStorage.setItem('style_optimizer_documents', JSON.stringify(documents));
      }
    }, 1000); // Espera 1 segundo después de dejar de escribir

    return () => clearTimeout(saveTimeoutRef.current);
  }, [docContent, docTitle, currentDocId, user]); // documents se quita de dep para evitar loops en local

  // Hack específico para guardar LocalStorage correctamente cuando cambia 'documents' en modo local
  useEffect(() => {
    if (!user && documents.length > 0) {
       localStorage.setItem('style_optimizer_documents', JSON.stringify(documents));
    }
  }, [documents, user]);


  // ----------------------------------------------------------------
  // 4. CREACIÓN Y BORRADO
  // ----------------------------------------------------------------

  // Crear Local
  const createNewLocalDoc = () => {
    const newDoc = {
      id: crypto.randomUUID(),
      title: 'Nuevo Borrador',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setDocuments(prev => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
    setDocContent('');
    setDocTitle('Nuevo Borrador');
    localStorage.setItem('style_optimizer_current_id', newDoc.id);
  };

  // Crear Nube
  const createNewCloudDoc = async () => {
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{ 
          title: 'Nuevo Capítulo', 
          content: '',
          user_id: user.id 
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setDocuments(prev => [data, ...prev]);
        setCurrentDocId(data.id);
        setDocContent('');
        setDocTitle('Nuevo Capítulo');
      }
    } catch (err) {
      console.error("Error creando doc:", err);
      alert("No se pudo crear el documento en la nube.");
    } finally {
      setIsSaving(false);
    }
  };

  const createNewDocument = () => {
    if (user) createNewCloudDoc();
    else createNewLocalDoc();
  };

  const updateTitle = (newTitle) => {
    setDocTitle(newTitle);
  };

  const deleteDocument = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("¿Estás seguro de borrar este documento?")) return;

    if (user) {
      // Borrar de Nube
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) {
        alert("Error borrando documento");
        return;
      }
    }

    // Actualizar estado local
    const remainingDocs = documents.filter(d => d.id !== id);
    setDocuments(remainingDocs);

    // Si borramos el actual, cambiar a otro
    if (id === currentDocId) {
      if (remainingDocs.length > 0) {
        selectDocument(remainingDocs[0].id);
      } else {
        // Si no queda ninguno, creamos uno nuevo inmediatamente
        user ? createNewCloudDoc() : createNewLocalDoc();
      }
    }
  };

  return (
    <DocumentContext.Provider value={{ 
      documents,
      currentDocId,
      docContent, 
      setDocContent, 
      docTitle, 
      updateTitle,
      createNewDocument,
      selectDocument,
      deleteDocument,
      isLoading,
      isSaving,
      // EXPORTAMOS EL NUEVO ESTADO Y FUNCIÓN
      analysisResults,
      updateAnalysis
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => useContext(DocumentContext);