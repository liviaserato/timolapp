import { useState } from "react";
import { ArrowDownLeft, ArrowDownRight, Settings2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SpilloverMode = "auto" | "left" | "right";

export function SpilloverSettings() {
  const [mode, setMode] = useState<SpilloverMode>("auto");
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<SpilloverMode>(mode);
  const [saving, setSaving] = useState(false);

  function handleEdit() {
    setDraft(mode);
    setEditMode(true);
  }

  function handleSave() {
    setSaving(true);
    // Simulate save — replace with real API call
    setTimeout(() => {
      setMode(draft);
      setEditMode(false);
      setSaving(false);
    }, 400);
  }

  function handleCancel() {
    setEditMode(false);
    setDraft(mode);
  }

  const modeLabel: Record<SpilloverMode, string> = {
    auto: "Automático (perna menor)",
    left: "Perna Esquerda",
    right: "Perna Direita",
  };

  if (!editMode) {
    return (
      <div className="flex items-center justify-center gap-2 mt-2">
        <Settings2 className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-[11px] text-muted-foreground">
          Derramamento: <strong className="text-foreground">{modeLabel[mode]}</strong>
        </span>
        <button
          type="button"
          onClick={handleEdit}
          className="text-[11px] text-primary hover:underline font-medium"
        >
          Alterar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3 pt-3 border-t border-border/40 space-y-2.5">
      <p className="text-[11px] font-medium text-muted-foreground text-center">
        Derramamento de novas franquias
      </p>

      <div className="flex items-center justify-center gap-1.5">
        <OptionButton
          active={draft === "auto"}
          onClick={() => setDraft("auto")}
        >
          <Settings2 className="h-3 w-3" />
          Automático
        </OptionButton>
        <OptionButton
          active={draft === "left"}
          onClick={() => setDraft("left")}
        >
          <ArrowDownLeft className="h-3 w-3" />
          Esquerda
        </OptionButton>
        <OptionButton
          active={draft === "right"}
          onClick={() => setDraft("right")}
        >
          <ArrowDownRight className="h-3 w-3" />
          Direita
        </OptionButton>
      </div>

      <p className="text-[10px] text-muted-foreground text-center leading-snug">
        {draft === "auto"
          ? "Novas franquias serão posicionadas automaticamente na perna de menor pontuação."
          : `Novas franquias serão posicionadas na perna ${draft === "left" ? "esquerda" : "direita"}.`}
      </p>

      <div className="flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs px-3"
          onClick={handleCancel}
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs px-3 gap-1"
          onClick={handleSave}
          disabled={saving || draft === mode}
        >
          {saving ? "Salvando…" : <><Check className="h-3 w-3" /> Salvar</>}
        </Button>
      </div>
    </div>
  );
}

function OptionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-colors border",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-muted-foreground hover:bg-accent/40"
      )}
    >
      {children}
    </button>
  );
}
