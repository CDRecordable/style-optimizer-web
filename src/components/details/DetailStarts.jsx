import React from 'react';
import { PieChart as PieChartIcon, ArrowLeft } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export default function DetailStarts({ analysis, onBack }) {

    // 1. Datos Gráficos
    const data = Object.entries(analysis.sentenceStarts).map(([name, value]) => ({ name, value }));
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28'];
    const TYPE_COLORS = {
        "Artículo": '#8884d8', "Preposición": '#82ca9d', "Pronombre": '#ffc658', 
        "Gerundio": '#ff8042', "Conector": '#00C49F', "Sujeto/Otro": '#FFBB28'
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Cabecera */}
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <PieChartIcon className="text-blue-500" /> Variedad de Inicio de Oración
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-10">
                {/* Gráfico Circular */}
                <div className="w-full md:w-1/2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={data} 
                                cx="50%" 
                                cy="50%" 
                                labelLine={false} 
                                outerRadius={80} 
                                fill="#8884d8" 
                                dataKey="value" 
                                label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                            >
                                {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Leyenda */}
                <div className="w-full md:w-1/2 space-y-4">
                    <h3 className="font-bold text-gray-700 mb-2">Análisis de Estructura</h3>
                    <p className="text-gray-600 text-sm">
                        Un estilo variado alterna el sujeto, complementos circunstanciales y conectores al inicio de las oraciones.
                        Evita la monotonía de empezar siempre igual (ej: Artículo + Sustantivo).
                    </p>
                    <ul className="text-sm space-y-2 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        {data.map((item, idx) => (
                            <li key={idx} className="flex justify-between border-b border-gray-200/50 pb-1 last:border-0">
                                <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[idx % COLORS.length]}}></div> 
                                    {item.name}
                                </span> 
                                <span className="font-bold">{item.value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Timeline Secuencial */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">Distribución Secuencial (Frase a Frase)</h3>
                <div className="h-8 w-full flex rounded-lg overflow-hidden shadow-inner">
                    {analysis.sentenceStartTimeline.map((item, i) => (
                        <div 
                            key={i} 
                            className="flex-1 h-full border-r border-white/10 hover:opacity-80 transition-opacity relative group" 
                            style={{backgroundColor: TYPE_COLORS[item.type] || '#ccc'}}
                        >
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-800 text-white text-xs p-1 rounded whitespace-nowrap z-10 shadow-lg">
                                Frase {i+1}: {item.type}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2 font-mono uppercase tracking-wider">
                    <span>Inicio del Texto</span>
                    <span>Final del Texto</span>
                </div>
            </div>
        </div>
    );
}