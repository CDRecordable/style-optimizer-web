import React from 'react';
import { Clock, PieChart, Maximize, ChevronRight } from 'lucide-react';

const STARTS_LABELS = {
    'pronoun': 'Pronombre',
    'adjective': 'Adjetivo',
    'adverb': 'Adverbio',
    'conjunction': 'Conjunción',
    'other': 'Otro'
};

const StartsPieChart = ({ analysis }) => {
    const startsData = analysis.sentenceStarts || {}; // { pronoun: 20, noun: 35, ... }
    const totalStarts = Object.values(startsData).reduce((sum, count) => sum + count, 0);

    const colors = {
        'noun': 'bg-blue-500',
        'adverb': 'bg-green-500',
        'pronoun': 'bg-purple-500',
        'conjunction': 'bg-yellow-500',
        'other': 'bg-gray-400',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
            <h3 className="text-lg font-bold text-gray-700 flex items-center gap-2 mb-4">
                <Clock size={20} className="text-blue-500" /> Variedad de Inicio
            </h3>
            
            <div className="flex items-center justify-between flex-grow gap-4">
                {/* Visual Representation Placeholder */}
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-bold relative">
                    {/* Reemplazar con el gráfico real si usas una librería de charts */}
                    <PieChart size={36} className="text-blue-400"/>
                </div>

                {/* Leyenda y Datos */}
                <ul className="text-sm space-y-1 flex-grow">
                    {Object.entries(startsData).map(([type, count]) => (
                        <li key={type} className="flex justify-between items-center">
                            <span className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${colors[type] || colors['other']}`}></div>
                                {STARTS_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1)}
                            </span>
                            <span className="font-semibold">{((count / totalStarts) * 100).toFixed(0)}%</span>
                        </li>
                    ))}
                </ul>
            </div>
            
            <span className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
                Total analizado: {totalStarts} inicios de frase
            </span>
        </div>
    );
};

export default StartsPieChart;