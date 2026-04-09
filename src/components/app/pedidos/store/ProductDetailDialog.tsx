import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/mock-products";

import comboMegaImg from "@/assets/produto-combo-mega.png";
import comboMiniImg from "@/assets/produto-combo-mini.png";
import produtosSeparadosImg from "@/assets/produtos-separados.png";
import loaderImg from "@/assets/produtos-loader-transparent.png";

const productImages: Record<string, string> = {
  "Combo Mega": comboMegaImg,
  "Combo Mini": comboMiniImg,
  "Produtos Separados": produtosSeparadosImg,
  "Loader Transparente": loaderImg,
};

interface Section {
  title: string;
  content?: string;
}

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function buildDimensionText(product: Product): string | undefined {
  const parts: string[] = [];
  if (product.packageHeight || product.packageWidth || product.packageLength) {
    parts.push(`${product.packageHeight ?? '–'} × ${product.packageWidth ?? '–'} × ${product.packageLength ?? '–'} cm (A × L × C)`);
  }
  if (product.packageDiameter) parts.push(`Diâmetro: ${product.packageDiameter} cm`);
  if (product.packageWeight) parts.push(`Peso: ${product.packageWeight} g`);
  return parts.length > 0 ? parts.join('\n') : undefined;
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  if (!product) return null;

  const img = productImages[product.name];
  const dimensionText = buildDimensionText(product);

  const sections: Section[] = [
    { title: "Benefícios", content: product.benefits },
    { title: "Dimensões da Embalagem", content: dimensionText },
    { title: "Instruções de uso", content: product.instructions },
    { title: "Garantia", content: product.warranty },
    { title: "Composição", content: product.composition },
    { title: "Fabricado por", content: product.manufacturer },
  ];

  const visibleSections = sections.filter((s) => s.content);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0 rounded-lg overflow-hidden border-primary">
        {/* Image */}
        <div className="bg-muted/30 flex items-center justify-center py-2">
          {img ? (
            <img src={img} alt={product.name} className="h-32 w-32 object-contain" />
          ) : (
            <div className="h-32 w-32 rounded-lg bg-muted/50 flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
            </div>
          )}
        </div>

        {/* Header */}
        <DialogHeader className="bg-primary px-4 py-3 space-y-0.5 text-left">
          <DialogDescription className="text-primary-foreground/70 text-xs font-medium m-0">
            {product.subcategory}
          </DialogDescription>
          <DialogTitle className="text-primary-foreground text-base font-bold leading-tight">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="max-h-[50vh]">
          <div className="px-4 py-4 space-y-4">
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {visibleSections.length > 0 ? (
              visibleSections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-sm font-semibold text-primary mb-1">{section.title}</h4>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground italic">Detalhes do produto em breve.</p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
