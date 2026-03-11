import type { TicketDetail } from "./TicketDetailDialog";

export const mockTicketsDetalhados: TicketDetail[] = [
  {
    id: "1",
    numero: "#00142",
    assunto: "Dúvida sobre pontos acumulados",
    categoria: "Bônus e Pontos",
    status: "em_andamento",
    descricaoInicial:
      "Olá, percebi que meus pontos do mês de fevereiro não foram contabilizados. Comprei dois combos e deveria ter recebido pelo menos 200 pontos, mas meu saldo continua o mesmo.",
    dataAbertura: "06/03/2026",
    ultimaAtualizacao: "08/03/2026",
    historico: [
      {
        id: "h1",
        autor: "usuario",
        nomeAutor: "Você",
        mensagem:
          "Olá, percebi que meus pontos do mês de fevereiro não foram contabilizados. Comprei dois combos e deveria ter recebido pelo menos 200 pontos.",
        dataHora: "06/03/2026 14:32",
      },
      {
        id: "h2",
        autor: "equipe",
        nomeAutor: "Equipe Timol",
        mensagem:
          "Olá! Obrigado por entrar em contato. Estamos verificando o histórico de pontuação da sua conta. Em breve retornaremos com a análise completa.",
        dataHora: "07/03/2026 09:15",
      },
      {
        id: "h3",
        autor: "equipe",
        nomeAutor: "Equipe Timol",
        mensagem:
          "Identificamos que houve um atraso na integração dos pedidos de fevereiro. Os pontos estão sendo recalculados e serão creditados em até 48h.",
        dataHora: "08/03/2026 11:40",
      },
    ],
  },
  {
    id: "2",
    numero: "#00138",
    assunto: "Erro no pagamento do pedido",
    categoria: "Financeiro",
    status: "concluido",
    descricaoInicial:
      "Tentei efetuar o pagamento do pedido #4521 via cartão de crédito, mas a transação retornou um erro genérico. O valor não foi debitado, porém o pedido ficou travado no sistema.",
    dataAbertura: "02/03/2026",
    ultimaAtualizacao: "05/03/2026",
    historico: [
      {
        id: "h4",
        autor: "usuario",
        nomeAutor: "Você",
        mensagem:
          "Tentei efetuar o pagamento do pedido #4521 via cartão de crédito, mas a transação retornou um erro genérico.",
        dataHora: "02/03/2026 16:05",
      },
      {
        id: "h5",
        autor: "equipe",
        nomeAutor: "Equipe Timol",
        mensagem:
          "Olá! Verificamos que houve uma instabilidade temporária no gateway de pagamento. O pedido foi liberado e você já pode tentar novamente.",
        dataHora: "03/03/2026 10:20",
      },
      {
        id: "h6",
        autor: "usuario",
        nomeAutor: "Você",
        mensagem: "Consegui realizar o pagamento agora. Muito obrigado pela agilidade!",
        dataHora: "03/03/2026 14:50",
      },
      {
        id: "h7",
        autor: "equipe",
        nomeAutor: "Equipe Timol",
        mensagem:
          "Que bom! Ficamos felizes em ajudar. Caso precise de algo mais, estamos à disposição. Chamado encerrado.",
        dataHora: "05/03/2026 09:00",
      },
    ],
  },
  {
    id: "3",
    numero: "#00105",
    assunto: "Alteração de endereço de entrega",
    categoria: "Cadastro",
    status: "arquivado",
    descricaoInicial: "Preciso alterar meu endereço de entrega para um novo local.",
    dataAbertura: "10/01/2026",
    ultimaAtualizacao: "12/01/2026",
    historico: [
      {
        id: "h8",
        autor: "usuario",
        nomeAutor: "Você",
        mensagem: "Preciso alterar meu endereço de entrega para Rua das Flores, 123.",
        dataHora: "10/01/2026 08:00",
      },
      {
        id: "h9",
        autor: "equipe",
        nomeAutor: "Equipe Timol",
        mensagem: "Endereço atualizado com sucesso! Chamado encerrado.",
        dataHora: "12/01/2026 10:30",
      },
    ],
  },
];
