/**
 * BKode logo geometry, copied unit-for-unit from the logo system canvas.
 * Symbol: 144 u rounded square (radius 32 u) with the K cut out ("vazado").
 * Wordmark: geometric drawing, cap height 100 u, stroke 16 u, x-height 70 u.
 */

export const SYMBOL_PATH =
  'M32 0H112A32 32 0 0 1 144 32V112A32 32 0 0 1 112 144H32A32 32 0 0 1 0 112V32A32 32 0 0 1 32 0ZM42.46 32H55.26V112H42.46ZM92.06 32H107.54L80.34 72L107.54 112H92.06L64.86 72Z';

/** The K alone, inside the 144 u square — used to build the "sólido" finish. */
export const SYMBOL_SQUARE_PATH =
  'M32 0H112A32 32 0 0 1 144 32V112A32 32 0 0 1 112 144H32A32 32 0 0 1 0 112V32A32 32 0 0 1 32 0Z';
export const SYMBOL_K_PATH = 'M42.46 32H55.26V112H42.46ZM92.06 32H107.54L80.34 72L107.54 112H92.06L64.86 72Z';

/** Wordmark strokes (16 u, butt caps, miter joins). Origin = top of the cap height. */
export const WORDMARK_STROKES = [
  'M8 0V100',
  'M8 8H38A20 20 0 0 1 38 48H8',
  'M8 48H40A22 22 0 0 1 40 92H8',
  'M90 0V100',
  'M302 0V100',
  'M329 65H390',
  'M383 65A27 27 0 1 0 373.36 85.68',
] as const;

export const WORDMARK_CIRCLES = [
  { cx: 195, cy: 65, r: 27 },
  { cx: 275, cy: 65, r: 27 },
] as const;

/** The "<" half of the K. */
export const WORDMARK_CHEVRON = '144,0 163.35,0 129.35,50 163.35,100 144,100 110,50';

/** Horizontal lockup: symbol 144 u, 40 u gap, wordmark shifted down 22 u. */
export const HORIZONTAL = { width: 575, height: 144, wordmarkX: 184, wordmarkY: 22 } as const;

/** Vertical lockup: symbol scaled 1.25× centred above the wordmark. */
export const VERTICAL = { width: 391, height: 328, symbolX: 105.5, symbolScale: 1.25, wordmarkY: 228 } as const;

export const WORDMARK = { width: 391, height: 100, capHeight: 0, xHeight: 30, baseline: 100 } as const;

export const PALETTE = [
  { name: 'Zinc 950', hex: '#09090B', role: 'Fundo principal, logo positivo' },
  { name: 'Zinc 900', hex: '#18181B', role: 'Superfícies, cards' },
  { name: 'Zinc 500', hex: '#71717A', role: 'Apoio, divisores' },
  { name: 'Zinc 50', hex: '#FAFAFA', role: 'Logo negativo, fundo claro' },
] as const;

type Finish = 'vazado' | 'solido';
type Variant = 'simbolo' | 'horizontal' | 'vertical';

const wordmarkMarkup = (color: string) =>
  [
    `<g fill="none" stroke="${color}" stroke-width="16" stroke-linecap="butt" stroke-linejoin="miter">`,
    ...WORDMARK_STROKES.map((d) => `<path d="${d}"/>`),
    ...WORDMARK_CIRCLES.map(({ cx, cy, r }) => `<circle cx="${cx}" cy="${cy}" r="${r}"/>`),
    '</g>',
    `<polygon points="${WORDMARK_CHEVRON}" fill="${color}"/>`,
  ].join('');

const symbolMarkup = (color: string, finish: Finish, ground: string) =>
  finish === 'vazado'
    ? `<path d="${SYMBOL_PATH}" fill="${color}" fill-rule="evenodd"/>`
    : `<path d="${SYMBOL_SQUARE_PATH}" fill="${color}"/><path d="${SYMBOL_K_PATH}" fill="${ground}"/>`;

/** Standalone SVG file content for the /marca downloads. */
export const logoSvg = (variant: Variant, color: string, finish: Finish): string => {
  const ground = color.toUpperCase() === '#FAFAFA' ? '#09090B' : '#FAFAFA';
  const head = (w: number, h: number) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="BKode">`;

  if (variant === 'simbolo') {
    return `${head(144, 144)}${symbolMarkup(color, finish, ground)}</svg>`;
  }

  if (variant === 'horizontal') {
    return `${head(HORIZONTAL.width, HORIZONTAL.height)}${symbolMarkup(color, finish, ground)}<g transform="translate(${HORIZONTAL.wordmarkX} ${HORIZONTAL.wordmarkY})">${wordmarkMarkup(color)}</g></svg>`;
  }

  return `${head(VERTICAL.width, VERTICAL.height)}<g transform="translate(${VERTICAL.symbolX} 0) scale(${VERTICAL.symbolScale})">${symbolMarkup(color, finish, ground)}</g><g transform="translate(0 ${VERTICAL.wordmarkY})">${wordmarkMarkup(color)}</g></svg>`;
};

export const LOGO_FILES = (['simbolo', 'horizontal', 'vertical'] as const).flatMap((variant) =>
  (
    [
      ['branco', '#FAFAFA'],
      ['preto', '#09090B'],
    ] as const
  ).flatMap(([tone, color]) =>
    (['solido', 'vazado'] as const).map((finish) => ({
      variant,
      tone,
      finish,
      color,
      file: `bkode-${variant}-${tone}-${finish}.svg`,
    })),
  ),
);
