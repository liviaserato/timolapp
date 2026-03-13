import { DashboardCard } from "@/components/app/DashboardCard";
import { FileText, Download, ExternalLink } from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

const documents: DocumentItem[] = [
  { id: "contract", name: "Contrato de Franquia", description: "Termos e condições da sua franquia", available: true },
  { id: "guide", name: "Guia do Franqueado", description: "Manual completo para novos franqueados", available: true },
  { id: "marketing", name: "Plano de Marketing", description: "Estratégias e materiais de divulgação", available: true },
  { id: "compensation", name: "Plano de Compensação", description: "Detalhes sobre comissões e bônus", available: true },
  
];

export function DocumentsCard({ className }: { className?: string }) {
  return (
    <DashboardCard icon={FileText} title="Documentos" className={className}>
      <div className="mt-2 space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center gap-3 rounded-md border border-border/60 p-2.5 transition-colors ${
              doc.available ? "hover:bg-muted/50 cursor-pointer" : "opacity-50 cursor-not-allowed"
            }`}
          >
            <FileText className="h-5 w-5 text-primary/60 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.name}</p>
              <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
            </div>
            {doc.available ? (
              <Download className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <span className="text-[10px] text-muted-foreground flex-shrink-0">Em breve</span>
            )}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
