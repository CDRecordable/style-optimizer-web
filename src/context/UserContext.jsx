import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// CORRECCIÓN: Añadido 'export' aquí para que DetailRepetitions pueda importarlo
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [isPremium, setIsPremium] = useState(false); // Lo conectaremos a la DB en la FASE 2
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Función auxiliar para cargar el perfil real
        const fetchProfile = async (userId) => {
            if (!userId) return;
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_premium')
                    .eq('id', userId)
                    .single();
                
                if (data) setIsPremium(data.is_premium);
            } catch (err) {
                console.error("Error cargando perfil:", err);
            }
        };

        // 1. Carga inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id); // <--- CARGAR PERFIL
            setLoading(false);
        });

        // 2. Escuchar cambios
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) fetchProfile(session.user.id);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // --- FUNCIÓN DE GESTIÓN DE PAGO (NUEVA) ---
    const handleManageSubscription = async () => {
        if (!user) {
            console.error("El usuario debe estar logueado para gestionar la suscripción.");
            alert("Por favor, inicia sesión para actualizar tu plan.");
            return;
        }

        // 1. Determinar la acción (El modal de pago siempre debe ir al portal de gestión)
        const action = isPremium ? 'manage' : 'subscribe'; 
        
        // 2. Definir la URL de retorno después del proceso de Stripe
        const returnUrl = window.location.origin; // Vuelve a la raíz de la app

        try {
            // Llama a la Edge Function de Supabase enviando acción, URL y ID
            const { data, error } = await supabase.functions.invoke('payment-actions', {
                body: { 
                    user_id: user.id,
                    action: action,          // <--- PARÁMETRO CLAVE AÑADIDO
                    priceId: 'price_1SY524JYWqabtZzcyEH0U53F', // <--- DEBES REEMPLAZAR ESTO
                    returnUrl: returnUrl     // <--- PARÁMETRO CLAVE AÑADIDO
                },
            });
            
            if (error) {
                console.error("Error al invocar Edge Function:", error);
                throw new Error("Fallo en la pasarela de pago.");
            }
            
            // Redirección inmediata a Stripe
            if (data && data.url) {
                window.location.href = data.url;
            } else {
                throw new Error("No se recibió URL de redirección.");
            }

        } catch (error) {
            console.error("Error Stripe/Suscripción:", error);
            alert("No se pudo conectar con la pasarela de pago. Inténtalo de nuevo.");
        }
    };

    const loginWithEmail = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
    };

    const signUpWithEmail = async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
    };

    const logout = async () => {
        try {
            // 1. Intentar cerrar sesión en el servidor
            await supabase.auth.signOut();
        } catch (error) {
            console.warn("Error al cerrar sesión (posiblemente ya cerrada):", error);
        } finally {
            // 2. LIMPIEZA AGRESIVA LOCAL
            
            // Borrar todas las claves de localStorage que sean de Supabase
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-')) {
                    localStorage.removeItem(key);
                }
            });

            // Limpiar estados de React
            setUser(null);
            setSession(null);
            setIsPremium(false);
            
            // 3. Recarga forzada a la raíz
            window.location.href = "/";
        }
    };
    
    // Simulación temporal para probar el botón premium mientras no hay pagos
    const debugSetPremium = () => setIsPremium(true);

    return (
        <UserContext.Provider value={{ 
            user, 
            session, 
            isPremium, 
            loading, 
            loginWithEmail, 
            signUpWithEmail, 
            logout,
            debugSetPremium,
            handleManageSubscription // <--- EXPUESTA PARA EL MODAL
        }}>
            {!loading && children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);