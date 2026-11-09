import { useEffect, useId, useRef, useState, type SubmitEvent } from 'react';
import type { LeadErrorCode, LeadInput, LeadResponse } from '@/lib/lead';

type SegmentOption = { value: LeadInput['segment']; label: string };

type Props = {
  segments: readonly SegmentOption[];
  defaultSegment?: LeadInput['segment'];
  whatsappHref: string | null;
  turnstileSiteKey?: string;
};

type Status =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; code: LeadErrorCode | 'network' };

type FieldErrors = Partial<Record<keyof LeadInput, string>>;

declare global {
  interface Window {
    turnstile?: { reset: (widget?: string) => void };
  }
}

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

const errorMessage = (code: LeadErrorCode | 'network', hasWhatsapp: boolean): string => {
  const fallback = hasWhatsapp ? ' ou fale com a gente pelo WhatsApp' : '';
  switch (code) {
    case 'invalid':
      return 'Revise os campos destacados e envie de novo.';
    case 'verification':
      return 'Não foi possível confirmar o envio. Recarregue a página e tente de novo.';
    case 'unavailable':
      return hasWhatsapp
        ? 'O formulário está temporariamente indisponível. Fale com a gente pelo WhatsApp.'
        : 'O formulário está temporariamente indisponível. Tente de novo mais tarde.';
    default:
      return `Não foi possível enviar agora. Tente de novo em instantes${fallback}.`;
  }
};

const fieldClass = (invalid: boolean) =>
  [
    'w-full rounded-lg border bg-coal/60 px-3.5 py-3 text-base text-paper placeholder:text-mute',
    'transition-colors focus:outline-none focus-visible:border-ash focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper',
    invalid ? 'border-paper' : 'border-line hover:border-edge',
  ].join(' ');

export default function ContactForm({ segments, defaultSegment, whatsappHref, turnstileSiteKey }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const startedAt = useRef<number>(0);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const id = useId();

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!turnstileSiteKey) return;
    if (document.querySelector(`script[src="${TURNSTILE_SRC}"]`)) return;
    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  useEffect(() => {
    if (status.kind === 'success' || status.kind === 'error') statusRef.current?.focus();
  }, [status]);

  const onSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === 'submitting') return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const value = (key: string) => String(data.get(key) ?? '');

    setFieldErrors({});
    setStatus({ kind: 'submitting' });

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: value('name'),
          contact: value('contact'),
          segment: value('segment'),
          message: value('message'),
          sourcePath: window.location.pathname,
          website: value('website'),
          startedAt: startedAt.current,
          turnstileToken: value('cf-turnstile-response') || undefined,
        }),
      });

      const result = (await response.json().catch(() => null)) as LeadResponse | null;

      if (result?.ok) {
        form.reset();
        setStatus({ kind: 'success' });
        return;
      }

      if (result && !result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setStatus({ kind: 'error', code: result.code });
      } else {
        setStatus({ kind: 'error', code: 'server' });
      }
      window.turnstile?.reset();
    } catch (error) {
      console.error('[contact] submit failed', error);
      setStatus({ kind: 'error', code: 'network' });
      window.turnstile?.reset();
    }
  };

  if (status.kind === 'success') {
    return (
      <div className="px-6 py-10 sm:px-10 sm:py-12">
        <p className="label">status: 201</p>
        <p ref={statusRef} tabIndex={-1} className="type-title mt-4 text-paper focus:outline-none">
          Mensagem enviada.
        </p>
        <p className="mt-4 max-w-md text-ash">
          Vamos responder pelo contato que você informou. Se preferir adiantar a conversa, chame no WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener" className="btn btn-solid">
              Abrir WhatsApp
            </a>
          )}
          <button type="button" className="btn btn-ghost" onClick={() => setStatus({ kind: 'idle' })}>
            Enviar outra mensagem
          </button>
        </div>
      </div>
    );
  }

  const submitting = status.kind === 'submitting';
  const describedBy = (field: keyof LeadInput) => (fieldErrors[field] ? `${id}-${field}-error` : undefined);

  return (
    <form onSubmit={onSubmit} aria-busy={submitting} className="relative px-6 py-10 sm:px-10 sm:py-12">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="mb-2 block font-mono text-xs text-ash">
            Seu nome
          </label>
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={describedBy('name')}
            className={fieldClass(Boolean(fieldErrors.name))}
          />
          {fieldErrors.name && (
            <p id={`${id}-name-error`} className="mt-2 text-sm text-paper">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${id}-contact`} className="mb-2 block font-mono text-xs text-ash">
            WhatsApp ou e-mail
          </label>
          <input
            id={`${id}-contact`}
            name="contact"
            type="text"
            inputMode="email"
            autoComplete="email"
            required
            minLength={5}
            maxLength={160}
            aria-invalid={Boolean(fieldErrors.contact)}
            aria-describedby={describedBy('contact')}
            className={fieldClass(Boolean(fieldErrors.contact))}
          />
          {fieldErrors.contact && (
            <p id={`${id}-contact-error`} className="mt-2 text-sm text-paper">
              {fieldErrors.contact}
            </p>
          )}
        </div>
      </div>

      <fieldset className="mt-6">
        <legend className="mb-3 font-mono text-xs text-ash">Você é</legend>
        <div className="flex flex-wrap gap-2">
          {segments.map((segment) => (
            <label key={segment.value} className="cursor-pointer">
              <input
                type="radio"
                name="segment"
                value={segment.value}
                defaultChecked={segment.value === (defaultSegment ?? segments[0]?.value)}
                required
                className="peer sr-only"
              />
              <span className="inline-flex min-h-9 items-center rounded-md border border-line px-3.5 text-sm text-ash transition-colors peer-checked:border-paper peer-checked:bg-paper peer-checked:font-medium peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-paper hover:text-paper">
                {segment.label}
              </span>
            </label>
          ))}
        </div>
        {fieldErrors.segment && <p className="mt-2 text-sm text-paper">{fieldErrors.segment}</p>}
      </fieldset>

      <div className="mt-6">
        <label htmlFor={`${id}-message`} className="mb-2 block font-mono text-xs text-ash">
          Qual problema você quer resolver?
        </label>
        <textarea
          id={`${id}-message`}
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          placeholder="Conte do seu jeito, sem termos técnicos."
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={describedBy('message')}
          className={`${fieldClass(Boolean(fieldErrors.message))} resize-y`}
        />
        {fieldErrors.message && (
          <p id={`${id}-message-error`} className="mt-2 text-sm text-paper">
            {fieldErrors.message}
          </p>
        )}
      </div>

      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Site</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {turnstileSiteKey && (
        <div className="cf-turnstile mt-6" data-sitekey={turnstileSiteKey} data-theme="dark" data-language="pt-br" />
      )}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={submitting} className="btn btn-solid w-full disabled:opacity-60 sm:w-auto">
          {submitting ? 'Enviando…' : 'Enviar mensagem'}
        </button>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener"
            className="text-center text-[0.9375rem] text-ash underline decoration-edge underline-offset-4 hover:text-paper hover:decoration-paper"
          >
            Prefere WhatsApp? Chame direto.
          </a>
        )}
      </div>

      <p
        ref={statusRef}
        tabIndex={-1}
        role={status.kind === 'error' ? 'alert' : undefined}
        aria-live="polite"
        className="mt-4 min-h-6 text-[0.9375rem] text-paper focus:outline-none"
      >
        {status.kind === 'error' ? errorMessage(status.code, Boolean(whatsappHref)) : ''}
      </p>
    </form>
  );
}
