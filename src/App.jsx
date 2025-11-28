import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Activity, Repeat, Mic2, AlertTriangle, Feather, Eye, Type, 
  Music, Zap, Layers, PauseCircle, RefreshCcw, MessageSquare, Gauge, 
  UserX, Printer, Globe, Youtube, Edit, Package, Hash, StickyNote, Trash2,
  PieChart as PieChartIcon, Fingerprint, Crown, LogOut, Settings, User, ChevronDown,
  Sparkles, ArrowRight, Check, X, Lock, PenTool, CreditCard, ChevronLeft, FilePlus
} from 'lucide-react';

// --- CONTEXTOS ---
import { AppProvider, useAppContext } from './context/AppContext';
import { UserProvider, useUserContext } from './context/UserContext';
import { DocumentProvider, useDocument } from './context/DocumentContext';

// --- UTILIDADES ---
import { analyzeText } from './utils/textAnalyzer';
import { TONES, TONE_LABELS } from './services/aiPrompts';
import { supabase } from './lib/supabaseClient'

// --- COMPONENTES COMUNES ---
import { DashboardCard, MetricCard, ComparisonCard } from './components/common/StyleComponents';
import AIConfigModal from './components/common/AIConfigModal';
import AuthModal from './components/auth/AuthModal';
import PaywallModal from './components/common/PaywallModal';
import QuickEditorPanel from './components/common/QuickEditorPanel';
import RichTextEditor from './components/common/RichTextEditor';
import FileSidebar from './components/common/FileSidebar';

// --- VISTAS ---
import ComparisonView from './components/dashboard/ComparisonView';
import AdminDashboard from './components/admin/AdminDashboard';
// --- NUEVOS COMPONENTES DE GRÁFICO (Importados para renderDashboard) ---
import SismografoChart from './components/dashboard/SismografoChart';
import StartsPieChart from './components/dashboard/StartsPieChart';

