import React, { useState } from 'react';
import { 
  BookOpen, Activity, Repeat, Mic2, AlertTriangle, Feather, Eye, Type, 
  Music, Zap, Layers, PauseCircle, RefreshCcw, MessageSquare, Gauge, 
  UserX, Printer, Globe, Youtube, Edit, Package, Hash, StickyNote, Trash2,
  PieChart as PieChartIcon, Fingerprint, Crown, LogOut, Settings, User, ChevronDown,
  Sparkles, ArrowRight, Check, X, Lock, PenTool, CreditCard 
} from 'lucide-react';

// --- CONTEXTOS ---
import { AppProvider, useAppContext } from './context/AppContext';
import { UserProvider, useUserContext } from './context/UserContext';

// --- UTILIDADES ---
import { analyzeText } from './utils/textAnalyzer';
import { TONES, TONE_LABELS } from './services/aiPrompts';
import { supabase } from './lib/supabaseClient'

// --- COMPONENTES COMUNES ---
import { DashboardCard, MetricCard, ComparisonCard } from './components/common/StyleComponents';
import AIConfigModal from './components/common/AIConfigModal';
import AuthModal from './components/auth/AuthModal';
import PaywallModal from './components/common/PaywallModal';
import QuickEditorPanel from './components/common/QuickEditorPanel'; // <--- QuickEditorPanel añadido

// --- VISTAS ---
import ComparisonView from './components/dashboard/ComparisonView';
import AdminDashboard from './components/admin/AdminDashboard';

