import React, { useState } from 'react';
import { X, CheckCircle2, Zap, Crown, Loader2, LogIn } from 'lucide-react';
import { useUserContext } from '../../context/UserContext';
import { supabase } from '../../lib/supabaseClient';
import AuthModal from '../auth/AuthModal';

export default function PaywallModal({ onClose, featureName }) {
    const { user } = useUserContext();
    const [loading, setLoading] = useState(false);
    const [showAuth, setShowAuth] = useState(false);

    const handleAction = async () => {
        // 1. SI NO HAY USUARIO -> ABRIR LOGIN
        if (!user) {
            setShowAuth(true);
            return;
        }

        // 2. SI HAY USUARIO -> INICIAR PAGO
        setLoading(true);
        try {
            console.log("Iniciando pago con función..."); // <--- BUSCA ESTE LOG
            
            const { data, error } = await supabase.functions.invoke('payment-actions', {
                body: { 
                    action: 'subscribe',
                    priceId: 'price_1SY524JYWqabtZzcyEH0U53F', 
                    returnUrl: window.location.origin 
                }
            });

            if (error) throw error;

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No se recibió URL de pago");
            }

        } catch (err) {
            console.error("Error pago:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={onClose}
        >
            
            {/* MODAL PRINCIPAL */}
            {!showAuth && (
                <div 
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-200 border border-indigo-100" 
                    onClick={(e) => e.stopPropagation()}
                >
                    
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition z-20"
                    >
                        <X size={20} />
                    </button>

                    {/* Header Degradado */}
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-inner relative z-10">
                            <Crown size={32} className="text-yellow-300 drop-shadow-sm" />
                        </div>
                        <h2 className="text-3xl font-extrabold tracking-tight mb-1 relative z-10">Plan PRO</h2>
                        <p className="text-indigo-100 text-sm font-medium relative z-10">Desbloquea {featureName || "todo el potencial"}</p>
                    </div>

                    <div className="p-8 pb-6">
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3 text-gray-700"><div className="p-1 bg-green-100 rounded-full mt-0.5"><CheckCircle2 className="text-green-600" size={16}/></div><div><span className="font-bold text-gray-900">Detector de Arcaísmos</span><p className="text-xs text-gray-500">Escáner inteligente de vocabulario.</p></div></div>
                            <div className="flex items-start gap-3 text-gray-700"><div className="p-1 bg-green-100 rounded-full mt-0.5"><CheckCircle2 className="text-green-600" size={16}/></div><div><span className="font-bold text-gray-900">Show vs Tell con IA</span><p className="text-xs text-gray-500">Transforma descripciones planas.</p></div></div>
                            <div className="flex items-start gap-3 text-gray-700"><div className="p-1 bg-green-100 rounded-full mt-0.5"><CheckCircle2 className="text-green-600" size={16}/></div><div><span className="font-bold text-gray-900">Editor de Estilo (3 Tonos)</span><p className="text-xs text-gray-500">Reescritura adaptativa.</p></div></div>
                            <div className="flex items-start gap-3 text-gray-700"><div className="p-1 bg-green-100 rounded-full mt-0.5"><CheckCircle2 className="text-green-600" size={16}/></div><span className="text-sm mt-0.5">Correcciones ilimitadas.</span></div>
                        </div>

                        <button 
                            onClick={handleAction}
                            disabled={loading}
                            className={`w-full py-4 text-white rounded-xl font-bold text-lg shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group relative overflow-hidden mb-4 disabled:opacity-70 disabled:cursor-not-allowed ${user ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-slate-800 hover:bg-slate-700 shadow-slate-300'}`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : user ? (
                                <>
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <Zap className="fill-yellow-400 text-yellow-400 group-hover:animate-pulse relative z-10" size={20}/>
                                    <span className="relative z-10">Desbloquear por <span className="text-yellow-200">2,90€</span>/mes</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} /> Inicia sesión para suscribirte
                                </>
                            )}
                        </button>
                        
                        <button onClick={onClose} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition hover:underline">
                            No gracias, seguiré con el plan gratuito
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL DE LOGIN SI ES NECESARIO */}
            {showAuth && (
                <div onClick={(e) => e.stopPropagation()}>
                    <AuthModal onClose={() => setShowAuth(false)} />
                </div>
            )}
        </div>
    );
}