// --- VISTAS DE DETALLE (Bloque Limpio) ---
import DetailProsody from './components/details/DetailProsody';
import DetailPassive from './components/details/DetailPassive';
import DetailReadability from './components/details/DetailReadability';
import DetailDialogue from './components/details/DetailDialogue';
import DetailSismografo from './components/details/DetailSismografo';
import DetailShowTell from './components/details/DetailShowTell';
import DetailBaul from './components/details/DetailBaul';
import DetailPunctuation from './components/details/DetailPunctuation';
import DetailMetrics from './components/details/DetailMetrics';
import DetailSenses from './components/details/DetailSenses';
import DetailCacophony from './components/details/DetailCacophony';
import DetailRepetitions from './components/details/DetailRepetitions';
import DetailAnaphora from './components/details/DetailAnaphora';
import DetailSticky from './components/details/DetailSticky';
import DetailPleonasms from './components/details/DetailPleonasms';
import DetailStarts from './components/details/DetailStarts';
import DetailUncountables from './components/details/DetailUncountables';
import DetailWeakVerbs from './components/details/DetailWeakVerbs';
import DetailArchaisms from './components/details/DetailArchaisms';

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
function StyleOptimizerApp() {
  const { tone, updateTone } = useAppContext();
  const { isPremium, upgradeToPremium, logout, user } = useUserContext();
  
  // Función auxiliar para extraer texto plano del HTML para el análisis
  const getPlainText = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.innerText || tempDiv.textContent || "";
  };

  // --- ESTADO GLOBAL (PERSISTENCIA Y ARCHIVOS) ---
  const { docContent, setDocContent, createNewDocument, docTitle, updateTitle } = useDocument();

  const [viewMode, setViewMode] = useState('input'); 
  
  const [analysisV1, setAnalysisV1] = useState(null);
  
  // ESTADOS MODALES Y PANELES
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showEditor, setShowEditor] = useState(false);

  // --- EFECTO DE SINCRONIZACIÓN ---
  useEffect(() => {
    if (viewMode === 'dashboard' && docContent && analysisV1) {
        const timer = setTimeout(() => {
            const plainText = getPlainText(docContent);
            const result = analyzeText(plainText);
            setAnalysisV1(result);
        }, 800);
        return () => clearTimeout(timer);
    }
  }, [docContent, viewMode]);

  // --- HANDLERS ---
  const handleAnalyze = () => {
    if (!user) {
        setShowAuthModal(true); 
        return;
    }

    try {
        const plainText = getPlainText(docContent);
    
        if (!plainText.trim()) return;
    
        const result1 = analyzeText(plainText); // <--- Aquí falla si la data es corrupta
        setAnalysisV1(result1);
        
        console.log("Análisis exitoso. Mostrando dashboard."); // Éxito
        
        setViewMode("dashboard");
        window.scrollTo(0,0);
        
    } catch (error) {
        // ERROR CRÍTICO: Muestra qué línea del analyzeText está fallando
        console.error("ERROR CRÍTICO DURANTE EL ANÁLISIS:", error); 
        alert("Error al procesar el texto. Por favor, revisa la consola para ver el fallo de sintaxis.");
        // Opcional: setViewMode("input"); para volver al editor
    }
};

  // Volver al editor SIN borrar nada (Navegación segura)
  const handleBackToEditor = () => {
      setViewMode("input");
  };

  // Crear nuevo archivo (Borrado destructivo con confirmación, gestionado por contexto)
  const handleNewFile = () => {
      createNewDocument();
      setAnalysisV1(null);
      setViewMode("input");
  };

  const handleManageSubscription = async () => {
      try {
          const { data, error } = await supabase.functions.invoke('payment-actions', {
              body: { 
                  action: 'manage', 
                  returnUrl: window.location.href 
              }
          });

          if (error) throw error;
          if (data?.url) window.location.href = data.url;
          
      } catch (err) {
          console.error("Error abriendo portal:", err);
          alert("No se pudo abrir el portal de facturación. Inténtalo más tarde.");
      }
  };

  // --- MAPA DE COMPONENTES ---
  const DETAIL_COMPONENTS = {
      'detail-prosody': DetailProsody, 'detail-passive': DetailPassive, 'detail-readability': DetailReadability,
      'detail-dialogue': DetailDialogue, 'detail-sismografo': DetailSismografo, 'detail-showtell': DetailShowTell,
      'detail-baul': DetailBaul, 'detail-punctuation': DetailPunctuation, 'detail-metrics': DetailMetrics,
      'detail-senses': DetailSenses, 'detail-cacophony': DetailCacophony, 'detail-repetitions': DetailRepetitions,
      'detail-anaphora': DetailAnaphora, 'detail-sticky': DetailSticky, 'detail-pleonasms': DetailPleonasms,
      'detail-starts': DetailStarts, 'detail-uncountables': DetailUncountables, 'detail-weakverbs': DetailWeakVerbs,
      'detail-archaisms': DetailArchaisms
  };

  const renderDetailView = () => {
      const ActiveComponent = DETAIL_COMPONENTS[viewMode];
      const activeAnalysis = analysisV1;
      if (ActiveComponent && activeAnalysis) {
          return <ActiveComponent analysis={activeAnalysis} onBack={() => setViewMode("dashboard")} />;
      }
      return null;
  };

  // VISTA DEMO
  const renderDemo = () => {
      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto py-8">
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-12 text-center text-white mb-16 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1 rounded-full text-indigo-200 text-sm font-bold mb-6 border border-white/10">
                        <Sparkles size={16} className="text-yellow-300"/> Potenciado con IA Gemini 2.0
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">Tu Editor Literario Personal</h1>
                    <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8 leading-relaxed">Analiza el ritmo, detecta vicios de estilo y reescribe frases complejas en segundos.</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => setShowAuthModal(true)} className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-indigo-50 transition hover:scale-105 flex items-center gap-2">
                            Crear Cuenta Gratis <ArrowRight size={20}/>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* GRID DE CARACTERÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600"><Activity size={24}/></div>
                        <h3 className="text-xl font-bold text-gray-800">Análisis Profundo (Free)</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Acceso a 18 métricas de estilo: Sismógrafo, Mapa Sensorial, Ritmo...</p>
                    <div className="h-2 w-full bg-indigo-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-500 w-3/4"></div></div>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Zap size={24}/></div>
                        <h3 className="text-xl font-bold text-gray-800">Corrección IA (Pro)</h3>
                    </div>
                    <p className="text-gray-600 mb-4">Reescritura automática de frases complejas, eliminación de paja y mejora de estilo.</p>
                    <div className="flex items-center gap-2 text-sm text-indigo-600 font-bold bg-indigo-50 p-2 rounded">
                        <Sparkles size={14}/> "Mejora este párrafo"
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-8 text-center text-slate-300">
                <h3 className="text-2xl font-bold text-white mb-4">¿Listo para empezar?</h3>
                <div className="flex justify-center gap-4">
                    <button onClick={() => setShowAuthModal(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-500 transition">Crear Cuenta Free</button>
                    <button onClick={() => { setViewMode('input'); window.scrollTo(0,0); }} className="bg-transparent border border-slate-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-slate-800 transition">Volver al Editor</button>
                </div>
            </div>
        </div>
      );
  };

  const renderDashboard = () => {
    const currentData = analysisV1;

    if (!currentData || !currentData.wordCount) {
        return <div className="text-center p-10 text-gray-500">Cargando análisis o documento vacío...</div>;
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* --- BARRA SUPERIOR DASHBOARD --- */}
            <div className="flex justify-between items-center mb-6">
                <button 
                    onClick={handleBackToEditor}
                    className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition px-4 py-2 rounded-lg hover:bg-indigo-50"
                >
                    <ChevronLeft size={20} /> Volver al Editor
                </button>
            </div>

            {/* 1. SECCIÓN DE MÉTRICAS BÁSICAS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard icon={<Type />} label="Palabras" value={currentData.wordCount} color="blue" />
                <MetricCard icon={<BookOpen />} label="Frases" value={currentData.sentenceCount} color="indigo" />
                <MetricCard icon={<Activity />} label="Tiempo Lectura" value={`~${Math.ceil(currentData.wordCount / 250)} min`} color="teal" subtext="Velocidad media" />
            </section>

            {/* 2. SISMÓGRAFO EN FILA COMPLETA (Visualización Horizontal) */}
            <section>
                <SismografoChart 
                    analysis={currentData} 
                    onViewDetail={() => setViewMode('detail-sismografo')}
                />
            </section>

            {/* 3. RITMO Y SINTAXIS */}
            <section className="space-y-6">
                <h3 className="text-2xl font-black text-slate-700 flex items-center gap-3 mb-8 pb-3 border-b-4 border-slate-200 uppercase tracking-wider">
                    <Activity className="text-indigo-500" /> Ritmo y Sintaxis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Tarjeta de Prosodia */}
                    <DashboardCard title="Prosodia" icon={<Mic2 />} onViewDetail={() => setViewMode('detail-prosody')}>
                        <div className="text-center py-2"><span className="text-xs text-gray-400">Análisis de acentuación y métrica</span></div>
                    </DashboardCard>

                    {/* Tarjetas de Métrica restantes para Ritmo y Sintaxis */}
                    <MetricCard icon={<PauseCircle />} label="Puntuación" value={currentData.punctuationDensity} color="orange" subtext="Comas por frase" onClick={() => setViewMode('detail-punctuation')} />
                    <MetricCard icon={<Gauge />} label="Legibilidad" value={currentData.readabilityScore} color="teal" onClick={() => setViewMode('detail-readability')} />

                    {/* GRÁFICO VARIACIÓN DE INICIO (Tarta) - Debe ir al final de esta sección */}
                    <StartsPieChart analysis={currentData} />
                    
                </div>
            </section>

            {/* 4. ESTILO Y VOCABULARIO (NUEVA SECCIÓN RESTAURADA) */}
            <section className="space-y-6">
                <h3 className="text-2xl font-black text-slate-700 flex items-center gap-3 mb-8 pb-3 border-b-4 border-purple-200 uppercase tracking-wider text-purple-800">
                    <Feather className="text-purple-500" /> Estilo y Vocabulario
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* --- TARJETAS PRO EN POSICIÓN DESTACADA (PRIMERAS TARJETAS) --- */}
                    
                    {/* Detector de Arcaísmos (PRO) */}
                    <div className="relative group col-span-1 row-span-1 lg:col-span-1">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl opacity-75 blur group-hover:opacity-100 transition duration-200"></div>
                        <div className="relative bg-white p-5 rounded-xl flex flex-col h-full border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><BookOpen size={24}/></div>
                                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                    <Sparkles size={10}/> PRO
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">Detector de Arcaísmos</h3>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                Escanea tu texto con IA en busca de vocabulario obsoleto o anacrónico.
                            </p>
                            <button 
                                onClick={() => setViewMode('detail-archaisms')}
                                className="mt-auto w-full py-2 bg-amber-50 text-amber-700 font-bold text-xs rounded-lg hover:bg-amber-100 transition flex items-center justify-center gap-2 group/btn"
                            >
                                Abrir Escáner <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform"/>
                            </button>
                        </div>
                    </div>

                    {/* Show, Don't Tell (PRO) */}
                    <div className="relative group col-span-1 row-span-1 lg:col-span-1">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-600 rounded-xl opacity-75 blur group-hover:opacity-100 transition duration-200"></div>
                        <div className="relative bg-white p-5 rounded-xl flex flex-col h-full border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Eye size={24}/></div>
                                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                    <Sparkles size={10}/> PRO
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1">Show, Don't Tell</h3>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                                Detecta descripciones abstractas ("Telling") y sugiere escenas sensoriales ("Showing").
                            </p>
                            <button 
                                onClick={() => setViewMode('detail-showtell')}
                                className="mt-auto w-full py-2 bg-green-50 text-green-700 font-bold text-xs rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2 group/btn"
                            >
                                Analizar Narrativa <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform"/>
                            </button>
                        </div>
                    </div>
                    
                    {/* --- RESTO DE MÉTRICAS DE ESTILO Y VOCABULARIO --- */}
                    
                    {/* NEW: Vicios (-ción / -mente) */}
                    <MetricCard 
                        icon={<Zap />} 
                        label="Vicios (-ción / -mente)" 
                        value={ (currentData.cionWords?.length || 0) + (currentData.menteWords?.length || 0) } 
                        color="red" 
                        subtext="Revisar ahora"
                        onClick={() => setViewMode('detail-metrics')} 
                    />

                    {/* Antiguas métricas (Incluye la antigua "Densidad - Ver Mapa") */}
                    <MetricCard icon={<RefreshCcw />} label="Anáforas" value={currentData.anaphoraAlerts.length} color="teal" onClick={() => setViewMode('detail-anaphora')} />
                    <MetricCard icon={<Layers />} label="Densidad" value="Ver Mapa" color="purple" onClick={() => setViewMode('detail-metrics')} />
                    <MetricCard icon={<StickyNote />} label="Frases Pegajosas" value={currentData.stickySentences.length} color="red" onClick={() => setViewMode('detail-sticky')} />
                    <MetricCard icon={<Repeat />} label="Repeticiones" value={currentData.repetitions.length} color="blue" onClick={() => setViewMode('detail-repetitions')} />
                    <MetricCard icon={<Trash2 />} label="Pleonasmos" value={currentData.pleonasmsFound.length} color="red" onClick={() => setViewMode('detail-pleonasms')} />
                    <MetricCard icon={<Zap />} label="Fuerza Verbal" value={currentData.weakAdverbs.length} color="purple" subtext="Verbos débiles" onClick={() => setViewMode('detail-weakverbs')} />
                    <MetricCard icon={<Package />} label="Palabras Baúl" value={currentData.baulWords.length} color="orange" onClick={() => setViewMode('detail-baul')} />
                    <MetricCard icon={<Hash />} label="Incontables" value={currentData.uncountablesFound.length} color="teal" onClick={() => setViewMode('detail-uncountables')} />
                    <MetricCard icon={<Music />} label="Cacofonías" value={currentData.cacophonies.length} color="red" onClick={() => setViewMode('detail-cacophony')} />
                    <MetricCard icon={<Fingerprint />} label="Sensorium" value="Ver Mapa" color="teal" onClick={() => setViewMode('detail-senses')} />
                    <MetricCard icon={<UserX />} label="Voz Pasiva" value={currentData.passiveCount} color="gray" onClick={() => setViewMode('detail-passive')} />
                    <MetricCard icon={<MessageSquare />} label="Diálogo" value={`${currentData.dialogueRatio}%`} color="blue" onClick={() => setViewMode('detail-dialogue')} />

                </div>
            </section>
        </div>
      );
  };

  const renderInput = () => {
    if (!user) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 py-12">
                 <div className="text-center py-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Analizador de Estilo Literario</h2>
                    <p className="text-gray-500 max-w-lg mx-auto text-lg">Diagnóstico profundo de ritmo y estilo.</p>
                </div>

                 <div className="bg-white rounded-3xl shadow-xl border border-indigo-50 p-12 text-center space-y-6 max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Lock size={40} className="text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Desbloquea tu Editor Inteligente</h3>
                    <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
                        Para analizar tu estilo, detectar vicios y mejorar tu ritmo, necesitas acceder a tu cuenta.
                    </p>
                    <div className="inline-block bg-green-100 text-green-800 text-sm font-bold px-4 py-1 rounded-full mb-4">
                        ✨ Plan Gratuito Disponible
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                        <button onClick={() => setShowAuthModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center justify-center gap-3">
                            <User size={20} /> Entrar / Crear Cuenta
                        </button>
                        <button onClick={() => { setViewMode('demo'); window.scrollTo(0,0); }} className="bg-white text-gray-600 border border-gray-200 px-8 py-4 rounded-xl font-bold text-lg shadow-sm hover:bg-gray-50 hover:text-indigo-600 transition-all flex items-center justify-center gap-3">
                            <Eye size={20} /> Ver Demo
                        </button>
                    </div>
                 </div>
            </div>
        );
    }

    // --- NUEVO LAYOUT CON SIDEBAR ---
    return (
      // 1. Contenedor principal que define el área de trabajo (flex-col para organizar verticalmente)
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 h-[calc(100vh-140px)] flex flex-col">
          
          {/* HEADER DE LA SECCIÓN DE ESCRITURA (NO SCROLLABLE) */}
          <div className="flex justify-between items-center pb-2 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg"><Edit size={18}/></span>
                <h2 className="text-xl font-bold text-gray-800">Estudio de Escritura</h2>
              </div>
              
              <div className="flex gap-3">
                 <button onClick={handleAnalyze} disabled={!getPlainText(docContent).trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                    <Activity size={16} /> Analizar Estilo
                </button>
              </div>
          </div>
          
          {/* LAYOUT PRINCIPAL: SIDEBAR + EDITOR (CORREGIDO PARA SCROLL Y DATA) */}
          {/* 2. Este contenedor toma el espacio vertical restante y organiza los dos paneles horizontalmente */}
          <div className="flex h-full gap-6 items-start flex-grow">
              
              {/* 1. SIDEBAR DE ARCHIVOS (ALTURA COMPLETA) */}
              <div className="w-64 flex-shrink-0 h-full rounded-2xl shadow-lg overflow-hidden border border-gray-200 hidden md:block">
                  <FileSidebar />
              </div>

              {/* 2. ÁREA DE EDICIÓN: El contenedor principal del editor debe tener un scroll visible */}
              <div className="flex-grow flex flex-col gap-4 h-full">
                  
                  {/* EDITOR V1 (PRINCIPAL) */}
                  {/* FIX FINAL DE SCROLL/DATA: Aplicamos altura FIJA a todo el contenedor del editor para garantizar el scroll */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col relative group h-[650px] overflow-hidden">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                        {/* INPUT PARA EL TÍTULO DEL DOCUMENTO */}
                        <div className="flex items-center gap-2 flex-grow">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <input 
                                type="text" 
                                value={docTitle}
                                onChange={(e) => updateTitle(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 uppercase tracking-wide w-full placeholder-gray-400 p-0"
                                placeholder="TÍTULO DEL CAPÍTULO..."
                            />
                        </div>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-4">{getPlainText(docContent).length} car.</span>
                    </div>
                    
                    {/* SCROLL AREA: Este div toma el espacio restante y HABILITA el scroll del ratón/barra */}
                    <div className="flex-grow overflow-y-auto"> 
                        <RichTextEditor 
                            content={docContent}
                            onChange={setDocContent}
                            placeholder="Érase una vez..."
                            className="border-none shadow-none rounded-none"
                        />
                    </div>
                  </div>
                  
                  {/* ELIMINADA LA SECCIÓN DE COMPARACIÓN */}
              </div>
          </div>
      </div>
    );
  };

  if (showAdmin) return <AdminDashboard onExit={() => setShowAdmin(false)} />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Click en logo ahora lleva al editor SIN borrar */}
            <div onClick={handleBackToEditor} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="bg-white/10 p-2 rounded-lg"><Feather size={20} className="text-indigo-100" /></div>
                <div><h1 className="text-xl font-bold leading-none">Style Optimizer</h1><span className="text-xs text-indigo-300 font-medium tracking-wider">AI EDITION</span></div>
            </div>
            
            <div className="flex items-center gap-3">
                {user && viewMode !== 'input' && (
                    <button onClick={() => setShowEditor(!showEditor)} className={`p-2 rounded-lg border transition-colors ${showEditor ? 'bg-white text-indigo-600 border-white' : 'bg-indigo-800/50 text-indigo-200 border-indigo-600 hover:text-white'}`} title="Abrir Editor Rápido"><PenTool size={18} /></button>
                )}
                <button onClick={() => setShowConfigModal(true)} className="p-2 bg-indigo-800/50 hover:bg-indigo-800 rounded-lg border border-indigo-600 text-indigo-200 hover:text-white transition-colors"><Settings size={18} /></button>

                <div className="relative">
                    <button onClick={() => setShowToneMenu(!showToneMenu)} className="flex items-center gap-2 bg-indigo-800/50 hover:bg-indigo-800 px-3 py-2 rounded-lg text-xs font-medium transition border border-indigo-600 min-w-[140px] justify-between"><span className="flex items-center gap-2 text-indigo-200">Tono: <span className="text-white font-bold">{TONE_LABELS[tone].split(' ')[1]}</span></span><span className="text-indigo-400 text-[10px]">▼</span></button>
                    {showToneMenu && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowToneMenu(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden text-gray-700 z-50 animate-in fade-in zoom-in-95 duration-100">
                                {Object.entries(TONES).map(([key, val]) => (<button key={key} onClick={() => { updateTone(val); setShowToneMenu(false); }} className={`w-full text-left px-4 py-3 text-xs hover:bg-indigo-50 border-b border-gray-50 ${tone === val ? 'bg-indigo-50 font-bold text-indigo-600' : ''}`}>{TONE_LABELS[val]}</button>))}
                            </div>
                        </>
                    )}
                </div>

                {/* BOTONES SIMPLIFICADOS: SOLO EDITOR */}
                <div className="bg-indigo-800/50 p-1 rounded-lg flex text-xs font-medium border border-indigo-600">
                    <button onClick={handleBackToEditor} className="px-3 py-1 rounded transition-all flex items-center gap-2 bg-white text-indigo-700 shadow-sm"><Edit size={14} /> Editor</button>
                </div>

                {user ? (
                    <div className="relative">
                        <div className="flex items-center bg-indigo-900/50 rounded-lg p-1 border border-indigo-600/50 cursor-pointer hover:border-indigo-400 transition-all" onClick={() => setShowUserMenu(!showUserMenu)}>
                            <div className="px-3 flex flex-col items-start justify-center h-full"><span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider leading-tight">{isPremium ? 'PRO Plan' : 'Free Plan'}</span></div>
                            <button onClick={(e) => { e.stopPropagation(); if (!isPremium) setShowPaywallModal(true); }} className={`px-3 py-1.5 rounded-md text-xs font-bold shadow-sm transition-all flex items-center gap-1 ${isPremium ? 'bg-emerald-500 text-white cursor-default' : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-105'}`}>{isPremium ? <><Crown size={12}/> Activo</> : 'Upgrade'}</button>
                        </div>
                        {showUserMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden text-gray-700 z-50 animate-in fade-in zoom-in-95 duration-100 p-1">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Conectado como</p>
                                        <p className="text-sm font-bold text-gray-800 truncate">{user.email}</p>
                                    </div>
                                    
                                    {isPremium && (
                                        <button 
                                            onClick={() => { setShowUserMenu(false); handleManageSubscription(); }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg text-gray-700 font-medium flex items-center gap-2 transition-colors mb-1"
                                        >
                                            <CreditCard size={16}/> Gestionar Suscripción
                                        </button>
                                    )}

                                    {!isPremium && (
                                        <button 
                                            onClick={() => { setShowUserMenu(false); setShowPaywallModal(true); }} 
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 rounded-lg text-indigo-600 font-bold flex items-center gap-2 mb-1"
                                        >
                                            <Zap size={16}/> Pasarme a PRO
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => { setShowUserMenu(false); logout(); }} 
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 rounded-lg text-red-600 flex items-center gap-2 transition-colors"
                                    >
                                        <LogOut size={16}/> Cerrar Sesión
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm transition hover:shadow-md border border-indigo-500">Entrar / Registro</button>
                )}
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 flex-grow print:p-0">
        {viewMode === 'input' && renderInput()}
        {viewMode === 'dashboard' && renderDashboard()}
        {viewMode === 'demo' && renderDemo()}
        {viewMode.startsWith('detail-') && renderDetailView()}
      </main>

      {/* QuickEditorPanel AHORA USA EL CONTEXTO GLOBAL */}
      <QuickEditorPanel 
          isOpen={showEditor} 
          onClose={() => setShowEditor(false)}
          text={docContent}      // Pasamos el estado global
          setText={setDocContent} // Pasamos el setter global
          onReanalyze={handleAnalyze} 
      />

      {showConfigModal && <AIConfigModal onClose={() => setShowConfigModal(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showPaywallModal && <PaywallModal onClose={() => setShowPaywallModal(false)} featureName="Plan PRO Completo" />}

      <footer className="bg-slate-900 text-slate-400 py-8 mt-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm">Style Optimizer AI &copy; 2025</div>
              <div className="flex gap-6 text-sm items-center">
                  {user && (
                      <div className="flex items-center gap-3 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-slate-300 truncate max-w-[150px]">{user.email}</span>
                          <button onClick={logout} className="text-xs text-red-400 hover:text-red-300 font-bold border-l border-slate-600 pl-3 ml-1">Salir</button>
                      </div>
                  )}
                  {user?.email === 'victorbalcells@gmail.com' && (
                      <button onClick={() => setShowAdmin(true)} className="text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded border border-indigo-700 hover:bg-indigo-800 transition-colors flex items-center gap-1">
                          <Settings size={12} /> Admin
                      </button>
                  )}
                  <a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Globe size={16}/> Web</a>
                  <a href="#" className="hover:text-red-400 transition-colors flex items-center gap-2"><Youtube size={16}/> YouTube</a>
              </div>
          </div>
      </footer>
    </div>
  );
}

export default function App() {
    return (
        <AppProvider>
            <UserProvider>
                <DocumentProvider> {/* <--- Importante: Envolver aquí */}
                    <StyleOptimizerApp />
                </DocumentProvider>
            </UserProvider>
        </AppProvider>
    );
}