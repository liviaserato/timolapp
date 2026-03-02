import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { method, email, document, country, birth_date } = await req.json();

    if (!method || !birth_date) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_input" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query = supabase
      .from("profiles")
      .select("username, email, full_name, user_id")
      .eq("birth_date", birth_date);

    if (method === "email") {
      if (!email) {
        return new Response(
          JSON.stringify({ success: false, error: "email_required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      query = query.ilike("email", email.trim().toLowerCase());
    } else if (method === "document") {
      if (!document) {
        return new Response(
          JSON.stringify({ success: false, error: "document_required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      const rawDoc = document.replace(/[^\dA-Za-z]/g, "");
      query = query.eq("document", rawDoc);
      if (country) {
        query = query.eq("country", country);
      }
    } else {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_method" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const { data: profile } = await query.limit(1).single();

    if (!profile || !profile.username) {
      return new Response(
        JSON.stringify({ success: false, error: "not_found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        username: profile.username,
        full_name: profile.full_name,
        user_id: profile.user_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[forgot-username] Error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "server_error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
