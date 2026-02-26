import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const username = url.searchParams.get("username");

    if (!username || typeof username !== "string" || !username.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid username" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiUrl = `https://www.timolweb.com.br/api/people/username-check?username=${encodeURIComponent(username.trim())}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; TimolApp/1.0)",
        "Origin": "https://timolsystem.com.br",
        "Referer": "https://timolsystem.com.br/",
      },
    });

    if (!apiRes.ok) {
      console.error("Timol username-check error:", apiRes.status);
      return new Response(
        JSON.stringify({ error: "upstream_error", status: apiRes.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await apiRes.json();
    console.log("Timol username-check response:", JSON.stringify(data));

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Username check error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
