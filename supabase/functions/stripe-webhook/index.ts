// Usamos versiones específicas probadas para Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import Stripe from "https://esm.sh/stripe@13.10.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature || !endpointSecret) {
    return new Response('Error: Falta firma', { status: 400 })
  }

  try {
    const body = await req.text()
    let event;
    
    try {
        event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret)
    } catch (err) {
        console.error(`⚠️ Error validando firma webhook: ${err.message}`)
        return new Response(`Webhook Signature Error: ${err.message}`, { status: 400 })
    }

    console.log(`🔔 Evento recibido: ${event.type}`)

    // Usamos SERVICE_ROLE_KEY para tener permisos de escritura
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const customerId = session.customer
      const userEmail = session.customer_details?.email

      console.log(`💰 Pago completado para cliente: ${customerId} (${userEmail})`)
      
      // Intentamos actualizar por ID de Stripe primero
      let { error } = await supabase
        .from('profiles')
        .update({ 
            is_premium: true, 
            subscription_status: 'active',
            stripe_customer_id: customerId 
        })
        .eq('stripe_customer_id', customerId)

      // Si no encontró al usuario por ID de Stripe (puede pasar en la primera compra),
      // lo buscamos por email y guardamos el ID.
      if (error || (await supabase.from('profiles').select('id').eq('stripe_customer_id', customerId)).data?.length === 0) {
         console.log(`⚠️ No encontrado por ID Stripe, buscando por email: ${userEmail}`)
         const updateByEmail = await supabase
            .from('profiles')
            .update({ 
                is_premium: true, 
                subscription_status: 'active', 
                stripe_customer_id: customerId 
            })
            .eq('email', userEmail)
         
         if (updateByEmail.error) console.error("❌ Error final actualizando perfil:", updateByEmail.error)
         else console.log("✅ Perfil actualizado por email.")
      } else {
          console.log("✅ Perfil actualizado por ID Stripe.")
      }
    } 
    
    else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object
      await supabase
        .from('profiles')
        .update({ is_premium: false, subscription_status: 'canceled' })
        .eq('stripe_customer_id', subscription.customer)
      console.log(`❌ Suscripción cancelada para ${subscription.customer}`)
    }

    return new Response(JSON.stringify({ received: true }), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
    })

  } catch (err) {
    console.error(`🔥 Error Webhook: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})