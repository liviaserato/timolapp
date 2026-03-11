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
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const rating = url.searchParams.get("rating");

    if (!token || !rating || !["positive", "negative"].includes(rating)) {
      return htmlResponse("Link inválido", "O link de avaliação é inválido ou está incompleto.", false);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if feedback token exists
    const { data: feedback, error: fetchErr } = await supabase
      .from("ticket_feedback")
      .select("id, rating, ticket_id")
      .eq("feedback_token", token)
      .maybeSingle();

    if (fetchErr || !feedback) {
      return htmlResponse("Token inválido", "Este link de avaliação não foi encontrado ou já expirou.", false);
    }

    // Check if already rated
    if (feedback.rating !== "pending") {
      const ratingLabel = feedback.rating === "positive" ? "👍 Satisfeito" : "👎 Insatisfeito";
      return htmlResponse(
        "Avaliação já registrada",
        `Você já avaliou este chamado como: ${ratingLabel}. Obrigado pelo seu feedback!`,
        true
      );
    }

    // Save rating
    const { error: updateErr } = await supabase
      .from("ticket_feedback")
      .update({ rating })
      .eq("id", feedback.id);

    if (updateErr) {
      console.error("Error saving feedback:", updateErr);
      return htmlResponse("Erro", "Não foi possível salvar sua avaliação. Tente novamente.", false);
    }

    const ratingLabel = rating === "positive" ? "👍 Satisfeito" : "👎 Insatisfeito";
    return htmlResponse(
      "Obrigado pelo seu feedback!",
      `Sua avaliação foi registrada: ${ratingLabel}. Você pode visualizar essa avaliação no seu Escritório Digital Timol.`,
      true
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return htmlResponse("Erro inesperado", "Ocorreu um erro ao processar sua avaliação.", false);
  }
});

function htmlResponse(title: string, message: string, success: boolean) {
  const color = success ? "#16a34a" : "#dc2626";
  const icon = success ? "✓" : "✕";

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Timol</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px; }
    .card { background: #fff; border-radius: 12px; padding: 48px 32px; max-width: 460px; width: 100%; text-align: center; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .icon { width: 56px; height: 56px; border-radius: 50%; background: ${color}; color: #fff; font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
    h1 { font-size: 20px; color: #020817; margin-bottom: 12px; }
    p { font-size: 15px; color: #64748b; line-height: 1.6; }
    .logo { margin-top: 32px; opacity: 0.4; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <img src="https://sinflvoxbphblalcsaba.supabase.co/storage/v1/object/public/email-assets/logo-timol-azul-escuro.svg" alt="Timol" height="28" class="logo" />
  </div>
</body>
</html>`;

  return new Response(html, {
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
}
