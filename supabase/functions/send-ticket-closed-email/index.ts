import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as React from "npm:react@18.3.1";
import { render } from "npm:@react-email/render@0.0.12";
import { TicketClosedEmail } from "../_shared/email-templates/ticket-closed.tsx";

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
    const { ticket_id } = await req.json();

    if (!ticket_id) {
      return new Response(JSON.stringify({ error: "ticket_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get ticket details
    const { data: ticket, error: ticketErr } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("id", ticket_id)
      .single();

    if (ticketErr || !ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile for name and email
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", ticket.user_id)
      .single();

    if (profileErr || !profile || !profile.email) {
      return new Response(JSON.stringify({ error: "User profile not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create feedback record with "pending" rating and get token
    const { data: feedback, error: feedbackErr } = await supabase
      .from("ticket_feedback")
      .insert({
        ticket_id: ticket.id,
        user_id: ticket.user_id,
        rating: "pending",
      })
      .select("feedback_token")
      .single();

    if (feedbackErr) {
      // If already exists, feedback was already sent
      if (feedbackErr.code === "23505") {
        return new Response(JSON.stringify({ error: "Feedback already sent for this ticket" }), {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw feedbackErr;
    }

    const feedbackBaseUrl = `${supabaseUrl}/functions/v1/ticket-feedback`;
    const feedbackPositiveUrl = `${feedbackBaseUrl}?token=${feedback.feedback_token}&rating=positive`;
    const feedbackNegativeUrl = `${feedbackBaseUrl}?token=${feedback.feedback_token}&rating=negative`;

    // Render email HTML
    const emailHtml = render(
      React.createElement(TicketClosedEmail, {
        fullName: profile.full_name || "Cliente",
        ticketNumero: ticket.numero,
        ticketAssunto: ticket.assunto,
        feedbackPositiveUrl,
        feedbackNegativeUrl,
      })
    );

    // Send email via Lovable API
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const emailRes = await fetch("https://api.lovable.dev/api/v1/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        to: profile.email,
        subject: `Chamado ${ticket.numero} concluído — Como foi o atendimento?`,
        html: emailHtml,
        purpose: "transactional",
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      console.error("Email send failed:", errBody);
      throw new Error(`Email send failed: ${emailRes.status}`);
    }

    await emailRes.text();

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
