import { forwardRef, useRef, useState, useMemo, useCallback } from "react";
import { Search, X, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { DashboardCard } from "@/components/app/DashboardCard";

/* ── FAQ data ── */

export const faqTabs = [
  { value: "conta", label: "Conta e Cadastro" },
  { value: "financeiro", label: "Financeiro e Bônus" },
  { value: "franquia", label: "Franquia" },
  { value: "rede", label: "Rede" },
  { value: "pedidos", label: "Pedidos e Compras" },
  { value: "produtos", label: "Produtos" },
  { value: "clientes", label: "Clientes" },
  { value: "treinamentos", label: "Treinamentos" },
];

const faqData: Record<string, { pergunta: string; resposta: string }[]> = {
  conta: [
    { pergunta: "Como altero meus dados pessoais?", resposta: "Acesse o menu Meus Dados no Escritório Digital. Lá você pode atualizar nome, telefone, endereço e demais informações. Alterações de documento exigem envio de comprovante via chamado." },
    { pergunta: "Esqueci minha senha, o que faço?", resposta: "Na tela de login, clique em 'Esqueci minha senha'. Você receberá um PIN por e-mail para redefinir sua senha. Caso não receba, verifique a caixa de spam ou entre em contato pelo suporte." },
    { pergunta: "Como altero meu e-mail de acesso?", resposta: "Acesse Meus Dados > Contato e clique no ícone de edição ao lado do e-mail. Um código de verificação será enviado ao novo endereço para confirmar a alteração." },
  ],
  financeiro: [
    { pergunta: "Como funciona o Carteira?", resposta: "O Carteira é sua carteira digital dentro do sistema. Você pode adicionar saldo, utilizar para pagamentos de pedidos e também realizar transferências para sua conta bancária." },
    { pergunta: "Quando recebo meu bônus?", resposta: "Os bônus são calculados semanalmente e disponibilizados às terças-feiras. O valor pode ser convertido em saldo no Carteira ou resgatado para conta bancária." },
    { pergunta: "Como resgato meu saldo?", resposta: "Acesse Financeiro > Carteira e clique em 'Resgatar / Transferir'. Informe o valor e confirme com seu PIN de segurança. O prazo para crédito é de até 3 dias úteis." },
  ],
  franquia: [
    { pergunta: "Como faço upgrade da minha franquia?", resposta: "Acesse Meus Dados > Franquia e clique em 'Upgrade'. Escolha o plano desejado e realize o pagamento. O upgrade é ativado imediatamente após a confirmação." },
    { pergunta: "Quais são os planos disponíveis?", resposta: "A Timol oferece os planos Bronze, Prata, Ouro e Platina. Cada plano possui benefícios e limites diferentes. Consulte os detalhes na seção Franquia." },
    { pergunta: "Posso transferir minha franquia?", resposta: "A transferência de franquia deve ser solicitada via chamado de suporte. Nossa equipe analisará o pedido e orientará sobre o processo e documentação necessária." },
  ],
  rede: [
    { pergunta: "Como visualizo minha rede?", resposta: "Acesse o menu Rede para ver a estrutura completa da sua equipe, incluindo diretos e indiretos, com informações de status e desempenho." },
    { pergunta: "Como convido alguém para minha rede?", resposta: "Você pode compartilhar seu link de indicação disponível no painel. Quando a pessoa se cadastrar pelo seu link, ela será automaticamente adicionada à sua rede." },
    { pergunta: "Como acompanho o desempenho da minha rede?", resposta: "No menu Rede, você tem acesso a relatórios detalhados de desempenho, pontuação e atividade de cada membro da sua equipe." },
  ],
  pedidos: [
    { pergunta: "Como faço um novo pedido?", resposta: "Acesse o menu Pedidos, selecione os produtos desejados, escolha a forma de pagamento e confirme. O pedido será processado e você receberá atualizações por e-mail." },
    { pergunta: "Posso cancelar um pedido?", resposta: "Pedidos podem ser cancelados enquanto estiverem com o status 'Aguardando Pagamento'. Após a confirmação do pagamento, entre em contato com o suporte para verificar a possibilidade." },
    { pergunta: "Qual o prazo de entrega?", resposta: "O prazo varia conforme a região, geralmente entre 5 a 15 dias úteis após a confirmação do pagamento. Você pode acompanhar o status pelo menu Pedidos." },
  ],
  produtos: [
    { pergunta: "Onde vejo os produtos disponíveis?", resposta: "Acesse o menu Produtos para ver o catálogo completo com descrições, preços e disponibilidade de cada item." },
    { pergunta: "Os produtos possuem garantia?", resposta: "Sim, todos os produtos Timol possuem garantia conforme o Código de Defesa do Consumidor. Consulte as condições específicas na página de cada produto." },
    { pergunta: "Como reporto um problema com um produto?", resposta: "Abra um chamado de suporte na categoria Produtos informando o número do pedido, o produto e o problema encontrado. Nossa equipe analisará e orientará sobre os próximos passos." },
  ],
  clientes: [
    { pergunta: "Como cadastro um cliente?", resposta: "Acesse o menu Clientes e clique em 'Novo Cliente'. Preencha os dados e salve. O cliente ficará vinculado ao seu perfil para facilitar pedidos futuros." },
    { pergunta: "Posso gerenciar pedidos dos meus clientes?", resposta: "Sim, na área de Clientes você pode acompanhar o histórico de pedidos, preferências e realizar novos pedidos em nome dos seus clientes." },
    { pergunta: "Como edito os dados de um cliente?", resposta: "Acesse Clientes, localize o cadastro desejado e clique para editar. Você pode atualizar informações de contato e endereço a qualquer momento." },
  ],
  treinamentos: [
    { pergunta: "Onde acesso os treinamentos?", resposta: "Acesse o menu Treinamentos para ver todos os cursos e materiais disponíveis. Os conteúdos são organizados por nível e tema para facilitar seu aprendizado." },
    { pergunta: "Os treinamentos são obrigatórios?", resposta: "Alguns treinamentos são obrigatórios para determinados níveis de franquia. Consulte os requisitos na seção Franquia para saber quais se aplicam ao seu plano." },
    { pergunta: "Recebo certificado?", resposta: "Sim, ao concluir cada treinamento, um certificado digital é gerado automaticamente e fica disponível para download na sua área de treinamentos." },
  ],
};

/* ── Helpers ── */

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

const HighlightText = forwardRef<HTMLSpanElement, { text: string; query: string }>(
  ({ text, query }, ref) => {
    if (!query.trim()) return <span ref={ref}>{text}</span>;

    const q = normalize(query.trim());
    const normalizedText = normalize(text);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    let idx = normalizedText.indexOf(q, lastIndex);
    while (idx !== -1) {
      if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));
      parts.push(
        <mark key={idx} className="bg-amber-200 dark:bg-amber-700/60 text-inherit" style={{ padding: 0, margin: 0 }}>
          {text.slice(idx, idx + q.length)}
        </mark>
      );
      lastIndex = idx + q.length;
      idx = normalizedText.indexOf(q, lastIndex);
    }

    if (lastIndex < text.length) parts.push(text.slice(lastIndex));

    return <span ref={ref}>{parts}</span>;
  }
);

