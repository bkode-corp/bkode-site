export const site = {
  name: 'BKode',
  legalName: 'BKode Tecnologia',
  tagline: 'Você descreve o problema. A gente escreve o sistema.',
  description:
    'A BKode desenvolve sistemas, automações com IA e sites para empresas, microempreendedores, profissionais e estudantes. De Belém para todo o Brasil.',
  city: 'Belém',
  region: 'PA',
  country: 'BR',
  /** Public business inbox. PUBLIC_CONTACT_EMAIL overrides it (e.g. contato@<domínio> once the domain exists). */
  email: 'bkode.corp@gmail.com',
  githubUrl: 'https://github.com/bkode-corp',
  foundedYear: 2026,
} as const;

export const nav = [
  { label: 'Soluções', href: '/#solucoes' },
  { label: 'Cases', href: '/cases' },
  { label: 'Processo', href: '/#processo' },
  { label: 'Marca', href: '/marca' },
] as const;