// --- VISTAS DE DETALLE ---
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

  const [mode, setMode] = useState('single');
  const [viewMode, setViewMode] = useState('input'); 
  
  const [textV1, setTextV1] = useState("");
  const [analysisV1, setAnalysisV1] = useState(null);
  const [textV2, setTextV2] = useState("");
  const [analysisV2, setAnalysisV2] = useState(null);
  
  // ESTADOS MODALES Y PANELES
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showEditor, setShowEditor] = useState(false); // <--- Estado del editor

  // --- HANDLERS ---
  const handleAnalyze = () => {
    if (!user) {
        setShowAuthModal(true); 
        return;
    }
    if (!textV1.trim()) return;
    const result1 = analyzeText(textV1);
    setAnalysisV1(result1);

    if (mode === 'compare' && textV2.trim()) {
        const result2 = analyzeText(textV2);
        setAnalysisV2(result2);
    }
    setViewMode("dashboard");
  };

  const handleReset = () => {
      setAnalysisV1(null);
      setAnalysisV2(null);
      setTextV1("");
      setTextV2("");
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
      const activeAnalysis = (mode === 'compare' && analysisV2) ? analysisV2 : analysisV1;
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
      const currentData = (mode === 'compare' && analysisV2) ? analysisV2 : analysisV1;
      return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {mode === 'compare' && analysisV2 && <ComparisonView analysisV1={analysisV1} analysisV2={analysisV2} />}
            
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard icon={<Type />} label="Palabras" value={currentData.wordCount} color="blue" />
                <MetricCard icon={<BookOpen />} label="Frases" value={currentData.sentenceCount} color="indigo" />
                <MetricCard icon={<Activity />} label="Tiempo Lectura" value={`~${Math.ceil(currentData.wordCount / 250)} min`} color="teal" subtext="Velocidad media" />
            </section>

            <section className="space-y-6">
                <h3 className="text-2xl font-black text-slate-700 flex items-center gap-3 mb-8 pb-3 border-b-4 border-slate-200 uppercase tracking-wider">
                    <Activity className="text-indigo-500" /> Ritmo y Sintaxis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DashboardCard title="Sismógrafo" icon={<Activity />} onViewDetail={() => setViewMode('detail-sismografo')}>
                        <div className="text-center py-2"><span className="text-3xl font-bold text-indigo-600">{currentData.sentenceLengths.length}</span><p className="text-xs text-gray-400">frases analizadas</p></div>
                    </DashboardCard>
                    <DashboardCard title="Prosodia" icon={<Mic2 />} onViewDetail={() => setViewMode('detail-prosody')}>
                        <div className="text-center py-2"><span className="text-xs text-gray-400">Análisis de acentuación y métrica</span></div>
                    </DashboardCard>
                    <MetricCard icon={<PauseCircle />} label="Puntuación" value={currentData.punctuationDensity} color="orange" subtext="Comas por frase" onClick={() => setViewMode('detail-punctuation')} />
                    <MetricCard icon={<Gauge />} label="Legibilidad" value={currentData.readabilityScore} color="teal" onClick={() => setViewMode('detail-readability')} />
                    <MetricCard icon={<RefreshCcw />} label="Anáforas" value={currentData.anaphoraAlerts.length} color="teal" onClick={() => setViewMode('detail-anaphora')} />
                    <MetricCard icon={<PieChartIcon />} label="Variedad Inicio" value="Analizar" color="blue" onClick={() => setViewMode('detail-starts')} />
                </div>
            </section>

            <section className="space-y-6">
                <h3 className="text-2xl font-black text-slate-700 flex items-center gap-3 mb-8 pb-3 border-b-4 border-purple-200 uppercase tracking-wider text-purple-800">
                    <Feather className="text-purple-500" /> Estilo y Vocabulario
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* --- TARJETA HERO 1: ARCAÍSMOS (PRO) --- */}
                    <div className="relative group col-span-1 row-span-1 md:col-span-2 lg:col-span-1">
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

                    {/* --- TARJETA HERO 2: SHOW VS TELL (PRO) --- */}
                    <div className="relative group col-span-1 row-span-1 md:col-span-2 lg:col-span-1">
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

                    {/* --- TARJETAS ESTÁNDAR --- */}
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

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
          <div className="text-center py-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{mode === 'compare' ? 'Comparador de Versiones' : 'Analizador de Estilo Literario'}</h2>
              <p className="text-gray-500 max-w-lg mx-auto text-lg">{mode === 'compare' ? 'Mide tu progreso científicamente.' : 'Diagnóstico profundo de ritmo y estilo.'}</p>
          </div>
          
          <div className={`grid gap-8 transition-all duration-500 ${mode === 'compare' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-96 relative group">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                    <label className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gray-400"></div>{mode === 'compare' ? 'Original (V1)' : 'Tu Texto'}</label>
                    <span className="text-xs text-gray-400">{textV1.length} car.</span>
                </div>
                <textarea 
                    className="w-full flex-grow p-6 focus:ring-0 border-none outline-none resize-none text-lg leading-relaxed font-serif text-gray-700 placeholder-gray-300" 
                    placeholder="Escribe o pega aquí el texto..." 
                    value={textV1} 
                    onChange={(e) => setTextV1(e.target.value)} 
                />
              </div>
              
              {mode === 'compare' && (
                  <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden flex flex-col h-96 relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
                    <div className="bg-indigo-50/50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
                        <label className="text-sm font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                            Editada (V2)
                        </label>
                        <span className="text-xs text-indigo-400">{textV2.length} car.</span>
                    </div>
                    <textarea className="w-full flex-grow p-6 focus:ring-0 border-none outline-none resize-none text-lg leading-relaxed font-serif text-gray-700 placeholder-indigo-200/50 bg-indigo-50/10" placeholder="Pega aquí la versión corregida..." value={textV2} onChange={(e) => setTextV2(e.target.value)} />
                  </div>
              )}
          </div>

          <div className="flex justify-center pt-4 gap-4">
            <button onClick={handleAnalyze} disabled={!textV1.trim() || (mode === 'compare' && !textV2.trim())} className="group bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3">
                <Activity className="w-5 h-5 group-hover:animate-pulse" /> {mode === 'compare' ? 'Comparar Versiones' : 'Analizar Texto'}
            </button>
          </div>
      </div>
    );
  };

  if (showAdmin) return <AdminDashboard onExit={() => setShowAdmin(false)} />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <div onClick={handleReset} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="bg-white/10 p-2 rounded-lg"><Feather className="w-6 h-6 text-indigo-100" /></div>
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

                <div className="bg-indigo-800/50 p-1 rounded-lg flex text-xs font-medium border border-indigo-600">
                    <button onClick={() => { setMode('single'); handleReset(); }} className={`px-3 py-1 rounded transition-all flex items-center gap-2 ${mode === 'single' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-200 hover:text-white'}`}><Edit size={14} /> Editor</button>
                    <button onClick={() => { setMode('compare'); handleReset(); }} className={`px-3 py-1 rounded transition-all flex items-center gap-2 ${mode === 'compare' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-200 hover:text-white'}`}><Layers size={14} /> Comparar</button>
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
                                    
                                    {/* --- NUEVO: GESTIONAR SUSCRIPCIÓN (Solo para PRO) --- */}
                                    {isPremium && (
                                        <button 
                                            onClick={() => { setShowUserMenu(false); handleManageSubscription(); }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-lg text-gray-700 font-medium flex items-center gap-2 transition-colors mb-1"
                                        >
                                            <CreditCard size={16}/> Gestionar Suscripción
                                        </button>
                                    )}

                                    {/* Botón Upgrade (Solo para Free) */}
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

      <QuickEditorPanel 
          isOpen={showEditor} 
          onClose={() => setShowEditor(false)}
          text={textV1}
          setText={setTextV1}
          onReanalyze={handleAnalyze} 
      />

      {showConfigModal && <AIConfigModal onClose={() => setShowConfigModal(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showPaywallModal && <PaywallModal onClose={() => setShowPaywallModal(false)} featureName="Plan PRO Completo" />}

      <footer className="bg-slate-900 text-slate-400 py-8 mt-12 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm">Style Optimizer AI &copy; 2024</div>
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
                <StyleOptimizerApp />
            </UserProvider>
        </AppProvider>
    );
}