import { site } from '@/data/site';
import { segments } from '@/data/segments';
import { cases } from '@/data/cases';

/**
 * Plain-text index of the whole site for AI agents and crawlers (llms.txt convention).
 * Built from the same data as the pages, so it never drifts from what visitors read.
 */
export const buildLlmsTxt = (origin: string, contact: { email: string; whatsapp: string | null }): string => {
  const url = (path: string) => new URL(path, origin).href;
  const lines: string[] = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.name} é uma software house de ${site.city}, ${site.region}, que atende clientes em todo o Brasil.`,
    'O cliente fala direto com quem desenvolve. Escopo, prazo e valor são combinados por escrito antes de começar.',
    '',
    '## Contato',
    '',
    `- E-mail: ${contact.email}`,
    ...(contact.whatsapp ? [`- WhatsApp: https://wa.me/${contact.whatsapp}`] : []),
    `- Formulário: ${url('/#contato')}`,
    `- GitHub: ${site.githubUrl}`,
    '',
    '## Soluções por público',
    '',
  ];

  for (const segment of segments) {
    lines.push(`### ${segment.label}`, '', `${segment.headline} ${segment.lede}`, '', `Página: ${url(`/${segment.slug}`)}`, '');
    for (const offer of segment.offers) lines.push(`- ${offer.title}: ${offer.description}`);
    for (const pkg of segment.packages ?? []) {
      lines.push(`- Pacote "${pkg.name}" (${pkg.price ?? 'valor sob consulta'}): ${pkg.includes.join('; ')}.`);
    }
    lines.push('');
  }

  lines.push('## Cases', '');
  for (const item of cases) {
    lines.push(
      `### ${item.name} — ${item.kind}`,
      '',
      `${item.summary}`,
      '',
      `- Problema: ${item.problem}`,
      `- Solução: ${item.solution}`,
      ...item.decisions.map((decision) => `- Decisão técnica: ${decision}`),
      `- Stack: ${item.stack.join(', ')}`,
      ...(item.status ? [`- Status: ${item.status}`] : []),
      `- Página: ${url(`/cases/${item.slug}`)}`,
      '',
    );
  }

  lines.push('## Marca', '', `Logo, cores e regras de uso: ${url('/marca')}`, '');
  return lines.join('\n');
};
