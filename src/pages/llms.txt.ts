import type { APIRoute } from 'astro';
import { buildLlmsTxt } from '@/lib/machine-index';
import { contactEmail, whatsappNumber } from '@/lib/contact';

export const GET: APIRoute = ({ site }) => {
  const origin = site?.href ?? 'http://localhost:4321';
  return new Response(buildLlmsTxt(origin, { email: contactEmail, whatsapp: whatsappNumber }), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
