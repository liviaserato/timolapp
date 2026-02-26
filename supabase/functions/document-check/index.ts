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
    let document: string | null = null;
    let issuerCountryIso2: string | null = null;

    if (req.method === "POST") {
      const body = await req.json();
      document = body.document;
      issuerCountryIso2 = body.issuerCountryIso2;
    } else {
      const url = new URL(req.url);
      document = url.searchParams.get("document");
      issuerCountryIso2 = url.searchParams.get("issuerCountryIso2");
    }

    if (!document || typeof document !== "string" || !document.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid document" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!issuerCountryIso2 || typeof issuerCountryIso2 !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid issuerCountryIso2" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiUrl = `https://www.timolweb.com.br/api/people/document-check?document=${encodeURIComponent(document.trim())}&issuerCountryIso2=${encodeURIComponent(issuerCountryIso2.trim())}`;
    const apiRes = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; TimolApp/1.0)",
        "Origin": "https://timolsystem.com.br",
        "Referer": "https://timolsystem.com.br/",
      },
    });

    if (apiRes.status === 400) {
      const errorData = await apiRes.text();
      console.error("Timol document-check 400:", errorData);
      return new Response(
        JSON.stringify({ error: "invalid_request", detail: errorData }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!apiRes.ok) {
      console.error("Timol document-check error:", apiRes.status);
      return new Response(
        JSON.stringify({ error: "upstream_error", status: apiRes.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await apiRes.json();
    console.log("Timol document-check response:", JSON.stringify(data));

    return new Response(
      JSON.stringify(data),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Document check error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
