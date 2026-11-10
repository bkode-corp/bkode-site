import type { CaseSlug } from './cases';

export type SegmentSlug = 'empresas' | 'microempreendedores' | 'profissionais' | 'estudantes';

/** Value persisted in `leads.segment` — must match the DB check constraint. */
export type LeadSegment = 'empresa' | 'microempreendedor' | 'profissional' | 'estudante';

export type Example = {
  /** Short tab label on segment pages. */
  tag: string;
  problem: string;
  outputs: readonly [string, string, string];
};

export type Offer = { title: string; description: string };

/** Productized offer with a fixed scope: one-off setup plus a monthly fee. */
export type Package = {
  name: string;
  summary: string;
  includes: readonly string[];
  /** One-off setup, display string (e.g. "R$ 1.200"). */
  price?: string;
  /** Recurring fee, display string (e.g. "R$ 39/mês"). */
  monthly?: string;
  /** What the monthly fee pays for. */
  monthlyCovers?: string;
};

export type Segment = {
  slug: SegmentSlug;
  leadValue: LeadSegment;
  label: string;
  /** Short form used in the "Eu sou…" selector. */
  persona: string;
  audience: string;
  headline: string;
  lede: string;
  offers: readonly Offer[];
  examples: readonly [Example, ...Example[]];
  caseSlugs: readonly CaseSlug[];
  packages?: readonly Package[];
  seo: { title: string; description: string };
};

