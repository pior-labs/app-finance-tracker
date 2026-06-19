export const PALETTE = [
  '#cae0a8',
  '#f8d7c0',
  '#dcd3f0',
  '#f5e3a0',
  '#c6e3d4',
  '#f1c8d6',
  '#d4cdf2',
  '#ffd6b3',
];

const PILL_BASE =
  'inline-flex items-center gap-2 rounded-full border border-transparent px-5.5 py-3 font-sans text-[15px] font-medium no-underline cursor-pointer transition-[transform,box-shadow,background-color] duration-150 motion-reduce:transition-none';

export const PILL_PRIMARY = `group ${PILL_BASE} bg-ink text-cream shadow-[0_8px_22px_-6px_rgba(45,36,24,0.4)] hover:-translate-y-px hover:shadow-[0_10px_26px_-6px_rgba(45,36,24,0.5)] motion-reduce:hover:translate-y-0`;
export const PILL_GHOST = `${PILL_BASE} bg-transparent text-ink-2 border-ink/20 hover:bg-frost/50`;
export const PILL_SMALL =
  'inline-flex items-center gap-2 self-start mt-3.5 rounded-full bg-ink/5 px-4 py-2 font-sans text-[13px] font-medium text-ink cursor-pointer border-0 hover:bg-ink/10';
