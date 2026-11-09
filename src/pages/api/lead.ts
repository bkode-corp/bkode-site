import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, TURNSTILE_SECRET_KEY } from 'astro:env/server';
import {
  MIN_FILL_TIME_MS,
  leadEnvelopeSchema,
  leadSchema,
  type LeadInput,
  type LeadResponse,
} from '@/lib/lead';

export const prerender = false;

const MAX_BODY_BYTES = 8_000;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const json = (body: LeadResponse, status: number): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

const verifyTurnstile = async (token: string | undefined, ip: string | null): Promise<boolean> => {
  if (!TURNSTILE_SECRET_KEY) return true;
  if (!token) return false;

  const form = new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token });
  if (ip) form.set('remoteip', ip);

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body: form });
    if (!response.ok) return false;
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error('[lead] turnstile verification failed', error);
    return false;
  }
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return json({ ok: false, code: 'unavailable' }, 503);
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return json({ ok: false, code: 'invalid' }, 415);
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return json({ ok: false, code: 'invalid' }, 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, code: 'invalid' }, 400);
  }

  const envelope = leadEnvelopeSchema.safeParse(payload);
  if (!envelope.success) {
    return json({ ok: false, code: 'invalid' }, 400);
  }

  // Honeypot filled or form submitted faster than a human could: pretend success, store nothing.
  const elapsed = Date.now() - envelope.data.startedAt;
  if (envelope.data.website || elapsed < MIN_FILL_TIME_MS) {
    return json({ ok: true }, 200);
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof LeadInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof LeadInput | undefined;
      if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return json({ ok: false, code: 'invalid', fieldErrors }, 422);
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? clientAddress ?? null;
  const human = await verifyTurnstile(envelope.data.turnstileToken, ip);
  if (!human) {
    return json({ ok: false, code: 'verification' }, 403);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const lead = parsed.data;
  try {
    // No `.select()`: the anon role can insert but never read leads back (see migration).
    const { error } = await supabase.from('leads').insert({
      name: lead.name,
      contact: lead.contact,
      segment: lead.segment,
      message: lead.message,
      source_path: lead.sourcePath ?? null,
    });

    if (error) {
      console.error('[lead] insert failed', error.code, error.message);
      return json({ ok: false, code: 'server' }, 502);
    }
  } catch (error) {
    console.error('[lead] supabase unreachable', error);
    return json({ ok: false, code: 'server' }, 502);
  }

  return json({ ok: true }, 201);
};

export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { allow: 'POST' } });
