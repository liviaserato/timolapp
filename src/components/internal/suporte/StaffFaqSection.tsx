import { useState, useMemo } from "react";
import { HelpCircle, Pencil, Plus, Trash2, ArrowUp, ArrowDown, Save, X, Search } from "lucide-react";
import { DashboardCard } from "@/components/app/DashboardCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { faqTabs } from "@/components/app/suporte/FaqSection";
import { toast } from "sonner";

type FaqItem = { id: string; pergunta: string; resposta: string };

const seedData: Record<string, FaqItem[]> = {
  conta: [
    { id: "c1", pergunta: "Como altero meus dados pessoais?", resposta: "Acesse o menu Meus Dados no Escritório Digital. Lá você pode atualizar nome, telefone, endereço e demais informações." },
    { id: "c2", pergunta: "Esqueci minha senha, o que faço?", resposta: "Na tela de login, clique em 'Esqueci minha senha'. Você receberá um PIN por e-mail para redefinir sua senha." },
    { id: "c3", pergunta: "Como altero meu e-mail de acesso?", resposta: "Acesse Meus Dados > Contato e clique no ícone de edição ao lado do e-mail." },
  ],
  financeiro: [
    { id: "f1", pergunta: "Como funciona a Carteira?", resposta: "A Carteira é sua carteira digital dentro do sistema." },
    { id: "f2", pergunta: "Quando recebo meu bônus?", resposta: "Os bônus são calculados semanalmente e disponibilizados às terças-feiras." },
    { id: "f3", pergunta: "Como resgato meu saldo?", resposta: "Acesse Financeiro > Carteira e clique em 'Resgatar / Transferir'." },
  ],
  franquia: [
    { id: "fr1", pergunta: "Como faço upgrade da minha franquia?", resposta: "Acesse Meus Dados > Franquia e clique em 'Upgrade'." },
    { id: "fr2", pergunta: "Quais são os planos disponíveis?", resposta: "A Timol oferece os planos Bronze, Prata, Ouro e Platina." },
    { id: "fr3", pergunta: "Posso transferir minha franquia?", resposta: "A transferência de franquia deve ser solicitada via chamado de suporte." },
  ],
  rede: [
    { id: "r1", pergunta: "Como visualizo minha rede?", resposta: "Acesse o menu Rede para ver a estrutura completa da sua equipe." },
    { id: "r2", pergunta: "Como convido alguém para minha rede?", resposta: "Você pode compartilhar seu link de indicação disponível no painel." },
    { id: "r3", pergunta: "Como acompanho o desempenho da minha rede?", resposta: "No menu Rede, você tem acesso a relatórios detalhados." },
  ],
  pedidos: [
    { id: "p1", pergunta: "Como faço um novo pedido?", resposta: "Acesse o menu Pedidos, selecione os produtos desejados." },
    { id: "p2", pergunta: "Posso cancelar um pedido?", resposta: "Pedidos podem ser cancelados enquanto estiverem com o status 'Aguardando Pagamento'." },
    { id: "p3", pergunta: "Qual o prazo de entrega?", resposta: "O prazo varia conforme a região, geralmente entre 5 a 15 dias úteis." },
  ],
  produtos: [
    { id: "pr1", pergunta: "Onde vejo os produtos disponíveis?", resposta: "Acesse o menu Produtos para ver o catálogo completo." },
    { id: "pr2", pergunta: "Os produtos possuem garantia?", resposta: "Sim, todos os produtos Timol possuem garantia conforme o CDC." },
    { id: "pr3", pergunta: "Como reporto um problema com um produto?", resposta: "Abra um chamado de suporte na categoria Produtos." },
  ],
  clientes: [
    { id: "cl1", pergunta: "Como cadastro um cliente?", resposta: "Acesse o menu Clientes e clique em 'Novo Cliente'." },
    { id: "cl2", pergunta: "Posso gerenciar pedidos dos meus clientes?", resposta: "Sim, na área de Clientes você pode acompanhar o histórico de pedidos." },
    { id: "cl3", pergunta: "Como edito os dados de um cliente?", resposta: "Acesse Clientes, localize o cadastro desejado e clique para editar." },
  ],
  treinamentos: [
    { id: "t1", pergunta: "Onde acesso os treinamentos?", resposta: "Acesse o menu Treinamentos para ver todos os cursos." },
    { id: "t2", pergunta: "Os treinamentos são obrigatórios?", resposta: "Alguns treinamentos são obrigatórios para determinados níveis." },
    { id: "t3", pergunta: "Recebo certificado?", resposta: "Sim, ao concluir cada treinamento, um certificado digital é gerado." },
  ],
};

