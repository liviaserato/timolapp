import { useState } from "react";
import { Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BinaryTab } from "@/components/app/rede/BinaryTab";
import { UnilevelTab } from "@/components/app/rede/UnilevelTab";
import { QualificationLegend } from "@/components/app/rede/QualificationLegend";

export default function Rede() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl font-bold">Minha Rede</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
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
