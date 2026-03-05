import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";
import type { Session } from "@supabase/supabase-js";

interface AuthGateProps {
  children: ReactNode;
  mode: "guest" | "protected";
}

export function AuthGate({ children, mode }: AuthGateProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setLoading(false);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <FullScreenTimolLoader
        mode="page"
        title="Carregando sessão..."
        className="bg-background"
      />
    );
  }

  if (mode === "protected" && !session) {
    return <Navigate to="/" replace />;
  }

  if (mode === "guest" && session) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
