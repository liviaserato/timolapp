import { ReactNode, useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, clearAccessToken, getUserRole } from "@/lib/api";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";

// ⚠️ TEMPORARY: Set to false when the real API is ready
const DEV_BYPASS = false;

type AuthMode = "guest" | "protected";

/** Which roles are allowed on this route group */
type AllowedRoles = "any" | "franchisee" | "internal";

interface AuthGateProps {
  children: ReactNode;
  mode: AuthMode;
  /** Restrict to specific role group. Default: "any" */
  allowedRoles?: AllowedRoles;
}

/** Returns the correct home path for a given role */
function homeForRole(role: string | null): string {
  if (!role) return "/app";
  // staff, admin, superadmin → /internal
  if (["staff", "admin", "superadmin"].includes(role)) return "/internal";
  // franchisee or unknown → /app
  return "/app";
}

export function AuthGate({ children, mode, allowedRoles = "any" }: AuthGateProps) {
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

  // Guest route: redirect authenticated users to their home
  if (mode === "guest" && authed) {
    return <Navigate to={homeForRole(getUserRole())} replace />;
  }

  // Protected route: redirect unauthenticated users to login
  if (mode === "protected" && !authed) {
    return <Navigate to="/" replace />;
  }

  // Role check: redirect if user doesn't have the right role group
  // Admins can access BOTH /app and /internal — no redirect for them
  if (mode === "protected" && authed && allowedRoles !== "any") {
    const role = getUserRole();
    const isAdmin = role === "admin" || role === "superadmin";

    // Admins bypass role restrictions — they can view both environments
    if (!isAdmin) {
      const isInternal = role && ["staff"].includes(role);

      if (allowedRoles === "internal" && !isInternal) {
        return <Navigate to="/app" replace />;
      }
      if (allowedRoles === "franchisee" && isInternal) {
        return <Navigate to="/internal" replace />;
      }
    }
  }

  return <>{children}</>;
}
