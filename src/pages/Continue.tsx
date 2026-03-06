import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { continueRegistration } from "@/lib/api";
import { FullScreenTimolLoader } from "@/components/ui/full-screen-timol-loader";

const Continue = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const loadData = async () => {
      try {
        const result = await continueRegistration(token);

        if (!result.isValid) {
          setError("Link inválido ou expirado.");
          return;
        }

        // Store wizard data in sessionStorage for Index to pick up
        sessionStorage.setItem("continueData", JSON.stringify({
          franchiseId: result.franchiseId,
          registrationStatus: result.registrationStatus,
        }));
        navigate("/?continue=1", { replace: true });
      } catch (err) {
        console.error("Continue error:", err);
        setError("Erro ao carregar dados. Tente novamente.");
      }
    };

    loadData();
  }, [token, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <img src="/favicon.svg" alt="Timol" className="h-12 w-12 mx-auto" />
          <h1 className="text-xl font-bold text-foreground">Link inválido</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm"
          >
            Ir para o cadastro
          </a>
        </div>
      </div>
    );
  }

  return (
    <FullScreenTimolLoader
      mode="page"
      size={48}
      title="Carregando seus dados..."
      className="bg-gradient-to-br from-primary/5 via-background to-primary/10"
    />
  );
};

export default Continue;
