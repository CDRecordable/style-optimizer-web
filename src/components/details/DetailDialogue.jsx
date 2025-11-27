import React, { useState } from 'react';
import { MessageSquare, ArrowLeft, Quote, Activity, ChevronLeft, ChevronRight, Tag, Sparkles, Info } from 'lucide-react';
import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomBarTooltip } from '../common/StyleComponents';
import AIEnhancerButton from '../common/AIEnhancerButton';

export default function DetailDialogue({ analysis, onBack }) {
    // Leemos datos con seguridad
    const stats = analysis.dialogueStats || {};
    const blocks = stats.blocks || [];
    const tagDensity = stats.tagDensity || 0;
    const lexicalRichness = stats.lexicalRichness || 0;
    const dialogueRatio = stats.dialogueRatio || analysis.dialogueRatio || 0;

    const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

    const hasDialogue = blocks.length > 0;
    const currentBlock = hasDialogue ? blocks[currentBlockIndex] : null;

    const rhythmData = blocks.map((b, i) => ({
        id: i + 1,
        len: b.wordCount,
        type: b.isMonologue ? 'Monólogo' : (b.isPingPong ? 'Ping-Pong' : 'Normal')
    }));

    const getBarColor = (entry) => {
        if (entry.type === 'Monólogo') return '#f87171'; 
        if (entry.type === 'Ping-Pong') return '#4ade80'; 
        return '#60a5fa'; 
    };

    const renderText = () => {
        const paragraphs = analysis.rawText.split(/\n+/);
        return paragraphs.map((para, pIdx) => {
            if (!para.trim()) return null;
            const isDialogue = /^[—–\-―«"“]/.test(para.trim());
            return isDialogue ? (
                <p key={pIdx} className="mb-4 p-4 rounded-r-xl bg-blue-50 border-l-4 border-blue-400 text-blue-900 font-medium shadow-sm">{para}</p>
            ) : (
                <p key={pIdx} className="mb-4 opacity-60 text-sm text-gray-600">{para}</p>
            );
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-8 min-h-[500px] animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <MessageSquare className="text-blue-500" /> Radiografía de Diálogo
                </h2>
                <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
                    <ArrowLeft size={20} /> Volver
                </button>
            </div>

            {hasDialogue ? (
                <>
                    {/* KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Peso */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-1">Peso Narrativo</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-800">{dialogueRatio}%</span>
                                <span className="text-xs text-slate-400">es diálogo</span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                <div className="h-full bg-blue-500" style={{width: `${dialogueRatio}%`}}></div>
                            </div>
                        </div>

                        {/* Acotaciones */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Tag size={12}/> Acotaciones</div>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-2xl font-bold ${tagDensity > 5 ? 'text-orange-500' : 'text-green-500'}`}>{tagDensity}%</span>
                                <span className="text-xs text-slate-400">densidad</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                                {tagDensity > 5 ? "⚠️ Abuso de 'dijo', 'preguntó'. Intenta usar acciones." : "✅ Buen equilibrio."}
                            </p>
                        </div>

                        {/* Voces Únicas */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 group relative">
                            <div className="text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                <Sparkles size={12}/> Riqueza Léxica
                                <Info size={10} className="text-slate-400 cursor-help"/>
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg hidden group-hover:block z-10">
                                Mide si los personajes usan vocabulario variado. Si es bajo, todos suenan igual.
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-purple-600">{lexicalRichness}%</span>
                                <span className="text-xs text-slate-400">palabras únicas</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                                {lexicalRichness < 30 ? "⚠️ Vocabulario repetitivo." : "✅ Voces ricas y distintas."}
                            </p>
                        </div>
                    </div>

                    {/* GRÁFICO */}
                    <div className="mb-8 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Activity size={14}/> Ritmo de Intervenciones
                        </h3>
                        <div className="h-32 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={rhythmData} barCategoryGap={2}>
                                    <Tooltip content={<CustomBarTooltip unit="palabras" labelPrefix="Turno" />} cursor={{fill: '#f1f5f9'}} />
                                    <Bar dataKey="len" radius={[2, 2, 0, 0]}>
                                        {rhythmData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CONSOLA */}
                    <div className="bg-blue-50 rounded-xl border border-blue-100 shadow-sm overflow-hidden mb-8">
                        <div className="bg-blue-100/50 px-4 py-2 flex justify-between items-center border-b border-blue-200">
                            <span className="text-xs font-bold text-blue-800 uppercase flex items-center gap-2">
                                <Quote size={14}/> Turno de Diálogo {currentBlockIndex + 1} de {blocks.length}
                            </span>
                            <div className="flex gap-1">
                                <button onClick={() => setCurrentBlockIndex(p => Math.max(0, p - 1))} disabled={currentBlockIndex === 0} className="p-1 hover:bg-white rounded disabled:opacity-50 text-blue-600"><ChevronLeft size={18}/></button>
                                <button onClick={() => setCurrentBlockIndex(p => Math.min(blocks.length - 1, p + 1))} disabled={currentBlockIndex === blocks.length - 1} className="p-1 hover:bg-white rounded disabled:opacity-50 text-blue-600"><ChevronRight size={18}/></button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-2 mb-3">
                                {currentBlock.isMonologue && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded font-bold uppercase border border-red-200">Posible Monólogo</span>}
                                {currentBlock.tagCount > 0 && <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold uppercase border border-orange-200">{currentBlock.tagCount} Acotaciones</span>}
                                {currentBlock.isPingPong && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded font-bold uppercase border border-green-200">Ritmo Ágil</span>}
                            </div>

                            <p className="text-gray-700 font-serif text-lg leading-relaxed mb-6 bg-white p-4 rounded-lg border border-blue-100 shadow-inner italic">
                                "{currentBlock.text}"
                            </p>
                            
                            <AIEnhancerButton 
                                key={currentBlockIndex}
                                componentId="detail-dialogue"
                                textToAnalyze={currentBlock.text}
                                contextLabel="Humanizar Diálogo"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 mb-8">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4"/>
                    <p className="text-gray-500 font-medium">No se han detectado diálogos.</p>
                </div>
            )}

            <div className="prose max-w-none font-serif text-lg leading-relaxed text-gray-700 opacity-90">
                {renderText()}
            </div>
        </div>
    );
}