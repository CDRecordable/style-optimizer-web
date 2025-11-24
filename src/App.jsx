import React, { useState } from 'react';
import { 
  BookOpen, Activity, Repeat, Mic2, AlertTriangle, Feather, Eye, Type, ArrowLeft,
  Music, Zap, Layers, Fingerprint, Ear, Utensils,
  PauseCircle, RefreshCcw, MessageSquare, Gauge, UserX, Printer, Globe, Youtube, 
  Edit, Package, AlignJustify, Minus, List, ArrowRight, Clock, ArrowDown, Info,
  StickyNote, Trash2, PieChart, CheckCircle2, XCircle, Table, BarChart2
} from 'lucide-react';
import { 
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    CartesianGrid, Legend, Cell, PieChart as RePie, Pie 
} from 'recharts';

import { 
    analyzeText, 
    VERBOS_PERCEPCION, 
    VERBOS_BAUL, 
    SUSTANTIVOS_BAUL, 
    SENSORY_DICT, 
    SUFIJOS_ADJETIVOS, 
    STOPWORDS,
    PALABRAS_BAUL 
} from './utils/textAnalyzer';

import { 
    DashboardCard, 
    MetricCard, 
    Badge, 
    ComparisonCard 
} from './components/StyleComponents';

// --- TOOLTIP PERSONALIZADO ---
const CustomBarTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-xl border border-slate-700 z-50">
          <p className="font-bold text-slate-300 mb-1">Frase {label}</p>
          <p className="text-sm">
            <span className="font-bold text-white">{data.realValue || data.value || data.count || data.len}</span> {unit}
          </p>
          {data.alert && <p className="text-xs text-yellow-300 mt-1 font-bold uppercase">{data.alert}</p>}
        </div>
      );
    }
    return null;
};

// --- COMPONENTE DE ENCABEZADO DE SECCIÓN ---
const SectionHeader = ({ icon, title, colorClass }) => (
    <h3 className={`text-2xl font-black text-slate-700 flex items-center gap-3 mb-8 pb-3 border-b-4 border-slate-200 uppercase tracking-wider ${colorClass}`}>
        {icon}
        {title}
    </h3>
);

