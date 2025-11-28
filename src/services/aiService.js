import { supabase } from '../lib/supabaseClient';
import {
  PROMPT_ARCHAISMS,
  PROMPT_SHOW_DONT_TELL,
  PROMPT_REPETITIONS_NEARBY 
} from './aiPrompts';

/**
 * Helper para limpiar la respuesta de la IA.
 * Busca el primer '[' y el último ']' para extraer solo el JSON válido.
 */
function cleanJSONResponse(response) {
  if (typeof response !== 'string') return JSON.stringify(response);
  
  // 1. Elimina bloques de código Markdown si existen
  let cleaned = response.replace(/```json\s*|```/g, '').trim();
  
  // 2. Búsqueda robusta del Array JSON
  // Buscamos el primer corchete de apertura
  const firstBracket = cleaned.indexOf('[');
  // Buscamos el ÚLTIMO corchete de cierre (para ignorar texto posterior)
  const lastBracket = cleaned.lastIndexOf(']');
  
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }
  
  return cleaned;
}

export const callAI = async (provider, userApiKey, prompt, model, featureContext) => {
    try {
        const { data, error } = await supabase.functions.invoke('ai-editor', {
            body: { 
                prompt: prompt,
                feature: featureContext || 'unknown_feature'
            }
        });

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

        if (data && data.error) {
            throw new Error(data.error);
        }

        return data.result;

    } catch (err) {
        console.error("💥 AI Service:", err);
        throw err; 
    }
};

// ==========================================
// FUNCIONES DE ANÁLISIS (EXPORTADAS)
// ==========================================

export async function analyzeArchaisms(text) {
    if (!text || text.length < 50) return { error: 'Texto muy corto.' };
    
    try {
        const prompt = typeof PROMPT_ARCHAISMS === 'function' ? PROMPT_ARCHAISMS(text) : PROMPT_ARCHAISMS; 
        const response = await callAI(null, null, prompt, null, 'archaisms');
        const jsonString = cleanJSONResponse(response);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Fallo análisis arcaísmos:', error);
        return { error: 'Error al analizar arcaísmos.' };
    }
}

export async function analyzeShowDontTell(text) {
    if (!text || text.length < 50) return { error: 'Texto muy corto.' };

    try {
        const prompt = typeof PROMPT_SHOW_DONT_TELL === 'function' ? PROMPT_SHOW_DONT_TELL(text) : PROMPT_SHOW_DONT_TELL;
        const response = await callAI(null, null, prompt, null, 'show_dont_tell');
        const jsonString = cleanJSONResponse(response);
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Fallo análisis Show Dont Tell:', error);
        return { error: 'Error al analizar Show Don\'t Tell.' };
    }
}

export async function analyzeRepetitionsNearby(text) {
    if (!text || text.length < 50) {
      return { error: 'El texto es muy corto para el análisis IA (mínimo 50 caracteres).' };
    }
  
    try {
      const prompt = PROMPT_REPETITIONS_NEARBY(text);
      const response = await callAI(null, null, prompt, null, 'repetitions_nearby');
      
      // Limpieza y Parseo
      const jsonString = cleanJSONResponse(response);
      
      try {
          const analysis = JSON.parse(jsonString);
          return analysis; 
      } catch (parseError) {
          console.error("Error parseando JSON de la IA:", jsonString);
          return { error: 'La IA devolvió un formato inválido. Inténtalo de nuevo.' };
      }
  
    } catch (error) {
      console.error('AI Repetitions Nearby analysis failed:', error);
      return { error: 'Fallo al procesar el análisis de repeticiones.' }; 
    }
}