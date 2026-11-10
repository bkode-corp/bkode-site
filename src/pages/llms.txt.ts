import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '@/lib/machine-index';
import { contactEmail, whatsappNumber } from '@/lib/contact';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from 'astro:env/server';

const formEnabled = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

export const GET: APIRoute = ({ site }) => {
  const origin = site?.href ?? 'http://localhost:4321';
  return new Response(buildLlmsTxt(origin, { email: contactEmail, whatsapp: whatsappNumber, formEnabled }), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
