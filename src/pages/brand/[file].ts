import type { APIRoute, GetStaticPaths } from 'astro';
import { LOGO_FILES, logoSvg } from '@/lib/brand';

/** Every logo version is generated from the same geometry the site renders, so downloads never drift. */
export const getStaticPaths = (() =>
  LOGO_FILES.map((entry) => ({ params: { file: entry.file }, props: { entry } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) => {
  const { entry } = props as { entry: (typeof LOGO_FILES)[number] };
  return new Response(logoSvg(entry.variant, entry.color, entry.finish), {
    headers: { 'content-type': 'image/svg+xml; charset=utf-8' },
  });
};
