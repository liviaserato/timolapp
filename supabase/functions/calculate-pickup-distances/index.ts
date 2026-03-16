import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Hardcoded pickup units with coordinates — replace with DB/API later
const PICKUP_UNITS = [
  { id: "salvador", name: "Unidade Salvador", lat: -12.9714, lng: -38.5124 },
  { id: "sao-paulo", name: "Unidade São Paulo", lat: -23.5505, lng: -46.6333 },
  { id: "uberlandia", name: "Unidade Uberlândia", lat: -18.9186, lng: -48.2772 },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cep } = await req.json();
    const cleanCep = (cep || "").replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      return new Response(JSON.stringify({ error: "CEP inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. ViaCEP to get address info
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const viaCepData = await viaCepRes.json();
    if (viaCepData.erro) {
      return new Response(JSON.stringify({ error: "CEP não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Google Geocoding to get coordinates from the address
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!GOOGLE_MAPS_API_KEY) {
      return new Response(JSON.stringify({ error: "Google Maps API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const address = `${viaCepData.logradouro || ""}, ${viaCepData.bairro || ""}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`;
    const geoRes = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      // Fallback: try with city + state only
      const fallbackRes = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(`${viaCepData.localidade}, ${viaCepData.uf}, Brasil`)}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const fallbackData = await fallbackRes.json();
      if (!fallbackData.results || fallbackData.results.length === 0) {
        return new Response(JSON.stringify({ error: "Não foi possível localizar o endereço" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      geoData.results = fallbackData.results;
    }

    const { lat, lng } = geoData.results[0].geometry.location;

    // 3. Calculate distances to each pickup unit
    const units = PICKUP_UNITS.map((unit) => {
      const distKm = haversineKm(lat, lng, unit.lat, unit.lng);
      return {
        id: unit.id,
        name: unit.name,
        distanceKm: Math.round(distKm),
      };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    return new Response(JSON.stringify({ units, customerCity: viaCepData.localidade }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error calculating distances:", err);
    return new Response(JSON.stringify({ error: "Erro interno ao calcular distâncias" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
