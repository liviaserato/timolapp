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
    const { franchise_id, document, birth_date } = await req.json();

    if (!franchise_id || !document || !birth_date) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find registration by franchise_id
    const { data: reg, error: regError } = await supabase
      .from("registration_status")
      .select("*")
      .eq("franchise_id", franchise_id)
      .single();

    if (regError || !reg) {
      return new Response(
        JSON.stringify({ error: "not_found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Already completed
    if (reg.franchise_selected && reg.payment_completed) {
      return new Response(
        JSON.stringify({ error: "already_completed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch profile to validate document + birth_date
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", reg.user_id)
      .single();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "not_found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize documents for comparison (strip formatting)
    const normalizeDoc = (d: string) => d.replace(/[^\dA-Za-z]/g, "").toLowerCase();
    const profileDoc = normalizeDoc(profile.document || "");
    const inputDoc = normalizeDoc(document);

    if (!profileDoc || profileDoc !== inputDoc) {
      return new Response(
        JSON.stringify({ error: "validation_failed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate birth date
    const profileBirth = profile.birth_date || "";
    if (!profileBirth || profileBirth !== birth_date) {
      return new Response(
        JSON.stringify({ error: "validation_failed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build wizard data (same format as continue-registration)
    const wizardData = {
      fullName: profile.full_name || reg.full_name,
      email: profile.email || reg.email,
      document: profile.document || reg.document,
      phone: profile.phone || "",
      birthDate: profile.birth_date || "",
      gender: profile.gender || "",
      country: profile.country || "",
      zipCode: profile.zip_code || "",
      street: profile.street || "",
      number: profile.number || "",
      complement: profile.complement || "",
      neighborhood: profile.neighborhood || "",
      city: profile.city || "",
      state: profile.state || "",
      username: profile.username || "",
      sponsorName: reg.sponsor_name,
      sponsorId: reg.sponsor_id,
      authUserId: reg.user_id,
      franchiseSelected: reg.franchise_selected,
      paymentCompleted: reg.payment_completed,
    };

    return new Response(
      JSON.stringify({ success: true, data: wizardData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("resume-registration error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
