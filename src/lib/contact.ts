import { PUBLIC_CONTACT_EMAIL, PUBLIC_WHATSAPP_NUMBER } from 'astro:env/client';
import { site } from '@/data/site';

const DIGITS_ONLY = /\D/g;

/** Normalized E.164 digits (e.g. 5591999999999) or null when not configured. */
export const whatsappNumber: string | null = (() => {
  const digits = (PUBLIC_WHATSAPP_NUMBER?.trim() || site.whatsapp).replace(DIGITS_ONLY, '');
  return digits.length >= 12 && digits.length <= 15 ? digits : null;
})();

export const contactEmail: string = PUBLIC_CONTACT_EMAIL?.trim() || site.email;

export const whatsappHref = (message: string): string | null => {
  if (!whatsappNumber) return null;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
};

export const mailtoHref = (subject: string): string =>
  `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}`;

/** Primary CTA target: WhatsApp when configured, otherwise the on-page contact section. */
export const primaryContactHref = (message: string): string => whatsappHref(message) ?? '/#contato';

/** Whether the primary CTA leaves the site (used to set target/rel). */
export const primaryIsExternal = whatsappNumber !== null;
