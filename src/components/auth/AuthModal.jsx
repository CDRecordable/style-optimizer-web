import React, { useState } from 'react';
import { X, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useUserContext } from '../../context/UserContext';

export default function AuthModal({ onClose }) {
    const { loginWithEmail, signUpWithEmail } = useUserContext();
    const [isLogin, setIsLogin] = useState(true); // Toggle entre Login y Registro
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isLogin) {
                await loginWithEmail(email, password);
                onClose(); // Cerrar modal si entra bien
            } else {
                await signUpWithEmail(email, password);
                setMessage("¡Cuenta creada! Revisa tu email para confirmar.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-indigo-100 relative">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={20}/>
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
                    </h2>
                    <p className="text-sm text-slate-500 mb-6">
                        {isLogin ? 'Accede para guardar tus análisis.' : 'Empieza a optimizar tus textos hoy.'}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
                                <input 
                                    type="password" 
                                    required
                                    minLength={6}
                                    className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && <div className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</div>}
                        {message && <div className="text-xs text-green-600 bg-green-50 p-2 rounded">{message}</div>}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading && <Loader2 size={18} className="animate-spin"/>}
                            {isLogin ? 'Entrar' : 'Registrarse'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-500">
                        {isLogin ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
                        <button 
                            onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }}
                            className="text-indigo-600 font-bold hover:underline"
                        >
                            {isLogin ? 'Regístrate' : 'Inicia Sesión'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}