HighlightText.displayName = "HighlightText";

/* ── Component ── */

type SearchFieldProps = {
  search: string;
  setSearch: (v: string) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  className?: string;
};

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
  ({ search, setSearch, handleKeyDown, clearSearch, className }, ref) => {
    const hasSearch = search.trim().length > 0;

    return (
      <div className={`relative ${className ?? ""}`}>
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          ref={ref}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar pergunta..."
          className="h-8 pl-8 pr-8 text-xs rounded-full bg-card border-2 border-app-card-border focus-visible:ring-1"
        />
        {hasSearch && (
          <button
            onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Limpar busca"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchField.displayName = "SearchField";

export default function FaqSection() {
  const [activeTab, setActiveTab] = useState("conta");
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const { filteredByTab, matchingTabs } = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) {
      return {
        filteredByTab: faqData,
        matchingTabs: new Set<string>(),
      };
    }

    const filtered: Record<string, { pergunta: string; resposta: string }[]> = {};
    const matching = new Set<string>();

    for (const tab of faqTabs) {
      const items = faqData[tab.value] ?? [];
      const hits = items.filter(
        (item) =>
          normalize(item.pergunta).includes(q) ||
          normalize(item.resposta).includes(q)
      );
      filtered[tab.value] = hits;
      if (hits.length > 0) matching.add(tab.value);
    }

    return { filteredByTab: filtered, matchingTabs: matching };
  }, [search]);

  const activeItems = filteredByTab[activeTab] ?? [];
  const hasSearch = search.trim().length > 0;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        if (search) {
          e.currentTarget.select();
        }
      }
    },
    [search]
  );

  const clearSearch = useCallback(() => {
    setSearch("");
    inputRef.current?.focus();
  }, []);

  return (
    <DashboardCard
      icon={HelpCircle}
      title="Perguntas Frequentes (FAQ)"
      headerRight={
        !isMobile ? (
          <SearchField
            ref={inputRef}
            search={search}
            setSearch={setSearch}
            handleKeyDown={handleKeyDown}
            clearSearch={clearSearch}
            className="w-full max-w-[260px]"
          />
        ) : undefined
      }
    >
      {isMobile && (
        <SearchField
          ref={inputRef}
          search={search}
          setSearch={setSearch}
          handleKeyDown={handleKeyDown}
          clearSearch={clearSearch}
          className="w-full mt-1 mb-2"
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-3">
        <TabsList className="block text-justify h-auto bg-transparent p-0 [&>*]:my-[3px]">
          {faqTabs.map((tab) => {
            const isOtherTabMatch =
              hasSearch && matchingTabs.has(tab.value) && tab.value !== activeTab;
            const hasMatchInTab = hasSearch && matchingTabs.has(tab.value);

            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`inline-flex text-xs rounded-full px-3 py-1.5 mx-[2px] border transition-all
                  data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary
                  ${
                    isOtherTabMatch
                      ? "border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-500 ring-1 ring-amber-300 dark:ring-amber-600"
                      : "border-border"
                  }
                  ${hasSearch && !hasMatchInTab ? "opacity-50" : ""}
                `}
              >
                {tab.label}
                {isOtherTabMatch && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-amber-400 text-[10px] font-bold text-amber-900">
                    {filteredByTab[tab.value]?.length ?? 0}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {faqTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-3">
            {activeItems.length === 0 && tab.value === activeTab ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                Nenhum resultado encontrado nesta categoria.
              </p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {(tab.value === activeTab ? activeItems : []).map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`${tab.value}-${idx}`}
                    className="border-b border-border"
                  >
                    <AccordionTrigger className="text-sm text-left py-3 hover:no-underline">
                      <HighlightText text={item.pergunta} query={search} />
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      <HighlightText text={item.resposta} query={search} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </DashboardCard>
  );
}
