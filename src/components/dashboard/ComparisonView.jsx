import React from 'react';
import { Layers, Activity, AlertTriangle } from 'lucide-react';
import { 
    BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { ComparisonCard, CustomBarTooltip } from '../common/StyleComponents';

export default function ComparisonView({ analysisV1, analysisV2 }) {
    if (!analysisV1 || !analysisV2) return null;

    // Preparamos datos para el gráfico superpuesto (Sismógrafo V1 vs V2)
    const comparisonChartData = analysisV1.sentenceLengths.slice(0, 60).map((len, i) => {
        const lenV2 = analysisV2.sentenceLengths[i] || 0;
        const alertV2 = analysisV2.sismografoAlerts.find(a => i >= a.start && i <= a.end);
        
        let colorV2 = "#818cf8"; 
        let labelV2 = "Normal";
        
        if (alertV2) {
            if (alertV2.type === 'staccato') { colorV2 = "#60a5fa"; labelV2 = "Staccato"; }
            if (alertV2.type === 'wall') { colorV2 = "#f87171"; labelV2 = "Muro"; }
            if (alertV2.type === 'flat') { colorV2 = "#9ca3af"; labelV2 = "Monótono"; }
        }

        return { 
            name: i + 1, 
            v1: len, 
            v2: lenV2,
            colorV2,
            alert: labelV2
        };
    });

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 rounded-3xl shadow-2xl mb-10 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Efecto de fondo */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
                {/* Cabecera */}
                <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
                    <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm shadow-inner">
                        <Layers className="text-indigo-300" size={32}/>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white">Informe de Evolución</h2>
                        <p className="text-indigo-200 text-sm mt-1 flex items-center gap-2">
                            <span className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">V1</span> Original 
                            <span className="opacity-50">vs</span> 
                            <span className="bg-indigo-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">V2</span> Editada
                        </p>
                    </div>
                </div>

                {/* FILA 1: KPIs Principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-800 mb-8">
                    <ComparisonCard title="Legibilidad" label="Escala Huerta" valOld={analysisV1.readabilityScore} valNew={analysisV2.readabilityScore} />
                    <ComparisonCard title="Show vs Tell" label="Filtros mentales" valOld={Number(analysisV1.perceptionRatio)} valNew={Number(analysisV2.perceptionRatio)} inverse={true} suffix="%" />
                    <ComparisonCard title="Grasa Textual" label="Frases Pegajosas" valOld={analysisV1.stickySentences.length} valNew={analysisV2.stickySentences.length} inverse={true} />
                    <ComparisonCard title="Voz Pasiva" label="Construcciones" valOld={analysisV1.passiveCount} valNew={analysisV2.passiveCount} inverse={true} />
                </div>

                {/* FILA 2: Gráfico de Ritmo Superpuesto */}
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-lg">
                    <h3 className="font-bold text-indigo-100 mb-4 flex items-center gap-2">
                        <Activity size={18}/> Ritmo Comparado (Superposición Visual)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonChartData} barGap={-100 /* Truco para superponer */}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fontSize: 10}} interval={4} />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.1)'}}
                                    content={<CustomBarTooltip unit="palabras" labelPrefix="Comparativa Frase" />}
                                />
                                <Legend wrapperStyle={{ paddingTop: '10px', color: '#e0e7ff', fontSize: '12px' }}/>
                                
                                {/* Barra Original (Gris fantasma de fondo) */}
                                <Bar dataKey="v1" name="Original (V1)" fill="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} barSize={12} /> 
                                
                                {/* Barra Editada (Coloreada según ritmo) */}
                                <Bar dataKey="v2" name="Editada (V2)" radius={[4, 4, 0, 0]} barSize={6}>
                                    {comparisonChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.colorV2} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 mt-4 text-[10px] text-indigo-200 uppercase font-bold tracking-wider opacity-70">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-400 rounded-full"></div> Staccato</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded-full"></div> Muro</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-gray-400 rounded-full"></div> Monótono</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-400 rounded-full"></div> Normal</span>
                    </div>
                </div>
            </div>
        </div>
    );
}