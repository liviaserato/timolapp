import { useRef } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { WizardData } from "@/types/wizard";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import timolLogo from "@/assets/logo-timol-azul-escuro.svg";
import favicon from "/favicon.svg";

interface Props {
  data: WizardData;
  onClose?: () => void;
}

export const ContractScreen = ({ data, onClose }: Props) => {
  const { t } = useLanguage();
  const docRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  const handleSavePdf = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    const el = docRef.current;
    if (!el) return;
    const fileName = `Contrato de Franquia ID ${mockId}.pdf`;
    html2pdf()
      .set({
        margin: [20, 20, 20, 20],
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(el)
      .save();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      window.close();
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  const todayShort = today.toLocaleDateString("pt-BR");

  const mockId = data.userId ?? "123456";
  const fullName = data.fullName ?? "_______________";
  const isForeigner = data.foreignerNoCpf === "true";
  const docLabel = isForeigner ? t("contract.documentPassport") : "CPF";
  const doc = data.document ?? "_______________";
  const birthDate = data.birthDate ?? "—";
  const email = data.email ?? "—";

  // Concatenated address
  const addressParts = [
    [data.street, data.number, data.complement].filter(Boolean).join(", "),
    data.neighborhood,
  ].filter(Boolean).join(" — ");
  const cityStateParts = [data.city, data.state].filter(Boolean).join("/");
  const fullAddress = [addressParts, cityStateParts, data.zipCode, data.country]
    .filter(Boolean)
    .join(", ") || "—";

  const franchiseName = data.franchise ? t(`franchise.${data.franchise}`) : "_______________";
  const sponsorDisplay = `${data.sponsorName ?? "—"} (${data.sponsorId ?? "—"})`;

  const clauses = [
    {
      title: "CLÁUSULA 1ª — DO OBJETO",
      text: `O presente contrato tem por objeto a concessão, pela TIMOL SYSTEM LTDA., doravante denominada FRANQUEADORA, ao FRANQUEADO acima qualificado, do direito de uso da marca, sistemas, métodos e processos desenvolvidos pela FRANQUEADORA, para operação de uma unidade de franquia do tipo ${franchiseName}, conforme as condições estabelecidas neste instrumento.\n\nA FRANQUEADORA concede ao FRANQUEADO o direito não exclusivo de utilizar a marca TIMOL, bem como todo o know-how, materiais de treinamento, ferramentas digitais e suporte técnico necessários para a operação da franquia, pelo período de vigência deste contrato.`,
    },
    {
      title: "CLÁUSULA 2ª — DA VIGÊNCIA",
      text: "O presente contrato terá vigência de 12 (doze) meses, contados a partir da data de sua assinatura, podendo ser renovado por igual período mediante acordo entre as partes, desde que o FRANQUEADO esteja em dia com todas as suas obrigações contratuais e financeiras.\n\nA renovação deverá ser solicitada com antecedência mínima de 30 (trinta) dias antes do término da vigência. A FRANQUEADORA reserva-se o direito de avaliar o desempenho do FRANQUEADO como critério para aprovação da renovação.",
    },
    {
      title: "CLÁUSULA 3ª — DAS OBRIGAÇÕES DO FRANQUEADO",
      text: "O FRANQUEADO se compromete a:\n\na) Respeitar e seguir fielmente os padrões, normas e procedimentos estabelecidos pela FRANQUEADORA;\n\nb) Manter sigilo absoluto sobre todas as informações, técnicas, métodos e know-how transmitidos pela FRANQUEADORA;\n\nc) Não utilizar a marca TIMOL ou qualquer material de propriedade intelectual da FRANQUEADORA para fins não autorizados;\n\nd) Participar dos treinamentos e capacitações oferecidos pela FRANQUEADORA;\n\ne) Manter seus dados cadastrais atualizados junto à FRANQUEADORA;\n\nf) Cumprir com todas as obrigações fiscais e legais decorrentes da operação da franquia;\n\ng) Não transferir, ceder ou sublicenciar os direitos objeto deste contrato sem prévia autorização por escrito da FRANQUEADORA.",
    },
    {
      title: "CLÁUSULA 4ª — DAS OBRIGAÇÕES DA FRANQUEADORA",
      text: "A FRANQUEADORA se compromete a:\n\na) Fornecer ao FRANQUEADO todo o suporte técnico necessário para a operação da franquia;\n\nb) Disponibilizar materiais de treinamento, manuais operacionais e ferramentas digitais;\n\nc) Manter o FRANQUEADO informado sobre atualizações, melhorias e novidades do sistema;\n\nd) Prestar assistência em questões técnicas e operacionais dentro dos prazos estabelecidos;\n\ne) Garantir a integridade e disponibilidade das plataformas digitais utilizadas na operação da franquia.",
    },
    {
      title: "CLÁUSULA 5ª — DA REMUNERAÇÃO",
      text: "Pela concessão dos direitos previstos neste contrato, o FRANQUEADO pagará à FRANQUEADORA os seguintes valores:\n\na) Taxa de adesão: valor correspondente à franquia selecionada, pago no ato da contratação, de forma única e não reembolsável;\n\nb) Eventuais taxas de renovação ou manutenção, conforme tabela vigente à época da renovação;\n\nc) Os valores mencionados não incluem impostos, que serão de responsabilidade do FRANQUEADO.\n\nParágrafo único: Em nenhuma hipótese haverá devolução dos valores pagos a título de taxa de adesão, independentemente do motivo da rescisão contratual.",
    },
    {
      title: "CLÁUSULA 6ª — DA PROPRIEDADE INTELECTUAL",
      text: "Todos os direitos de propriedade intelectual relativos à marca TIMOL, incluindo mas não se limitando a logotipos, designs, materiais de marketing, softwares, metodologias, processos e know-how, são e permanecerão sendo de propriedade exclusiva da FRANQUEADORA.\n\nO FRANQUEADO reconhece que a utilização da marca e demais elementos de propriedade intelectual é limitada exclusivamente ao período de vigência deste contrato e aos fins nele previstos. Qualquer uso não autorizado constituirá violação contratual e poderá resultar em rescisão imediata e responsabilização civil e criminal.",
    },
    {
      title: "CLÁUSULA 7ª — DA RESCISÃO",
      text: "O presente contrato poderá ser rescindido:\n\na) Por acordo mútuo entre as partes, mediante comunicação por escrito com antecedência mínima de 30 (trinta) dias;\n\nb) Por justa causa, em caso de descumprimento de qualquer das obrigações previstas neste contrato, após notificação e prazo de 15 (quinze) dias para regularização;\n\nc) Automaticamente, ao término da vigência, caso não haja renovação;\n\nd) Por decisão unilateral da FRANQUEADORA, em caso de conduta que prejudique a imagem ou reputação da marca TIMOL.\n\nEm caso de rescisão, o FRANQUEADO deverá cessar imediatamente o uso da marca e devolver todos os materiais de propriedade da FRANQUEADORA.",
    },
    {
      title: "CLÁUSULA 8ª — DA CONFIDENCIALIDADE",
      text: "O FRANQUEADO compromete-se a manter em absoluto sigilo e confidencialidade todas as informações, dados, técnicas, estratégias comerciais, listas de clientes e quaisquer outras informações a que tenha acesso em razão deste contrato.\n\nEsta obrigação de confidencialidade permanecerá vigente mesmo após o término ou rescisão do presente contrato, por prazo indeterminado, sujeitando o infrator às penalidades previstas em lei e à reparação integral dos danos causados.",
    },
    {
      title: "CLÁUSULA 9ª — DISPOSIÇÕES GERAIS",
      text: "Este contrato constitui o acordo integral entre as partes com relação ao seu objeto, substituindo todos os entendimentos, negociações e acordos anteriores.\n\nQualquer alteração deste contrato somente será válida se feita por escrito e assinada por ambas as partes.\n\nA tolerância de qualquer das partes quanto ao descumprimento de obrigação pela outra não implicará renúncia ao direito de exigir o cumprimento da obrigação, nem constituirá novação ou precedente invocável.\n\nSe qualquer disposição deste contrato for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito.",
    },
    {
      title: "CLÁUSULA 10ª — DO FORO",
      text: "As partes elegem o foro da Comarca de São Paulo, Estado de São Paulo, para dirimir quaisquer questões oriundas deste contrato, renunciando a qualquer outro, por mais privilegiado que seja.\n\nE, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença das testemunhas abaixo.",
    },
  ];

  return (
    <>
      {/* Screen toolbar – hidden on print */}
      <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label={t("btn.back")}
            >
              <X className="h-5 w-5" />
            </button>
            <h1 className="text-sm sm:text-lg font-semibold text-foreground truncate">{t("contract.title")}</h1>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={handlePrint} className="px-2 sm:px-3">
              <Printer className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{t("contract.print")}</span>
            </Button>
            <Button size="sm" onClick={handleSavePdf} className="px-2 sm:px-3">
              <Download className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">{t("contract.savePdf")}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* A4 document container */}
      <div className="print:pt-0 pt-14 sm:pt-16 pb-8 bg-muted/30 print:bg-white min-h-screen">
        <div className="contract-pages-wrapper max-w-[210mm] mx-auto print:max-w-none px-3 sm:px-4 print:px-0">
          <div ref={docRef} className="contract-document bg-white print:shadow-none shadow-lg print:p-0 p-6 sm:p-[20mm] print:pt-0">

            {/* Header */}
            <div className="text-center mb-6 print:mb-5 pt-4 print:pt-[20mm]">
              <img src={timolLogo} alt="Timol" className="h-10 sm:h-12 mx-auto mb-3" />
              <div className="flex items-center justify-center gap-1.5">
                <img src={favicon} alt="" className="h-4 w-4" />
                <h1 className="contract-h1">{t("contract.heading")}</h1>
              </div>
            </div>

            {/* Franchisee data block */}
            <div className="mb-6 border border-border/50 rounded p-4 sm:p-5 bg-muted/20 print:bg-transparent print:border-foreground/20">
              <h2 className="contract-h2 mb-3">{t("contract.franchiseeData")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
                <ContractField label="ID" value={mockId} />
                <ContractField label={t("summary.fullName")} value={fullName} />
                <ContractField label={docLabel} value={doc} />
                <ContractField label={t("summary.birthDate")} value={birthDate} />
                <ContractField label={t("summary.email")} value={email} />
                <ContractField label={t("contract.address")} value={fullAddress} spanFull />
                <ContractField label={t("summary.franchiseChosen")} value={franchiseName} />
                <ContractField label={t("contract.acquisitionDate")} value={todayShort} />
                <ContractField label={t("contract.sponsor")} value={sponsorDisplay} spanFull />
              </div>
            </div>

            {/* Clauses */}
            <div className="contract-body space-y-3">
              {clauses.map((clause, i) => (
                <div key={i} className="contract-clause">
                  <h3 className="contract-h3">{clause.title}</h3>
                  <p className="whitespace-pre-line text-justify">{clause.text}</p>
                </div>
              ))}
            </div>

            {/* Signature block */}
            <div className="mt-12 pt-8 border-t border-foreground/20">
              <p className="text-sm text-center mb-10 text-muted-foreground">
                {t("contract.dateLocation").replace("{date}", dateStr)}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                <div className="text-center">
                  <div className="border-t border-foreground/40 pt-2 mx-4">
                    <p className="text-sm font-semibold">TIMOL SYSTEM LTDA.</p>
                    <p className="text-xs text-muted-foreground">FRANQUEADORA</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-foreground/40 pt-2 mx-4">
                    <p className="text-sm font-semibold">{fullName.toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">FRANQUEADO</p>
                  </div>
                </div>
              </div>

              {/* Witnesses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                <div className="text-center">
                  <div className="border-t border-foreground/40 pt-2 mx-8">
                    <p className="text-xs text-muted-foreground">{t("contract.witness")} 1</p>
                    <p className="text-xs text-muted-foreground">CPF: _______________</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-foreground/40 pt-2 mx-8">
                    <p className="text-xs text-muted-foreground">{t("contract.witness")} 2</p>
                    <p className="text-xs text-muted-foreground">CPF: _______________</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-muted-foreground print:hidden">
              — {t("contract.endOfDocument")} —
            </div>
          </div>
        </div>
      </div>

      {/* Contract typography & print styles */}
      <style>{`
        .contract-document {
          font-family: inherit;
          color: hsl(var(--foreground));
          line-height: 1.7;
        }
        .contract-h1 {
          font-size: 1.3rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          line-height: 1.3;
        }
        .contract-h2 {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: hsl(var(--foreground));
          line-height: 1.4;
        }
        .contract-h3 {
          font-size: 0.95rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          margin-bottom: 0.3rem;
          line-height: 1.4;
        }
        .contract-body {
          font-size: 0.875rem;
          line-height: 1.65;
          color: hsl(var(--foreground) / 0.9);
        }
        .contract-body p { margin-bottom: 0; }
        .contract-body ul, .contract-body ol { padding-left: 1.5rem; margin: 0.25rem 0; }
        .contract-body li { margin-bottom: 0.15rem; }
        .contract-body a { color: hsl(var(--primary)); text-decoration: underline; }
        .contract-body strong, .contract-body b { font-weight: 700; color: hsl(var(--foreground)); }

        @media print {
          @page { size: A4; margin: 20mm; }
          html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          body * { color: #000 !important; border-color: #888 !important; }
          img { filter: grayscale(100%) !important; }
          .contract-clause { break-inside: avoid; }
          .contract-document { padding: 0 !important; }
        }

        @media (max-width: 640px) {
          .contract-h1 { font-size: 1.1rem; }
        }

        @media (min-width: 1400px) {
          .contract-pages-wrapper { max-width: 210mm; }
        }
      `}</style>
    </>
  );
};

function ContractField({ label, value, spanFull }: { label: string; value: string; spanFull?: boolean }) {
  return (
    <div className={`flex gap-2 ${spanFull ? "sm:col-span-2" : ""}`}>
      <span className="text-muted-foreground font-medium flex-shrink-0">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
