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
    const document = url.searchParams.get("document");
    const foreigner = url.searchParams.get("foreigner") === "true";
    const countryIso2 = url.searchParams.get("countryIso2") || "BR";

    if (!document) {
      return new Response(
        JSON.stringify({ error: "Missing document parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean document (digits only for CPF)
    const cleanDoc = foreigner ? document.trim() : document.replace(/\D/g, "");

    const apiUrl = `https://www.timolweb.com.br/gateway/cliente/buscacpf?cpf_cnpj=${encodeURIComponent(cleanDoc)}`;
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
      // API error — return empty so user can proceed
      return new Response(
        JSON.stringify({ records: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiData = await apiRes.json();
    console.log("Timol buscacpf response:", JSON.stringify(apiData));

    // Map API response to our record format
    // The API may return an array or a single object — normalize
    const rawRecords = Array.isArray(apiData) ? apiData : (apiData ? [apiData] : []);

    const records = rawRecords
      .filter((r: Record<string, unknown>) => r && (r.id || r.id_franquia))
      .map((r: Record<string, unknown>) => ({
        id: String(r.id_franquia || r.id || ""),
        name: String(r.nome || r.name || ""),
        country: String(r.pais || r.country || ""),
        countryIso2: String(r.pais_cod_iso || r.countryIso2 || countryIso2),
        sponsorId: String(r.patrocinador_id || r.sponsor_id || ""),
      }));

    return new Response(
      JSON.stringify({ records }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Document lookup error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
