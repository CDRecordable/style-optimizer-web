import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Clave desde secretos (Asegúrate de haberla configurado en la web de Supabase)
    const GEMINI_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_KEY) throw new Error('Falta GEMINI_API_KEY en secretos')

    const { prompt, feature } = await req.json()

    // 2. LLAMADA A GOOGLE USANDO GEMINI 2.0 (El que tienes disponible)
    // Usamos 'gemini-2.0-flash' que apareció en tu lista
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`
    
    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })

    const aiData = await aiResponse.json()

    // Si falla, devolvemos el error exacto para verlo en los logs
    if (aiData.error) throw new Error(`Google Error: ${aiData.error.message}`)

    const text = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    // 3. Guardar Log en Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (user) {
        // Intentamos guardar el log, pero si falla no rompemos la ejecución
        try {
            await supabaseClient.from('ai_usage').insert({
                user_id: user.id,
                feature_used: feature || 'unknown',
                model_used: 'gemini-2.0-flash'
            })
        } catch(e) {
            console.warn("Error guardando log:", e)
        }
    }

    return new Response(
      JSON.stringify({ result: text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})