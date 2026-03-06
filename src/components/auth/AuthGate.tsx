import { ReactNode, useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, clearAccessToken } from "@/lib/api";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";

// ⚠️ TEMPORARY: Set to false when the real API is ready
const DEV_BYPASS = true;

interface AuthGateProps {
  children: ReactNode;
  mode: "guest" | "protected";
}

export function AuthGate({ children, mode }: AuthGateProps) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  const checkAuth = useCallback(() => {
    setAuthed(isAuthenticated());
    setChecked(true);
  }, []);

  useEffect(() => {
    checkAuth();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "timol_access_token" || e.key === null) {
        checkAuth();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [checkAuth]);

  // DEV BYPASS: skip all auth checks
  if (DEV_BYPASS) {
    return <>{children}</>;
  }

  if (!checked) {
    return (
      <FullScreenTimolLoader
        mode="page"
        title="Carregando sessão..."
        className="bg-background"
      />
    );
  }

  if (mode === "protected" && !authed) {
    return <Navigate to="/" replace />;
  }

  if (mode === "guest" && authed) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
