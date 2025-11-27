import React, { useMemo } from 'react';
import { Eye, Ear, Fingerprint, Utensils, ArrowLeft, BarChart2 } from 'lucide-react';
import { SENSORY_DICT } from '../../utils/textAnalyzer';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailSenses({ analysis, onBack }) {

    // 1. Calcular totales para mostrar estadísticas rápidas
    const stats = useMemo(() => {
        const total = analysis.sensoryCounts.sight + analysis.sensoryCounts.sound + analysis.sensoryCounts.touch + analysis.sensoryCounts.smell_taste;
        if (total === 0) return { dominant: 'Ninguno', percent: 0 };
        
        const maxVal = Math.max(analysis.sensoryCounts.sight, analysis.sensoryCounts.sound, analysis.sensoryCounts.touch, analysis.sensoryCounts.smell_taste);
        let dominant = '';
        if (maxVal === analysis.sensoryCounts.sight) dominant = 'Vista';
        else if (maxVal === analysis.sensoryCounts.sound) dominant = 'Oído';
        else if (maxVal === analysis.sensoryCounts.touch) dominant = 'Tacto';
        else dominant = 'Olfato y Gusto';

        return { dominant, percent: Math.round((maxVal / total) * 100) };
    }, [analysis.sensoryCounts]);

    // 2. Renderizado de Texto
    const renderText = () => {
        const paragraphs = analysis.rawText.split(/\n+/);
        return paragraphs.map((para, pIdx) => (
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
        ));
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Eye className="text-teal-500" /> Mapa Sensorial (Sensorium)
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition"><ArrowLeft size={20} /> Volver</button>
            </div>

            {/* PANEL ESTADÍSTICO SUPERIOR */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* TIMELINES */}
                <div className="lg:col-span-2 bg-teal-50 p-6 rounded-xl border border-teal-100">
                    <h3 className="text-sm font-bold text-teal-900 mb-6 flex items-center gap-2">Evolución por Sentido</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-blue-600 w-24 text-right uppercase flex items-center justify-end gap-1"><Eye size={12}/> Vista</span>
                            <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-blue-100">
                                {analysis.sensoryTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full ${s.sight > 0 ? 'bg-blue-500' : 'bg-transparent'}`} />))}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-green-600 w-24 text-right uppercase flex items-center justify-end gap-1"><Ear size={12}/> Oído</span>
                            <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-green-100">
                                {analysis.sensoryTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full ${s.sound > 0 ? 'bg-green-500' : 'bg-transparent'}`} />))}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-bold text-orange-600 w-24 text-right uppercase flex items-center justify-end gap-1"><Fingerprint size={12}/> Tacto</span>
                            <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-orange-100">
                                {analysis.sensoryTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full ${s.touch > 0 ? 'bg-orange-500' : 'bg-transparent'}`} />))}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* ETIQUETA CORREGIDA */}
                            <span className="text-xs font-bold text-pink-600 w-24 text-right uppercase flex items-center justify-end gap-1"><Utensils size={12}/> Olfato/Gusto</span>
                            <div className="flex-1 h-4 bg-white rounded-full overflow-hidden flex border border-pink-100">
                                {analysis.sensoryTimeline.map((s, i) => (<div key={i} className={`flex-1 h-full ${s.smell_taste > 0 ? 'bg-pink-500' : 'bg-transparent'}`} />))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* TARJETA INSIGHTS */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Predominancia</h3>
                        <div className="text-3xl font-bold text-gray-800 mb-1">{stats.dominant}</div>
                        <div className="text-sm text-gray-500">Domina el {stats.percent}% de la carga sensorial.</div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 mb-2">
                            <BarChart2 size={14}/> ANÁLISIS IA
                        </div>
                        {/* BOTÓN CON TEXTO CORREGIDO */}
                        <AIEnhancerButton 
                            componentId="detail-senses"
                            textToAnalyze={analysis.rawText.substring(0, 2000)} 
                            contextLabel="Pedir Informe"
                        />
                    </div>
                </div>
            </div>

            <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700">{renderText()}</div>
        </div>
    );
}