# bkode-site

Site institucional da BKode. Astro (HTML estático por página) + Tailwind v4 + ilhas React, publicado na Vercel.

## Rodar

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # astro check + build (.vercel/output)
```

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Textos por público, ofertas, pacotes e preços | `src/data/segments.ts` |
| Cases | `src/data/cases.ts` |
| Nome, e-mail, cidade, menu | `src/data/site.ts` |
| Geometria do logo (fonte única para site, downloads e imagens) | `src/lib/brand.ts` |
| Tokens visuais (cores Zinc, grid, linhas de construção) | `src/styles/global.css` |

Preço de pacote: preencha `price` em `segments.ts` (ex.: `price: 'a partir de R$ 900'`). Sem ele, o card mostra "Valor fechado antes de começar".

## Rotas

- `/`, `/empresas`, `/microempreendedores`, `/profissionais`, `/estudantes`
- `/cases` e `/cases/[slug]`
- `/marca`: versões do logo, cores, regras e downloads em `/brand/*.svg` (gerados no build a partir de `brand.ts`)
- `/llms.txt` e `/ai`: índice do site em texto puro para agentes de IA, montado dos mesmos dados das páginas
- `/api/lead`: grava o formulário no Supabase (função serverless; o resto é estático)

## Variáveis de ambiente

Veja `.env.example`. Todas são opcionais:

- `PUBLIC_WHATSAPP_NUMBER`: liga os botões de WhatsApp. Sem ele, os CTAs levam para a seção de contato.
- `PUBLIC_CONTACT_EMAIL`: troca o e-mail padrão (`bkode.corp@gmail.com`).
- `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_KEY`: o formulário só aparece quando os dois existem. Antes disso, a seção de contato mostra WhatsApp e e-mail.
- `SITE_URL`: origem canônica quando o domínio próprio existir.

As variáveis `PUBLIC_*` entram no HTML no momento do build. Depois de alterá-las na Vercel, faça um redeploy.

## Banco (Supabase)

Aplique `supabase/migrations/20261028120000_create_leads.sql`. A role `anon` só pode fazer INSERT nas colunas do formulário: sem SELECT, UPDATE ou DELETE, e sem definir `status`. A triagem dos leads é feita pelo dashboard.

## Favicon e imagens de compartilhamento

```sh
npm run brand    # requer: pip install playwright && playwright install chromium
```

Gera `public/favicon.svg`, `favicon-48.png`, `apple-touch-icon.png` e `public/og/*.png` a partir de `src/lib/brand.ts` e dos títulos em `segments.ts`.
