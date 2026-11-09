import type { SegmentSlug } from './segments';

export type CaseStudy = {
  slug: string;
  name: string;
  kind: string;
  segments: readonly SegmentSlug[];
  summary: string;
  problem: string;
  solution: string;
  decisions: readonly string[];
  stack: readonly string[];
  /** Only set when it adds honest context (e.g. prototype vs. production). */
  status?: 'Em produção' | 'MVP';
};

const caseData = [
  {
    slug: 'talos',
    name: 'Ecossistema Talos',
    kind: 'Atendimento com IA no WhatsApp',
    segments: ['empresas'],
    summary:
      'Atendimento automatizado no WhatsApp com IA, montado em fluxos visuais que a equipe consegue revisar.',
    problem:
      'Empresas precisavam automatizar o atendimento no WhatsApp com respostas inteligentes, não roteiros fixos, e auditar milhares de etapas de automação sem se perder em listas.',
    solution:
      'Dois sistemas independentes: um motor que mantém as conexões do WhatsApp e processa a IA, e um painel com editor visual de fluxos em grafo, leitura de PDFs e coleta de dados da web.',
    decisions: [
      'Salvamento com debounce para manter centenas de nós do editor sincronizados com o banco sem sobrecarregar a API.',
      'Reconexão, heartbeat e limpeza de sessões órfãs no motor, evitando vazamento de memória com várias sessões simultâneas.',
    ],
    stack: ['Next.js', 'Express', 'Gemini', 'React Flow', 'Baileys', 'Supabase'],
    status: 'Em produção',
  },
  {
    slug: 'prazinho',
    name: 'Prazinho',
    kind: 'Gestão financeira para revenda',
    segments: ['microempreendedores'],
    summary:
      'Vendas a prazo, compras, estoque e fechamento do mês para pequenos revendedores, em um só lugar.',
    problem:
      'Pequenos revendedores que vendem parcelado no crediário próprio precisam saber, a qualquer momento, quanto têm em caixa, quanto vão receber e o que precisam repor.',
    solution:
      'Sistema web com vendas à vista e parceladas, compras de fornecedores que alimentam o estoque, aviso de reposição, fechamento mensal com metas e relatórios em PDF. As finanças pessoais ficam separadas das do negócio.',
    decisions: [
      'Row Level Security em todas as tabelas: cada conta enxerga apenas os próprios dados.',
      'Modo de demonstração com dados fictícios para apresentar o sistema sem tocar no banco.',
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Supabase', 'Vercel'],
    status: 'Em produção',
  },
  {
    slug: 'full-motion',
    name: 'Full Motion',
    kind: 'Gestão de studio de pilates',
    segments: ['empresas', 'microempreendedores'],
    summary:
      'Agenda de aulas, créditos de alunos, pagamentos e um portal para o aluno agendar sozinho.',
    problem:
      'Um studio de pilates precisava controlar turmas com vagas limitadas, planos por crédito e pagamentos, e dar aos alunos um jeito de marcar aula sem depender da recepção.',
    solution:
      'Sistema com dois perfis. O administrador gerencia calendário, alunos, pagamentos e relatórios. O aluno usa um portal instalável no celular para ver horários, agendar e acompanhar os créditos.',
    decisions: [
      'Permissões aplicadas no próprio banco, com Row Level Security e uma função de verificação de papel (administrador ou aluno).',
      'Perfil criado automaticamente por trigger a cada novo cadastro.',
    ],
    stack: ['React', 'TypeScript', 'Supabase', 'React Query', 'PWA'],
  },
  {
    slug: 'orcapro',
    name: 'OrçaPro',
    kind: 'Orçamentos em PDF',
    segments: ['profissionais', 'microempreendedores'],
    summary:
      'Orçamentos profissionais para freelancers e MEIs: cadastre clientes e serviços e gere o PDF com a sua marca.',
    problem:
      'Freelancers e MEIs perdem tempo montando orçamento à mão, e o documento final nem sempre transmite o profissionalismo do trabalho.',
    solution:
      'Cadastro de clientes e serviços, montagem do orçamento em poucos passos e PDF gerado com os dados da empresa.',
    decisions: [
      'PDF renderizado no navegador, sem servidor dedicado para gerar documentos.',
      'Tabelas e políticas de acesso versionadas em SQL junto com o código.',
    ],
    stack: ['React', 'Vite', 'Supabase', 'React PDF'],
    status: 'MVP',
  },
  {
    slug: 'agenda-link',
    name: 'AgendaLink',
    kind: 'Agendamento com pagamento',
    segments: ['profissionais', 'microempreendedores'],
    summary:
      'Agenda online para profissionais autônomos, do horário marcado ao pagamento confirmado.',
    problem:
      'Profissionais autônomos gastam horas por semana organizando horários, lidando com faltas e cobrando manualmente.',
    solution:
      'Página de agendamento com as regras do prestador e pagamento via Stripe Checkout, confirmado por webhook.',
    decisions: [
      'Constraints no PostgreSQL impedem que dois clientes reservem o mesmo horário ao mesmo tempo.',
      'Tratamento de fuso horário para profissionais e clientes em regiões diferentes.',
    ],
    stack: ['React', 'Vite', 'Supabase', 'Stripe', 'Edge Functions'],
    status: 'Em produção',
  },
] as const satisfies readonly CaseStudy[];

export type CaseSlug = (typeof caseData)[number]['slug'];

/** Widened to CaseStudy so optional fields (status) are readable on every item. */
export const cases: readonly CaseStudy[] = caseData;

const caseIndex = new Map<string, CaseStudy>(cases.map((item) => [item.slug, item]));

export const getCases = (slugs: readonly CaseSlug[]): CaseStudy[] =>
  slugs.flatMap((slug) => {
    const found = caseIndex.get(slug);
    return found ? [found] : [];
  });