const segmentData = [
  {
    slug: 'empresas',
    leadValue: 'empresa',
    label: 'Empresas',
    persona: 'Empresa',
    audience: 'Para quem cresceu em planilhas, grupos de WhatsApp e sistemas que não conversam entre si.',
    headline: 'Atendimento automatizado e operação em um sistema só.',
    lede:
      'Automatizamos o atendimento com IA, construímos sistemas internos para o processo que vocês já têm e conectamos as ferramentas que hoje exigem copiar e colar.',
    offers: [
      {
        title: 'Atendimento com IA no WhatsApp',
        description:
          'Respostas automáticas treinadas nos documentos da empresa, fluxos que a equipe edita e transferência para um atendente quando necessário.',
      },
      {
        title: 'Sistemas internos sob medida',
        description: 'Cadastros, painéis e permissões desenhados em cima do processo real da equipe.',
      },
      {
        title: 'Integrações',
        description: 'Pagamentos, planilhas e sistemas existentes trocando dados sem retrabalho manual.',
      },
      {
        title: 'Painéis e relatórios',
        description: 'Indicadores do negócio sempre atualizados, sem montar planilha no fim do mês.',
      },
    ],
    examples: [
      {
        tag: 'Atendimento',
        problem: 'Nosso WhatsApp recebe mais mensagens do que a equipe consegue responder.',
        outputs: [
          'Atendente com IA treinado nos documentos da empresa',
          'Fluxos de conversa editáveis em um painel visual',
          'Transferência para uma pessoa quando a IA não souber',
        ],
      },
      {
        tag: 'Operação',
        problem: 'Cada setor controla tudo em uma planilha diferente.',
        outputs: [
          'Sistema único com cadastro central',
          'Permissões por setor e por pessoa',
          'Relatórios gerados automaticamente',
        ],
      },
    ],
    caseSlugs: ['talos', 'full-motion'],
    seo: {
      title: 'Sistemas e automação com IA para empresas',
      description:
        'Atendimento com IA no WhatsApp, sistemas internos sob medida, integrações e painéis para empresas. Desenvolvido pela BKode, em Belém.',
    },
  },
  {
    slug: 'microempreendedores',
    leadValue: 'microempreendedor',
    label: 'Microempreendedores',
    persona: 'Microempreendedor',
    audience: 'Para MEIs e pequenos negócios que querem saber quanto entra, quanto sai e quem ainda deve.',
    headline: 'Vendas, agenda e orçamento sem caderno nem planilha.',
    lede:
      'Sistemas simples de usar no celular para controlar vendas a prazo, receber agendamentos e mandar orçamento com cara profissional.',
    offers: [
      {
        title: 'Controle de vendas e estoque',
        description: 'Vendas à vista e parceladas, contas a receber e a pagar, estoque com aviso de reposição.',
      },
      {
        title: 'Agendamento online',
        description: 'Seus clientes marcam horário sozinhos, com confirmação e pagamento na hora.',
      },
      {
        title: 'Orçamentos com a sua marca',
        description: 'Orçamento em PDF montado em minutos a partir do seu catálogo de serviços.',
      },
      {
        title: 'Site do seu negócio',
        description: 'Um site rápido, que aparece no Google e leva o cliente direto para o seu WhatsApp.',
      },
    ],
    examples: [
      {
        tag: 'Vendas a prazo',
        problem: 'Vendo a prazo e anoto tudo num caderno.',
        outputs: [
          'Vendas parceladas com a data de cada parcela',
          'Lista de quem está com pagamento atrasado',
          'Estoque com aviso de reposição',
        ],
      },
      {
        tag: 'Agenda',
        problem: 'Passo o dia respondendo se ainda tem horário amanhã.',
        outputs: [
          'Página de agendamento com seus horários livres',
          'Pagamento ou sinal no momento da marcação',
          'Confirmação automática para o cliente',
        ],
      },
    ],
    caseSlugs: ['prazinho', 'agenda-link', 'orcapro'],
    packages: [
      {
        name: 'Site do negócio',
        summary: 'Para ser encontrado no Google e receber cliente direto no WhatsApp.',
        includes: [
          'Página com serviços, horários e localização',
          'Botão direto para o seu WhatsApp',
          'Configuração para aparecer nas buscas do Google',
          'Publicação no seu domínio',
        ],
        price: 'R$ 1.200',
        monthly: 'R$ 39/mês',
        monthlyCovers: 'Hospedagem, domínio e ajustes de texto e fotos.',
      },
      {
        name: 'Agenda online',
        summary: 'Para parar de responder "ainda tem horário amanhã?" o dia inteiro.',
        includes: [
          'Página de agendamento com os seus horários livres',
          'Confirmação automática para o cliente',
          'Sinal ou pagamento no momento da marcação',
          'Painel para você ver e remarcar a agenda',
        ],
        price: 'R$ 900',
        monthly: 'R$ 79/mês',
        monthlyCovers: 'Servidor, banco de dados, backups e suporte.',
      },
      {
        name: 'Controle de vendas',
        summary: 'Para trocar o caderno do fiado por um sistema no celular.',
        includes: [
          'Vendas à vista e parceladas',
          'Lista de quem está com pagamento atrasado',
          'Estoque com aviso de reposição',
          'Fechamento do mês em PDF',
        ],
        price: 'R$ 900',
        monthly: 'R$ 79/mês',
        monthlyCovers: 'Servidor, banco de dados, backups e suporte.',
      },
    ],
    seo: {
      title: 'Sistemas para MEI e pequenos negócios',
      description:
        'Controle de vendas a prazo, agendamento online, orçamentos em PDF e sites para microempreendedores. Desenvolvido pela BKode, em Belém.',
    },
  },
  {
    slug: 'profissionais',
    leadValue: 'profissional',
    label: 'Profissionais',
    persona: 'Profissional',
    audience: 'Para autônomos, freelancers e profissionais que perdem horas com tarefa repetida.',
    headline: 'Automatize a parte repetitiva do seu trabalho.',
    lede:
      'Orçamentos, agenda, relatórios e documentos que hoje tomam horas da sua semana podem ser montados por um sistema feito para o seu jeito de trabalhar.',
    offers: [
      {
        title: 'Orçamentos e propostas',
        description: 'Catálogo de serviços com preço e documento pronto para enviar ao cliente.',
      },
      {
        title: 'Agenda e cobrança',
        description: 'Horários, confirmações e pagamentos organizados sem troca de mensagens.',
      },
      {
        title: 'Automação de rotina',
        description: 'Planilhas, e-mails e relatórios que se montam sozinhos a partir dos seus dados.',
      },
      {
        title: 'Documentos com IA',
        description: 'Transcrição de reuniões e relatórios gerados a partir de gravações, com sua revisão.',
      },
    ],
    examples: [
      {
        tag: 'Orçamentos',
        problem: 'Perco horas montando orçamento no Word.',
        outputs: [
          'Catálogo dos seus serviços com preço',
          'Orçamento em PDF com sua marca em minutos',
          'Histórico de orçamentos por cliente',
        ],
      },
      {
        tag: 'Relatórios',
        problem: 'Toda semana monto o mesmo relatório à mão.',
        outputs: [
          'Coleta automática dos dados de origem',
          'Relatório no formato que você já usa',
          'Envio programado por e-mail',
        ],
      },
    ],
    caseSlugs: ['orcapro', 'agenda-link'],
    seo: {
      title: 'Automação e ferramentas para profissionais e autônomos',
      description:
        'Orçamentos, agenda, automação de relatórios e documentos com IA para profissionais e autônomos. Desenvolvido pela BKode, em Belém.',
    },
  },
  {
    slug: 'estudantes',
    leadValue: 'estudante',
    label: 'Estudantes',
    persona: 'Estudante',
    audience: 'Para quem quer aprender fazendo, mostrar o que sabe e estudar com ferramentas melhores.',
    headline: 'Do primeiro projeto ao primeiro emprego em tecnologia.',
    lede:
      'Mentoria técnica para destravar seus projetos, portfólio profissional publicado e ferramentas com IA para revisar o que você estudou.',
    offers: [
      {
        title: 'Mentoria em desenvolvimento',
        description: 'Revisão de código, trilha de estudo e acompanhamento para tirar seus projetos do papel.',
      },
      {
        title: 'Portfólio profissional',
        description: 'Site pessoal e repositórios organizados para mostrar o que você sabe fazer.',
      },
      {
        title: 'Ferramentas de estudo com IA',
        description: 'Transcrição de aulas gravadas e resumos estruturados por tópico.',
      },
    ],
    examples: [
      {
        tag: 'Portfólio',
        problem: 'Sei programar, mas ninguém vê o que eu faço.',
        outputs: [
          'Site de portfólio com seus projetos',
          'Repositórios organizados e documentados',
          'Domínio próprio e publicação na Vercel',
        ],
      },
      {
        tag: 'Estudo',
        problem: 'Gravo as aulas, mas nunca consigo revisar.',
        outputs: [
          'Transcrição automática das gravações',
          'Resumo estruturado por tópico',
          'Material pronto para revisar antes da prova',
        ],
      },
    ],
    caseSlugs: [],
    seo: {
      title: 'Mentoria, portfólio e ferramentas de estudo para estudantes',
      description:
        'Mentoria em desenvolvimento, portfólio profissional e ferramentas de estudo com IA para estudantes. BKode, Belém.',
    },
  },
] as const satisfies readonly Segment[];

/** Widened to Segment so optional fields (packages) are readable on every item. */
export const segments: readonly Segment[] = segmentData;

const segmentIndex = new Map<string, Segment>(segments.map((item) => [item.slug, item]));

export const getSegment = (slug: string): Segment | undefined => segmentIndex.get(slug);

export const segmentLabelBySlug = (slug: SegmentSlug): string => segmentIndex.get(slug)?.label ?? slug;
