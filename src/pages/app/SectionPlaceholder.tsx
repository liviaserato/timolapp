import { useParams } from "react-router-dom";
import { Construction } from "lucide-react";

const sectionNames: Record<string, string> = {
  cadastro: "Cadastro",
  franquia: "Franquia",
  rede: "Rede",
  clientes: "Clientes",
  treinamentos: "Treinamentos",
  produtos: "Produtos",
  pedidos: "Pedidos",
  financeiro: "Financeiro",
  comercial: "Comercial",
  relatorios: "Relatórios",
  suporte: "Suporte",
  configuracoes: "Configurações",
};

export default function SectionPlaceholder() {
  const { section } = useParams<{ section: string }>();
  const title = sectionNames[section || ""] || section || "Página";

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Construction className="h-16 w-16 text-muted-foreground/40" />
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Esta seção está em construção e será disponibilizada em breve.
      </p>
    </div>
  );
}
