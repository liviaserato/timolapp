import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Video, Image as ImageIcon, Table2, Download, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MaterialItem {
  id: string;
  title: string;
  type: "pdf" | "video" | "image" | "table";
  description?: string;
  url: string;
  thumbnail?: string;
}

const categories = [
  { id: "apresentacao", label: "Apresentação" },
  { id: "produtos", label: "Produtos" },
  { id: "treinamento", label: "Treinamento" },
  { id: "redes-sociais", label: "Redes Sociais" },
];

const mockMaterials: Record<string, MaterialItem[]> = {
  apresentacao: [
    { id: "1", title: "Apresentação Institucional TIMOL", type: "pdf", description: "PDF com a apresentação oficial da marca", url: "#" },
    { id: "2", title: "Vídeo Institucional 2025", type: "video", description: "Vídeo de 3 min sobre a história da TIMOL", url: "#" },
    { id: "3", title: "Banner de Apresentação", type: "image", description: "Banner HD para redes sociais", url: "#" },
  ],
  produtos: [
    { id: "4", title: "Catálogo de Produtos", type: "pdf", description: "Catálogo completo com preços sugeridos", url: "#" },
    { id: "5", title: "Tabela de Preços Sugeridos", type: "table", description: "Preços atualizados para revenda", url: "#" },
    { id: "6", title: "Fotos dos Produtos (Pack)", type: "image", description: "Pack com fotos profissionais dos produtos", url: "#" },
    { id: "7", title: "Vídeo de Demonstração", type: "video", description: "Como apresentar os produtos ao cliente", url: "#" },
  ],
  treinamento: [
    { id: "8", title: "Manual de Vendas", type: "pdf", description: "Guia completo de técnicas de vendas", url: "#" },
    { id: "9", title: "Como Abordar o Cliente", type: "video", description: "Vídeo-aula sobre abordagem consultiva", url: "#" },
  ],
  "redes-sociais": [
    { id: "10", title: "Pack de Stories", type: "image", description: "Templates editáveis para Instagram Stories", url: "#" },
    { id: "11", title: "Pack de Posts", type: "image", description: "Templates de feed com fotos dos produtos", url: "#" },
    { id: "12", title: "Legendas Prontas", type: "pdf", description: "Textos de copy para posts em redes sociais", url: "#" },
  ],
};

const typeConfig = {
  pdf: { icon: FileText, color: "text-red-500", bg: "bg-red-50", label: "PDF" },
  video: { icon: Video, color: "text-blue-500", bg: "bg-blue-50", label: "Vídeo" },
  image: { icon: ImageIcon, color: "text-emerald-500", bg: "bg-emerald-50", label: "Imagem" },
  table: { icon: Table2, color: "text-amber-500", bg: "bg-amber-50", label: "Tabela" },
};

function MaterialCard({ item }: { item: MaterialItem }) {
  const config = typeConfig[item.type];
  const TypeIcon = config.icon;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: item.title, text: item.description, url: item.url });
    } else {
      navigator.clipboard.writeText(item.url);
      toast.success("Link copiado!");
    }
  };

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-border/60 bg-background p-3 transition-all hover:border-primary/30 hover:shadow-sm">
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", config.bg)}>
        <TypeIcon className={cn("h-5 w-5", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <Badge variant="secondary" className="shrink-0 text-[10px] px-1.5 py-0">
            {config.label}
          </Badge>
        </div>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleShare} title="Compartilhar">
          <Share2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Baixar">
          <Download className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" title="Abrir">
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function MaterialApoioSection() {
  return (
    <Tabs defaultValue="apresentacao" className="mt-2">
      <TabsList className="w-full justify-start bg-muted/50 h-auto flex-wrap gap-1 p-1">
        {categories.map((cat) => (
          <TabsTrigger
            key={cat.id}
            value={cat.id}
            className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md px-3 py-1.5"
          >
            {cat.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((cat) => (
        <TabsContent key={cat.id} value={cat.id} className="mt-3 space-y-2">
          {(mockMaterials[cat.id] || []).map((item) => (
            <MaterialCard key={item.id} item={item} />
          ))}
        </TabsContent>
      ))}
    </Tabs>
  );
}
