import { useState } from "react";
import { emailTemplates, type EmailTemplate } from "@/components/app/configuracoes/email-preview-templates";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail } from "lucide-react";

export default function EmailPreviews() {
  const [selectedId, setSelectedId] = useState(emailTemplates[0].id);
  const selected = emailTemplates.find((t) => t.id === selectedId)!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Templates de E-mail
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualize como cada e-mail transacional é exibido para o usuário.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-full sm:w-[340px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {emailTemplates.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant={selected.category === "auth" ? "default" : "secondary"}>
          {selected.category === "auth" ? "Autenticação" : "Transacional"}
        </Badge>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-1">{selected.name}</p>
        <p className="text-xs text-muted-foreground mb-4">{selected.description}</p>
        <div className="flex justify-center bg-muted/30 rounded-md p-4">
          <iframe
            title={selected.name}
            srcDoc={selected.html}
            className="w-full max-w-[620px] border rounded bg-white"
            style={{ height: selected.id === 'completed-registration' ? 900 : 520 }}
            sandbox=""
          />
        </div>
      </div>
    </div>
  );
}
