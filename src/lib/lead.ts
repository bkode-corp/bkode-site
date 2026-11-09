import { z } from 'zod';

export const LEAD_SEGMENTS = ['empresa', 'microempreendedor', 'profissional', 'estudante'] as const;

/** Bots that fill the form faster than this are dropped silently. */
export const MIN_FILL_TIME_MS = 2500;

const trimmed = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .min(min, { message })
    .max(max, { message: `Use no máximo ${max} caracteres.` });

/** Shared by the form (client-side feedback) and the API route (authoritative validation). */
export const leadSchema = z.object({
  name: trimmed(2, 120, 'Informe seu nome.'),
  contact: trimmed(5, 160, 'Informe um WhatsApp ou e-mail para retorno.'),
  segment: z.enum(LEAD_SEGMENTS, { message: 'Escolha o perfil que mais combina com você.' }),
  message: trimmed(10, 2000, 'Descreva o problema em pelo menos 10 caracteres.'),
  sourcePath: z.string().max(200).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/** Envelope fields that never reach the database. */
export const leadEnvelopeSchema = z.object({
  website: z.string().optional(),
  startedAt: z.number().int().nonnegative(),
  turnstileToken: z.string().optional(),
});

export type LeadErrorCode = 'invalid' | 'unavailable' | 'verification' | 'server';

export type LeadResponse =
  | { ok: true }
  | { ok: false; code: LeadErrorCode; fieldErrors?: Partial<Record<keyof LeadInput, string>> };
