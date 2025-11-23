import React, { useState } from 'react';
import { 
  BookOpen, Activity, Repeat, Mic2, AlertTriangle, Feather, Eye, Type, ArrowLeft,
  Music, Zap, Layers, Fingerprint, Ear, Utensils,
  PauseCircle, RefreshCcw, MessageSquare, Gauge, UserX, Printer, Globe, Youtube, 
  Edit, Package, AlignJustify, Minus, List, ArrowRight, Clock, ArrowDown, Info
} from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';

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

// --- TOOLTIP PERSONALIZADO GRÁFICOS ---
const CustomBarTooltip = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-xl border border-slate-700">
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
    
    // 1. DETALLE: VOZ PASIVA
    if (viewMode === 'detail-passive') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><UserX className="text-gray-500" /> Voz Pasiva e Impersonal</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertTriangle className="text-amber-500" size={20}/> La Trampa de la Pasiva</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="bg-white p-3 rounded border border-slate-200 shadow-sm">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">EJEMPLO PASIVO (Evitar)</p>
                                <p className="text-red-700 font-medium">"La decisión <span className="bg-red-100 px-1 rounded">fue tomada</span> por el comité."</p>
                            </div>
                            <div className="flex justify-center"><ArrowDown className="text-slate-300"/></div>
                            <div className="bg-white p-3 rounded border border-green-200 shadow-sm ring-1 ring-green-100">
                                <p className="text-xs text-green-600 font-bold uppercase mb-1">EJEMPLO ACTIVO (Preferir)</p>
                                <p className="text-green-800 font-bold">"El comité <span className="underline decoration-green-400 decoration-2">tomó</span> la decisión."</p>
                            </div>
                        </div>
                        <div className="text-sm text-slate-600 space-y-4">
                            <p><strong className="text-slate-800">¿Por qué corregirlo?</strong><br/>La voz pasiva oculta al "agente" (quién hace la acción). Hace que el texto suene burocrático, débil o distante. </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Busca construcciones con <strong>"SER + Participio"</strong> (fue hecho, ha sido visto).</li>
                                <li>Cuidado con el <strong>"SE" impersonal</strong> (se dice, se comenta).</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="mb-6">
                            {para.split(/(\s+)/).map((w, i) => {
                                if (!/\w+/.test(w)) return <span key={i}>{w}</span>;
                                const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                const isPassive = (clean === 'se' || clean === 'fue' || clean === 'fueron' || clean === 'sido' || clean === 'siendo');
                                return <span key={i} className={isPassive ? "bg-slate-200 text-slate-800 font-bold border-b-2 border-slate-400 px-1 rounded cursor-help" : ""}>{w}</span>;
                            })}
                        </p>
                    ))}
                </div>
            </div>
        );
    }

    // 2. DETALLE: LEGIBILIDAD
    if (viewMode === 'detail-readability') {
        const score = analysis.readabilityScore;
        let label = "Normal"; let color = "text-yellow-600"; let bg = "bg-yellow-50";
        if (score > 80) { label = "Muy Fácil"; color = "text-green-600"; bg = "bg-green-50"; }
        else if (score > 60) { label = "Fácil"; color = "text-green-500"; bg = "bg-green-50"; }
        else if (score > 40) { label = "Normal"; color = "text-yellow-600"; bg = "bg-yellow-50"; }
        else { label = "Difícil"; color = "text-red-600"; bg = "bg-red-50"; }

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Gauge className="text-teal-500" /> Índice de Legibilidad</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="flex flex-col items-center justify-center py-12 space-y-8">
                    <div className={`relative w-64 h-64 flex items-center justify-center rounded-full border-[16px] ${bg.replace('bg-', 'border-')} transition-all duration-1000`}>
                        <div className="text-center">
                            <span className={`text-7xl font-black ${color} tracking-tighter`}>{score}</span>
                            <span className="block text-xs text-gray-400 uppercase mt-2 tracking-widest">Escala F. Huerta</span>
                        </div>
                    </div>
                    <div className="text-center max-w-lg">
                        <h3 className={`text-3xl font-bold ${color} mb-2`}>{label}</h3>
                        <p className="text-gray-600 text-lg">Este índice mide la complejidad estructural del texto basándose en la longitud de las palabras y de las oraciones.</p>
                    </div>
                </div>
            </div>
        );
    }

    // 3. DETALLE: DIÁLOGO
    if (viewMode === 'detail-dialogue') {
         return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><MessageSquare className="text-blue-500" /> Radiografía de Diálogo</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="mb-8 bg-slate-50 p-4 rounded-xl">
                    <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                        <span>Narrativa ({100 - analysis.dialogueRatio}%)</span>
                        <span>Diálogo ({analysis.dialogueRatio}%)</span>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                        <div className="h-full bg-slate-400" style={{width: `${100 - analysis.dialogueRatio}%`}}></div>
                        <div className="h-full bg-blue-500" style={{width: `${analysis.dialogueRatio}%`}}></div>
                    </div>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                     {paragraphs.map((para, pIdx) => {
                        if (!para.trim()) return null;
                        const startsWithDialogue = /^[—–\-―«"“]/.test(para.trim());
                        return startsWithDialogue 
                            ? <p key={pIdx} className="mb-4 p-4 rounded-r-xl bg-blue-50 border-l-4 border-blue-400 text-blue-900 font-medium">{para}</p>
                            : <p key={pIdx} className="mb-4 opacity-80">{para}</p>;
                    })}
                </div>
            </div>
         );
    }

    // 4. DETALLE: SISMÓGRAFO
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
                
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Activity size={16}/> Ritmo Visual (Colores indican anomalías)</h3>
                    <div className="h-64 w-full mb-6">
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div><span className="text-xs font-bold text-gray-600">Staccato (Rápido)</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-xs font-bold text-gray-600">Muro (Denso)</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded-full"></div><span className="text-xs font-bold text-gray-600">Monotonía</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-indigo-400 rounded-full"></div><span className="text-xs font-bold text-gray-600">Normal</span></div>
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

    // 5. DETALLE: SHOW VS TELL
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
                
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Activity size={16}/> Densidad de "Filtros" por frase</h3>
                    <div className="h-40 mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
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
                    <div className="flex justify-center gap-8">
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-full"></div><span className="text-sm font-medium text-gray-600">Show (Directo)</span></div>
                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-400 rounded-full"></div><span className="text-sm font-medium text-gray-600">Tell (Filtro)</span></div>
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

    // 6. DETALLE: PALABRAS BAÚL
    if (viewMode === 'detail-baul') {
        return (
             <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px]">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Package className="text-orange-500" /> Palabras Baúl</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="flex items-start gap-3"><div className="p-2 bg-orange-100 rounded text-orange-600"><AlertTriangle size={16}/></div><div><h4 className="font-bold text-orange-900 text-sm">Verbos Comodín</h4><p className="text-xs text-orange-700 mt-1">Hacer, tener, poner...</p></div></div>
                     <div className="flex items-start gap-3"><div className="p-2 bg-yellow-100 rounded text-yellow-600"><Package size={16}/></div><div><h4 className="font-bold text-yellow-900 text-sm">Sustantivos Vagos</h4><p className="text-xs text-yellow-700 mt-1">Cosa, algo, tema...</p></div></div>
                </div>
                <div className="prose max-w-none text-lg text-gray-700 font-serif">
                     {paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="mb-6">
                            {para.split(/(\s+)/).map((w, i) => {
                                const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                const isBaul = PALABRAS_BAUL.has(clean);
                                return <span key={i} className={isBaul ? "bg-orange-100 text-orange-900 border-b-2 border-orange-300 px-1 rounded" : ""}>{w}</span>
                            })}
                        </p>
                     ))}
                </div>
            </div>
        )
    }

    // 7. DETALLE: DENSIDAD DE PUNTUACIÓN
    if (viewMode === 'detail-punctuation') {
        const chartData = analysis.commasPerSentence.map((count, i) => ({
            id: i+1,
            realValue: count,
            visualValue: count === 0 ? 0.2 : count
        }));

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><PauseCircle className="text-orange-500" /> Ritmo Respiratorio (Puntuación)</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Activity size={16}/> Densidad de Comas por Frase</h3>
                    <div className="h-40 mb-6">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="id" hide />
                                <YAxis allowDecimals={false} hide />
                                <Tooltip content={<CustomBarTooltip unit="comas" />} cursor={{fill: 'transparent'}} />
                                <Bar dataKey="visualValue" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => {
                                        const count = entry.realValue;
                                        let color = "#4ade80"; // Green
                                        if (count === 0) color = "#60a5fa"; // Blue
                                        if (count > 3) color = "#f87171"; // Red
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded border border-blue-100"><span className="block font-bold text-blue-800 text-sm mb-1">0 Comas (Directo)</span><p className="text-xs text-blue-600">Barras azules. Frase directa y rápida.</p></div>
                        <div className="bg-green-50 p-3 rounded border border-green-100"><span className="block font-bold text-green-800 text-sm mb-1">1-3 Comas (Equilibrado)</span><p className="text-xs text-green-600">Barras verdes. Ritmo estándar.</p></div>
                        <div className="bg-red-50 p-3 rounded border border-red-100"><span className="block font-bold text-red-800 text-sm mb-1">4+ Comas (Laberíntico)</span><p className="text-xs text-red-600">Barras rojas. Riesgo de perder al lector.</p></div>
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

    // 8. DETALLE: MÉTRICAS DE ESTILO
    if (viewMode === 'detail-metrics') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Layers className="text-purple-500" /> Análisis de Densidad y Estilo</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2"><Activity size={16}/> Distribución de Estilo</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4"><span className="text-xs font-bold text-purple-500 w-10 text-right">-mte</span><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.metricsTimeline.map((m, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 ${m.mente > 0 ? 'bg-purple-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Adverbio`}/>))}</div></div>
                        <div className="flex items-center gap-4"><span className="text-xs font-bold text-indigo-500 w-10 text-right">-ción</span><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.metricsTimeline.map((m, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 ${m.cion > 0 ? 'bg-indigo-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Nominalización`}/>))}</div></div>
                        <div className="flex items-center gap-4"><span className="text-xs font-bold text-orange-500 w-10 text-right">Adj+</span><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.metricsTimeline.map((m, i) => (<div key={i} className={`flex-1 h-full border-r border-white/20 ${m.adj > 0 ? 'bg-orange-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Cluster Adjetivos`}/>))}</div></div>
                        <div className="flex items-center gap-4"><span className="text-xs font-bold text-teal-500 w-10 text-right">Inicio</span><div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">{analysis.metricsTimeline.map((_, i) => { const isAnaphora = analysis.anaphoraAlerts.some(a => a.indices.includes(i)); return <div key={i} className={`flex-1 h-full border-r border-white/20 ${isAnaphora ? 'bg-teal-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Inicio Repetitivo`}/> })}</div></div>
                    </div>
                </div>
                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="mb-6">
                            {para.split(/(\s+)/).map((w, i) => {
                                const clean = w.toLowerCase().replace(/[.,;:!?]/g, "");
                                let style = "";
                                if (clean.endsWith("mente") && clean.length > 5) style = "bg-purple-100 text-purple-900 border-b-2 border-purple-300";
                                else if ((clean.endsWith("ción") || clean.endsWith("cion")) && clean.length > 4) style = "bg-indigo-100 text-indigo-900 border-b-2 border-indigo-300";
                                return <span key={i} className={style}>{w}</span>;
                            })}
                        </p>
                    ))}
                </div>
            </div>
        );
    }

    // 9. DETALLE: MAPA SENSORIAL (TIMELINE HORIZONTAL)
    if (viewMode === 'detail-senses') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Eye className="text-teal-500" /> Mapa Sensorial</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2"><Activity size={16}/> Flujo Sensorial (Línea de Tiempo)</h3>
                    <div className="space-y-4">
                        {/* VISTA */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-blue-500 w-12 text-right uppercase">Vista</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                {analysis.sensoryTimeline.map((s, i) => (
                                    <div key={i} className={`flex-1 h-full border-r border-white/20 ${s.sight > 0 ? 'bg-blue-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Vista (${s.sight})`}/>
                                ))}
                            </div>
                        </div>
                        {/* OIDO */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-green-500 w-12 text-right uppercase">Oído</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                {analysis.sensoryTimeline.map((s, i) => (
                                    <div key={i} className={`flex-1 h-full border-r border-white/20 ${s.sound > 0 ? 'bg-green-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Oído (${s.sound})`}/>
                                ))}
                            </div>
                        </div>
                        {/* TACTO */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-orange-500 w-12 text-right uppercase">Tacto</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                {analysis.sensoryTimeline.map((s, i) => (
                                    <div key={i} className={`flex-1 h-full border-r border-white/20 ${s.touch > 0 ? 'bg-orange-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Tacto (${s.touch})`}/>
                                ))}
                            </div>
                        </div>
                        {/* GUSTO/OLFATO */}
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-pink-500 w-12 text-right uppercase">Olfato</span>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden flex">
                                {analysis.sensoryTimeline.map((s, i) => (
                                    <div key={i} className={`flex-1 h-full border-r border-white/20 ${s.smell_taste > 0 ? 'bg-pink-500' : 'bg-transparent'}`} title={`Frase ${i+1}: Gusto/Olfato (${s.smell_taste})`}/>
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

    // 10. DETALLE: CACOFONÍAS (CORREGIDO V3.5 - DOBLE RESALTADO)
    if (viewMode === 'detail-cacophony') {
        
        // PRE-CALCULO DE PAREJAS PROBLEMÁTICAS PARA EL TEXTO
        const shockIndices = new Set();
        const echoIndices = new Set();
        const echoPartners = {}; // Map para tooltips
        const shockPartners = {};

        const allWords = analysis.rawText.split(/\s+/); // Tokenización básica para índices globales
        // NOTA: Esto es una aproximación para la vista. La lógica real idealmente debería ser más robusta con índices de caracteres.
        // Para esta versión, usaremos una lógica de paso por párrafo que es más segura visualmente.

        // DATOS PARA EL GRÁFICO
        const soundTimelineData = analysis.rawText.split(/([.!?]+)/).filter(s => s.trim().length > 0 && !/^[.!?]+$/.test(s)).map((sent, i) => {
            const words = sent.toLowerCase().replace(/[.,;:!?()"«»]/g, "").split(/\s+/).filter(w => w.length > 0);
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
            return { id: i+1, val: (hasShock || hasEcho) ? 1 : 0.1, hasShock, hasEcho, text: sent };
        });

        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Music className="text-red-500" /> Escáner Sonoro: Cacofonías y Ecos</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                
                <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2"><Activity size={16}/> Distribución Sonora (Pasa el ratón)</h3>
                    <div className="h-24 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={soundTimelineData}>
                                <XAxis dataKey="id" hide />
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const d = payload[0].payload;
                                            const type = d.hasShock ? 'CHOQUE (Final/Inicio igual)' : d.hasEcho ? 'ECO (Rima interna)' : 'Limpio';
                                            return (
                                                <div className="bg-slate-800 text-white p-2 text-xs rounded shadow max-w-xs">
                                                    <strong>Frase {d.id}: {type}</strong>
                                                    <p className="mt-1 italic opacity-80">{d.text.substring(0, 50)}...</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                    cursor={{fill: 'transparent'}} 
                                />
                                <Bar dataKey="val" radius={[2, 2, 0, 0]}>
                                    {soundTimelineData.map((entry, index) => {
                                        let color = "#e5e7eb"; // Gris
                                        if (entry.hasEcho) color = "#fb923c"; // Naranja
                                        if (entry.hasShock) color = "#f87171"; // Rojo
                                        return <Cell key={`cell-${index}`} fill={color} height={entry.hasShock || entry.hasEcho ? 40 : 10} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex gap-6 mt-2 text-xs text-gray-500 justify-center">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded"/> Choque (placa caerá)</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-orange-400 rounded"/> Eco (rima interna)</div>
                    </div>
                </div>

                <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                    {paragraphs.map((para, pIdx) => (
                        <p key={pIdx} className="mb-6">
                            {/* LÓGICA DE RESALTADO DOBLE: Marcamos AMBOS ELEMENTOS de la pareja */}
                            {para.split(/(\s+)/).map((w, i, arr) => {
                                if (!w.trim()) return <span key={i}>{w}</span>;
                                
                                const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                let style = "";
                                let title = "";

                                // 1. DETECCIÓN DE CHOQUE (Miramos atrás y adelante para marcar ambos)
                                // Soy el primero de la pareja?
                                if (i < arr.length - 2) {
                                    const nextWord = arr[i+2].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                    if (clean.length >= 3 && nextWord.length >= 3 && clean.slice(-2) === nextWord.slice(0,2)) {
                                        style = "bg-red-100 text-red-800 border-b-2 border-red-400 font-bold cursor-help";
                                        title = `Choque con: "${nextWord}"`;
                                    }
                                }
                                // Soy el segundo de la pareja? (Miramos atrás)
                                if (i >= 2) {
                                    const prevWord = arr[i-2].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                    if (prevWord.length >= 3 && clean.length >= 3 && prevWord.slice(-2) === clean.slice(0,2)) {
                                        style = "bg-red-100 text-red-800 border-b-2 border-red-400 font-bold cursor-help";
                                        title = `Choque con: "${prevWord}"`;
                                    }
                                }

                                // 2. DETECCIÓN DE ECO (Si no es choque, miramos eco)
                                if (!style && clean.length > 4) {
                                    const suffix = clean.slice(-3);
                                    // Miramos adelante
                                    let matchWord = null;
                                    for(let k=1; k<=3; k++) {
                                        let lookAheadIdx = i + (k * 2);
                                        if (lookAheadIdx < arr.length) {
                                            const target = arr[lookAheadIdx].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                            if (target.endsWith(suffix) && target !== clean) matchWord = target;
                                        }
                                    }
                                    // Miramos atrás
                                    for(let k=1; k<=3; k++) {
                                        let lookBackIdx = i - (k * 2);
                                        if (lookBackIdx >= 0) {
                                            const target = arr[lookBackIdx].toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                            if (target.endsWith(suffix) && target !== clean) matchWord = target;
                                        }
                                    }

                                    if (matchWord) {
                                        style = "bg-orange-100 text-orange-800 border-b-2 border-orange-300 decoration-orange-500 underline decoration-dotted cursor-help";
                                        title = `Rima con: "${matchWord}"`;
                                    }
                                }
                                
                                return <span key={i} className={style} title={title}>{w}</span>;
                            })}
                        </p>
                    ))}
                </div>
            </div>
        );
    }

    // 11. DETALLE: REPETICIONES
    if (viewMode === 'detail-repetitions') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><Repeat className="text-blue-500" /> Repeticiones Léxicas</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 bg-blue-50 p-5 rounded-xl h-fit border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><List size={16}/> Palabras más usadas</h3>
                        <div className="space-y-2">
                            {analysis.repetitions.slice(0, 10).map(([word, count]) => (
                                <div key={word} className="flex justify-between items-center bg-white p-2 rounded border border-blue-100">
                                    <span className="text-gray-700 font-medium capitalize">{word}</span>
                                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 prose max-w-none font-serif text-lg leading-relaxed text-gray-700">
                        {paragraphs.map((para, pIdx) => (
                            <p key={pIdx} className="mb-6">
                                {para.split(/(\s+)/).map((w, i) => {
                                    const clean = w.toLowerCase().replace(/[.,;:!?()"«»]/g, "");
                                    const isRepeated = analysis.repetitions.slice(0, 5).some(r => r[0] === clean) && !STOPWORDS.has(clean);
                                    return <span key={i} className={isRepeated ? "bg-blue-100 text-blue-900 border-b border-blue-300" : ""}>{w} </span>;
                                })}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 12. DETALLE: INICIOS REPETITIVOS
    if (viewMode === 'detail-anaphora') {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2"><RefreshCcw className="text-teal-500" /> Inicios Repetitivos (Anáforas)</h2>
                    <button onClick={() => setViewMode("dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 mb-6">
                    <p className="text-sm text-teal-800">Se han detectado <strong>{analysis.anaphoraAlerts.length}</strong> casos donde frases consecutivas empiezan con la misma palabra.</p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-800 mb-8">
                             <ComparisonCard title="Diálogo" label="vs Narrativa" valOld={analysisV1.dialogueRatio} valNew={analysisV2.dialogueRatio} inverse={false} suffix="%" />
                            <ComparisonCard title="Legibilidad" label="Escala F. Huerta" valOld={analysisV1.readabilityScore} valNew={analysisV2.readabilityScore} inverse={false} />
                            <ComparisonCard title="Voz Pasiva" label="Casos detectados" valOld={analysisV1.passiveCount} valNew={analysisV2.passiveCount} inverse={true} />
                        </div>
                        
                        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                            <h3 className="font-bold text-indigo-100 mb-4 flex items-center gap-2"><Activity size={18}/> Ritmo Comparado (Primeras 30 frases)</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[...analysisV1.sentenceLengths.map((len, i) => ({ name: i+1, Original: len, Corregido: analysisV2.sentenceLengths[i] || 0 })).slice(0, 30)]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                                        <YAxis stroke="rgba(255,255,255,0.5)" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: 'none', borderRadius: '8px', color: 'white' }} itemStyle={{ color: '#e0e7ff' }} />
                                        <Legend wrapperStyle={{ paddingTop: '10px' }}/>
                                        <Bar dataKey="Original" fill="rgba(255,255,255,0.3)" radius={[4, 4, 0, 0]} /> 
                                        <Bar dataKey="Corregido" fill="#818cf8" radius={[4, 4, 0, 0]} /> 
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
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
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2 border-gray-200"><Activity className="text-indigo-500"/> RITMO</h3>
                
                <DashboardCard title="Sismógrafo de Frases" icon={<Activity className="text-indigo-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-sismografo')}>
                    <div className="h-32 flex items-end gap-1 border-b border-gray-100 pb-1 overflow-x-auto mb-1">
                        {(mode === 'compare' ? analysisV2 : analysisV1).sentenceLengths.map((len, i) => (
                            <div key={i} className={`w-2 rounded-t transition-all hover:opacity-80 ${len > 25 ? 'bg-red-400' : len < 8 ? 'bg-blue-300' : 'bg-indigo-400'}`} style={{ height: `${Math.min(100, (len/40)*100)}%`, minWidth: '6px' }}></div>
                        ))}
                    </div>
                </DashboardCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <MetricCard icon={<PauseCircle />} label="Densidad de Puntuación" value={(mode === 'compare' ? analysisV2 : analysisV1).punctuationDensity} color="orange" subtext="Comas por frase" onClick={() => setViewMode('detail-punctuation')} />
                    <MetricCard icon={<Gauge />} label="Legibilidad" value={(mode === 'compare' ? analysisV2 : analysisV1).readabilityScore} color="teal" subtext="Escala F. Huerta" onClick={() => setViewMode('detail-readability')} />
                </div>
            </section>

            {/* SECCIÓN 3: ESTILO */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2 border-gray-200"><Feather className="text-purple-500"/> ESTILO</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DashboardCard title="Inicios Repetitivos" icon={<RefreshCcw className="text-teal-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-anaphora')}>
                        {(mode === 'compare' ? analysisV2 : analysisV1).anaphoraAlerts.length > 0 ? <div className="text-sm space-y-1">{(mode === 'compare' ? analysisV2 : analysisV1).anaphoraAlerts.slice(0,3).map((a,i)=><div key={i} className="flex justify-between p-2 bg-teal-50 rounded text-teal-800"><span className="font-medium italic">"{a.word}..."</span><span className="text-xs bg-white px-2 py-0.5 rounded font-bold">x{a.indices.length}</span></div>)}</div> : <p className="text-sm text-gray-400 italic">Sin anáforas detectadas.</p>}
                    </DashboardCard>

                    <DashboardCard title="Repeticiones" icon={<Repeat className="text-blue-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-repetitions')}>
                        <div className="space-y-1">
                            {(mode === 'compare' ? analysisV2 : analysisV1).repetitions.length > 0 ? (mode === 'compare' ? analysisV2 : analysisV1).repetitions.slice(0, 3).map(([w, c]) => (
                                <div key={w} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0"><span className="text-gray-700 capitalize">{w}</span><span className="bg-blue-100 text-blue-800 px-2 rounded-full text-xs font-bold">{c}</span></div>
                            )) : <p className="text-sm text-gray-400">Limpio de repeticiones.</p>}
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Métricas de Estilo" icon={<Layers className="text-purple-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-metrics')}>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-purple-50 p-2 rounded text-center"><span className="block font-bold text-purple-700 text-lg">{(mode === 'compare' ? analysisV2 : analysisV1).rhymes.mente}</span><span className="text-[10px] text-purple-500 uppercase">-mente</span></div>
                            <div className="bg-indigo-50 p-2 rounded text-center"><span className="block font-bold text-indigo-700 text-lg">{(mode === 'compare' ? analysisV2 : analysisV1).rhymes.cion}</span><span className="text-[10px] text-indigo-500 uppercase">-ción</span></div>
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

            {/* SECCIÓN 4: NARRACIÓN */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2 border-gray-200"><BookOpen className="text-pink-500"/> NARRACIÓN</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard icon={<Eye />} label="Show vs Tell" value={`${(mode === 'compare' ? analysisV2 : analysisV1).perceptionRatio}%`} color="green" onClick={() => setViewMode('detail-showtell')} />
                    <MetricCard icon={<UserX />} label="Voz Pasiva" value={(mode === 'compare' ? analysisV2 : analysisV1).passiveCount} color="gray" subtext="Casos detectados" onClick={() => setViewMode('detail-passive')} />
                    <MetricCard icon={<MessageSquare />} label="Diálogo" value={`${(mode === 'compare' ? analysisV2 : analysisV1).dialogueRatio}%`} color="blue" subtext="vs Narrativa" onClick={() => setViewMode('detail-dialogue')} />
                </div>
            </section>

            {/* SECCIÓN 5: SENSORIUM */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-2 border-gray-200"><Eye className="text-teal-500"/> SENSORIUM</h3>
                <DashboardCard title="Mapa Sensorial" icon={<Eye className="text-teal-600 w-5 h-5" />} onViewDetail={() => setViewMode('detail-senses')}>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-blue-50 rounded p-2"><Eye size={16} className="mx-auto text-blue-500 mb-1"/><span className="text-sm font-bold text-blue-700">{(mode === 'compare' ? analysisV2 : analysisV1).sensoryCounts.sight}</span></div>
                        <div className="bg-green-50 rounded p-2"><Ear size={16} className="mx-auto text-green-500 mb-1"/><span className="text-sm font-bold text-green-700">{(mode === 'compare' ? analysisV2 : analysisV1).sensoryCounts.sound}</span></div>
                        <div className="bg-orange-50 rounded p-2"><Fingerprint size={16} className="mx-auto text-orange-500 mb-1"/><span className="text-sm font-bold text-orange-700">{(mode === 'compare' ? analysisV2 : analysisV1).sensoryCounts.touch}</span></div>
                        <div className="bg-pink-50 rounded p-2"><Utensils size={16} className="mx-auto text-pink-500 mb-1"/><span className="text-sm font-bold text-pink-700">{(mode === 'compare' ? analysisV2 : analysisV1).sensoryCounts.smell_taste}</span></div>
                    </div>
                </DashboardCard>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}