export default function StyleOptimizer() {
  const [mode, setMode] = useState('single'); 
  
  const [textV1, setTextV1] = useState("");
  const [analysisV1, setAnalysisV1] = useState(null);
  
  const [textV2, setTextV2] = useState("");
  const [analysisV2, setAnalysisV2] = useState(null);

  const [viewMode, setViewMode] = useState('input'); 

  const handleAnalyze = () => {
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

  const handlePrint = () => {
      window.print();
  };

  // --- VISTAS DE DETALLE ---
  const renderDetailView = () => {
    const analysis = analysisV1;
    if (!analysis) return null;
    const paragraphs = analysis.rawText.split(/\n+/);
    
    // 1. DETALLE: ESCÁNER PROSÓDICO
    if (viewMode === 'detail-prosody') {
        const rhythmTimeline = analysis.rhythmAnalysis.map(s => ({
            hasDactyl: s.highlights.some(h => h.type === 'Dactílico'),
            hasAmphibrach: s.highlights.some(h => h.type === 'Anfíbraco'),
            hasTrochee: s.highlights.some(h => h.type === 'Trocaico')
        }));

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Mic2 className="text-indigo-500" /> Escáner Prosódico</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="mb-10 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2"><Activity size={16}/> Partitura Rítmica (Evolución)</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4"><span className="text-xs font-bold text-indigo-600 w-16 text-right uppercase">Vals</span><div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden flex">{rhythmTimeline.map((r, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 ${r.hasDactyl ? 'bg-indigo-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Ritmo Dactílico`}/>))}</div></div>
                        <div className="flex items-center gap-4"><span className="text-xs font-bold text-emerald-600 w-16 text-right uppercase">Narrativo</span><div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden flex">{rhythmTimeline.map((r, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 ${r.hasAmphibrach ? 'bg-emerald-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Ritmo Anfíbraco`}/>))}</div></div>
                        <div className="flex items-center gap-4"><span className="text-xs font-bold text-amber-600 w-16 text-right uppercase">Machacón</span><div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden flex">{rhythmTimeline.map((r, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 ${r.hasTrochee ? 'bg-amber-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Ritmo Trocaico`}/>))}</div></div>
                    </div>
                </div>
                <div className="space-y-6 font-serif text-lg leading-relaxed text-gray-700">
                    {analysis.rhythmAnalysis.map((sentData, idx) => {
                        if (!sentData) return null;
                        if (sentData.highlights.length === 0) return <p key={idx} className="mb-2 opacity-70">{sentData.text}</p>;
                        return (
                            <div key={idx} className="p-4 rounded-lg border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all bg-white relative group">
                                <span className="absolute top-2 right-2 text-xs font-sans font-bold text-gray-300">Frase {idx+1}</span>
                                <div className="flex flex-wrap gap-x-3 gap-y-4 items-end leading-none">
                                    {sentData.prosody.map((w, wIdx) => {
                                        const highlight = sentData.highlights.find(h => wIdx >= h.startWordIdx && wIdx <= h.endWordIdx);
                                        let containerClass = "flex flex-col items-center group relative p-1 rounded";
                                        let label = null;
                                        if (highlight) {
                                            if (highlight.type === 'Dactílico') { containerClass += " bg-indigo-50 text-indigo-900"; if(wIdx===highlight.startWordIdx) label="Dáctilo"; }
                                            else if (highlight.type === 'Anfíbraco') { containerClass += " bg-emerald-50 text-emerald-900"; if(wIdx===highlight.startWordIdx) label="Anfíbraco"; }
                                            else if (highlight.type === 'Trocaico') { containerClass += " bg-amber-50 text-amber-900"; if(wIdx===highlight.startWordIdx) label="Troqueo"; }
                                        }
                                        return (
                                            <div key={wIdx} className={containerClass}>
                                                {label && <span className="absolute -top-4 left-0 text-[9px] font-sans font-bold uppercase tracking-wider text-gray-400">{label}</span>}
                                                <div className="flex gap-[2px] mb-2">{w.syllableMap.map((isStressed, sIdx) => (<div key={sIdx} className={`rounded-full transition-all ${isStressed && !STOPWORDS.has(w.clean) ? 'bg-indigo-600 w-2 h-2' : 'bg-gray-200 w-1.5 h-1.5'}`} />))}</div><span>{w.clean}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    // 2. DETALLE: VOZ PASIVA (AÑADIDO GRÁFICO)
    if (viewMode === 'detail-passive') {
        const activeSentences = analysis.sentenceCount - analysis.passiveCount;
        const data = [
            { name: 'Activa', value: activeSentences },
            { name: 'Pasiva', value: analysis.passiveCount },
        ];
        const COLORS = ['#4ade80', '#94a3b8'];

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><UserX className="text-gray-500" /> Voz Pasiva e Impersonal</h2><button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button></div>
                
                {/* CONTEXTO Y GRÁFICO */}
                <div className="flex flex-col md:flex-row gap-8 mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <div className="w-full md:w-1/3 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePie>
                                <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} fill="#8884d8" dataKey="value" paddingAngle={5}>
                                    {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </RePie>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-2/3 space-y-3">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><AlertTriangle className="text-amber-500" size={20}/> ¿Por qué evitar la pasiva?</h3>
                        <p className="text-sm text-slate-600">La voz pasiva ("fue hecho por") oculta al responsable de la acción y alarga la frase innecesariamente. En español, suena burocrática o traducida del inglés. <br/><br/><strong>Objetivo:</strong> Mantener la pasiva por debajo del 5% de tus frases.</p>
                    </div>
                </div>

                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">{paragraphs.map((para, pIdx) => ( <p key={pIdx} className="mb-6"> {para.split(/(\s+)/).map((w, i) => { if (!/\w+/.test(w)) return <span key={i}>{w}</span>; const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, ""); const isPassive = (clean === 'se' || clean === 'fue' || clean === 'fueron' || clean === 'sido' || clean === 'siendo'); return <span key={i} className={isPassive ? "bg-slate-200 text-slate-800 font-bold border-b-2 border-slate-400 px-1 rounded cursor-help" : ""}>{w}</span>; })} </p> ))}</div>
            </div>
        );
    }
    // 3. DETALLE: LEGIBILIDAD
    if (viewMode === 'detail-readability') {
        const score = analysis.readabilityScore;
        let label = "Normal"; let color = "text-yellow-600"; let bg = "bg-yellow-50";
        if (score > 80) { label = "Muy Fácil"; color = "text-green-600"; bg = "bg-green-50"; }
        else if (score > 60) { label = "Fácil"; color = "text-green-500"; bg = "bg-green-50"; }
        else if (score > 40) { label = "Normal"; color = "text-yellow-600"; bg = "bg-yellow-50"; }
        else { label = "Difícil"; color = "text-red-600"; bg = "bg-red-50"; }

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="flex justify-between items-center mb-6 border-b pb-4"><h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Gauge className="text-teal-500" /> Índice de Legibilidad</h2><button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button></div>
                <div className="flex flex-col items-center justify-center py-12 space-y-8"><div className={`relative w-64 h-64 flex items-center justify-center rounded-full border-[16px] ${bg.replace('bg-', 'border-')} transition-all duration-1000`}><div className="text-center"><span className={`text-7xl font-black ${color} tracking-tighter`}>{score}</span><span className="block text-xs text-gray-400 uppercase mt-2 tracking-widest">Escala F. Huerta</span></div></div><div className="text-center max-w-lg"><h3 className={`text-3xl font-bold ${color} mb-2`}>{label}</h3><p className="text-gray-600 text-lg">Este índice mide la complejidad estructural del texto basándose en la longitud de las palabras y de las oraciones.</p></div></div>
            </div>
        );
    }
    // 4. DETALLE: DIÁLOGO
    if (viewMode === 'detail-dialogue') {
         return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4"><h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><MessageSquare className="text-blue-500" /> Radiografía de Diálogo</h2><button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button></div>
                <div className="mb-8 bg-slate-50 p-4 rounded-xl"><div className="flex justify-between text-sm font-bold text-gray-600 mb-2"><span>Narrativa ({100 - analysis.dialogueRatio}%)</span><span>Diálogo ({analysis.dialogueRatio}%)</span></div><div className="h-6 bg-gray-200 rounded-full overflow-hidden flex shadow-inner"><div className="h-full bg-slate-400" style={{width: `${100 - analysis.dialogueRatio}%`}}></div><div className="h-full bg-blue-500" style={{width: `${analysis.dialogueRatio}%`}}></div></div></div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">{paragraphs.map((para, pIdx) => { if (!para.trim()) return null; const startsWithDialogue = /^[—–\-―«"“]/.test(para.trim()); return startsWithDialogue ? <p key={pIdx} className="mb-4 p-4 rounded-r-xl bg-blue-50 border-l-4 border-blue-400 text-blue-900 font-medium">{para}</p> : <p key={pIdx} className="mb-4 opacity-80">{para}</p>; })}</div>
            </div>
         );
    }
    // 5. DETALLE: SISMÓGRAFO
    if (viewMode === 'detail-sismografo') {
         let globalSentenceIdx = 0; 
         const chartData = analysis.sentenceLengths.map((len, i) => {
             const alert = analysis.sismografoAlerts.find(a => i >= a.start && i <= a.end);
             let color = "#818cf8"; 
             let label = null;
             if (alert) {
                 if (alert.type === 'staccato') { color = "#3b82f6"; label = "Staccato"; }
                 if (alert.type === 'wall') { color = "#ef4444"; label = "Muro"; }
                 if (alert.type === 'flat') { color = "#9ca3af"; label = "Plano"; }
             }
             return { id: i+1, len, color, alert: label };
         });

         return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Activity className="text-indigo-500" /> Mapa de Longitud y Cadencia</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>

                {/* --- LEYENDA AÑADIDA --- */}
                <div className="flex flex-wrap justify-center gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 rounded shadow-sm"></div> <span className="text-xs font-bold text-gray-600">Staccato (Rápido)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded shadow-sm"></div> <span className="text-xs font-bold text-gray-600">Muro (Denso)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded shadow-sm"></div> <span className="text-xs font-bold text-gray-600">Monotonía (Repetitivo)</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-400 rounded shadow-sm"></div> <span className="text-xs font-bold text-gray-600">Fluido (Normal)</span></div>
                </div>

                <div className="h-64 w-full mb-8">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="id" tick={{fontSize: 10}} tickLine={false} axisLine={false} interval={4} />
                            <YAxis hide />
                            <Tooltip content={<CustomBarTooltip unit="palabras" />} cursor={{fill: 'transparent'}} />
                            <Bar dataKey="len" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                   {paragraphs.map((para, pIdx) => {
                       if (!para.trim()) return null;
                       const sentences = para.split(/([.!?]+)/);
                       const renderedSentences = [];
                       let buffer = "";
                       for (let i = 0; i < sentences.length; i++) {
                           const part = sentences[i];
                           buffer += part;
                           if (/^[.!?]+$/.test(part) || i === sentences.length - 1) {
                               if (buffer.trim().length > 0 && !/^[.!?]+$/.test(buffer)) {
                                   const currentIdx = globalSentenceIdx;
                                   const alert = analysis.sismografoAlerts.find(a => currentIdx >= a.start && currentIdx <= a.end);
                                   let className = "transition-colors duration-300 ";
                                   if (alert) {
                                       if (alert.type === 'staccato') className += "bg-blue-100 text-blue-900 decoration-blue-300 underline decoration-2 underline-offset-4 ";
                                       if (alert.type === 'wall') className += "bg-red-100 text-red-900 decoration-red-300 underline decoration-2 underline-offset-4 ";
                                       if (alert.type === 'flat') className += "bg-gray-200 text-gray-800 ";
                                   }
                                   renderedSentences.push(<span key={currentIdx} className={className} title={alert ? alert.type.toUpperCase() : `Frase ${currentIdx + 1}`}>{buffer}</span>);
                                   globalSentenceIdx++;
                               } else {
                                   renderedSentences.push(<span key={`punct-${i}`}>{buffer}</span>);
                               }
                               buffer = "";
                           }
                       }
                       return <p key={pIdx} className="mb-4">{renderedSentences}</p>;
                   })}
                </div>
            </div>
         )
    }
    // 6. DETALLE: SHOW VS TELL (AÑADIDO GRÁFICO Y CONTEXTO)
    if (viewMode === 'detail-showtell') {
        const chartData = analysis.perceptionPerSentence.map((count, i) => ({
            id: i+1,
            realValue: count,
            visualValue: count === 0 ? 0.2 : count
        }));

        return (
             <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px]">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Eye className="text-green-600" /> Show vs Tell (Filtros Mentales)</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>

                {/* CONTEXTO Y GRÁFICO */}
                <div className="mb-8 bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="flex gap-4 items-start mb-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-green-600"><Eye size={24}/></div>
                        <div>
                            <h3 className="font-bold text-green-900">Filtros de Percepción</h3>
                            <p className="text-sm text-green-800 mt-1">Palabras como <i>"vio", "oyó", "sintió", "parecía"</i> distancian al lector. En lugar de decir "Vio que la habitación estaba sucia", describe la suciedad directamente ("El polvo cubría los muebles").</p>
                        </div>
                    </div>
                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dcfce7"/>
                                <XAxis dataKey="id" hide />
                                <Tooltip content={<CustomBarTooltip unit="filtros" />} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="visualValue" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => {
                                        const color = entry.realValue > 0 ? '#f87171' : '#4ade80';
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2 text-xs font-bold text-green-800 opacity-70">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-400 rounded-full"></div> Inmersivo (Show)</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Filtrado (Tell)</span>
                    </div>
                </div>

                <div className="prose max-w-none text-lg text-gray-700 font-serif">
                     {paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="mb-6">
                            {para.split(/(\s+)/).map((w, i) => {
                                const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                const isFilter = VERBOS_PERCEPCION.has(clean);
                                return <span key={i} className={isFilter ? "bg-red-100 text-red-900 border-b-2 border-red-300 px-1 rounded cursor-help group relative" : ""} >{w}</span>
                            })}
                        </p>
                     ))}
                </div>
            </div>
        )
    }
    // 7. DETALLE: PALABRAS BAÚL (TIMELINE MEJORADO)
    if (viewMode === 'detail-baul') {
        return (
             <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px]">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Package className="text-orange-500" /> Palabras Baúl</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                        <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2"><Info size={16}/> ¿Qué son?</h3>
                        <p className="text-sm text-orange-800 mb-2">Términos vagos como <i>"cosa", "algo", "hacer", "tener"</i> que diluyen la precisión de tu texto.</p>
                        <div className="flex gap-2 text-xs font-bold mt-3">
                            <span className="bg-white px-2 py-1 rounded text-orange-600 border border-orange-200">Hacer → Construir</span>
                            <span className="bg-white px-2 py-1 rounded text-orange-600 border border-orange-200">Cosa → Objeto</span>
                        </div>
                    </div>
                    
                    {/* TIMELINE DE PALABRAS BAÚL */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Distribución en el texto</h3>
                        <div className="h-12 w-full bg-gray-100 rounded-full relative flex items-center overflow-hidden">
                            {analysis.baulTimeline.map((item, idx) => (
                                <div 
                                    key={idx}
                                    className="absolute w-1 h-full bg-orange-500 opacity-50 hover:opacity-100 transition-all"
                                    style={{ left: `${item.position * 100}%` }}
                                    title={`"${item.word}" en ${(item.position * 100).toFixed(0)}%`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
                            <span>Inicio</span>
                            <span>Final</span>
                        </div>
                    </div>
                </div>

                <div className="prose max-w-none text-lg text-gray-700 font-serif">
                     {paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="mb-6">
                            {para.split(/(\s+)/).map((w, i) => {
                                const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                const isBaul = PALABRAS_BAUL.has(clean);
                                return <span key={i} className={isBaul ? "bg-orange-100 text-orange-900 border-b-2 border-orange-300 px-1 rounded font-bold" : ""}>{w}</span>
                            })}
                        </p>
                     ))}
                </div>
            </div>
        )
    }
    // 8. DETALLE: DENSIDAD DE PUNTUACIÓN (GRÁFICO RESTAURADO & LEYENDA MEJORADA)
    if (viewMode === 'detail-punctuation') {
        const chartData = analysis.commasPerSentence.map((count, i) => ({
            id: i+1,
            realValue: count,
            visualValue: count === 0 ? 0.2 : count
        }));

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><PauseCircle className="text-orange-500" /> Ritmo Respiratorio</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                
                {/* GRÁFICO RESTAURADO CON ENCUADRE CORREGIDO */}
                <div className="h-48 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="id" hide />
                            <YAxis allowDecimals={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                            <Tooltip content={<CustomBarTooltip unit="comas" />} cursor={{fill: 'transparent'}} />
                            <Bar dataKey="visualValue" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => {
                                    const count = entry.realValue;
                                    let color = "#4ade80"; // Green
                                    if (count === 0) color = "#60a5fa"; // Blue (Muy rápido)
                                    if (count > 3) color = "#f87171"; // Red (Denso)
                                    return <Cell key={`cell-${index}`} fill={color} />;
                                })}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-3 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 rounded"></div> <span className="text-xs font-bold text-gray-600">0 Comas (Simple)</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded"></div> <span className="text-xs font-bold text-gray-600">1-3 Comas (Normal)</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded"></div> <span className="text-xs font-bold text-gray-600">+3 Comas (Laberíntico)</span></div>
                    </div>
                </div>

                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => {
                        const sentences = para.split(/([.!?]+)/);
                        return (
                            <p key={pIdx} className="mb-6">
                                {sentences.map((part, sIdx) => {
                                    if (/^[.!?]+$/.test(part) || part.trim().length === 0) return <span key={sIdx}>{part}</span>;
                                    const commaCount = (part.match(/,/g) || []).length;
                                    const isLabyrinth = commaCount > 3;
                                    return (
                                        <span key={sIdx} className={isLabyrinth ? "bg-red-50 text-red-900 decoration-red-300 underline decoration-wavy" : ""}>
                                            {part.split(/([,])/).map((token, i) => (
                                                <span key={i} className={token === ',' ? "font-bold text-orange-600" : ""}>{token}</span>
                                            ))}
                                        </span>
                                    );
                                })}
                            </p>
                        );
                    })}
                </div>
            </div>
        );
    }
    // 9. DETALLE: MÉTRICAS DE ESTILO (CORREGIDO RESALTADO TEXTO)
    if (viewMode === 'detail-metrics') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Layers className="text-purple-500" /> Análisis de Densidad y Estilo</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>

                {/* VISUALIZACIÓN EN GRÁFICO (TIMELINE DE ESTILO) */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2"><Activity size={16}/> Mapa de Calor Estilístico</h3>
                    <div className="flex flex-col gap-6">
                        {/* CARRIL: ADVERBIOS */}
                        <div className="flex items-center gap-4">
                             <div className="w-24 text-right">
                                <span className="block text-xs font-bold text-purple-600 uppercase">-mente</span>
                                <span className="text-[10px] text-gray-400">Adverbios</span>
                             </div>
                             <div className="flex-1 h-6 bg-gray-200 rounded flex overflow-hidden">
                                {analysis.metricsTimeline.map((m, i) => (
                                    <div key={i} className={`flex-1 h-full border-r border-white/20 transition-colors hover:opacity-80 ${m.mente > 0 ? 'bg-purple-500' : 'bg-transparent'}`} title={`Frase ${i+1}: ${m.mente} adverbios`}/>
                                ))}
                             </div>
                        </div>
                         {/* CARRIL: NOMINALIZACIONES */}
                        <div className="flex items-center gap-4">
                             <div className="w-24 text-right">
                                <span className="block text-xs font-bold text-indigo-600 uppercase">-ción</span>
                                <span className="text-[10px] text-gray-400">Nominaliz.</span>
                             </div>
                             <div className="flex-1 h-6 bg-gray-200 rounded flex overflow-hidden">
                                {analysis.metricsTimeline.map((m, i) => (
                                    <div key={i} className={`flex-1 h-full border-r border-white/20 transition-colors hover:opacity-80 ${m.cion > 0 ? 'bg-indigo-500' : 'bg-transparent'}`} title={`Frase ${i+1}: ${m.cion} nominalizaciones`}/>
                                ))}
                             </div>
                        </div>
                        {/* CARRIL: ADJETIVOS */}
                        <div className="flex items-center gap-4">
                             <div className="w-24 text-right">
                                <span className="block text-xs font-bold text-orange-600 uppercase">Adj+</span>
                                <span className="text-[10px] text-gray-400">Clusters</span>
                             </div>
                             <div className="flex-1 h-6 bg-gray-200 rounded flex overflow-hidden">
                                {analysis.metricsTimeline.map((m, i) => (
                                    <div key={i} className={`flex-1 h-full border-r border-white/20 transition-colors hover:opacity-80 ${m.adj > 0 ? 'bg-orange-500' : 'bg-transparent'}`} title={`Frase ${i+1}: ${m.adj} clusters`}/>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>

                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="mb-6">
                            {para.split(/(\s+)/).map((w, i, arr) => {
                                const clean = w.toLowerCase().replace(/[.,;:!?]/g, "");
                                let style = "";
                                let title = "";
                                
                                // Verificamos CADA condición independientemente para que no se pisen
                                // 1. Adverbios
                                if (clean.endsWith("mente") && clean.length > 5) {
                                    style += " bg-purple-100 text-purple-900 border-b-2 border-purple-300";
                                    title = "Adverbio -mente";
                                }
                                // 2. Nominalizaciones
                                if ((clean.endsWith("ción") || clean.endsWith("cion")) && clean.length > 4) {
                                    style += " bg-indigo-100 text-indigo-900 border-b-2 border-indigo-300";
                                    title = "Nominalización";
                                }
                                
                                // 3. Cluster Adjetivos (Lógica en línea - Marcar ambas palabras)
                                const isAdj = (word) => SUFIJOS_ADJETIVOS.some(s => word && word.endsWith(s));
                                let isClusterPart = false;
                                if (!STOPWORDS.has(clean) && isAdj(clean)) {
                                    if (i < arr.length - 1) {
                                        const nextW = arr[i+1].toLowerCase().replace(/[.,;:!?]/g,"");
                                        if (isAdj(nextW) && !STOPWORDS.has(nextW)) isClusterPart = true;
                                    }
                                    if (i > 0) {
                                        const prevW = arr[i-1].toLowerCase().replace(/[.,;:!?]/g,"");
                                        if (isAdj(prevW) && !STOPWORDS.has(prevW)) isClusterPart = true;
                                    }
                                }
                                
                                if (isClusterPart) {
                                    // Usamos un naranja fuerte para que destaque sobre otros estilos si coinciden (raro)
                                    style = " bg-orange-100 text-orange-900 border-b-2 border-orange-300 font-medium"; 
                                    title = "Cluster de Adjetivos";
                                }

                                return <span key={i} className={style} title={title}>{w}</span>;
                            })}
                        </p>
                    ))}
                </div>
            </div>
        );
    }
    // 10. DETALLE: MAPA SENSORIAL (TIMELINES SEPARADOS)
    if (viewMode === 'detail-senses') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Eye className="text-teal-500" /> Mapa Sensorial</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>

                {/* TIMELINES SEPARADOS */}
                <div className="mb-8 p-6 bg-teal-50 rounded-xl border border-teal-100">
                    <h3 className="text-sm font-bold text-teal-900 mb-6 flex items-center gap-2">Evolución por Sentido</h3>
                    <div className="space-y-4">
                        {/* VISTA */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-blue-600 w-16 text-right uppercase flex items-center justify-end gap-1"><Eye size={12}/> Vista</span>
                            <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-blue-100">
                                {analysis.sensoryTimeline.map((s, i) => (
                                    <div key={i} className={`flex-1 h-full ${s.sight > 0 ? 'bg-blue-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Vista`}/>
                                ))}
                            </div>
                        </div>
                        {/* OIDO */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-green-600 w-16 text-right uppercase flex items-center justify-end gap-1"><Ear size={12}/> Oído</span>
                            <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-green-100">
                                {analysis.sensoryTimeline.map((s, i) => (
                                    <div key={i} className={`flex-1 h-full ${s.sound > 0 ? 'bg-green-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Oído`}/>
                                ))}
                            </div>
                        </div>
                        {/* TACTO */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-orange-600 w-16 text-right uppercase flex items-center justify-end gap-1"><Fingerprint size={12}/> Tacto</span>
                            <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-orange-100">
                                {analysis.sensoryTimeline.map((s, i) => (
                                    <div key={i} className={`flex-1 h-full ${s.touch > 0 ? 'bg-orange-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Tacto`}/>
                                ))}
                            </div>
                        </div>
                        {/* OLFATO */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-pink-600 w-16 text-right uppercase flex items-center justify-end gap-1"><Utensils size={12}/> Olfato</span>
                            <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-pink-100">
                                {analysis.sensoryTimeline.map((s, i) => (
                                    <div key={i} className={`flex-1 h-full ${s.smell_taste > 0 ? 'bg-pink-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Olfato`}/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="mb-6">
                            {para.split(/(\s+)/).map((w, i) => {
                                const clean = w.toLowerCase().replace(/[.,;:!?]/g, "");
                                let style = "";
                                if ([...SENSORY_DICT.sight].some(s => clean.includes(s))) style = "bg-blue-100 text-blue-800 border-b border-blue-300";
                                else if ([...SENSORY_DICT.sound].some(s => clean.includes(s))) style = "bg-green-100 text-green-800 border-b border-green-300";
                                else if ([...SENSORY_DICT.touch].some(s => clean.includes(s))) style = "bg-orange-100 text-orange-800 border-b border-orange-300";
                                else if ([...SENSORY_DICT.smell_taste].some(s => clean.includes(s))) style = "bg-pink-100 text-pink-800 border-b border-pink-300";
                                return <span key={i} className={style ? `px-1 rounded ${style}` : ""}>{w}</span>;
                            })}
                        </p>
                    ))}
                </div>
            </div>
        );
    }
    // 11. DETALLE: CACOFONÍAS (TIMELINES SEPARADOS)
    if (viewMode === 'detail-cacophony') {
        const soundData = analysis.sentenceLengths.map((_, i) => {
             const sentenceText = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s))[i] || "";
             const words = sentenceText.toLowerCase().replace(/[.,;:!?()"«»]/g, "").split(/\s+/);
             let hasShock = false;
             let hasEcho = false;
             words.forEach((w, idx) => {
                 if (idx < words.length - 1) {
                     const next = words[idx+1];
                     if (w.length >= 3 && next.length >= 3 && w.slice(-2) === next.slice(0,2)) hasShock = true;
                 }
                 if (w.length > 4) {
                     const suffix = w.slice(-3);
                     for(let k=1; k<=3; k++) {
                         if(idx+k < words.length && words[idx+k].endsWith(suffix) && words[idx+k] !== w) hasEcho = true;
                     }
                 }
             });
             return { id: i+1, hasShock, hasEcho };
        });

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Music className="text-red-500" /> Escáner Sonoro</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>

                {/* TIMELINES SEPARADOS */}
                <div className="mb-8 p-6 bg-red-50 rounded-xl border border-red-100">
                    <h3 className="text-sm font-bold text-red-900 mb-4 flex items-center gap-2">Mapa de Incidentes Sonoros</h3>
                    <div className="space-y-4">
                        {/* CHOQUE */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-red-600 w-24 text-right uppercase">Choques</span>
                            <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-red-100">
                                {soundData.map((entry, index) => (
                                    <div key={index} className={`flex-1 h-full ${entry.hasShock ? 'bg-red-500' : 'bg-transparent'}`} title={`Frase ${index+1}: Choque`}/>
                                ))}
                            </div>
                        </div>
                        {/* ECO */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-orange-600 w-24 text-right uppercase">Rimas</span>
                            <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-orange-100">
                                {soundData.map((entry, index) => (
                                    <div key={index} className={`flex-1 h-full ${entry.hasEcho ? 'bg-orange-500' : 'bg-transparent'}`} title={`Frase ${index+1}: Rima interna`}/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="mb-6">
                            {para.split(/(\s+)/).map((w, i, arr) => {
                                if (!w.trim()) return <span key={i}>{w}</span>;
                                const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                let style = "";
                                if (i < arr.length - 2) {
                                    const nextWord = arr[i+2].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                    if (clean.length >= 3 && nextWord.length >= 3 && clean.slice(-2) === nextWord.slice(0,2)) style = "bg-red-100 text-red-800 border-b-2 border-red-400 font-bold cursor-help";
                                }
                                if (i >= 2) {
                                    const prevWord = arr[i-2].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                    if (prevWord.length >= 3 && clean.length >= 3 && prevWord.slice(-2) === clean.slice(0,2)) style = "bg-red-100 text-red-800 border-b-2 border-red-400 font-bold cursor-help";
                                }
                                // Rima interna (Eco)
                                if (!style && clean.length > 4) {
                                     const suffix = clean.slice(-3);
                                     let hasEcho = false;
                                     for(let k=1; k<=3; k++) {
                                         let idx2 = i + (k*2);
                                         if(idx2 < arr.length) {
                                             const target = arr[idx2].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                             if(target.endsWith(suffix) && target !== clean) hasEcho = true;
                                         }
                                     }
                                     for(let k=1; k<=3; k++) {
                                         let idx2 = i - (k*2);
                                         if(idx2 >= 0) {
                                             const target = arr[idx2].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                             if(target.endsWith(suffix) && target !== clean) hasEcho = true;
                                         }
                                     }
                                     if(hasEcho) style = "bg-orange-100 text-orange-800 border-b-2 border-orange-300 decoration-orange-500 underline decoration-dotted";
                                }

                                return <span key={i} className={style}>{w}</span>;
                            })}
                        </p>
                    ))}
                </div>
            </div>
        );
    }
    // 12. DETALLE: REPETICIONES CERCANAS (CAMBIADO DE NOMBRE Y LÓGICA)
    if (viewMode === 'detail-repetitions') {
        // Crear datos para gráfico de densidad de repeticiones cercanas
        // Agrupamos por tramos del 10% del texto
        const densityData = Array(10).fill(0).map((_, i) => ({ x: i, count: 0 }));
        const totalWords = analysis.wordCount;
        
        [...analysis.closeRepetitionIndices].forEach(idx => {
            const bucket = Math.floor((idx / totalWords) * 10);
            if (bucket >= 0 && bucket < 10) densityData[bucket].count++;
        });

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Repeat className="text-blue-500" /> Repeticiones Cercanas</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8">
                     {/* COLUMNA IZQUIERDA: DATOS */}
                     <div className="w-full md:w-1/3 space-y-6">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                             <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-sm"><List size={16}/> Top 10 Frecuentes</h3>
                             <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                                <table className="min-w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">Palabra</th>
                                            <th className="px-4 py-2 text-right">Rep.</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {analysis.repetitions.slice(0, 10).map(([word, count], idx) => (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-4 py-2 font-medium text-gray-900 capitalize">{word}</td>
                                                <td className="px-4 py-2 text-right font-bold text-blue-600">{count}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                        
                        {/* GRÁFICO DE DENSIDAD */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Densidad de Repeticiones</h3>
                            <div className="h-24 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={densityData}>
                                        <defs>
                                            <linearGradient id="colorRep" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <Tooltip cursor={{stroke: '#3b82f6'}} content={<CustomBarTooltip unit="repeticiones" label="Tramo" />}/>
                                        <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRep)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                     </div>

                    {/* TEXTO RESALTADO */}
                    <div className="w-full md:w-2/3 prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                        {paragraphs.map((para, pIdx) => (
                            <p key={pIdx} className="mb-6">
                                {para.split(/(\s+)/).map((w, i) => {
                                    // Calcular el índice global aproximado de la palabra para cruzar con closeRepetitionIndices
                                    // Esta es una aproximación visual; en una app real usaríamos un mapeo exacto de tokens.
                                    // Aquí simplemente resaltamos si la palabra es una de las "frecuentes" Y está cerca de otra.
                                    // Para simplificar en esta vista estática: usamos el análisis previo.
                                    
                                    const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                    // Simulamos índice para buscar en el Set (esto requeriría pasar el índice exacto desde el render, 
                                    // pero para efectos visuales, si la palabra está en las repeticiones, la marcamos).
                                    // MEJORA: Usar un contador global si fuera necesario, pero aquí marcaremos las del TOP 10 para simplicidad visual robusta
                                    // O MEJOR: Si textAnalyzer devolvió índices, los usamos. Pero como el renderizado de React divide por párrafos y espacios,
                                    // perderíamos el índice exacto absoluto fácilmente.
                                    // FALLBACK ROBUSTO: Marcar si es una palabra del TOP 10 que NO es stopword.
                                    
                                    const isTopRep = analysis.repetitions.slice(0, 10).some(r => r[0] === clean) && !STOPWORDS.has(clean);
                                    
                                    return <span key={i} className={isTopRep ? "bg-blue-100 text-blue-900 border-b border-blue-300 font-medium cursor-help" : ""} title={isTopRep ? "Repetición frecuente" : ""}>{w} </span>;
                                })}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        );
    }
    // 13. DETALLE: ANÁFORAS
    if (viewMode === 'detail-anaphora') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><RefreshCcw className="text-teal-500" /> Inicios Repetitivos</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => {
                        const sentences = para.split(/([.!?]+)/);
                        return (
                            <p key={pIdx} className="mb-6">
                                {sentences.map((s, sIdx) => {
                                    const words = s.trim().split(" ");
                                    if(words.length > 0) {
                                        const first = words[0].toLowerCase().replace(/[.,;:!?]/g,"");
                                        const isAnaphora = analysis.anaphoraAlerts.some(a => a.word === first);
                                        if (isAnaphora) return <span><span className="bg-teal-200 font-bold text-teal-900 px-1 rounded">{words[0]}</span> {words.slice(1).join(" ")} </span>
                                    }
                                    return <span>{s} </span>
                                })}
                            </p>
                        )
                    })}
                </div>
            </div>
        );
    }
    // 14. DETALLE: FRASES PEGAJOSAS (CORREGIDO TIMELINE Y RESALTADO)
    if (viewMode === 'detail-sticky') {
        // Cálculo para el gráfico: Ratio de pegamento por frase
        const stickyData = analysis.stickySentences.map(s => ({
            id: s.index + 1,
            ratio: s.glueRatio
        }));
        
        // Usamos un contador global de frases para sincronizar con el texto
        let sentenceCounter = 0;

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><StickyNote className="text-yellow-600" /> Frases Pegajosas (Grasa Textual)</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                
                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 mb-8">
                    <h3 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><Info size={20}/> ¿Qué es una frase pegajosa?</h3>
                    <p className="text-sm text-yellow-700 mb-4">Son oraciones con <strong>más del 45%</strong> de palabras funcionales. Entorpecen la lectura.</p>
                    
                    {/* Timeline gráfico simple */}
                    <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stickyData}>
                                <XAxis dataKey="id" hide />
                                <Tooltip content={<CustomBarTooltip unit="%" label="Pegamento" />} cursor={{stroke: '#eab308'}} />
                                <Area type="monotone" dataKey="ratio" stroke="#ca8a04" fill="#fde047" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => {
                       if (!para.trim()) return null;
                       const sentences = para.split(/([.!?]+)/);
                       const renderedSentences = [];
                       let buffer = "";
                       
                       for (let i = 0; i < sentences.length; i++) {
                           const part = sentences[i];
                           buffer += part;
                           // Si es delimitador o final, procesamos la frase
                           if (/^[.!?]+$/.test(part) || i === sentences.length - 1) {
                               if (buffer.trim().length > 0 && !/^[.!?]+$/.test(buffer)) {
                                   // Verificamos si el índice actual coincide con una sticky sentence
                                   const currentIdx = sentenceCounter; 
                                   const isSticky = analysis.stickySentences.some(s => s.index === currentIdx);
                                   
                                   if (isSticky) {
                                       const words = buffer.split(/(\s+|[.,;:!?])/);
                                       const stickyContent = words.map((w, wIdx) => {
                                            const clean = w.toLowerCase().replace(/[.,;:!?]/g, "");
                                            if (STOPWORDS.has(clean)) {
                                                return <span key={wIdx} className="font-bold text-yellow-800 bg-yellow-200/50 rounded px-0.5" title="Palabra pegamento">{w}</span>
                                            }
                                            return <span key={wIdx} className="text-yellow-900">{w}</span>
                                       });
                                       renderedSentences.push(<span key={currentIdx} className="bg-yellow-100 border-b-2 border-yellow-400 rounded px-1 mx-1" title="Frase Pegajosa">{stickyContent}</span>);
                                   } else {
                                       renderedSentences.push(<span key={currentIdx}>{buffer}</span>);
                                   }
                                   sentenceCounter++; // Incrementamos el contador real de frases
                               } else {
                                   renderedSentences.push(<span key={`punct-${i}`}>{buffer}</span>);
                               }
                               buffer = "";
                           }
                       }
                       return <p key={pIdx} className="mb-4">{renderedSentences}</p>;
                   })}
                </div>
            </div>
        );
    }
    // 15. DETALLE: PLEONASMOS
    if (viewMode === 'detail-pleonasms') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Trash2 className="text-red-500" /> Detector de Pleonasmos</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                
                {/* EDUCATIONAL HEADER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-red-50 p-5 rounded-xl border border-red-100">
                        <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2"><Info size={16}/> ¿Qué es un Pleonasmo?</h3>
                        <p className="text-sm text-red-800 leading-relaxed">
                            Es una figura retórica que consiste en añadir palabras innecesarias para la comprensión del mensaje. 
                            Aunque a veces se usa para dar fuerza ("lo vi con mis propios ojos"), en textos técnicos o narrativos limpios suele considerarse un vicio (pobreza léxica).
                        </p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                        <h3 className="font-bold text-gray-700 text-sm mb-3 uppercase tracking-wider text-center">Ejemplo Esquático</h3>
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex flex-col items-center">
                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold mb-1 line-through decoration-red-400">Subir arriba</span>
                                <XCircle size={20} className="text-red-400"/>
                            </div>
                            <ArrowRight className="text-gray-300"/>
                            <div className="flex flex-col items-center">
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mb-1">Subir</span>
                                <CheckCircle2 size={20} className="text-green-500"/>
                            </div>
                        </div>
                    </div>
                </div>

                {analysis.pleonasmsFound.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 border-t border-gray-50 pt-12">
                        <Feather size={48} className="mx-auto mb-4 opacity-20"/>
                        <p className="text-xl">¡Texto limpio! No se han detectado redundancias obvias.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <div className="bg-white p-2 border-b border-gray-100 text-gray-400 text-sm font-bold uppercase mb-2">
                            Redundancias detectadas en tu texto ({analysis.pleonasmsFound.length})
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {analysis.pleonasmsFound.map((p, i) => (
                                <li key={i} className="flex items-center justify-between p-4 bg-white border border-gray-100 shadow-sm rounded-lg hover:border-red-200 transition group">
                                    <span className="font-bold text-gray-700 capitalize group-hover:text-red-600 transition-colors">"{p}"</span>
                                    <span className="text-[10px] font-mono text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 uppercase font-bold">Corregir</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
    // 16. DETALLE: VARIADAD DE INICIO (AÑADIDO GRÁFICO LINEAL)
    if (viewMode === 'detail-starts') {
        const data = Object.entries(analysis.sentenceStarts).map(([name, value]) => ({ name, value }));
        const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];
        const TYPE_COLORS = {
            "Artículo": '#8884d8', "Preposición": '#82ca9d', "Pronombre": '#ffc658', 
            "Gerundio": '#ff8042', "Conector": '#00C49F', "Sujeto/Otro": '#FFBB28'
        };

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><PieChart className="text-blue-500" /> Variedad de Inicio de Oración</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                
                {/* CHART AREA */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-10">
                    <div className="w-full md:w-1/2 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePie>
                                <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}>
                                    {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                                </Pie>
                                <Tooltip />
                            </RePie>
                        </ResponsiveContainer>
                    </div>
                    <div className="w-full md:w-1/2 space-y-4">
                        <h3 className="font-bold text-gray-700 mb-2">Análisis de Estructura</h3>
                        <p className="text-gray-600 text-sm">Un estilo variado alterna el sujeto, complementos circunstanciales y conectores.</p>
                        <ul className="text-sm space-y-2">
                            {data.map((item, idx) => (
                                <li key={idx} className="flex justify-between border-b border-gray-100 pb-1">
                                    <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div> {item.name}</span> 
                                    <span className="font-bold">{item.value}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* TIMELINE LINEAL AÑADIDO */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">Distribución Secuencial (Frase a Frase)</h3>
                    <div className="h-8 w-full flex rounded-lg overflow-hidden">
                        {analysis.sentenceStartTimeline.map((item, i) => (
                            <div 
                                key={i} 
                                className="flex-1 h-full border-r border-white/20 hover:opacity-80 transition-opacity relative group" 
                                style={{backgroundColor: TYPE_COLORS[item.type] || '#ccc'}}
                            >
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs p-1 rounded whitespace-nowrap z-10">
                                    Frase {i+1}: {item.type}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
                        <span>Inicio</span>
                        <span>Final del Texto</span>
                    </div>
                </div>
            </div>
        );
    }
    // 17. DETALLE: FUERZA VERBAL
    if (viewMode === 'detail-weakverbs') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Zap className="text-purple-600" /> Fuerza Verbal</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                {analysis.weakAdverbs.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <Zap size={48} className="mx-auto mb-4 opacity-20"/>
                        <p className="text-xl">¡Excelente! Tus verbos parecen fuertes y directos.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                            <h3 className="font-bold text-purple-900 mb-2">Construcciones Débiles Detectadas</h3>
                            <p className="text-sm text-purple-700 mb-4">El uso de "Verbo + Adverbio" suele indicar un verbo débil. Intenta reemplazar la pareja entera por un verbo más potente.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analysis.weakAdverbs.map((pair, i) => (
                                    <div key={i} className="flex flex-col bg-white p-4 rounded shadow-sm border border-purple-100">
                                        <span className="text-xs text-gray-400 font-bold uppercase mb-1">Detectado</span>
                                        <span className="text-red-500 font-medium line-through decoration-red-300">{pair}</span>
                                        <div className="mt-2 pt-2 border-t border-gray-50 flex items-center gap-2 text-green-600 text-sm">
                                            <ArrowRight size={14}/> <span>¿Verbo más fuerte?</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white p-10 rounded-xl shadow text-center">
            <h3 className="text-xl text-gray-500 mb-4">Selecciona una tarjeta para ver detalles.</h3>
            <button onClick={() => setViewMode("dashboard")} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">Volver</button>
        </div>
    );
  };

  // --- RENDERIZADO PRINCIPAL ---

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      {/* NAVBAR */}
      <header className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
            {/* LOGO CLICKABLE -> HOME */}
            <div 
                onClick={handleReset}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            >
                <div className="bg-white/10 p-2 rounded-lg">
                    <Feather className="w-6 h-6 text-indigo-100" /> 
                </div>
                <div>
                    <h1 className="text-xl font-bold leading-none">Style Optimizer</h1>
                    <span className="text-xs text-indigo-300 font-medium tracking-wider">EDICIÓN PRO 2.0</span>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="bg-indigo-800/50 p-1 rounded-lg flex text-xs font-medium border border-indigo-600">
                    <button 
                      onClick={() => { setMode('single'); handleReset(); }}
                      className={`px-4 py-1.5 rounded-md transition-all flex items-center gap-2 ${mode === 'single' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-200 hover:text-white hover:bg-indigo-700'}`}
                    >
                      <Edit size={14} /> Editor
                    </button>
                    <button 
                      onClick={() => { setMode('compare'); handleReset(); }}
                      className={`px-4 py-1.5 rounded-md transition-all flex items-center gap-2 ${mode === 'compare' ? 'bg-white text-indigo-700 shadow-sm' : 'text-indigo-200 hover:text-white hover:bg-indigo-700'}`}
                    >
                      <Layers size={14} /> Comparar
                    </button>
                </div>

                {analysisV1 && (
                    <button onClick={handlePrint} className="hidden sm:flex bg-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg text-xs transition items-center gap-2 border border-indigo-500">
                        <Printer size={14}/> Imprimir
                    </button>
                )}
                
                {analysisV1 && viewMode !== 'input' && ( 
                    <button onClick={handleReset} className="bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm">
                        Nuevo Análisis
                    </button> 
                )}
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 flex-grow print:p-0">
        
        {/* --- VISTA DE ENTRADA (INPUT) --- */}
        {viewMode === 'input' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div className="text-center py-8">
                  <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
                      {mode === 'compare' ? 'Comparador de Versiones' : 'Analizador de Estilo Literario'}
                  </h2>
                  <p className="text-gray-500 max-w-lg mx-auto text-lg">
                      {mode === 'compare' 
                        ? 'Pega tu borrador original y tu versión corregida para medir científicamente tu progreso.' 
                        : 'Pega tu texto para obtener un diagnóstico profundo sobre ritmo, léxico y vicios estilísticos.'}
                  </p>
              </div>

              <div className={`grid gap-8 transition-all duration-500 ${mode === 'compare' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                  {/* TEXTO 1 */}
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col h-96">
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex justify-between items-center">
                        <label className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            {mode === 'compare' ? 'Versión Original (V1)' : 'Tu Texto'}
                        </label>
                        <span className="text-xs text-gray-400">{textV1.length} car.</span>
                    </div>
                    <textarea 
                        className="w-full flex-grow p-6 focus:ring-0 border-none outline-none resize-none text-lg leading-relaxed font-serif text-gray-700 placeholder-gray-300"
                        placeholder="Escribe o pega aquí el texto..." 
                        value={textV1} 
                        onChange={(e) => setTextV1(e.target.value)} 
                    />
                  </div>

                  {/* TEXTO 2 (Solo Compare) */}
                  {mode === 'compare' && (
                      <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-100 overflow-hidden flex flex-col h-96 relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-purple-500"></div>
                        <div className="bg-indigo-50/50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center">
                            <label className="text-sm font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                                Versión Editada (V2)
                            </label>
                            <span className="text-xs text-indigo-400">{textV2.length} car.</span>
                        </div>
                        <textarea 
                            className="w-full flex-grow p-6 focus:ring-0 border-none outline-none resize-none text-lg leading-relaxed font-serif text-gray-700 placeholder-indigo-200/50 bg-indigo-50/10"
                            placeholder="Pega aquí la versión corregida..." 
                            value={textV2} 
                            onChange={(e) => setTextV2(e.target.value)} 
                        />
                      </div>
                  )}
              </div>

              <div className="flex justify-center pt-4">
                <button 
                    onClick={handleAnalyze} 
                    disabled={!textV1.trim() || (mode === 'compare' && !textV2.trim())} 
                    className="group bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
                >
                    <Activity className="w-5 h-5 group-hover:animate-pulse" /> 
                    {mode === 'compare' ? 'Comparar Versiones' : 'Analizar Texto'}
                </button>
              </div>
          </div>
        )}

        {/* --- VISTAS DE DETALLE --- */}
        {viewMode.startsWith('detail-') && renderDetailView()}


        {/* --- DASHBOARD VIEW --- */}
        {viewMode === 'dashboard' && analysisV1 && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* MODO COMPARACIÓN */}
            {mode === 'compare' && analysisV2 && (
                <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 rounded-3xl shadow-2xl mb-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <Layers className="text-indigo-300" size={32}/>
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Informe de Evolución</h2>
                                <p className="text-indigo-200 text-sm mt-1">Análisis diferencial: Versión Original vs. Versión Editada</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-800 mb-8">
                            <ComparisonCard title="Limpieza (-mente)" label="Adverbios" valOld={analysisV1.rhymes.mente} valNew={analysisV2.rhymes.mente} inverse={true} />
                            <ComparisonCard title="Precisión (Baúl)" label="Palabras vagas" valOld={analysisV1.baulWords.length} valNew={analysisV2.baulWords.length} inverse={true} />
                             <ComparisonCard title="Show vs Tell" label="Filtros mentales" valOld={Number(analysisV1.perceptionRatio)} valNew={Number(analysisV2.perceptionRatio)} inverse={true} suffix="%" />
                            <ComparisonCard title="Longitud Media" label="Palabras/Frase" valOld={Number(analysisV1.avgSentenceLength)} valNew={Number(analysisV2.avgSentenceLength)} inverse={false} />
                        </div>
                    </div>
                </div>
            )}

            {/* SECCIÓN 1: DATOS GENÉRICOS */}
            <section>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard icon={<Type />} label="Palabras" value={mode === 'compare' ? analysisV2.wordCount : analysisV1.wordCount} color="blue" />
                    <MetricCard icon={<BookOpen />} label="Frases" value={mode === 'compare' ? analysisV2.sentenceCount : analysisV1.sentenceCount} color="indigo" />
                    <MetricCard icon={<Clock />} label="Tiempo Lectura" value={`~${Math.ceil((mode === 'compare' ? analysisV2.wordCount : analysisV1.wordCount) / 250)} min`} color="teal" subtext="Velocidad media" />
                </div>
            </section>

            {/* SECCIÓN 2: RITMO */}
            <section className="space-y-6">
                <SectionHeader icon={<Activity className="text-indigo-500" size={28} />} title="Ritmo" colorClass="text-indigo-800 border-indigo-200" />
                
                <div className="w-full">
                    <DashboardCard title="Sismógrafo de Frases" icon={<Activity className="text-indigo-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-sismografo')}>
                        <div className="mb-2 flex gap-2">
                            <Badge color="blue" text="Staccato" />
                            <Badge color="red" text="Muros" />
                            <Badge color="gray" text="Monotonía" />
                        </div>
                        <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    data={(mode === 'compare' ? analysisV2 : analysisV1).sentenceLengths.map((len, i) => {
                                        const currentData = mode === 'compare' ? analysisV2 : analysisV1;
                                        const alert = currentData.sismografoAlerts.find(a => i >= a.start && i <= a.end);
                                        let color = "#818cf8"; 
                                        let alertType = "";
                                        if (alert) {
                                            if (alert.type === 'staccato') { color = "#60a5fa"; alertType = "Staccato"; } 
                                            if (alert.type === 'wall') { color = "#f87171"; alertType = "Muro"; } 
                                            if (alert.type === 'flat') { color = "#9ca3af"; alertType = "Monotonía"; } 
                                        } else if (len < 8) {
                                            color = "#93c5fd"; 
                                        }
                                        return { id: i+1, len, color, alert: alertType };
                                    })}
                                >
                                    <Tooltip content={<CustomBarTooltip unit="palabras" />} cursor={{fill: 'transparent'}} />
                                    <Bar dataKey="len" radius={[2, 2, 0, 0]}>
                                        {(mode === 'compare' ? analysisV2 : analysisV1).sentenceLengths.map((_, index) => {
                                             const currentData = mode === 'compare' ? analysisV2 : analysisV1;
                                             const alert = currentData.sismografoAlerts.find(a => index >= a.start && index <= a.end);
                                             let color = "#818cf8"; 
                                             if (alert) {
                                                 if (alert.type === 'staccato') color = "#60a5fa";
                                                 if (alert.type === 'wall') color = "#f87171";
                                                 if (alert.type === 'flat') color = "#9ca3af";
                                             }
                                             return <Cell key={`cell-${index}`} fill={color} />
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </DashboardCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <DashboardCard title="Escáner Prosódico" icon={<Mic2 className="text-pink-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-prosody')}>
                        <div className="text-center py-4 flex flex-col justify-center h-full">
                            <p className="text-xs text-gray-400 mb-3">Detecta la "música" del texto:</p>
                            <div className="flex justify-center gap-2 flex-wrap">
                                <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">Vals</span>
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold border border-emerald-100">Narrativo</span>
                                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-bold border border-amber-100">Machacón</span>
                            </div>
                        </div>
                    </DashboardCard>
                    <MetricCard icon={<PauseCircle />} label="Densidad de Puntuación" value={(mode === 'compare' ? analysisV2 : analysisV1).punctuationDensity} color="orange" subtext="Comas por frase" onClick={() => setViewMode('detail-punctuation')} />
                    <MetricCard icon={<Gauge />} label="Legibilidad" value={(mode === 'compare' ? analysisV2 : analysisV1).readabilityScore} color="teal" subtext="Escala F. Huerta" onClick={() => setViewMode('detail-readability')} />
                </div>
            </section>

             {/* SECCIÓN 3: HIGIENE Y SINTAXIS (VOZ PASIVA MOVIDA AQUÍ) */}
             <section className="space-y-6">
                <SectionHeader icon={<Trash2 className="text-red-500" size={28} />} title="Higiene y Sintaxis" colorClass="text-red-800 border-red-200" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DashboardCard title="Frases Pegajosas" icon={<StickyNote className="text-yellow-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-sticky')}>
                         <div className="text-center py-2"><span className="text-3xl font-bold text-yellow-600">{(mode === 'compare' ? analysisV2 : analysisV1).stickySentences.length}</span><p className="text-xs text-gray-400">exceso de "glue words"</p></div>
                    </DashboardCard>

                    <DashboardCard title="Pleonasmos" icon={<Trash2 className="text-red-500 w-5 h-5" />} onViewDetail={() => setViewMode('detail-pleonasms')}>
                        <div className="text-center py-2"><span className="text-3xl font-bold text-red-500">{(mode === 'compare' ? analysisV2 : analysisV1).pleonasmsFound.length}</span><p className="text-xs text-gray-400">redundancias</p></div>
                    </DashboardCard>

                    {/* VOZ PASIVA - AHORA CON PIE CHART EN DASHBOARD */}
                    <DashboardCard title="Voz Pasiva" icon={<UserX className="text-gray-500 w-5 h-5" />} onViewDetail={() => setViewMode('detail-passive')}>
                        <div className="h-24 w-full flex justify-center items-center relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <RePie>
                                    <Pie
                                        data={[
                                            { name: 'Activa', value: (mode === 'compare' ? analysisV2 : analysisV1).sentenceCount - (mode === 'compare' ? analysisV2 : analysisV1).passiveCount },
                                            { name: 'Pasiva', value: (mode === 'compare' ? analysisV2 : analysisV1).passiveCount }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={35}
                                        fill="#8884d8"
                                        dataKey="value"
                                        isAnimationActive={false}
                                    >
                                        <Cell fill="#4ade80" />
                                        <Cell fill="#94a3b8" />
                                    </Pie>
                                </RePie>
                            </ResponsiveContainer>
                            <span className="absolute text-[10px] font-bold text-gray-400 bottom-0 w-full text-center">Ver Detalle</span>
                            <span className="absolute text-xl font-bold text-gray-600">{(mode === 'compare' ? analysisV2 : analysisV1).passiveCount}</span>
                        </div>
                    </DashboardCard>

                    {/* INICIO DE FRASE */}
                    <DashboardCard title="Inicio de Frase" icon={<PieChart className="text-blue-500 w-5 h-5" />} onViewDetail={() => setViewMode('detail-starts')}>
                        <div className="h-24 w-full flex justify-center items-center relative">
                             <ResponsiveContainer width="100%" height="100%">
                                <RePie>
                                    <Pie
                                        data={Object.entries((mode === 'compare' ? analysisV2 : analysisV1).sentenceStarts).map(([name, value]) => ({ name, value }))}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={25}
                                        outerRadius={35}
                                        fill="#8884d8"
                                        dataKey="value"
                                        isAnimationActive={false}
                                    >
                                        {Object.entries((mode === 'compare' ? analysisV2 : analysisV1).sentenceStarts).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'][index % 6]} />
                                        ))}
                                    </Pie>
                                </RePie>
                            </ResponsiveContainer>
                            <span className="absolute text-[10px] font-bold text-gray-400 bottom-0 w-full text-center">Ver Detalle</span>
                        </div>
                    </DashboardCard>
                    
                    <DashboardCard title="Fuerza Verbal" icon={<Zap className="text-purple-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-weakverbs')}>
                        <div className="text-center py-2"><span className="text-3xl font-bold text-purple-600">{(mode === 'compare' ? analysisV2 : analysisV1).weakAdverbs.length}</span><p className="text-xs text-gray-400">verbos débiles</p></div>
                    </DashboardCard>
                </div>
            </section>

            {/* SECCIÓN 4: ESTILO */}
            <section className="space-y-6">
                <SectionHeader icon={<Feather className="text-purple-500" size={28} />} title="Estilo" colorClass="text-purple-800 border-purple-200" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DashboardCard title="Inicios Repetitivos" icon={<RefreshCcw className="text-teal-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-anaphora')}>
                        {(mode === 'compare' ? analysisV2 : analysisV1).anaphoraAlerts.length > 0 ? <div className="text-sm space-y-1">{(mode === 'compare' ? analysisV2 : analysisV1).anaphoraAlerts.slice(0,3).map((a,i)=><div key={i} className="flex justify-between p-2 bg-teal-50 rounded text-teal-800"><span className="font-medium italic">"{a.word}..."</span><span className="text-xs bg-white px-2 py-0.5 rounded font-bold">x{a.indices.length}</span></div>)}</div> : <p className="text-sm text-gray-400 italic">Sin anáforas detectadas.</p>}
                    </DashboardCard>

                    {/* REPETICIONES CERCANAS */}
                    <DashboardCard title="Repeticiones Cercanas" icon={<Repeat className="text-blue-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-repetitions')}>
                        <div className="text-center py-2"><span className="text-3xl font-bold text-blue-600">{(mode === 'compare' ? analysisV2 : analysisV1).repetitions.length}</span><p className="text-xs text-gray-400">palabras frecuentes</p></div>
                    </DashboardCard>

                    <DashboardCard title="Métricas de Estilo" icon={<Layers className="text-purple-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-metrics')}>
                        <div className="grid grid-cols-3 gap-1 text-center">
                            <div className="bg-purple-50 p-1.5 rounded"><span className="block font-bold text-purple-700 text-sm">{(mode === 'compare' ? analysisV2 : analysisV1).rhymes.mente}</span><span className="text-[8px] text-purple-500 uppercase">-mente</span></div>
                            <div className="bg-indigo-50 p-1.5 rounded"><span className="block font-bold text-indigo-700 text-sm">{(mode === 'compare' ? analysisV2 : analysisV1).rhymes.cion}</span><span className="text-[8px] text-indigo-500 uppercase">-ción</span></div>
                            <div className="bg-orange-50 p-1.5 rounded"><span className="block font-bold text-orange-700 text-sm">{(mode === 'compare' ? analysisV2 : analysisV1).adjectiveClusters}</span><span className="text-[8px] text-orange-500 uppercase">Adj+</span></div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Cacofonías" icon={<Music className="text-red-500 w-5 h-5" />} onViewDetail={() => setViewMode('detail-cacophony')}>
                         <div className="text-center py-2"><span className="text-3xl font-bold text-red-500">{(mode === 'compare' ? analysisV2 : analysisV1).cacophonies.length}</span><p className="text-xs text-gray-400">choques sonoros</p></div>
                    </DashboardCard>

                    <DashboardCard title="Palabras Baúl" icon={<Package className="text-orange-500 w-5 h-5" />} onViewDetail={() => setViewMode('detail-baul')}>
                        <div className="text-center py-2"><span className="text-3xl font-bold text-orange-500">{(mode === 'compare' ? analysisV2 : analysisV1).baulWords.length}</span><p className="text-xs text-gray-400">términos vagos</p></div>
                    </DashboardCard>
                </div>
            </section>

            {/* SECCIÓN 5: NARRACIÓN */}
            <section className="space-y-6">
                <SectionHeader icon={<BookOpen className="text-pink-500" size={28} />} title="Narración" colorClass="text-pink-800 border-pink-200" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard icon={<Eye />} label="Show vs Tell" value={`${(mode === 'compare' ? analysisV2 : analysisV1).perceptionRatio}%`} color="green" onClick={() => setViewMode('detail-showtell')} />
                    <MetricCard icon={<MessageSquare />} label="Diálogo" value={`${(mode === 'compare' ? analysisV2 : analysisV1).dialogueRatio}%`} color="blue" subtext="vs Narrativa" onClick={() => setViewMode('detail-dialogue')} />
                </div>
            </section>

            {/* SECCIÓN 6: SENSORIUM */}
            <section className="space-y-6">
                <SectionHeader icon={<Eye className="text-teal-500" size={28} />} title="Sensorium" colorClass="text-teal-800 border-teal-200" />
                <DashboardCard title="Mapa Sensorial" icon={<Eye className="text-teal-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-senses')}>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-blue-50 rounded p-2"><Eye size={16} className="mx-auto text-blue-500 mb-1"/><span className="text-sm font-bold text-blue-700">{(mode === 'compare' ? analysisV2 : analysisV1).sensoryCounts.sight}</span></div>
                        <div className="bg-green-50 rounded p-2"><Ear size={16} className="mx-auto text-green-500 mb-1"/><span className="text-sm font-bold text-green-700">{(mode === 'compare' ? analysisV2 : analysisV1).sensoryCounts.sound}</span></div>
                        <div className="bg-orange-50 rounded p-2"><Fingerprint size={16} className="mx-auto text-orange-500 mb-1"/><span className="text-sm font-bold text-orange-700">{(mode === 'compare' ? analysisV2 : analysisV1).sensoryCounts.touch}</span></div>
                        <div className="bg-pink-50 rounded p-2"><Utensils size={16} className="mx-auto text-pink-500 mb-1"/><span className="text-sm font-bold text-pink-700">{(mode === 'compare' ? analysisV2 : analysisV1).sensoryCounts.smell_taste}</span></div>
                    </div>
                </DashboardCard>
            </section>

            {/* FOOTER */}
            <footer className="bg-slate-900 text-slate-400 py-8 mt-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm">
                        Creado por <a href="https://victorbalcells.com" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">Víctor Balcells</a>
                    </div>
                    <div className="flex gap-4">
                        <a href="https://victorbalcells.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                            <Globe size={16}/> Web
                        </a>
                        <a href="https://youtube.com/channel/UCdw2qndef7Jn7FTwQTaTyTw/" target="_blank" rel="noreferrer" className="hover:text-red-400 transition-colors flex items-center gap-2">
                            <Youtube size={16}/> YouTube
                        </a>
                    </div>
                </div>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}