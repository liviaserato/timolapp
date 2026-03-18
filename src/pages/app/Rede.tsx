import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BinaryTab } from "@/components/app/rede/BinaryTab";
import { UnilevelTab } from "@/components/app/rede/UnilevelTab";

export default function Rede() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary">Minha Rede</h1>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe a estrutura e o desempenho da sua rede de franqueados</p>
      </div>

      <Tabs defaultValue="binario" className="w-full">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="binario">Binário</TabsTrigger>
          <TabsTrigger value="unilevel">Unilevel</TabsTrigger>
        </TabsList>

        <TabsContent value="binario">
          <BinaryTab />
        </TabsContent>

        <TabsContent value="unilevel">
          <UnilevelTab searchQuery={search} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
