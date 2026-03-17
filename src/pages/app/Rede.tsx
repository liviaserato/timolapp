import { useState, useRef } from "react";
import { Search, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BinaryTab } from "@/components/app/rede/BinaryTab";
import { UnilevelTab } from "@/components/app/rede/UnilevelTab";
import { QualificationLegend } from "@/components/app/rede/QualificationLegend";

export default function Rede() {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      inputRef.current?.select();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">Minha Rede</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe a estrutura e o desempenho da sua rede de franqueados</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Buscar por ID ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-8 h-9 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); inputRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <Tabs defaultValue="binario" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="binario" className="flex-1 sm:flex-none">Binário</TabsTrigger>
          <TabsTrigger value="unilevel" className="flex-1 sm:flex-none">Unilevel</TabsTrigger>
        </TabsList>

        <TabsContent value="binario">
          <BinaryTab />
        </TabsContent>

        <TabsContent value="unilevel">
          <UnilevelTab searchQuery={search} />
        </TabsContent>
      </Tabs>

      <QualificationLegend />
    </div>
  );
}
