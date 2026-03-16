import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Product } from "@/data/mock-products";

interface Section {
  title: string;
  content?: string;
}

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({ product, open, onOpenChange }: ProductDetailDialogProps) {
  if (!product) return null;

  const sections: Section[] = [
    { title: "Benefícios", content: product.benefits },
    { title: "Instruções de uso", content: product.instructions },
    { title: "Garantia", content: product.warranty },
    { title: "Composição", content: product.composition },
    { title: "Fabricado por", content: product.manufacturer },
  ];

  const visibleSections = sections.filter((s) => s.content);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 gap-0 rounded-lg overflow-hidden">
        {/* Header */}
        <DialogHeader className="bg-primary px-4 py-3 space-y-0.5 [&>button]:text-primary-foreground">
          <DialogDescription className="text-primary-foreground/70 text-xs font-medium m-0">
            {product.subcategory}
          </DialogDescription>
          <DialogTitle className="text-primary-foreground text-base font-bold leading-tight">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="max-h-[60vh]">
          <div className="px-4 py-4 space-y-4">
            {/* Description */}
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {/* Sections */}
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
