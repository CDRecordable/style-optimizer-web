import React from 'react';
import { 
    Activity, Mic2, Zap, Eye, ArrowRight, CheckCircle2, 
    MousePointerClick, Layers, ShieldCheck, ArrowLeft 
} from 'lucide-react';

export default function DemoShowcase({ onBack, onRegister }) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* NAV DE REGRESO */}
            <div className="mb-8">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition font-medium">
                    <ArrowLeft size={20} /> Volver al Editor
                </button>
            </div>

            {/* HERO SECTION */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    Escribe como los <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Profesionales</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                    No es solo un corrector ortográfico. Es un analista de estilo, ritmo y narrativa potenciado por Inteligencia Artificial.
                </p>
                <div className="flex justify-center gap-4">
                    <button 
                        onClick={onRegister}
                        className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        Crear Cuenta Gratis <ArrowRight size={20}/>
                    </button>
                </div>
            </div>

            {/* GRID DE CARACTERÍSTICAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <FeatureCard 
                    icon={<Activity className="text-blue-500"/>}
                    title="Sismógrafo de Ritmo"
                    desc="Visualiza la longitud de tus frases. Detecta 'muros de texto' y monotonía al instante."
                />
                <FeatureCard 
                    icon={<Mic2 className="text-indigo-500"/>}
                    title="Escáner Prosódico"
                    desc="Analiza la musicalidad. Detecta rimas internas no deseadas y cacofonías."
                />
                <FeatureCard 
                    icon={<Eye className="text-green-500"/>}
                    title="Show, Don't Tell"
                    desc="Encuentra filtros mentales ('vio', 'sintió') y conviértelos en experiencias inmersivas."
                />
                <FeatureCard 
                    icon={<Zap className="text-yellow-500"/>}
                    title="Potenciador IA"
                    desc="Reescribe frases débiles con un clic usando nuestros modelos de IA ajustados."
                />
                <FeatureCard 
                    icon={<Layers className="text-purple-500"/>}
                    title="Comparador de Versiones"
                    desc="Mide científicamente cuánto ha mejorado tu texto tras la edición."
                />
                <FeatureCard 
                    icon={<ShieldCheck className="text-teal-500"/>}
                    title="Análisis de Estilo"
                    desc="Detecta abusos de adverbios (-mente), pasivas y palabras baúl."
                />
            </div>

            {/* EJEMPLO VISUAL (MOCKUP) */}
            <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white mb-20 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <div className="inline-block bg-indigo-500 text-xs font-bold px-3 py-1 rounded-full mb-4">
                            ANTES VS DESPUÉS
                        </div>
                        <h3 className="text-3xl font-bold mb-4">La diferencia es matemática</h3>
                        <p className="text-indigo-200 mb-6 text-lg">
                            Pasa de un texto plano y confuso a una prosa brillante y rítmica. Nuestra herramienta te guía paso a paso.
                        </p>
                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400"/> <span>Elimina redundancias</span></li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400"/> <span>Mejora la legibilidad</span></li>
                            <li className="flex items-center gap-3"><CheckCircle2 className="text-green-400"/> <span>Enriquece el vocabulario</span></li>
                        </ul>
                        <button 
                            onClick={onRegister}
                            className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition flex items-center gap-2"
                        >
                            <MousePointerClick size={20}/> Pruébalo tú mismo
                        </button>
                    </div>
                    
                    {/* Mockup Visual */}
                    <div className="flex-1 w-full bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="space-y-4">
                            <div className="bg-red-500/20 p-4 rounded-lg border-l-4 border-red-500">
                                <p className="text-xs text-red-300 font-bold uppercase mb-1">Original</p>
                                <p className="text-red-100 italic text-sm">"El hombre caminó lentamente hacia la casa que era muy grande."</p>
                            </div>
                            <div className="flex justify-center">
                                <ArrowDown className="text-white/50 animate-bounce"/>
                            </div>
                            <div className="bg-green-500/20 p-4 rounded-lg border-l-4 border-green-500">
                                <p className="text-xs text-green-300 font-bold uppercase mb-1">Optimizado (IA)</p>
                                <p className="text-green-100 font-serif text-lg">"El hombre se arrastró hacia la mansión."</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Decoración fondo */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
            </div>

            {/* CTA FINAL */}
            <div className="text-center py-12 border-t border-slate-200">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">¿Listo para mejorar tu escritura?</h2>
                <p className="text-slate-600 mb-8">Únete a cientos de escritores que ya usan Style Optimizer.</p>
                <button 
                    onClick={onRegister}
                    className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:bg-slate-800 transition-all"
                >
                    Comenzar Gratis
                </button>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}