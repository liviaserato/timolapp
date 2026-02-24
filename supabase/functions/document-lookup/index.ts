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

    // TODO: Replace this with the actual Timol API endpoint when provided
    // Expected API: GET https://www.timolweb.com.br/api/???
    // Parameters: document (CPF or passport number), foreigner flag, country
    // Expected response: array of records with { id, nome, pais_cod_iso, patrocinador_id, ... }
    //
    // For now, return empty records (no existing registration found)
    // This allows the flow to work end-to-end while waiting for the actual API path

    const records: Array<{
      id: string;
      name: string;
      country: string;
      countryIso2: string;
      sponsorId: string;
    }> = [];

    // Placeholder: when API is integrated, map the response like this:
    // const apiResponse = await fetch(`https://www.timolweb.com.br/api/PATH?param=${document}`);
    // const apiData = await apiResponse.json();
    // records = apiData.map(r => ({
    //   id: r.id_franquia || r.id,
    //   name: r.nome,
    //   country: r.pais,
    //   countryIso2: r.pais_cod_iso,
    //   sponsorId: r.patrocinador_id,
    // }));

    return new Response(
      JSON.stringify({ records }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
