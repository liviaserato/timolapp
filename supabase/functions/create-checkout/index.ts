import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    const {
      price,
      currency,
      customerEmail,
      franchiseTypeCode,
      franchiseId,
      installments,
      customerName,
      authUserId,
    } = await req.json();

    if (!price || !currency || !customerEmail || !franchiseTypeCode) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert price to smallest currency unit (cents/centavos)
    const amount = Math.round(price * 100);

    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: currency.toLowerCase(),
      metadata: {
        franchiseTypeCode,
        franchiseId: franchiseId || "",
        customerEmail,
        customerName: customerName || "",
        authUserId: authUserId || "",
      },
      receipt_email: customerEmail,
    };

    // Add installments for BRL payments
    if (currency.toLowerCase() === "brl" && installments && installments > 1) {
      paymentIntentParams.payment_method_options = {
        card: {
          installments: {
            enabled: true,
          },
        },
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to create payment intent" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