function uid() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function StaffFaqSection() {
  const [activeTab, setActiveTab] = useState<string>("conta");
  const [data, setData] = useState<Record<string, FaqItem[]>>(seedData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ pergunta: string; resposta: string }>({ pergunta: "", resposta: "" });
  const [search, setSearch] = useState("");

  const items = data[activeTab] ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.pergunta.toLowerCase().includes(q) || i.resposta.toLowerCase().includes(q),
    );
  }, [items, search]);

  function startEdit(item: FaqItem) {
    setEditingId(item.id);
    setDraft({ pergunta: item.pergunta, resposta: item.resposta });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({ pergunta: "", resposta: "" });
  }

  function saveEdit(id: string) {
    if (!draft.pergunta.trim() || !draft.resposta.trim()) {
      toast.error("Preencha pergunta e resposta");
      return;
    }
    setData((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] ?? []).map((it) =>
        it.id === id ? { ...it, pergunta: draft.pergunta.trim(), resposta: draft.resposta.trim() } : it,
      ),
    }));
    toast.success("Pergunta atualizada");
    cancelEdit();
  }

  function addNew() {
    const newItem: FaqItem = { id: uid(), pergunta: "", resposta: "" };
    setData((prev) => ({ ...prev, [activeTab]: [newItem, ...(prev[activeTab] ?? [])] }));
    setEditingId(newItem.id);
    setDraft({ pergunta: "", resposta: "" });
  }

  function removeItem(id: string) {
    setData((prev) => ({
      ...prev,
      [activeTab]: (prev[activeTab] ?? []).filter((it) => it.id !== id),
    }));
    toast.success("Pergunta removida");
  }

  function move(id: string, direction: -1 | 1) {
    setData((prev) => {
      const list = [...(prev[activeTab] ?? [])];
      const idx = list.findIndex((it) => it.id === id);
      if (idx < 0) return prev;
      const target = idx + direction;
      if (target < 0 || target >= list.length) return prev;
      [list[idx], list[target]] = [list[target], list[idx]];
      return { ...prev, [activeTab]: list };
    });
  }

  return (
    <DashboardCard
      icon={HelpCircle}
      title="Perguntas Frequentes (FAQ)"
      headerRight={
        <div className="relative w-full max-w-[260px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pergunta..."
            className="h-8 pl-8 pr-8 text-xs rounded-full bg-card border-2 border-app-card-border focus-visible:ring-1"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpar"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      }
    >
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); cancelEdit(); }} className="mt-3">
        <TabsList className="block text-justify h-auto bg-transparent p-0 [&>*]:my-[3px]">
          {faqTabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="inline-flex text-xs rounded-full px-3 py-1.5 mx-[2px] border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary"
            >
              {tab.label}
              <span className="ml-1.5 text-muted-foreground/70 text-[10px]">
                ({(data[tab.value] ?? []).length})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {faqTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            <div className="flex justify-end mb-3">
              <Button
                size="sm"
                variant="outline"
                className="text-muted-foreground gap-1.5 text-xs h-8"
                onClick={addNew}
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar pergunta
              </Button>
            </div>

            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                {search ? "Nenhuma pergunta encontrada." : "Nenhuma pergunta cadastrada."}
              </p>
            ) : (
              <div className="space-y-2">
                {filtered.map((item, idx) => {
                  const realIdx = items.findIndex((it) => it.id === item.id);
                  const isEditing = editingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-lg border border-border bg-card p-3"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={draft.pergunta}
                            onChange={(e) => setDraft((p) => ({ ...p, pergunta: e.target.value }))}
                            placeholder="Pergunta"
                            className="text-sm"
                            autoFocus
                          />
                          <Textarea
                            value={draft.resposta}
                            onChange={(e) => setDraft((p) => ({ ...p, resposta: e.target.value }))}
                            placeholder="Resposta"
                            className="text-sm min-h-[80px] resize-none"
                          />
                          <div className="flex items-center justify-end gap-1.5 pt-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground gap-1 h-8 text-xs"
                              onClick={cancelEdit}
                            >
                              <X className="h-3.5 w-3.5" />
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="gap-1 h-8 text-xs"
                              onClick={() => saveEdit(item.id)}
                            >
                              <Save className="h-3.5 w-3.5" />
                              Salvar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-snug">
                              {item.pergunta || <span className="text-muted-foreground italic">Sem pergunta</span>}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {item.resposta || <span className="italic">Sem resposta</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => move(item.id, -1)}
                              disabled={realIdx === 0}
                              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Mover para cima"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => move(item.id, 1)}
                              disabled={realIdx === items.length - 1}
                              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                              title="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Remover"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </DashboardCard>
  );
}
