import React, { useMemo } from 'react'; // Importamos useMemo para la data
import { 
    BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
    YAxis
} from 'recharts';
import { Activity, ChevronRight, Maximize } from 'lucide-react';
// Asumimos que CustomBarTooltip está disponible en '../common/StyleComponents' o usamos un Tooltip simple.

// --- DEFINICIONES (Copias de DetailSismografo para colorear) ---
const LEGEND_ITEMS = [
    { type: 'STACCATO', label: 'Staccato (3+ Cortas)', color: 'bg-blue-600' },
    { type: 'MURO', label: 'Muro (3+ Largas)', color: 'bg-red-600' }, 
    { type: 'MONOTONIA', label: 'Monotonía (Largas Similares)', color: 'bg-orange-600' },
    { type: 'NORMAL', label: 'Normal', color: 'bg-indigo-400' },
];

const getBarColor = (type) => {
    switch (type) {
        case 'STACCATO':
            return '#3b82f6'; // Azul
        case 'MURO':
            return '#ef4444'; // Rojo
        case 'MONOTONIA':
            return '#f97316'; // Naranja
        default:
            return '#818cf8'; // Índigo
    }
};

/**
 * Lógica de clasificación de cadenas (Adaptada de DetailSismografo.jsx para consistencia)
 * NOTA: Esta lógica compleja DEBE estar aquí para que los colores funcionen en el Dashboard.
 */
const classifyRhythm = (lengths, alerts) => {
    return lengths.map((len, i) => {
        const alert = alerts.find(a => i >= a.start && i <= a.end);
        let color = "#818cf8"; // Indigo (Normal)
        let type = "NORMAL";
        
        if (alert) {
            if (alert.type === 'staccato') { color = "#3b82f6"; type = "STACCATO"; }
            if (alert.type === 'wall') { color = "#ef4444"; type = "MURO"; }
            if (alert.type === 'flat') { color = "#9ca3af"; type = "MONOTONIA"; }
        }
        return { id: i + 1, len, color, type: type };
    });
};

/**
 * Determina la clasificación general del texto para el texto de la leyenda.
 */
const getOverallRhythmType = (classifications) => {
    if (classifications.length === 0) return { type: "Necesita más texto", color: "text-gray-500" };

    const counts = classifications.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
    }, {});
    
    const totalSentences = classifications.length;
    
    if (counts['MURO'] / totalSentences > 0.10) {
        return { type: "MURO (Demasiados bloques largos)", color: "text-red-500" };
    }
    if (counts['STACCATO'] / totalSentences > 0.20) {
        return { type: "STACCATO (Ritmo Cortante y Rápido)", color: "text-blue-500" };
    }
    if (counts['MONOTONIA'] / totalSentences > 0.10) {
        return { type: "MONOTONÍA (Baja variación de frase)", color: "text-orange-500" };
    }
    
    return { type: "NORMAL (Buen Flujo y Variación)", color: "text-green-500" };
};


const SismografoChart = ({ analysis, onViewDetail }) => {
    const lengths = analysis.sentenceLengths || [];
    const maxLen = Math.max(...lengths, 1);
    
    const averageLength = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    
    // 1. CONSTRUCCIÓN DE DATA COMO EN EL GRÁFICO DETALLADO
    const chartData = useMemo(() => {
        return classifyRhythm(analysis.sentenceLengths, analysis.sismografoAlerts);
    }, [analysis]);
    
    const overallRhythm = getOverallRhythmType(chartData);
    
    // FIX VISUAL: El dominio del eje Y es el máximo + 10%
    const yAxisDomain = [0, maxLen * 1.10]; 

    return (
        <div className="col-span-full bg-white p-6 rounded-2xl shadow-xl border border-indigo-100/50 flex flex-col">
            
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-indigo-700 flex items-center gap-2">
                    <Activity size={24} /> Sismógrafo de Ritmo
                </h3>
                <button 
                    onClick={onViewDetail} 
                    className="text-indigo-500 hover:text-indigo-700 transition"
                    title="Ver detalles"
                >
                    <Maximize size={20} />
                </button>
            </div>

            {/* DIAGNÓSTICO GENERAL CON TEXTO DE CONTEXTO */}
            <div className="flex flex-col mb-4 pb-2 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Diagnóstico de Ritmo Dominante</span>
                <span className={`text-xl font-black ${overallRhythm.color}`}>{overallRhythm.type}</span>
            </div>

            {/* VISUALIZACIÓN DE BARRAS: Usando Recharts para el Dashboard */}
            <div className="h-44 w-full flex-grow px-2 py-2 bg-gray-50 rounded-lg"> 
                <ResponsiveContainer width="100%" height="100%">
                    {/* FIX: Definimos el margen superior (top=10) y el dominio del eje Y */}
                    <BarChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}> 
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        
                        {/* El eje Y es CRÍTICO para el escalado y el espacio superior */}
                        <YAxis hide domain={yAxisDomain} /> 
                        <XAxis dataKey="id" hide={true} /> 
                        
                        {/* Tooltip simple para visualización */}
                        <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                    <div className="bg-indigo-900 text-white text-xs p-2 rounded shadow-lg">
                                        <p className="font-bold">{`${data.len} palabras`}</p>
                                        <p className="opacity-80">Tipo: {data.type}</p>
                                    </div>
                                );
                            }
                            return null;
                        }} />

                        <Bar dataKey="len" radius={[2, 2, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* LEYENDA AÑADIDA */}
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 mt-4 pt-3 border-t border-gray-100">
                {LEGEND_ITEMS.map(item => (
                    <div key={item.type} className="flex items-center text-xs text-gray-600">
                        <span className={`w-3 h-3 rounded-full mr-1 ${item.color}`}></span>
                        {item.label}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between text-sm text-gray-600">
                <span>Frases Analizadas: <span className="font-bold text-indigo-600">{lengths.length}</span></span>
                <span>Longitud Media: <span className="font-bold">{averageLength.toFixed(1)}</span> palabras</span>
            </div>
            
            <button 
                onClick={onViewDetail} 
                className="mt-4 text-xs text-indigo-600 font-bold hover:text-indigo-800 transition flex items-center justify-center pt-2 border-t border-indigo-50"
            >
                VER DETALLES <ChevronRight size={14} />
            </button>
        </div>
    );
};

export default SismografoChart;