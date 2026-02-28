import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const body = await req.json();
    const { mode } = body;

    if (!mode || !["insert", "update"].includes(mode)) {
      return new Response(
        JSON.stringify({ error: "Invalid mode. Use 'insert' or 'update'." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (mode === "insert") {
      const { user_id, full_name, email, document, sponsor_name, sponsor_id, phone, preferred_language, city, state, country, user_display_id, sponsor_source, gender } = body;

      if (!user_id || !email) {
        return new Response(
          JSON.stringify({ error: "user_id and email are required for insert." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabaseAdmin
        .from("registration_status")
        .insert({
          user_id,
          full_name: full_name || null,
          email,
          document: document || null,
          sponsor_name: sponsor_name || null,
          sponsor_id: sponsor_id || null,
          phone: phone || null,
          preferred_language: preferred_language || 'pt',
          city: city || null,
          state: state || null,
          country: country || null,
          user_display_id: user_display_id || null,
          sponsor_source: sponsor_source || null,
          gender: gender || null,
        });

      if (error) {
        console.error("Insert error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to insert registration status." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (mode === "update") {
      const { user_id, fields } = body;

      if (!user_id || !fields || typeof fields !== "object") {
        return new Response(
          JSON.stringify({ error: "user_id and fields are required for update." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Only allow specific fields to be updated
      const allowedFields = ["franchise_selected", "payment_completed", "status"];
      const sanitized: Record<string, unknown> = {};
      for (const key of allowedFields) {
        if (key in fields) {
          sanitized[key] = fields[key];
        }
      }

      if (Object.keys(sanitized).length === 0) {
        return new Response(
          JSON.stringify({ error: "No valid fields to update." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabaseAdmin
        .from("registration_status")
        .update(sanitized)
        .eq("user_id", user_id);

      if (error) {
        console.error("Update error:", error);
        return new Response(
          JSON.stringify({ error: "Failed to update registration status." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
