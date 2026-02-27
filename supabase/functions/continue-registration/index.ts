import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Token is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Look up registration by continue_token
    const { data: reg, error: regError } = await supabase
      .from("registration_status")
      .select("*")
      .eq("continue_token", token)
      .single();

    if (regError || !reg) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If already completed, still return data but flag it
    if (reg.franchise_selected && reg.payment_completed) {
      return new Response(
        JSON.stringify({ completed: true, message: "Registration already completed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch profile data for full user info
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", reg.user_id)
      .single();

    // Build wizard data from profile + registration status
    const wizardData = {
      // From profile
      fullName: profile?.full_name || reg.full_name,
      email: profile?.email || reg.email,
      document: profile?.document || reg.document,
      phone: profile?.phone || "",
      birthDate: profile?.birth_date || "",
      gender: profile?.gender || "",
      country: profile?.country || "",
      zipCode: profile?.zip_code || "",
      street: profile?.street || "",
      number: profile?.number || "",
      complement: profile?.complement || "",
      neighborhood: profile?.neighborhood || "",
      city: profile?.city || "",
      state: profile?.state || "",
      username: profile?.username || "",

      // From registration status
      sponsorName: reg.sponsor_name,
      sponsorId: reg.sponsor_id,
      authUserId: reg.user_id,

      // Status
      franchiseSelected: reg.franchise_selected,
      paymentCompleted: reg.payment_completed,
    };

    return new Response(
      JSON.stringify({ success: true, data: wizardData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("continue-registration error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
