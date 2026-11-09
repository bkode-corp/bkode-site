import { useCallback, useId, useRef, useState, type KeyboardEvent } from 'react';

export type DiffItem = {
  id: string;
  /** Tab label. */
  label: string;
  problem: string;
  outputs: readonly string[];
  link?: { href: string; label: string };
};

type Props = {
  items: readonly DiffItem[];
  /** Accessible name for the tab list. */
  ariaLabel: string;
  /** Optional caption shown before the tabs (e.g. "Eu sou"). */
  caption?: string;
  /** File-name style label in the panel header. */
  filename?: string;
};

const KEY_STEP: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

/**
 * The client's problem rendered as a removed line and BKode's delivery as added lines —
 * a code diff applied to a business. Animation is pure CSS (see global.css `.diff-*`):
 * it runs on first paint without JS and restarts on tab change via the panel `key`.
 */
export default function ProblemDiff({ items, ariaLabel, caption, filename = 'rotina.diff' }: Props) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const select = useCallback(
    (index: number, focus = false) => {
      const total = items.length;
      if (total === 0) return;
      const next = ((index % total) + total) % total;
      setActive(next);
      if (focus) tabRefs.current[next]?.focus();
    },
    [items.length],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let target: number | undefined;
    if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = items.length - 1;
    else if (event.key in KEY_STEP) target = index + (KEY_STEP[event.key] ?? 0);
    if (target === undefined) return;
    event.preventDefault();
    select(target, true);
  };

  const current = items[active];
  if (!current) return null;

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = `${baseId}-panel`;
  const totalLines = current.outputs.length + 1;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-ink">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <span className="font-mono text-xs text-ash">{filename}</span>
        <span className="font-mono text-xs text-ash" aria-hidden="true">
          −1 +{current.outputs.length}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 pt-4">
        {caption && <span className="font-mono text-xs text-ash">{caption}</span>}
        <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-1.5">
          {items.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={tabId(index)}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => select(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                className={
                  selected
                    ? 'min-h-8 rounded-md bg-paper px-3 text-sm font-medium text-ink'
                    : 'min-h-8 rounded-md border border-line px-3 text-sm text-ash transition-colors hover:border-edge hover:text-paper'
                }
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div
        key={current.id}
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        className="mt-4 border-t border-line py-3 font-mono text-[0.875rem] leading-relaxed sm:text-[0.9375rem]"
      >
        <p className="diff-del grid grid-cols-[2.25rem_1.25rem_minmax(0,1fr)] pr-4 text-mute">
          <span aria-hidden="true" className="select-none text-right text-edge">
            1
          </span>
          <span aria-hidden="true" className="select-none text-center">
            −
          </span>
          <span>
            <span className="sr-only">Problema: </span>
            <span className="diff-strike text-ash">{current.problem}</span>
          </span>
        </p>

        <ul className="mt-1">
          {current.outputs.map((output, index) => (
            <li
              key={output}
              className="diff-add grid grid-cols-[2.25rem_1.25rem_minmax(0,1fr)] bg-paper/[0.04] py-0.5 pr-4 text-paper"
              style={{ ['--i' as string]: index }}
            >
              <span aria-hidden="true" className="select-none text-right text-edge">
                {index + 2}
              </span>
              <span aria-hidden="true" className="select-none text-center text-ash">
                +
              </span>
              <span>
                <span className="sr-only">Entrega: </span>
                {output}
              </span>
            </li>
          ))}
        </ul>

        <p aria-hidden="true" className="mt-1 grid grid-cols-[2.25rem_1.25rem_minmax(0,1fr)] text-edge">
          <span className="text-right">{totalLines + 1}</span>
        </p>
      </div>

      {current.link && (
        <a
          href={current.link.href}
          className="group flex items-center justify-between gap-3 border-t border-line px-4 py-3.5 text-[0.9375rem] font-medium text-paper transition-colors hover:bg-coal"
        >
          {current.link.label}
          <svg viewBox="0 0 16 16" className="size-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" strokeLinecap="square" />
          </svg>
        </a>
      )}
    </div>
  );
}
