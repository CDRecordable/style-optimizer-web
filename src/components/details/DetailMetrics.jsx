import React from 'react';
import { Layers, ChevronLeft, Zap } from 'lucide-react';
import { 
    ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Legend 
} from 'recharts';

const DetailMetrics = ({ analysis, onBack }) => {
    const cionWords = analysis.cionWords || [];
    const menteWords = analysis.menteWords || [];
    const timelineData = analysis.viciosTimeline || []; 
    
    const totalVices = cionWords.length + menteWords.length;

    // Función para renderizar el texto con resaltados
    const renderHighlightedText = () => {
        if (!analysis.rawText) return null;
        
        // Para mantener el formato (saltos de línea), dividimos por párrafos
        const paragraphs = analysis.rawText.split(/\n+/);
        
        return paragraphs.map((para, pIdx) => {
            const words = para.split(/(\s+)/); // Mantiene los espacios para reconstruir
            return (
                <p key={pIdx} className="mb-4">
                    {words.map((word, wIdx) => {
                        const clean = word.toLowerCase().replace(/[.,;:!?()"«»—]/g, "");
                        let styleClass = "";
                        
                        if (clean.endsWith("mente") && clean.length > 5) {
                            styleClass = "bg-purple-200 text-purple-900 font-bold px-1 rounded shadow-sm";
                        } else if ((clean.endsWith("ción") || clean.endsWith("cion")) && clean.length > 4) {
                            styleClass = "bg-indigo-200 text-indigo-900 font-bold px-1 rounded shadow-sm";
                        }
                        
                        return <span key={wIdx} className={styleClass}>{word}</span>;
                    })}
                </p>
            );
        });
    };

    return (
        <div className="space-y-8 bg-white p-8 rounded-xl shadow-lg min-h-screen animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex justify-between items-center border-b pb-4">
                <button onClick={onBack} className="flex items-center text-indigo-600 hover:text-indigo-800 font-bold transition">
                    <ChevronLeft size={20} /> Volver al Dashboard
                </button>
                <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                    <Layers size={30} className="text-purple-600" /> Vicios (-ción / -mente)
                </h2>
            </div>

            {/* Resumen y Gráfico */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Panel Lateral de Totales */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="p-6 bg-red-50 rounded-xl border border-red-100 text-center shadow-sm">
                        <h3 className="text-lg font-bold text-red-600 mb-2">Total Detectado</h3>
                        <p className="text-5xl font-black text-gray-800">{totalVices}</p>
                        <p className="text-xs text-gray-500 mt-2">Palabras que empobrecen el ritmo</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-purple-700 flex items-center gap-2">
                                    <Zap size={16}/> Adverbios (-mente)
                                </h4>
                                <span className="bg-white px-2 py-1 rounded text-purple-800 font-bold text-sm shadow-sm">{menteWords.length}</span>
                            </div>
                            <p className="text-xs text-gray-500">Abuso de adverbios de modo. Intenta usar verbos más fuertes.</p>
                        </div>

                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-indigo-700 flex items-center gap-2">
                                    <Layers size={16}/> Sustantivos (-ción)
                                </h4>
                                <span className="bg-white px-2 py-1 rounded text-indigo-800 font-bold text-sm shadow-sm">{cionWords.length}</span>
                            </div>
                            <p className="text-xs text-gray-500">Nominalizaciones que hacen el texto estático y pesado.</p>
                        </div>
                    </div>
                </div>

                {/* Gráfico de Dispersión (Timeline) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-inner flex flex-col justify-center">
                    <h3 className="text-sm font-bold text-gray-500 uppercase mb-6 text-center">Mapa de Distribución en el Texto</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <XAxis type="number" dataKey="position" name="Posición" unit="%" domain={[0, 100]} hide />
                                <YAxis type="category" dataKey="type" name="Tipo" allowDuplicatedCategory={false} hide />
                                <ZAxis type="number" range={[100, 100]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg">
                                                <p className="font-bold">"{data.word}"</p>
                                                <p>Posición: {Math.round(data.position)}%</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                                <Legend verticalAlign="top" height={36}/>
                                <Scatter name="-mente" data={timelineData.filter(d => d.type === 'mente')} fill="#8b5cf6" shape="circle" />
                                <Scatter name="-ción" data={timelineData.filter(d => d.type === 'cion')} fill="#6366f1" shape="triangle" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-4 border-t border-gray-100 pt-2">
                        <span>Inicio del texto</span>
                        <span>Fin del texto</span>
                    </div>
                </div>
            </div>

            {/* Texto Resaltado */}
            <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Revisión en Contexto</h3>
                <div className="p-8 bg-gray-50 rounded-xl border border-gray-200 font-serif text-lg leading-relaxed text-gray-700 max-h-[500px] overflow-y-auto shadow-inner">
                    {renderHighlightedText()}
                </div>
            </div>
        </div>
    );
};

export default DetailMetrics;