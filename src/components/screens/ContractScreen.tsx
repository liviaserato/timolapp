import { Link } from "react-router-dom";
import { FileText, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import type { Language } from "@/i18n/translations";
import timolLogo from "@/assets/logo-timol-azul-escuro.svg";

type ContractSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type ContractContent = {
  sections: ContractSection[];
};

const contractContent: Record<Language, ContractContent> = {
  pt: {
    sections: [
      {
        title: "Cláusula 1 — Objeto",
        paragraphs: [
          "Este contrato trata da adesão do franqueado ao sistema TIMOL, permitindo sua participação na rede de negócios, a comercialização de produtos do portfólio da marca e a atuação conforme as diretrizes deste contrato e dos Documentos Complementares do sistema.",
        ],
      },
      {
        title: "Cláusula 2 — Definições",
        paragraphs: ["Para fins deste contrato, consideram-se:"],
        bullets: [
          "TIMOL: empresa responsável pela gestão do sistema de franquias, pela marca e pelos produtos comercializados na rede.",
          "Franqueado: pessoa que adere ao sistema TIMOL mediante aquisição de franquia e concordância com as regras deste contrato.",
          "Plataforma TIMOL: ambiente digital utilizado para cadastro, gestão da rede, acesso a informações, treinamentos e demais funcionalidades do sistema.",
          "Documentos Complementares: materiais oficiais que regulamentam o funcionamento do sistema, incluindo Plano de Marketing, Guia do Franqueado e políticas comerciais vigentes.",
        ],
      },
      {
        title: "Cláusula 3 — Natureza da relação",
        paragraphs: [
          "A relação entre as partes possui natureza empresarial, caracterizando-se como participação em sistema de franquia e rede de negócios.",
          "O franqueado atua como operador independente, sem vínculo empregatício, societário ou de representação comercial com a TIMOL.",
          "O sistema TIMOL opera em rede e não concede exclusividade territorial aos franqueados.",
        ],
      },
      {
        title: "Cláusula 4 — Adesão e aquisição da franquia",
        paragraphs: [
          "A adesão ao sistema TIMOL ocorre mediante aceitação deste contrato e pagamento do valor correspondente à aquisição da franquia.",
        ],
        bullets: [
          "A aquisição da franquia implica pagamento único pelo direito de ingresso no sistema.",
          "A franquia possui prazo indeterminado e poderá ser mantida enquanto forem observadas as condições previstas neste contrato.",
          "O valor pago não se caracteriza como investimento financeiro nem participação societária.",
          "Após a confirmação e ativação inicial da franquia, os valores pagos não são reembolsáveis, salvo hipóteses previstas em políticas comerciais específicas.",
          "Em caso de falecimento do titular, a franquia poderá ser transferida aos herdeiros legais mediante comprovação documental e inexistência de pendências contratuais.",
          "O inadimplemento relacionado à aquisição da franquia poderá ensejar suspensão ou cancelamento da franquia.",
        ],
      },
      {
        title: "Cláusula 5 — Ativação e manutenção da franquia",
        paragraphs: [
          "A manutenção da franquia depende do cumprimento das condições de ativação estabelecidas pela TIMOL.",
        ],
        bullets: [
          "A ativação ocorre mediante aquisição de produtos classificados pela empresa como produtos ativáveis.",
          "Nem todos os produtos do portfólio geram ativação.",
          "A condição de franquia ativa é requisito para participação no Plano de Marketing e recebimento de bonificações.",
          "A TIMOL poderá alterar critérios de ativação conforme políticas comerciais vigentes.",
          "A ausência de ativação poderá suspender benefícios comerciais até a regularização.",
          "O franqueado poderá adquirir produtos conforme seu interesse comercial e estratégia de atuação.",
          "A TIMOL não exige manutenção de estoque mínimo obrigatório, embora possa recomendar estoque adequado para atendimento aos clientes.",
        ],
      },
      {
        title: "Cláusula 6 — Remuneração e Plano de Marketing",
        paragraphs: [
          "O franqueado poderá participar do Plano de Marketing da TIMOL e fazer jus a eventuais bonificações, incentivos ou premiações conforme as regras vigentes.",
        ],
        bullets: [
          "As bonificações possuem natureza variável e dependem do desempenho individual.",
          "A TIMOL não garante qualquer nível mínimo de ganhos ou resultados financeiros.",
          "O Plano de Marketing poderá ser atualizado ou alterado a qualquer tempo.",
          "A remuneração está vinculada à comercialização efetiva de produtos do portfólio TIMOL.",
        ],
      },
      {
        title: "Cláusula 7 — Obrigações da TIMOL",
        paragraphs: ["Compete à TIMOL:"],
        bullets: [
          "disponibilizar acesso aos ambientes oficiais do sistema;",
          "fornecer ou disponibilizar produtos do portfólio;",
          "divulgar e manter atualizados os Documentos Complementares;",
          "disponibilizar materiais institucionais de apoio;",
          "efetuar o pagamento de bonificações quando atendidos os requisitos do sistema.",
        ],
      },
      {
        title: "Cláusula 8 — Obrigações do franqueado",
        paragraphs: ["Compete ao franqueado:"],
        bullets: [
          "atuar com ética e boa-fé;",
          "respeitar as regras do sistema;",
          "manter seus dados atualizados;",
          "seguir as políticas comerciais vigentes;",
          "não prometer ganhos financeiros em nome da empresa;",
          "não divulgar benefícios dos produtos além do autorizado nos materiais oficiais;",
          "não utilizar a marca TIMOL sem autorização;",
          "não produzir materiais promocionais próprios utilizando a marca;",
          "não utilizar a rede TIMOL para promover outros sistemas de marketing multinível.",
        ],
      },
      {
        title: "Cláusula 9 — Uso da marca",
        paragraphs: [
          "A marca TIMOL e seus sinais distintivos são de propriedade exclusiva da franqueadora.",
          "O franqueado poderá compartilhar apenas materiais oficiais disponibilizados pela empresa.",
          "É proibida a criação ou divulgação de materiais próprios contendo a marca sem autorização expressa.",
        ],
      },
      {
        title: "Cláusula 10 — Documentos Complementares",
        paragraphs: [
          "O funcionamento do sistema TIMOL será regulamentado também pelos Documentos Complementares, incluindo:",
        ],
        bullets: [
          "Plano de Marketing;",
          "Guia do Franqueado;",
          "políticas comerciais;",
          "comunicados oficiais.",
        ],
      },
      {
        title: "Cláusula 11 — Proteção de dados",
        paragraphs: [
          "As partes comprometem-se a cumprir a legislação aplicável à proteção de dados pessoais, incluindo a Lei Geral de Proteção de Dados (LGPD).",
          "O franqueado não poderá utilizar dados obtidos no sistema para finalidades alheias ao funcionamento da rede.",
        ],
      },
      {
        title: "Cláusula 12 — Prazo e vigência",
        paragraphs: [
          "O contrato possui prazo indeterminado e permanecerá válido enquanto observadas as condições previstas neste documento.",
        ],
      },
      {
        title: "Cláusula 13 — Rescisão",
        paragraphs: ["A franquia poderá ser cancelada em casos como:"],
        bullets: [
          "inadimplência;",
          "descumprimento contratual;",
          "uso indevido da marca;",
          "divulgação de informações falsas;",
          "tentativa de aliciamento da rede para sistemas concorrentes.",
        ],
      },
      {
        title: "Cláusula 14 — Disposições gerais",
        paragraphs: [
          "O franqueado atua de forma independente, assumindo os riscos e responsabilidades de sua atividade comercial.",
          "O eventual encerramento das atividades empresariais da TIMOL implicará o encerramento automático deste contrato.",
        ],
      },
      {
        title: "Cláusula 15 — Aceite eletrônico",
        paragraphs: [
          "A aceitação deste contrato poderá ocorrer por meio eletrônico, inclusive mediante confirmação digital na Plataforma TIMOL.",
          "O registro do aceite poderá incluir data, hora, identificação do usuário, endereço de IP e versão do contrato vigente.",
          "O aceite eletrônico possui a mesma validade jurídica que a assinatura física ou digital.",
        ],
      },
    ],
  },
  en: {
    sections: [
      {
        title: "Clause 1 — Purpose",
        paragraphs: [
          "This agreement governs the franchisee's adherence to the TIMOL system, allowing participation in the business network, commercialization of products in the brand portfolio, and operation under the guidelines of this agreement and the system's Complementary Documents.",
        ],
      },
      {
        title: "Clause 2 — Definitions",
        paragraphs: ["For the purposes of this agreement, the following definitions apply:"],
        bullets: [
          "TIMOL: company responsible for managing the franchise system, the brand, and the products commercialized in the network.",
          "Franchisee: person who joins the TIMOL system by purchasing a franchise and agreeing to the rules set out in this agreement.",
          "TIMOL Platform: digital environment used for registration, network management, access to information, training, and other system features.",
          "Complementary Documents: official materials that regulate the operation of the system, including the Marketing Plan, Franchisee Guide, and current commercial policies.",
        ],
      },
      {
        title: "Clause 3 — Nature of the relationship",
        paragraphs: [
          "The relationship between the parties is of a business nature, characterized as participation in a franchise system and business network.",
          "The franchisee acts as an independent operator, with no employment, corporate, or commercial representation relationship with TIMOL.",
          "The TIMOL system operates as a network and does not grant territorial exclusivity to franchisees.",
        ],
      },
      {
        title: "Clause 4 — Joining and purchasing the franchise",
        paragraphs: [
          "Joining the TIMOL system occurs through acceptance of this agreement and payment of the amount corresponding to the franchise acquisition.",
        ],
        bullets: [
          "The franchise purchase implies a one-time payment for the right to enter the system.",
          "The franchise has an indefinite term and may be maintained as long as the conditions set out in this agreement are observed.",
          "The amount paid does not constitute a financial investment or equity participation.",
          "After the initial confirmation and activation of the franchise, the amounts paid are non-refundable, except where provided for in specific commercial policies.",
          "In the event of the holder's death, the franchise may be transferred to legal heirs upon documentary proof and provided there are no contractual pending issues.",
          "Default related to the franchise acquisition may result in suspension or cancellation of the franchise.",
        ],
      },
      {
        title: "Clause 5 — Franchise activation and maintenance",
        paragraphs: [
          "Maintaining the franchise depends on meeting the activation conditions established by TIMOL.",
        ],
        bullets: [
          "Activation occurs through the acquisition of products classified by the company as activation products.",
          "Not all products in the portfolio generate activation.",
          "Active franchise status is required for participation in the Marketing Plan and receipt of bonuses.",
          "TIMOL may change activation criteria according to current commercial policies.",
          "Lack of activation may suspend commercial benefits until regularization.",
          "The franchisee may purchase products according to their commercial interest and operating strategy.",
          "TIMOL does not require mandatory minimum stock, although it may recommend adequate stock to serve customers.",
        ],
      },
      {
        title: "Clause 6 — Compensation and Marketing Plan",
        paragraphs: [
          "The franchisee may participate in the TIMOL Marketing Plan and be entitled to bonuses, incentives, or awards according to the rules in force.",
        ],
        bullets: [
          "Bonuses are variable in nature and depend on individual performance.",
          "TIMOL does not guarantee any minimum level of earnings or financial results.",
          "The Marketing Plan may be updated or changed at any time.",
          "Compensation is linked to the effective commercialization of products from the TIMOL portfolio.",
        ],
      },
      {
        title: "Clause 7 — TIMOL obligations",
        paragraphs: ["TIMOL shall:"],
        bullets: [
          "provide access to the system's official environments;",
          "supply or make available products from the portfolio;",
          "publish and keep the Complementary Documents updated;",
          "provide institutional support materials;",
          "pay bonuses when the system requirements are met.",
        ],
      },
      {
        title: "Clause 8 — Franchisee obligations",
        paragraphs: ["The franchisee shall:"],
        bullets: [
          "act ethically and in good faith;",
          "respect the system rules;",
          "keep their data updated;",
          "follow the current commercial policies;",
          "not promise financial gains on behalf of the company;",
          "not disclose product benefits beyond what is authorized in official materials;",
          "not use the TIMOL brand without authorization;",
          "not produce their own promotional materials using the brand;",
          "not use the TIMOL network to promote other multi-level marketing systems.",
        ],
      },
      {
        title: "Clause 9 — Use of the brand",
        paragraphs: [
          "The TIMOL brand and its distinctive signs are the exclusive property of the franchisor.",
          "The franchisee may share only official materials provided by the company.",
          "Creating or distributing their own materials containing the brand without express authorization is prohibited.",
        ],
      },
      {
        title: "Clause 10 — Complementary Documents",
        paragraphs: [
          "The operation of the TIMOL system is also governed by the Complementary Documents, including:",
        ],
        bullets: [
          "Marketing Plan;",
          "Franchisee Guide;",
          "commercial policies;",
          "official notices.",
        ],
      },
      {
        title: "Clause 11 — Data protection",
        paragraphs: [
          "The parties undertake to comply with the legislation applicable to personal data protection, including the General Data Protection Law (LGPD).",
          "The franchisee may not use data obtained through the system for purposes unrelated to the operation of the network.",
        ],
      },
      {
        title: "Clause 12 — Term and validity",
        paragraphs: [
          "This agreement has an indefinite term and remains valid as long as the conditions set out in this document are observed.",
        ],
      },
      {
        title: "Clause 13 — Termination",
        paragraphs: ["The franchise may be canceled in cases such as:"],
        bullets: [
          "default;",
          "breach of contract;",
          "misuse of the brand;",
          "disclosure of false information;",
          "attempting to lure the network to competing systems.",
        ],
      },
      {
        title: "Clause 14 — General provisions",
        paragraphs: [
          "The franchisee acts independently and assumes the risks and responsibilities of their business activity.",
          "Any termination of TIMOL's business activities will result in the automatic termination of this agreement.",
        ],
      },
      {
        title: "Clause 15 — Electronic acceptance",
        paragraphs: [
          "Acceptance of this agreement may occur electronically, including by digital confirmation on the TIMOL Platform.",
          "The record of acceptance may include date, time, user identification, IP address, and the version of the agreement in force.",
          "Electronic acceptance has the same legal validity as a physical or digital signature.",
        ],
      },
    ],
  },
  es: {
    sections: [
      {
        title: "Cláusula 1 — Objeto",
        paragraphs: [
          "Este contrato regula la adhesión del franquiciado al sistema TIMOL, permitiéndole participar en la red de negocios, comercializar productos del portafolio de la marca y actuar conforme a las directrices de este contrato y de los Documentos Complementarios del sistema.",
        ],
      },
      {
        title: "Cláusula 2 — Definiciones",
        paragraphs: ["Para fines de este contrato, se consideran:"],
        bullets: [
          "TIMOL: empresa responsable de la gestión del sistema de franquicias, de la marca y de los productos comercializados en la red.",
          "Franquiciado: persona que se adhiere al sistema TIMOL mediante la adquisición de una franquicia y la aceptación de las reglas establecidas en este contrato.",
          "Plataforma TIMOL: entorno digital utilizado para el registro, la gestión de la red, el acceso a información, capacitaciones y demás funcionalidades del sistema.",
          "Documentos Complementarios: materiales oficiales que regulan el funcionamiento del sistema, incluidos el Plan de Marketing, la Guía del Franquiciado y las políticas comerciales vigentes.",
        ],
      },
      {
        title: "Cláusula 3 — Naturaleza de la relación",
        paragraphs: [
          "La relación entre las partes tiene naturaleza empresarial y se caracteriza como participación en un sistema de franquicia y red de negocios.",
          "El franquiciado actúa como operador independiente, sin vínculo laboral, societario o de representación comercial con TIMOL.",
          "El sistema TIMOL opera en red y no concede exclusividad territorial a los franquiciados.",
        ],
      },
      {
        title: "Cláusula 4 — Adhesión y adquisición de la franquicia",
        paragraphs: [
          "La adhesión al sistema TIMOL ocurre mediante la aceptación de este contrato y el pago del importe correspondiente a la adquisición de la franquicia.",
        ],
        bullets: [
          "La adquisición de la franquicia implica un pago único por el derecho de ingreso al sistema.",
          "La franquicia tiene plazo indefinido y podrá mantenerse mientras se cumplan las condiciones previstas en este contrato.",
          "El importe pagado no constituye inversión financiera ni participación societaria.",
          "Después de la confirmación y activación inicial de la franquicia, los importes pagados no son reembolsables, salvo los casos previstos en políticas comerciales específicas.",
          "En caso de fallecimiento del titular, la franquicia podrá transferirse a los herederos legales mediante comprobación documental y ausencia de pendientes contractuales.",
          "El incumplimiento relacionado con la adquisición de la franquicia podrá dar lugar a la suspensión o cancelación de la franquicia.",
        ],
      },
      {
        title: "Cláusula 5 — Activación y mantenimiento de la franquicia",
        paragraphs: [
          "El mantenimiento de la franquicia depende del cumplimiento de las condiciones de activación establecidas por TIMOL.",
        ],
        bullets: [
          "La activación ocurre mediante la adquisición de productos clasificados por la empresa como productos activables.",
          "No todos los productos del portafolio generan activación.",
          "La condición de franquicia activa es requisito para participar en el Plan de Marketing y recibir bonificaciones.",
          "TIMOL podrá modificar los criterios de activación según las políticas comerciales vigentes.",
          "La falta de activación podrá suspender beneficios comerciales hasta la regularización.",
          "El franquiciado podrá adquirir productos según su interés comercial y estrategia de actuación.",
          "TIMOL no exige mantenimiento de stock mínimo obligatorio, aunque podrá recomendar un stock adecuado para atender a los clientes.",
        ],
      },
      {
        title: "Cláusula 6 — Remuneración y Plan de Marketing",
        paragraphs: [
          "El franquiciado podrá participar en el Plan de Marketing de TIMOL y tener derecho a eventuales bonificaciones, incentivos o premios conforme a las reglas vigentes.",
        ],
        bullets: [
          "Las bonificaciones tienen naturaleza variable y dependen del desempeño individual.",
          "TIMOL no garantiza ningún nivel mínimo de ingresos o resultados financieros.",
          "El Plan de Marketing podrá actualizarse o modificarse en cualquier momento.",
          "La remuneración está vinculada a la comercialización efectiva de productos del portafolio TIMOL.",
        ],
      },
      {
        title: "Cláusula 7 — Obligaciones de TIMOL",
        paragraphs: ["Corresponde a TIMOL:"],
        bullets: [
          "poner a disposición acceso a los entornos oficiales del sistema;",
          "suministrar o poner a disposición productos del portafolio;",
          "divulgar y mantener actualizados los Documentos Complementarios;",
          "poner a disposición materiales institucionales de apoyo;",
          "efectuar el pago de bonificaciones cuando se cumplan los requisitos del sistema.",
        ],
      },
      {
        title: "Cláusula 8 — Obligaciones del franquiciado",
        paragraphs: ["Corresponde al franquiciado:"],
        bullets: [
          "actuar con ética y buena fe;",
          "respetar las reglas del sistema;",
          "mantener sus datos actualizados;",
          "seguir las políticas comerciales vigentes;",
          "no prometer ganancias financieras en nombre de la empresa;",
          "no divulgar beneficios de los productos más allá de lo autorizado en los materiales oficiales;",
          "no utilizar la marca TIMOL sin autorización;",
          "no producir materiales promocionales propios utilizando la marca;",
          "no utilizar la red TIMOL para promover otros sistemas de marketing multinivel.",
        ],
      },
      {
        title: "Cláusula 9 — Uso de la marca",
        paragraphs: [
          "La marca TIMOL y sus signos distintivos son propiedad exclusiva de la franquiciadora.",
          "El franquiciado podrá compartir únicamente materiales oficiales puestos a disposición por la empresa.",
          "Se prohíbe crear o divulgar materiales propios que contengan la marca sin autorización expresa.",
        ],
      },
      {
        title: "Cláusula 10 — Documentos Complementarios",
        paragraphs: [
          "El funcionamiento del sistema TIMOL también se regirá por los Documentos Complementarios, incluidos:",
        ],
        bullets: [
          "Plan de Marketing;",
          "Guía del Franquiciado;",
          "políticas comerciales;",
          "comunicados oficiales.",
        ],
      },
      {
        title: "Cláusula 11 — Protección de datos",
        paragraphs: [
          "Las partes se comprometen a cumplir la legislación aplicable sobre protección de datos personales, incluida la Ley General de Protección de Datos (LGPD).",
          "El franquiciado no podrá utilizar los datos obtenidos en el sistema para finalidades ajenas al funcionamiento de la red.",
        ],
      },
      {
        title: "Cláusula 12 — Plazo y vigencia",
        paragraphs: [
          "El contrato tiene plazo indefinido y permanecerá válido mientras se cumplan las condiciones previstas en este documento.",
        ],
      },
      {
        title: "Cláusula 13 — Rescisión",
        paragraphs: ["La franquicia podrá cancelarse en casos como:"],
        bullets: [
          "morosidad;",
          "incumplimiento contractual;",
          "uso indebido de la marca;",
          "divulgación de información falsa;",
          "intento de captar la red para sistemas competidores.",
        ],
      },
      {
        title: "Cláusula 14 — Disposiciones generales",
        paragraphs: [
          "El franquiciado actúa de forma independiente y asume los riesgos y responsabilidades de su actividad comercial.",
          "El eventual cese de las actividades empresariales de TIMOL implicará la terminación automática de este contrato.",
        ],
      },
      {
        title: "Cláusula 15 — Aceptación electrónica",
        paragraphs: [
          "La aceptación de este contrato podrá ocurrir por medios electrónicos, incluso mediante confirmación digital en la Plataforma TIMOL.",
          "El registro de la aceptación podrá incluir fecha, hora, identificación del usuario, dirección IP y versión vigente del contrato.",
          "La aceptación electrónica tiene la misma validez jurídica que la firma física o digital.",
        ],
      },
    ],
  },
};

export const ContractScreen = () => {
  const { language, t } = useLanguage();

  const content = contractContent[language];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-muted/20">
      <header className="z-20 shrink-0 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <img src={timolLogo} alt="Timol" className="h-10 w-fit" />
          <Button asChild variant="outline" size="sm" className="w-full justify-center sm:w-auto">
            <Link to="/cadastro">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("contract.back")}
            </Link>
          </Button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              {t("contract.notice")}
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
                {t("contract.title")}
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                {t("contract.intro")}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            {content.sections.map((section, index) => (
              <section
                key={section.title}
                className={index === 0 ? "space-y-3" : "space-y-3 border-t border-border/60 pt-6"}
              >
                <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                  {section.title}
                </h2>

                <div className="space-y-3">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-6 text-foreground/90 sm:text-[15px]">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.bullets && (
                  <ul className="space-y-2 text-sm leading-6 text-foreground/90 sm:text-[15px]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="border-t border-border/60 pb-8 pt-5 sm:pb-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {t("contract.endOfDocument")}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
