import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Verificar cabecera
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Falta cabecera Authorization')

    console.log(`🔐 Auth Header recibido (Inicio): ${authHeader.substring(0, 20)}...`)

    // 2. Inicializar Supabase (Cliente Usuario)
    // Esta configuración evita que la librería intente usar localStorage/cookies
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { headers: { Authorization: authHeader } },
        auth: {
            persistSession: false,      // No guardar sesión en memoria
            autoRefreshToken: false,    // No intentar refrescar (el token viene del front)
            detectSessionInUrl: false   // No buscar en URL
        }
      }
    )

    // 3. Verificar Usuario
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
        console.error("❌ Error Auth:", JSON.stringify(userError))
        // Si falla, es probable que el token haya caducado.
        // Devolvemos 401 para que el frontend sepa que debe pedir login de nuevo.
        throw new Error("Tu sesión ha caducado. Por favor, sal y vuelve a entrar.")
    }

    console.log(`✅ Usuario validado: ${user.email} (${user.id})`)

    // 4. Inicializar Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const { action, priceId, returnUrl } = await req.json()

    // 5. Buscar perfil en DB (Usamos Service Role si es necesario, pero primero intentamos normal)
    // Para asegurar lectura fiable de stripe_customer_id, usamos un cliente ADMIN temporal
    // Esto evita problemas si las RLS de 'profiles' son muy estrictas.
    const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
    )

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // 6. Crear cliente Stripe si no existe
    if (!customerId) {
      console.log("🆕 Creando cliente en Stripe...")
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_uid: user.id },
      })
      customerId = customer.id
      
      await supabaseAdmin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    let url;

    // ACCIÓN: SUSCRIBIRSE
    if (action === 'subscribe') {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: returnUrl,
        allow_promotion_codes: true,
      })
      url = session.url
    } 
    // ACCIÓN: GESTIONAR
    else if (action === 'manage') {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      })
      url = session.url
    }

    return new Response(
      JSON.stringify({ url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("🔥 Payment Error:", error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})