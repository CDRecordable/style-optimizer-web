import { supabase } from '../lib/supabaseClient';

export const callAI = async (provider, userApiKey, prompt, model, featureContext) => {
    try {
        // Llamamos a la función enviando también el 'feature' para los logs
        const { data, error } = await supabase.functions.invoke('ai-editor', {
            body: { 
                prompt: prompt,
                feature: featureContext || 'unknown_feature' // <--- ESTO ES LO IMPORTANTE
            }
        });

        // Manejo de errores de red/servidor
        if (error) {
            try {
                const errorBody = await error.context.json(); 
                if (errorBody && errorBody.error) {
                    throw new Error(errorBody.error);
                }
            } catch (e) {
                // Si no hay JSON de error, seguimos
            }
            console.error("❌ Error Raw Supabase:", error);
            throw new Error(`Error del servidor: ${error.message || "Desconocido"}`);
        }

        // Manejo de errores lógicos de la función
        if (data && data.error) {
            throw new Error(data.error);
        }

        return data.result;

    } catch (err) {
        console.error("💥 AI Service:", err);
        throw err; 
    }
};