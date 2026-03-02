import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import timolLogoDark from "@/assets/logo-timol-azul-escuro.svg";

interface Props {
  className?: string;
}

// Placeholder promo image when none is uploaded
const PLACEHOLDER_IMAGE = "";

export const LoginPromoBanner = ({ className }: Props) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Try to load the promo image from storage
    loadPromoImage();
  }, []);

  const loadPromoImage = async () => {
    try {
      const { data } = supabase.storage
        .from("login-promo")
        .getPublicUrl("promo-banner.jpg");

      if (data?.publicUrl) {
        // Check if file actually exists by fetching headers
        const res = await fetch(data.publicUrl, { method: "HEAD" });
        if (res.ok) {
          setImageUrl(data.publicUrl);
        }
      }
    } catch {
      // No image uploaded yet — show placeholder
    }
  };

  return (
    <div
      className={cn(
        "relative flex-col items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8",
        className
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Promoção Timol"
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
          <img src={timolLogoDark} alt="Timol" className="h-12 brightness-0 invert" />
          <div className="space-y-3">
            <h2 className="text-xl font-bold leading-tight">
              Seu negócio digital começa aqui
            </h2>
            <p className="text-sm opacity-80 leading-relaxed max-w-[280px]">
              Faça parte da rede Timol e tenha acesso a produtos exclusivos, treinamentos e suporte completo.
            </p>
          </div>
          <div className="mt-4 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-xs">
            #TimolTransforma
          </div>
        </div>
      )}
    </div>
  );
};
