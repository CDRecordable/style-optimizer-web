import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext();

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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
                fetchProfile(session.user.id); // <--- CARGAR PERFIL AL ENTRAR
            } else {
                setIsPremium(false); // RESET AL SALIR
            }
            
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Funciones de Auth
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
            debugSetPremium 
        }}>
            {!loading && children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);